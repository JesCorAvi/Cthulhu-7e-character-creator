"use client"

import type React from "react"
import { useRef, useState, useEffect, useCallback, Suspense, useMemo, useLayoutEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, RoundedBox } from "@react-three/drei"
import * as THREE from "three"

// Simple dice component with manual animation
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
  allPositions: React.MutableRefObject<THREE.Vector3[]> // Nueva prop para ver a los otros dados
  onSettled: (id: number, value: number) => void
  onPositionUpdate: (id: number, pos: THREE.Vector3) => void
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
}: DieProps) {
  const groupRef = useRef<THREE.Group>(null)
  
  const phase = useRef<"waiting" | "rolling" | "settling" | "settled">("waiting")
  const currentPos = useRef<THREE.Vector3>(new THREE.Vector3(position[0], -0.5, position[2]))
  const rotation = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0))
  
  const animationTime = useRef(0)
  const hasSettled = useRef(false)
  const settlingStartRotation = useRef<[number, number, number]>([0, 0, 0])
  const startingPos = useRef<[number, number, number]>([position[0], -0.5, position[2]])

  // Offset acumulado por colisiones (empujones)
  const collisionOffset = useRef(new THREE.Vector3(0, 0, 0))
  const collisionRotOffset = useRef(new THREE.Euler(0, 0, 0))

  // Variables de Caos
  const chaosRef = useRef({
      spinAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
      spinSpeed: 20 + Math.random() * 15,
      driftX: (Math.random() - 0.5) * 2,
      driftZ: (Math.random() - 0.5) * 2
  })

  // --- 1. LÓGICA DE ROTACIÓN ---
  const getFinalRotation = (value: number): [number, number, number] => {
    switch (value) {
      case 1: return [0, 0, 0]
      case 2: return [-Math.PI / 2, 0, 0]
      case 3: return [0, 0, Math.PI / 2]
      case 4: return [0, 0, -Math.PI / 2]
      case 5: return [Math.PI / 2, 0, 0]
      case 6: return [Math.PI, 0, 0]
      default: return [0, 0, 0]
    }
  }

  const normalizeAngle = (angle: number): number => {
    let normalized = angle % (Math.PI * 2)
    if (normalized > Math.PI) normalized -= Math.PI * 2
    if (normalized < -Math.PI) normalized += Math.PI * 2
    return normalized
  }

  const findClosestTargetRotation = (
    current: [number, number, number],
    target: [number, number, number],
  ): [number, number, number] => {
    return target.map((t, i) => {
      const c = current[i]
      const diff = normalizeAngle(t - c)
      return c + diff
    }) as [number, number, number]
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

  // RESET
  useEffect(() => {
    phase.current = "waiting"
    startingPos.current = [position[0], -0.5, position[2]]
    currentPos.current.set(position[0], -0.5, position[2])
    rotation.current.set(0, 0, 0)
    hasSettled.current = false
    animationTime.current = 0
    
    // Reset colisiones
    collisionOffset.current.set(0, 0, 0)
    collisionRotOffset.current.set(0, 0, 0)
    
    chaosRef.current = {
      spinAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      spinSpeed: 25 + Math.random() * 20,
      driftX: (Math.random() - 0.5) * 3,
      driftZ: (Math.random() - 0.5) * 3
    }

    if (groupRef.current) {
      groupRef.current.position.set(position[0], -0.5, position[2])
      groupRef.current.rotation.set(0, 0, 0)
    }
  }, [rollKey])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (phase.current === "rolling") {
      animationTime.current += delta
      const rollDuration = 1.6
      const progress = Math.min(animationTime.current / rollDuration, 1)

      // A. Posición Base (Trayectoria)
      const maxThrowDistance = 7 * throwForce
      const throwProgress = Math.min(progress * 1.1, 1)
      const easeOut = 1 - Math.pow(1 - throwProgress, 2)
      
      const throwOffsetX = throwDirection.x * maxThrowDistance * easeOut
      const throwOffsetZ = throwDirection.z * maxThrowDistance * easeOut
      
      const driftScale = Math.sin(progress * Math.PI) * 1.5
      const currentDriftX = chaosRef.current.driftX * driftScale * 0.5
      const currentDriftZ = chaosRef.current.driftZ * driftScale * 0.5

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

      // Posición "ideal" antes de colisiones
      const idealX = startingPos.current[0] + throwOffsetX + currentDriftX
      const idealZ = startingPos.current[2] + throwOffsetZ + currentDriftZ

      // B. DETECCIÓN DE COLISIONES (Repulsión)
      const myPos = new THREE.Vector3(idealX + collisionOffset.current.x, y, idealZ + collisionOffset.current.z)
      
      // Chequear contra todos los otros dados
      allPositions.current.forEach((otherPos, index) => {
          if (index === id) return // No chocar conmigo mismo
          
          const dist = myPos.distanceTo(otherPos)
          const MIN_DIST = 1.1 // Tamaño del dado (1) + margen (0.1)
          
          if (dist < MIN_DIST) {
              // Vector de empuje (desde el otro dado hacia mí)
              const pushDir = new THREE.Vector3().subVectors(myPos, otherPos).normalize()
              
              // Evitar NaNs si están en la misma posición exacta
              if (pushDir.lengthSq() === 0) pushDir.set(Math.random()-0.5, 0, Math.random()-0.5).normalize()
              
              // Fuerza de repulsión (cuanto más cerca, más fuerte)
              const overlap = MIN_DIST - dist
              const pushForce = overlap * 0.15 // Factor de suavidad

              // Acumular el empujón en mi offset
              collisionOffset.current.x += pushDir.x * pushForce
              collisionOffset.current.z += pushDir.z * pushForce

              // Efecto visual: Cambiar rotación al chocar
              collisionRotOffset.current.x += (Math.random() - 0.5) * 0.5
              collisionRotOffset.current.z += (Math.random() - 0.5) * 0.5
          }
      })

      // Aplicar posición final
      currentPos.current.set(
        idealX + collisionOffset.current.x,
        y,
        idealZ + collisionOffset.current.z
      )

      // C. Rotación
      const spinDamping = Math.max(0, 1 - Math.pow(progress, 3))
      const currentSpinSpeed = chaosRef.current.spinSpeed * spinDamping * delta

      rotation.current.x += chaosRef.current.spinAxis.x * currentSpinSpeed + collisionRotOffset.current.x * 0.1
      rotation.current.y += chaosRef.current.spinAxis.y * currentSpinSpeed
      rotation.current.z += chaosRef.current.spinAxis.z * currentSpinSpeed + collisionRotOffset.current.z * 0.1
      
      // Decaer el efecto de choque en rotación
      collisionRotOffset.current.x *= 0.9
      collisionRotOffset.current.z *= 0.9

      // D. Guía Invisible (Corrección final)
      if (progress > 0.75) {
         const finalRot = getFinalRotation(targetValue)
         const currentRotTuple: [number, number, number] = [rotation.current.x, rotation.current.y, rotation.current.z]
         const targetRot = findClosestTargetRotation(currentRotTuple, finalRot)
         
         const guideStrength = Math.pow((progress - 0.75) / 0.25, 3) * 0.25
         
         rotation.current.x += (targetRot[0] - rotation.current.x) * guideStrength
         rotation.current.y += (targetRot[1] - rotation.current.y) * guideStrength
         rotation.current.z += (targetRot[2] - rotation.current.z) * guideStrength
      }

      if (progress >= 1) {
        settlingStartRotation.current = [rotation.current.x, rotation.current.y, rotation.current.z]
        phase.current = "settling"
        animationTime.current = 0
      }
    }

    if (phase.current === "settling") {
      animationTime.current += delta
      const settleDuration = 0.5
      const progress = Math.min(animationTime.current / settleDuration, 1)
      
      const c1 = 1.70158;
      const c3 = c1 + 1;
      const eased = 1 + c3 * Math.pow(progress - 1, 3) + c1 * Math.pow(progress - 1, 2);

      const finalRot = getFinalRotation(targetValue)
      const startRot = settlingStartRotation.current
      const closestTarget = findClosestTargetRotation(startRot, finalRot)

      rotation.current.set(
        startRot[0] + (closestTarget[0] - startRot[0]) * eased,
        startRot[1] + (closestTarget[1] - startRot[1]) * eased,
        startRot[2] + (closestTarget[2] - startRot[2]) * eased
      )
      
      // Mantener separación en el suelo también
      const myPos = currentPos.current.clone()
      myPos.y = -0.5 // Forzar altura de suelo
      
      allPositions.current.forEach((otherPos, index) => {
          if (index === id) return
          const dist = myPos.distanceTo(otherPos)
          const MIN_DIST = 1.1
           if (dist < MIN_DIST) {
              const pushDir = new THREE.Vector3().subVectors(myPos, otherPos).normalize()
              if (pushDir.lengthSq() === 0) pushDir.set(1,0,0)
              
              const pushForce = (MIN_DIST - dist) * 0.1
              collisionOffset.current.x += pushDir.x * pushForce
              collisionOffset.current.z += pushDir.z * pushForce
           }
      })

      // Vibración de impacto
      let wobbleY = -0.5
      if (progress < 0.5) {
          wobbleY += Math.sin(progress * Math.PI * 4) * 0.05 * (1 - progress*2)
      }
      
      currentPos.current.set(
          startingPos.current[0] + 7*throwForce*throwDirection.x + chaosRef.current.driftX*0.75*0.5 + collisionOffset.current.x, // Estimado final aproximado
          wobbleY,
          startingPos.current[2] + 7*throwForce*throwDirection.z + chaosRef.current.driftZ*0.75*0.5 + collisionOffset.current.z
      )
      // Nota: En settling simplificamos la posición X/Z para que no "tiemble", 
      // usando el último collisionOffset acumulado

      if (progress >= 1 && !hasSettled.current) {
        hasSettled.current = true
        phase.current = "settled"
        onSettled(id, targetValue)
      }
    }

    groupRef.current.position.copy(currentPos.current)
    groupRef.current.rotation.copy(rotation.current)
    
    // IMPORTANTE: Reportar mi posición actual al sistema central
    onPositionUpdate(id, currentPos.current)
  })

  return (
    <group ref={groupRef}>
      <RoundedBox args={[1, 1, 1]} radius={0.1} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
      </RoundedBox>
      <DiceDots position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} value={1} />
      <DiceDots position={[0, -0.51, 0]} rotation={[Math.PI / 2, 0, 0]} value={6} />
      <DiceDots position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]} value={3} />
      <DiceDots position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]} value={4} />
      <DiceDots position={[0, 0, 0.51]} rotation={[0, 0, 0]} value={2} />
      <DiceDots position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]} value={5} />
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
    case 1:
      return [[0, 0]]
    case 2:
      return [[-s, s], [s, -s]]
    case 3:
      return [[-s, s], [0, 0], [s, -s]]
    case 4:
      return [[-s, s], [s, s], [-s, -s], [s, -s]]
    case 5:
      return [[-s, s], [s, s], [0, 0], [-s, -s], [s, -s]]
    case 6:
      return [[-s, s], [-s, 0], [-s, -s], [s, s], [s, 0], [s, -s]]
    default:
      return []
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
}: {
  dicePositionsRef: React.MutableRefObject<THREE.Vector3[]>
  isRolling: boolean
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

    const desiredCameraPos = new THREE.Vector3(center.x * 0.5, 8, 8 + center.z * 0.3)

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
}: {
  diceCount: number
  isRolling: boolean
  rollKey: number
  targetValues: number[]
  throwDirection: { x: number; z: number }
  throwForce: number
  onDieSettled: (id: number, value: number) => void
}) {
  const DICE_COLORS = ["#dc2626", "#2563eb", "#16a34a", "#ca8a04", "#9333ea", "#db2777"]

  const positions = useMemo(() => {
    if (diceCount === 1) return [[0, 0, 0]] as [number, number, number][]
    if (diceCount === 2)
      return [
        [-1, 0, 0],
        [1, 0, 0],
      ] as [number, number, number][]
    if (diceCount === 3)
      return [
        [-1.2, 0, 0.5],
        [1.2, 0, 0.5],
        [0, 0, -0.8],
      ] as [number, number, number][]
    if (diceCount === 4)
      return [
        [-1.2, 0, -0.8],
        [1.2, 0, -0.8],
        [-1.2, 0, 0.8],
        [1.2, 0, 0.8],
      ] as [number, number, number][]
    return Array.from({ length: diceCount }, (_, i) => {
      const angle = (i / diceCount) * Math.PI * 2
      return [Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5] as [number, number, number]
    })
  }, [diceCount])

  // Esta referencia guarda la "verdad" de dónde están todos los dados
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

      <CameraController dicePositionsRef={dicePositionsRef} isRolling={isRolling} />

      <Table />
      {positions.map((pos, i) => (
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
          allPositions={dicePositionsRef} // Pasamos la "visión" global a cada dado
          onSettled={onDieSettled}
          onPositionUpdate={handlePositionUpdate}
        />
      ))}
      <Environment preset="city" />
    </>
  )
}

interface Dice3DSceneProps {
  diceCount: number
  onRollComplete: (values: number[]) => void
}

export function Dice3DScene({ diceCount, onRollComplete }: Dice3DSceneProps) {
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

  useEffect(() => {
    setIsRolling(false)
    setTargetValues([])
    setSettledCount(0)
    hasCompletedRef.current = false
  }, [diceCount])

  const handleDieSettled = useCallback(
    (id: number, value: number) => {
      setSettledCount((prev) => {
        const newCount = prev + 1
        if (newCount === diceCount && !hasCompletedRef.current) {
          hasCompletedRef.current = true
          setTimeout(() => {
            onRollComplete(targetValues)
          }, 2000)
        }
        return newCount
      })
    },
    [diceCount, targetValues, onRollComplete],
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

      const values = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1)
      setTargetValues(values)
      setRollKey((prev) => prev + 1)
      setIsRolling(true)
      setSettledCount(0)
      hasCompletedRef.current = false
    }

    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }, [isDragging, dragStart, dragEnd, isRolling, diceCount])

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
            diceCount={diceCount}
            isRolling={isRolling}
            rollKey={rollKey}
            targetValues={targetValues}
            throwDirection={throwDirection}
            throwForce={throwForce}
            onDieSettled={handleDieSettled}
          />
        </Canvas>
      </Suspense>

      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-10">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg text-center">
          {isRolling ? (
            <p className="text-white font-medium">Lanzando dados...</p>
          ) : (
            <p className="text-white/80 text-sm">Arrastra para lanzar los dados</p>
          )}
        </div>
      </div>

      {/* Drag indicator */}
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