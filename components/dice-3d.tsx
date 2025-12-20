"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback, Suspense, useMemo, useLayoutEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Text } from "@react-three/drei"
import * as THREE from "three"

// --- GEOMETRÍA D10 ---
const D10_GEO = {
  r: 0.65,
  h: 0.55,
  zigzag: 0.08,
}

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
    center: THREE.Vector3
    normal: THREE.Vector3
    value: number
    upVector: THREE.Vector3 
  }[] = []

  const vertices: number[] = []

  const addTriangle = (v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) => {
    vertices.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z)
  }

  const computeNormal = (v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) => {
    const edge1 = new THREE.Vector3().subVectors(v2, v1)
    const edge2 = new THREE.Vector3().subVectors(v3, v1)
    return new THREE.Vector3().crossVectors(edge1, edge2).normalize()
  }

  // Caras Superiores
  for (let i = 0; i < 5; i++) {
    const idxCenter = i * 2 + 1
    const idxLeft = (idxCenter - 1 + 10) % 10
    const idxRight = (idxCenter + 1) % 10
    
    const vPole = topPole
    const vLeft = eqPoints[idxLeft]
    const vCenter = eqPoints[idxCenter]
    const vRight = eqPoints[idxRight]

    addTriangle(vPole, vLeft, vCenter)
    addTriangle(vPole, vCenter, vRight)

    const n1 = computeNormal(vPole, vLeft, vCenter)
    const n2 = computeNormal(vPole, vCenter, vRight)
    const avgNormal = n1.add(n2).normalize()
    
    const center = new THREE.Vector3().add(vPole).add(vLeft).add(vCenter).add(vRight).divideScalar(4)
    const upVector = new THREE.Vector3().subVectors(vPole, center).normalize()

    faces.push({ center, normal: avgNormal, value: i * 2 + 1, upVector })
  }

  // Caras Inferiores
  for (let i = 0; i < 5; i++) {
    const idxCenter = i * 2
    const idxLeft = (idxCenter - 1 + 10) % 10
    const idxRight = (idxCenter + 1) % 10
    
    const vPole = botPole
    const vRight = eqPoints[idxRight]
    const vCenter = eqPoints[idxCenter]
    const vLeft = eqPoints[idxLeft]

    addTriangle(vPole, vRight, vCenter)
    addTriangle(vPole, vCenter, vLeft)

    const n1 = computeNormal(vPole, vRight, vCenter)
    const n2 = computeNormal(vPole, vCenter, vLeft)
    const avgNormal = n1.add(n2).normalize()

    const center = new THREE.Vector3().add(vPole).add(vRight).add(vCenter).add(vLeft).divideScalar(4)
    const upVector = new THREE.Vector3().subVectors(vPole, center).normalize()

    let val = i * 2 + 2
    if (val === 10) val = 0 

    faces.push({ center, normal: avgNormal, value: val, upVector })
  }

  return { faces, vertices }
}

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

  const state = useRef<{
    active: boolean
    time: number
    duration: number
    startPos: THREE.Vector3
    startQ: THREE.Quaternion
    targetQ: THREE.Quaternion
    tumbleAxis: THREE.Vector3
    spins: number
    driftX: number
    driftZ: number
    hasSettledCallbackFired: boolean
  }>({
    active: false,
    time: 0,
    duration: 2.0,
    startPos: new THREE.Vector3(),
    startQ: new THREE.Quaternion(),
    targetQ: new THREE.Quaternion(),
    tumbleAxis: new THREE.Vector3(1, 0, 0),
    spins: 0,
    driftX: 0,
    driftZ: 0,
    hasSettledCallbackFired: false
  })

  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3(position[0], -0.5, position[2]))
  const collisionOffset = useRef(new THREE.Vector3(0, 0, 0))

  // --- 1. Calcular Orientación Final Robusta ---
  const calculateTargetQuaternion = (value: number, type: DiceType): THREE.Quaternion => {
    // Definir vectores locales (Normal y Up) para la cara deseada.
    const localNormal = new THREE.Vector3(0, 1, 0);
    const localUp = new THREE.Vector3(0, 0, -1);

    if (type === 'd6') {
        switch (value) {
            case 1: localNormal.set(0, 1, 0); localUp.set(0, 0, -1); break;
            case 2: localNormal.set(0, 0, 1); localUp.set(0, 1, 0); break;
            case 3: localNormal.set(1, 0, 0); localUp.set(0, 1, 0); break;
            case 4: localNormal.set(-1, 0, 0); localUp.set(0, 1, 0); break;
            case 5: localNormal.set(0, 0, -1); localUp.set(0, 1, 0); break;
            case 6: localNormal.set(0, -1, 0); localUp.set(0, 0, 1); break;
        }
    } else if (type === 'd10' || type === 'd100') {
         const face = D10_DATA.faces.find(f => f.value === value);
         if (face) {
             localNormal.copy(face.normal);
             localUp.copy(face.upVector);
         }
    }

    // A. Rotación para llevar la cara al cielo (0,1,0)
    const targetNormalWorld = new THREE.Vector3(0, 1, 0);
    const qAlign = new THREE.Quaternion().setFromUnitVectors(localNormal, targetNormalWorld);

    // B. Ver dónde quedó el vector "Up" tras esa alineación
    const currentUpWorld = localUp.clone().applyQuaternion(qAlign);

    // C. Decidir rotación final (Yaw) en el plano horizontal
    let targetYaw = 0;
    if (type === 'd6') {
         const quadrant = Math.floor(Math.random() * 4);
         targetYaw = quadrant * (Math.PI / 2);
    } else {
         targetYaw = (Math.random() - 0.5) * Math.PI * 2;
    }

    const targetUpDir = new THREE.Vector3(Math.sin(targetYaw), 0, -Math.cos(targetYaw)).normalize();
    const flatCurrentUp = new THREE.Vector3(currentUpWorld.x, 0, currentUpWorld.z).normalize();
    
    const qYaw = new THREE.Quaternion();
    if (flatCurrentUp.lengthSq() > 0.01) {
        qYaw.setFromUnitVectors(flatCurrentUp, targetUpDir);
    }

    return qYaw.multiply(qAlign);
  }

  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(position[0], -0.5, position[2])
      groupRef.current.rotation.set(0, 0, 0)
    }
    currentPos.current.set(position[0], -0.5, position[2])
  }, [position])

  // --- 2. Preparar el Lanzamiento ---
  useEffect(() => {
    if (isRolling && !state.current.active) {
      const timer = setTimeout(() => {
        if (!groupRef.current) return;

        const startQ = groupRef.current.quaternion.clone();
        const targetQ = calculateTargetQuaternion(targetValue, diceType);

        // Elegir un eje de rotación "divertido" (horizontal) para el tumbling
        const randAngle = Math.random() * Math.PI * 2;
        const tumbleAxis = new THREE.Vector3(Math.cos(randAngle), 0, Math.sin(randAngle)).normalize();
        
        // Número ENTERO de vueltas extra (para asegurar que 360 grados nos devuelven a la orientación original relativa)
        const spins = 3 + Math.floor(Math.random() * 3); 

        state.current = {
          active: true,
          time: 0,
          duration: 1.8,
          startPos: currentPos.current.clone(),
          startQ: startQ,
          targetQ: targetQ,
          tumbleAxis: tumbleAxis,
          spins: spins,
          driftX: (Math.random() - 0.5) * 3,
          driftZ: (Math.random() - 0.5) * 3,
          hasSettledCallbackFired: false
        }
        
        collisionOffset.current.set(0,0,0)

      }, startDelay)
      return () => clearTimeout(timer)
    } else if (!isRolling) {
      state.current.active = false;
      state.current.hasSettledCallbackFired = false;
    }
  }, [isRolling, startDelay, rollKey, targetValue, diceType])

  useFrame((_, delta) => {
    if (!state.current.active || !groupRef.current) return

    state.current.time += delta
    
    const progress = Math.min(state.current.time / state.current.duration, 1)
    
    // Easing suave
    const easeOut = 1 - Math.pow(1 - progress, 4); 
    
    // --- LÓGICA DE ROTACIÓN CORREGIDA (SLERP + TUMBLE) ---
    // 1. Interpolamos desde Start hasta Target (camino más corto).
    // Esto garantiza que al final (progress=1), la base de la rotación sea EXACTAMENTE targetQ.
    const qBase = state.current.startQ.clone().slerp(state.current.targetQ, easeOut);
    
    // 2. Calculamos una rotación adicional "Tumble" (volteretas) sobre un eje horizontal.
    // Usamos vueltas completas (N * 360 grados).
    // Al principio (progress=0), ángulo 0 -> Identidad.
    // Al final (progress=1), ángulo N*360 -> Identidad.
    // Durante el movimiento, añade giros locos.
    const tumbleAngle = easeOut * state.current.spins * Math.PI * 2;
    const qTumble = new THREE.Quaternion().setFromAxisAngle(state.current.tumbleAxis, tumbleAngle);
    
    // 3. Combinamos: Aplicamos el Tumble en coordenadas globales a la interpolación base.
    groupRef.current.quaternion.multiplyQuaternions(qTumble, qBase);

    // Forzar exactitud al final para evitar micro-errores de flotante
    if (progress >= 1) {
       groupRef.current.quaternion.copy(state.current.targetQ);
    }

    // --- POSICIÓN ---
    const maxThrowDistance = 7 * throwForce
    const throwProgress = Math.min(progress * 1.1, 1)
    const posEase = 1 - Math.pow(1 - throwProgress, 2)
    
    const throwOffsetX = throwDirection.x * maxThrowDistance * posEase
    const throwOffsetZ = throwDirection.z * maxThrowDistance * posEase
    
    const FLOOR_Y = diceType === "d6" ? -0.5 : -0.55;

    let y = FLOOR_Y
    
    // Rebotes simples
    if (progress < 0.2) {
       const p = progress / 0.2;
       y = FLOOR_Y + Math.sin(p * Math.PI) * 1.5;
    } else if (progress < 0.45) {
       const p = (progress - 0.2) / 0.25;
       y = FLOOR_Y + Math.sin(p * Math.PI) * 0.6;
    } else if (progress < 0.65) {
       const p = (progress - 0.45) / 0.2;
       y = FLOOR_Y + Math.sin(p * Math.PI) * 0.2;
    }

    const driftScale = Math.sin(progress * Math.PI) * 1.0;
    const idealX = state.current.startPos.x + throwOffsetX + (state.current.driftX * driftScale * 0.5)
    const idealZ = state.current.startPos.z + throwOffsetZ + (state.current.driftZ * driftScale * 0.5)

    const COLLISION_RADIUS = 1.1
    const myPos = new THREE.Vector3(idealX + collisionOffset.current.x, y, idealZ + collisionOffset.current.z)
    
    allPositions.current.forEach((otherPos, index) => {
      if (index === id) return
      const dist = new THREE.Vector3(myPos.x, 0, myPos.z).distanceTo(new THREE.Vector3(otherPos.x, 0, otherPos.z))
      
      if (dist < COLLISION_RADIUS) {
        const pushDir = new THREE.Vector3().subVectors(myPos, otherPos).normalize()
        pushDir.y = 0
        if (pushDir.lengthSq() === 0) pushDir.set(Math.random()-0.5, 0, Math.random()-0.5).normalize()
        
        const pushForce = (COLLISION_RADIUS - dist) * (progress < 0.5 ? 0.15 : 0.05)
        collisionOffset.current.x += pushDir.x * pushForce
        collisionOffset.current.z += pushDir.z * pushForce
      }
    })

    currentPos.current.set(idealX + collisionOffset.current.x, y, idealZ + collisionOffset.current.z)
    groupRef.current.position.copy(currentPos.current)
    onPositionUpdate(id, currentPos.current)

    if (progress >= 1 && !state.current.hasSettledCallbackFired) {
        state.current.hasSettledCallbackFired = true;
        groupRef.current.position.y = FLOOR_Y; 
        onSettled(id, targetValue);
    }
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
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(D10_DATA.vertices, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  return (
    <group>
      {diceType === "d10" || diceType === "d100" ? (
        <>
          <mesh castShadow receiveShadow geometry={geometry}>
            <meshStandardMaterial color={color} roughness={0.2} metalness={0.3} flatShading side={THREE.DoubleSide} />
          </mesh>

          {D10_DATA.faces.map((face, i) => {
            let textStr = face.value.toString()
            if (diceType === "d100") {
              textStr = face.value === 0 ? "00" : `${face.value}0`
            }

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
                  const zAxis = face.normal.clone()
                  const yAxis = face.upVector.clone()
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
  isFinished,
  diceType,
  diceConfig,
}: {
  dicePositionsRef: React.MutableRefObject<THREE.Vector3[]>
  isRolling: boolean
  isFinished: boolean
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
    const isD10 = diceType === "d10" || (diceConfig && diceConfig.includes("d10"))
    const isD6 = diceType === "d6" || (diceConfig && diceConfig.includes("d6"))
    
    const shouldZoomTop = isFinished && (hasD100 || isD10 || isD6);

    let desiredCameraPos: THREE.Vector3;
    let lerpSpeed: number;

    if (shouldZoomTop) {
        const height = dicePositions.length > 3 ? 6.5 : 5.0
        desiredCameraPos = new THREE.Vector3(center.x, height, center.z + 0.1) 
        lerpSpeed = 2.0 
    } else {
        const zoomFactor = hasD100 ? 5.5 : 8
        desiredCameraPos = new THREE.Vector3(center.x * 0.5, zoomFactor, zoomFactor + center.z * 0.3)
        lerpSpeed = isRolling ? 3 : 5
    }

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
  isFinished,
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
  isFinished: boolean
  rollKey: number
  targetValues: number[]
  throwDirection: { x: number; z: number }
  throwForce: number
  onDieSettled: (id: number, value: number) => void
  diceType: DiceType
  diceConfig?: DiceType[]
}) {
  const DICE_COLORS = [
    "#e74c3c", // Rojo
    "#3498db", // Azul
    "#2ecc71", // Verde
    "#9b59b6", // Púrpura
    "#f1c40f", // Amarillo/Dorado
    "#34495e", // Azul oscuro/Gris
  ]

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
        isFinished={isFinished}
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
            targetValue={targetValues[i] ?? 1}
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
  const isFinished = settledCount === activeDiceCount && activeDiceCount > 0

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
        if (type === "d10" || type === "d100") return Math.floor(Math.random() * 10)
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
            isFinished={isFinished}
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