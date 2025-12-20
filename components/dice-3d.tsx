"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback, Suspense, useMemo, useLayoutEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Text } from "@react-three/drei"
import * as THREE from "three"

// --- CONSTANTES Y GENERADOR ÚNICO DE DATOS D10 ---
const D10_GEO = {
  r: 0.65,      
  h: 0.55,      
  zigzag: 0.08, 
}

// Esta función genera TANTO la geometría visual COMO la lógica de las caras
// para asegurar que coincidan al 100%.
const buildD10Data = () => {
  const { r, h, zigzag } = D10_GEO
  const topPole = new THREE.Vector3(0, h, 0)
  const botPole = new THREE.Vector3(0, -h, 0)

  const eqPoints: THREE.Vector3[] = []
  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI * 2) / 10
    const y = i % 2 === 0 ? zigzag : -zigzag
    eqPoints.push(new THREE.Vector3(Math.sin(angle) * r, y, Math.cos(angle) * r))
  }

  const faces: { 
      center: THREE.Vector3; 
      normal: THREE.Vector3; 
      isTop: boolean; 
      pole: THREE.Vector3;
      value: number; // Valor lógico asignado a esta cara (1-10)
  }[] = []
  
  const vertices: number[] = [] // Array plano para el BufferGeometry

  const addTriangle = (v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) => {
    vertices.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z)
  }

  // Generar Caras Superiores (Indices 0-4) -> Valores Impares (1, 3, 5, 7, 9)
  for (let i = 0; i < 5; i++) {
    const idxCenter = i * 2 + 1
    const idxLeft = (idxCenter - 1 + 10) % 10
    const idxRight = (idxCenter + 1) % 10
    const v1 = topPole, v2 = eqPoints[idxLeft], v3 = eqPoints[idxCenter], v4 = eqPoints[idxRight]

    // Geometría Visual
    addTriangle(v1, v2, v3)
    addTriangle(v1, v3, v4)

    // Datos Lógicos
    const center = new THREE.Vector3().add(v1).add(v2).add(v3).add(v4).divideScalar(4)
    const normal = new THREE.Vector3()
      .crossVectors(new THREE.Vector3().subVectors(v4, v2), new THREE.Vector3().subVectors(v1, v3))
      .normalize()
    
    faces.push({ center, normal, isTop: true, pole: topPole, value: (i * 2) + 1 })
  }

  // Generar Caras Inferiores (Indices 5-9) -> Valores Pares (2, 4, 6, 8, 10)
  for (let i = 0; i < 5; i++) {
    const idxCenter = i * 2
    const idxLeft = (idxCenter - 1 + 10) % 10
    const idxRight = (idxCenter + 1) % 10
    const v1 = botPole, v2 = eqPoints[idxRight], v3 = eqPoints[idxCenter], v4 = eqPoints[idxLeft]

    // Geometría Visual
    addTriangle(v1, v2, v3)
    addTriangle(v1, v3, v4)

    // Datos Lógicos
    const center = new THREE.Vector3().add(v1).add(v2).add(v3).add(v4).divideScalar(4)
    const normal = new THREE.Vector3()
      .crossVectors(new THREE.Vector3().subVectors(v4, v2), new THREE.Vector3().subVectors(v1, v3))
      .normalize()

    let val = (i - 5) * 2 + 2 // Esto daría problemas aquí porque i empieza en 0
    val = (i * 2) + 2; 

    faces.push({ center, normal, isTop: false, pole: botPole, value: val })
  }

  return { faces, vertices }
}

// Generamos los datos globales una sola vez
const D10_DATA = buildD10Data()

export type DiceType = "d6" | "d10" | "d20" | "d100"

interface DieProps {
  id: number
  color: string
  targetValue: number
  isRolling: boolean
  rollKey: number
  startDelay: number
  position: [number, number, number]
  throwDirection: { x: number; z: number }
  throwForce: number
  allPositions: React.MutableRefObject<THREE.Vector3[]>
  onSettled: (id: number, value: number) => void
  onPositionUpdate: (id: number, pos: THREE.Vector3) => void
  diceType: DiceType
}

function Die({
  id,
  color,
  targetValue,
  isRolling,
  rollKey,
  startDelay,
  position,
  throwDirection,
  throwForce,
  allPositions,
  onSettled,
  onPositionUpdate,
  diceType,
}: DieProps) {
  const groupRef = useRef<THREE.Group>(null)

  const phase = useRef<"waiting" | "rolling" | "settling" | "settled">("waiting")
  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3(position[0], -0.5, position[2]))
  const rotation = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0))

  const animationTime = useRef(0)
  const hasSettled = useRef(false)
  const settlingStartRotation = useRef<THREE.Quaternion>(new THREE.Quaternion())
  const finalTargetQuaternion = useRef<THREE.Quaternion>(new THREE.Quaternion())
  const startingPos = useRef<[number, number, number]>([position[0], -0.5, position[2]])
  const collisionOffset = useRef(new THREE.Vector3(0, 0, 0))
  const collisionRotOffset = useRef(new THREE.Euler(0, 0, 0))

  const chaosRef = useRef({
    spinAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
    spinSpeed: 20 + Math.random() * 15,
    driftX: (Math.random() - 0.5) * 2,
    driftZ: (Math.random() - 0.5) * 2,
  })

  // --- Lógica de Rotación Exacta ---
  const calculateFinalQuaternion = (value: number, type: DiceType): THREE.Quaternion => {
    const q = new THREE.Quaternion()

    if (type === "d6") {
         const euler = new THREE.Euler(0,0,0)
         switch (value) {
            case 1: euler.set(0, 0, 0); break;
            case 2: euler.set(-Math.PI / 2, 0, 0); break;
            case 3: euler.set(0, 0, Math.PI / 2); break;
            case 4: euler.set(0, 0, -Math.PI / 2); break;
            case 5: euler.set(Math.PI / 2, 0, 0); break;
            case 6: euler.set(Math.PI, 0, 0); break;
        }
        q.setFromEuler(euler)
    } else if (type === "d10" || type === "d100") {
      // Búsqueda directa: Encontramos la cara que tiene asignado el VALOR objetivo.
      // Esto elimina cualquier error de cálculo de índices.
      const searchVal = value === 0 ? 10 : value
      
      const targetFace = D10_DATA.faces.find(f => f.value === searchVal)
      
      if (targetFace) {
          const localNormal = targetFace.normal.clone()
          const targetUp = new THREE.Vector3(0, 1, 0)
          q.setFromUnitVectors(localNormal, targetUp)
          
          const randomY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2)
          q.multiply(randomY)
      }
    }
    return q
  }

  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], -0.5, position[2])
      groupRef.current.rotation.set(0, 0, 0)
    }
    currentPos.current.set(position[0], -0.5, position[2])
    startingPos.current = [position[0], -0.5, position[2]]
  }, [position])

  useEffect(() => {
    if (isRolling && phase.current === "waiting") {
      const timer = setTimeout(() => {
        phase.current = "rolling"
        animationTime.current = 0
      }, startDelay)
      return () => clearTimeout(timer)
    }
  }, [isRolling, startDelay])

  useEffect(() => {
    phase.current = "waiting"
    startingPos.current = [position[0], -0.5, position[2]]
    currentPos.current.set(position[0], -0.5, position[2])
    rotation.current.set(0, 0, 0)
    hasSettled.current = false
    animationTime.current = 0
    collisionOffset.current.set(0, 0, 0)
    collisionRotOffset.current.set(0, 0, 0)

    chaosRef.current = {
      spinAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      spinSpeed: 25 + Math.random() * 20,
      driftX: (Math.random() - 0.5) * 3,
      driftZ: (Math.random() - 0.5) * 3,
    }

    if (groupRef.current) {
      groupRef.current.position.set(position[0], -0.5, position[2])
      groupRef.current.rotation.set(0, 0, 0)
    }
  }, [rollKey])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const COLLISION_RADIUS = 1.1 
    const SETTLE_Y = -0.55 

    if (phase.current === "rolling") {
      animationTime.current += delta
      const rollDuration = 1.6
      const progress = Math.min(animationTime.current / rollDuration, 1)

      const maxThrowDistance = 7 * throwForce
      const throwProgress = Math.min(progress * 1.1, 1)
      const easeOut = 1 - Math.pow(1 - throwProgress, 2)
      
      const throwOffsetX = throwDirection.x * maxThrowDistance * easeOut
      const throwOffsetZ = throwDirection.z * maxThrowDistance * easeOut

      const driftScale = Math.sin(progress * Math.PI) * 1.5
      const currentDriftX = chaosRef.current.driftX * driftScale * 0.5
      const currentDriftZ = chaosRef.current.driftZ * driftScale * 0.5

      // Posición Y
      let y: number
      if (progress < 0.15) {
        y = -0.5 + (progress / 0.15) * 1.5
      } else if (progress < 0.65) {
        const arcProgress = (progress - 0.15) / 0.5
        y = 1.0 + Math.sin(arcProgress * Math.PI) * 0.8 - arcProgress * 1.0
      } else {
        const fallProgress = (progress - 0.65) / 0.35
        const bounce = Math.abs(Math.cos(fallProgress * Math.PI * 3)) * 0.3 * (1 - fallProgress)
        y = -0.5 + bounce
      }

      const idealX = startingPos.current[0] + throwOffsetX + currentDriftX
      const idealZ = startingPos.current[2] + throwOffsetZ + currentDriftZ

      // Colisiones
      const myPos = new THREE.Vector3(idealX + collisionOffset.current.x, y, idealZ + collisionOffset.current.z)
      allPositions.current.forEach((otherPos, index) => {
        if (index === id) return
        const dist = myPos.distanceTo(otherPos)
        
        if (dist < COLLISION_RADIUS) {
          const pushDir = new THREE.Vector3().subVectors(myPos, otherPos).normalize()
          if (pushDir.lengthSq() === 0) pushDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize()
          const pushForce = (COLLISION_RADIUS - dist) * 0.15
          collisionOffset.current.x += pushDir.x * pushForce
          collisionOffset.current.z += pushDir.z * pushForce
        }
      })

      currentPos.current.set(idealX + collisionOffset.current.x, y, idealZ + collisionOffset.current.z)

      // Rotación Caótica
      const spinDamping = Math.max(0, 1 - Math.pow(progress, 3))
      const currentSpinSpeed = chaosRef.current.spinSpeed * spinDamping * delta
      
      groupRef.current.rotateOnWorldAxis(chaosRef.current.spinAxis, currentSpinSpeed)
      
      if (progress >= 1) {
        settlingStartRotation.current.copy(groupRef.current.quaternion)
        finalTargetQuaternion.current = calculateFinalQuaternion(targetValue, diceType)
        phase.current = "settling"
        animationTime.current = 0
      }
    }

    if (phase.current === "settling") {
      animationTime.current += delta
      const settleDuration = 0.4
      const progress = Math.min(animationTime.current / settleDuration, 1)
      const t = 1 - Math.pow(1 - progress, 3) 

      groupRef.current.quaternion.slerpQuaternions(
          settlingStartRotation.current, 
          finalTargetQuaternion.current, 
          t
      )
      
      currentPos.current.y = THREE.MathUtils.lerp(currentPos.current.y, SETTLE_Y, t)
      
      const myPos = currentPos.current.clone()
      allPositions.current.forEach((otherPos, index) => {
        if (index === id) return
        const dist = new THREE.Vector3(myPos.x, 0, myPos.z).distanceTo(new THREE.Vector3(otherPos.x, 0, otherPos.z))
        
        if (dist < COLLISION_RADIUS) {
           const pushDir = new THREE.Vector3().subVectors(myPos, otherPos).normalize()
           pushDir.y = 0
           if (pushDir.lengthSq() === 0) pushDir.set(1, 0, 0)
           const pushForce = (COLLISION_RADIUS - dist) * 0.05
           currentPos.current.add(pushDir.multiplyScalar(pushForce))
        }
      })

      if (progress >= 1 && !hasSettled.current) {
        hasSettled.current = true
        phase.current = "settled"
        onSettled(id, targetValue)
      }
    }

    groupRef.current.position.copy(currentPos.current)
    onPositionUpdate(id, currentPos.current)
  })

  return (
    <group ref={groupRef} position={position}>
      <DiceModel diceType={diceType} value={targetValue} color={color} />
    </group>
  )
}

function DiceModel({
  diceType,
  value,
  color,
}: {
  diceType: DiceType
  value: number
  color: string
}) {
  // Usamos los datos GLOBALES (D10_DATA) para construir la malla.
  // Esto asegura que la geometría visual sea IDÉNTICA a la lógica de rotación.
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(D10_DATA.vertices, 3))
    geo.computeVertexNormals()
    return geo
  }, [])
  
  return (
    <group>
      {diceType === "d10" || diceType === "d100" ? (
        <>
          <mesh castShadow receiveShadow geometry={geometry}>
            <meshStandardMaterial
              color={color}
              roughness={0.2}
              metalness={0.1}
              flatShading
              side={THREE.DoubleSide}
            />
          </mesh>

          {D10_DATA.faces.map((face, i) => {
            // Lógica de texto: Usamos el valor YA pre-calculado en buildD10Data
            let displayVal = face.value
            if (displayVal === 10) displayVal = 0 // El 10 se muestra como 0

            let textStr = displayVal.toString()
            if (diceType === "d100") {
                 textStr = displayVal === 0 ? "00" : `${displayVal}0`
            }

            // Offset de 0.04
            const pos = face.center.clone().add(face.normal.clone().multiplyScalar(0.04))

            return (
              <Text
                key={i}
                position={pos}
                fontSize={diceType === "d100" ? 0.28 : 0.36} 
                color="#000000"
                anchorX="center"
                anchorY="middle"
                onUpdate={(self) => {
                   // Orientación corregida
                   const zAxis = face.normal.clone()
                   const yAxis = new THREE.Vector3().subVectors(face.pole, face.center).normalize()
                   const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize()
                   yAxis.crossVectors(zAxis, xAxis).normalize()

                   const matrix = new THREE.Matrix4()
                   matrix.makeBasis(xAxis, yAxis, zAxis)
                   self.quaternion.setFromRotationMatrix(matrix)
                }}
              >
                {textStr}
              </Text>
            )
          })}
        </>
      ) : diceType === "d6" ? (
        <>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
          <DiceDots position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} value={1} />
          <DiceDots position={[0, -0.51, 0]} rotation={[Math.PI / 2, 0, 0]} value={6} />
          <DiceDots position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]} value={3} />
          <DiceDots position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]} value={4} />
          <DiceDots position={[0, 0, 0.51]} rotation={[0, 0, 0]} value={2} />
          <DiceDots position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]} value={5} />
        </>
      ) : (
        <mesh castShadow receiveShadow>
          <icosahedronGeometry args={[0.6]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} flatShading />
        </mesh>
      )}
    </group>
  )
}

function DiceDots({
  position,
  rotation,
  value,
}: { position: [number, number, number]; rotation: [number, number, number]; value: number }) {
  const dotPositions = getDotPositions(value)
  return (
    <group position={position} rotation={rotation}>
      {dotPositions.map((pos, idx) => (
        <mesh key={idx} position={[pos[0], pos[1], 0.01]}>
          <circleGeometry args={[0.09, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  )
}

function getDotPositions(value: number): [number, number][] {
  const s = 0.22
  switch (value) {
    case 1: return [[0, 0]]
    case 2: return [[-s, s], [s, -s]]
    case 3: return [[-s, s], [0, 0], [s, -s]]
    case 4: return [[-s, s], [s, s], [-s, -s], [s, -s]]
    case 5: return [[-s, s], [s, s], [0, 0], [-s, -s], [s, -s]]
    case 6: return [[-s, s], [-s, 0], [-s, -s], [s, s], [s, 0], [s, -s]]
    default: return []
  }
}

function Table() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#1a472a" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.99, 0]}>
        <ringGeometry args={[5, 5.3, 64]} />
        <meshStandardMaterial color="#5d3a1a" roughness={0.7} />
      </mesh>
    </group>
  )
}

function CameraController({
  dicePositionsRef,
  isRolling,
  diceType,
  diceConfig,
}: {
  dicePositionsRef: React.MutableRefObject<THREE.Vector3[]>
  isRolling: boolean
  diceType: DiceType
  diceConfig?: DiceType[]
}) {
  const { camera } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 8, 8))
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0))

  useFrame((_, delta) => {
    const dicePositions = dicePositionsRef.current
    if (dicePositions.length === 0) return

    const center = new THREE.Vector3()
    dicePositions.forEach((pos) => center.add(pos))
    center.divideScalar(dicePositions.length)

    const hasD100 = diceType === "d100" || (diceConfig && diceConfig.includes("d100"))
    const zoomFactor = hasD100 ? 5.5 : 8

    const desiredCameraPos = new THREE.Vector3(center.x * 0.5, zoomFactor, zoomFactor + center.z * 0.3)
    const lerpSpeed = isRolling ? 3 : 5
    targetPosition.current.lerp(desiredCameraPos, delta * lerpSpeed)
    targetLookAt.current.lerp(center, delta * lerpSpeed)

    camera.position.copy(targetPosition.current)
    camera.lookAt(targetLookAt.current)
  })

  return null
}

function SceneContent({
  diceCount,
  isRolling,
  rollKey,
  targetValues,
  throwDirection,
  throwForce,
  onDieSettled,
  diceType,
  diceConfig,
}: {
  diceCount: number
  isRolling: boolean
  rollKey: number
  targetValues: number[]
  throwDirection: { x: number; z: number }
  throwForce: number
  onDieSettled: (id: number, value: number) => void
  diceType: DiceType
  diceConfig?: DiceType[]
}) {
  const DICE_COLORS = ["#ffffff"]

  const count = diceConfig ? diceConfig.length : diceCount

  const positions = useMemo(() => {
    if (count === 1) return [[0, 0, 0]] as [number, number, number][]
    if (count === 2) return [[-1, 0, 0], [1, 0, 0]] as [number, number, number][]
    if (count === 3) return [[-1.2, 0, 0.5], [1.2, 0, 0.5], [0, 0, -0.8]] as [number, number, number][]
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      return [Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5] as [number, number, number]
    })
  }, [count])

  const dicePositionsRef = useRef<THREE.Vector3[]>(positions.map((pos) => new THREE.Vector3(pos[0], -0.5, pos[2])))

  useEffect(() => {
    dicePositionsRef.current = positions.map((pos) => new THREE.Vector3(pos[0], -0.5, pos[2]))
  }, [positions])

  const handlePositionUpdate = useCallback((id: number, pos: THREE.Vector3) => {
    if (dicePositionsRef.current[id]) {
      dicePositionsRef.current[id].copy(pos)
    }
  }, [])

  return (
    <>
      <color attach="background" args={["#0f172a"]} />
      <fog attach="fog" args={["#0f172a", 12, 25]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[-3, 5, -3]} intensity={0.4} color="#ffd700" />

      <CameraController 
        dicePositionsRef={dicePositionsRef} 
        isRolling={isRolling} 
        diceType={diceType}
        diceConfig={diceConfig}
      />
      <Table />
      
      {positions.map((pos, i) => {
        const type = diceConfig ? diceConfig[i] : diceType

        return (
          <Die
            key={`die-${i}-${rollKey}`}
            id={i}
            color={DICE_COLORS[i % DICE_COLORS.length]}
            position={pos}
            targetValue={targetValues[i] || 1}
            isRolling={isRolling}
            rollKey={rollKey}
            startDelay={i * 100}
            throwDirection={throwDirection}
            throwForce={throwForce}
            allPositions={dicePositionsRef}
            onSettled={onDieSettled}
            onPositionUpdate={handlePositionUpdate}
            diceType={type}
          />
        )
      })}
      <Environment preset="city" />
    </>
  )
}

interface Dice3DSceneProps {
  diceCount?: number
  onRollComplete: (values: number[]) => void
  diceType?: DiceType
  diceConfig?: DiceType[]
}

export function Dice3DScene({ diceCount = 1, onRollComplete, diceType = "d6", diceConfig }: Dice3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [rollKey, setRollKey] = useState(0)
  const [targetValues, setTargetValues] = useState<number[]>([])
  const [settledCount, setSettledCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null)
  const [canvasError, setCanvasError] = useState<string | null>(null)
  const hasCompletedRef = useRef(false)
  const [throwDirection, setThrowDirection] = useState<{ x: number; z: number }>({ x: 0, z: -1 })
  const [throwForce, setThrowForce] = useState(0.5)

  const activeDiceCount = diceConfig ? diceConfig.length : diceCount

  useEffect(() => {
    setIsRolling(false)
    setTargetValues([])
    setSettledCount(0)
    hasCompletedRef.current = false
  }, [activeDiceCount])

  const handleDieSettled = useCallback(
    (id: number, value: number) => {
      setSettledCount((prev) => {
        const newCount = prev + 1
        if (newCount === activeDiceCount && !hasCompletedRef.current) {
          hasCompletedRef.current = true
          setTimeout(() => {
            onRollComplete(targetValues)
          }, 2000)
        }
        return newCount
      })
    },
    [activeDiceCount, targetValues, onRollComplete],
  )

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (isRolling) return
      setIsDragging(true)
      setDragStart({ x: clientX, y: clientY })
      setDragEnd({ x: clientX, y: clientY })
    },
    [isRolling],
  )

  const moveDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return
      setDragEnd({ x: clientX, y: clientY })
    },
    [isDragging],
  )

  const endDrag = useCallback(() => {
    if (!isDragging || !dragStart || !dragEnd || isRolling) {
      setIsDragging(false)
      setDragStart(null)
      setDragEnd(null)
      return
    }

    const dx = dragEnd.x - dragStart.x
    const dy = dragEnd.y - dragStart.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 50) {
      const length = Math.sqrt(dx * dx + dy * dy)
      const normalizedX = dx / length
      const normalizedZ = dy / length

      const force = Math.min(1, Math.max(0.3, distance / 300))

      setThrowDirection({ x: normalizedX, z: normalizedZ })
      setThrowForce(force)

      const values = Array.from({ length: activeDiceCount }, (_, i) => {
        const type = diceConfig ? diceConfig[i] : diceType
        if (type === "d6") return Math.floor(Math.random() * 6) + 1
        if (type === "d10" || type === "d100") return Math.floor(Math.random() * 10) + 1
        if (type === "d20") return Math.floor(Math.random() * 20) + 1
        return 1
      })

      setTargetValues(values)
      setRollKey((prev) => prev + 1)
      setIsRolling(true)
      setSettledCount(0)
      hasCompletedRef.current = false
    }

    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }, [isDragging, dragStart, dragEnd, isRolling, activeDiceCount, diceType, diceConfig])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      startDrag(touch.clientX, touch.clientY)
    }
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      moveDrag(touch.clientX, touch.clientY)
    }
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      endDrag()
    }
    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd, { passive: false })
    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [startDrag, moveDrag, endDrag])

  const getRelativePos = (pos: { x: number; y: number } | null) => {
    if (!pos || !containerRef.current) return null
    const rect = containerRef.current.getBoundingClientRect()
    return { x: pos.x - rect.left, y: pos.y - rect.top }
  }

  const relStart = getRelativePos(dragStart)
  const relEnd = getRelativePos(dragEnd)

  if (canvasError) {
    return (
      <div className="w-full h-[400px] bg-slate-900 rounded-xl flex items-center justify-center">
        <p className="text-red-400">Error: {canvasError}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative select-none"
      style={{ touchAction: "none" }}
      onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
      onMouseMove={(e) => moveDrag(e.clientX, e.clientY)}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
    >
      <Suspense
        fallback={
          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
            <p className="text-white">Cargando dados 3D...</p>
          </div>
        }
      >
        <Canvas
          shadows
          camera={{ position: [0, 8, 8], fov: 45 }}
          style={{ cursor: isRolling ? "default" : isDragging ? "grabbing" : "grab" }}
        >
          <SceneContent
            diceCount={activeDiceCount}
            isRolling={isRolling}
            rollKey={rollKey}
            targetValues={targetValues}
            throwDirection={throwDirection}
            throwForce={throwForce}
            onDieSettled={handleDieSettled}
            diceType={diceType}
            diceConfig={diceConfig}
          />
        </Canvas>
      </Suspense>

      <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-10">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg text-center">
          {isRolling ? (
            <p className="text-white font-medium">Lanzando dados...</p>
          ) : (
            <p className="text-white/80 text-sm">Arrastra para lanzar los dados</p>
          )}
        </div>
      </div>

      {isDragging && relStart && relEnd && (
        <svg className="absolute inset-0 pointer-events-none z-20" style={{ overflow: "visible" }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.8)" />
            </marker>
          </defs>
          <line
            x1={relStart.x}
            y1={relStart.y}
            x2={relEnd.x}
            y2={relEnd.y}
            stroke="rgba(255,255,255,0.8)"
            strokeWidth="3"
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
          />
          <circle cx={relStart.x} cy={relStart.y} r="8" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="2" />
        </svg>
      )}
    </div>
  )
}