"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Physics, useBox, usePlane } from "@react-three/cannon"
import { Environment, Text, RoundedBox, Line } from "@react-three/drei"
import * as THREE from "three"

// Configuración de caras del dado - mapea la normal hacia arriba al valor de la cara opuesta
const FACE_NORMALS: { normal: THREE.Vector3; value: number }[] = [
  { normal: new THREE.Vector3(0, 1, 0), value: 6 },
  { normal: new THREE.Vector3(0, -1, 0), value: 1 },
  { normal: new THREE.Vector3(1, 0, 0), value: 3 },
  { normal: new THREE.Vector3(-1, 0, 0), value: 4 },
  { normal: new THREE.Vector3(0, 0, 1), value: 2 },
  { normal: new THREE.Vector3(0, 0, -1), value: 5 },
]

interface DiePhysicsProps {
  id: number
  color: string
  onValueDetermined: (id: number, value: number) => void
  throwForce: { x: number; y: number; z: number } | null
  startPosition: [number, number, number]
}

function Die3DPhysics({ id, color, onValueDetermined, throwForce, startPosition }: DiePhysicsProps) {
  const [ref, api] = useBox<THREE.Group>(() => ({
    mass: 1,
    position: startPosition,
    args: [1, 1, 1],
    material: {
      friction: 0.6,
      restitution: 0.3,
    },
    angularDamping: 0.3,
    linearDamping: 0.1,
  }))

  const [isSettled, setIsSettled] = useState(false)
  const [hasBeenThrown, setHasBeenThrown] = useState(false)
  const velocityRef = useRef([0, 0, 0])
  const angularRef = useRef([0, 0, 0])
  const positionRef = useRef([0, 0, 0])
  const settleTimer = useRef<NodeJS.Timeout | null>(null)
  const quaternionRef = useRef([0, 0, 0, 1])

  useEffect(() => {
    const unsubVel = api.velocity.subscribe((v) => (velocityRef.current = v))
    const unsubAng = api.angularVelocity.subscribe((v) => (angularRef.current = v))
    const unsubPos = api.position.subscribe((p) => (positionRef.current = p))
    const unsubQuat = api.quaternion.subscribe((q) => (quaternionRef.current = q))
    return () => {
      unsubVel()
      unsubAng()
      unsubPos()
      unsubQuat()
    }
  }, [api])

  // Aplicar fuerza cuando se lanza
  useEffect(() => {
    if (throwForce && !hasBeenThrown) {
      setHasBeenThrown(true)
      setIsSettled(false)

      api.velocity.set(throwForce.x * 8, throwForce.y * 6 + 5, throwForce.z * 8)
      api.angularVelocity.set((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20)
    }
  }, [throwForce, hasBeenThrown, api])

  // Detectar cuando el dado se detiene
  useFrame(() => {
    if (!hasBeenThrown || isSettled) return

    const vel = Math.sqrt(velocityRef.current[0] ** 2 + velocityRef.current[1] ** 2 + velocityRef.current[2] ** 2)
    const angVel = Math.sqrt(angularRef.current[0] ** 2 + angularRef.current[1] ** 2 + angularRef.current[2] ** 2)

    if (vel < 0.05 && angVel < 0.05 && positionRef.current[1] < 0) {
      if (!settleTimer.current) {
        settleTimer.current = setTimeout(() => {
          const quat = new THREE.Quaternion(
            quaternionRef.current[0],
            quaternionRef.current[1],
            quaternionRef.current[2],
            quaternionRef.current[3],
          )

          const upVector = new THREE.Vector3(0, 1, 0)
          let maxDot = Number.NEGATIVE_INFINITY
          let faceValue = 1

          for (const face of FACE_NORMALS) {
            const rotatedNormal = face.normal.clone().applyQuaternion(quat)
            const dot = rotatedNormal.dot(upVector)
            if (dot > maxDot) {
              maxDot = dot
              faceValue = face.value
            }
          }

          setIsSettled(true)
          onValueDetermined(id, faceValue)
        }, 300)
      }
    } else {
      if (settleTimer.current) {
        clearTimeout(settleTimer.current)
        settleTimer.current = null
      }
    }
  })

  return (
    <group ref={ref}>
      <RoundedBox args={[1, 1, 1]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
      </RoundedBox>
      <DiceFace position={[0, 0.51, 0]} rotation={[-Math.PI / 2, 0, 0]} value={1} />
      <DiceFace position={[0, -0.51, 0]} rotation={[Math.PI / 2, 0, 0]} value={6} />
      <DiceFace position={[0.51, 0, 0]} rotation={[0, Math.PI / 2, 0]} value={3} />
      <DiceFace position={[-0.51, 0, 0]} rotation={[0, -Math.PI / 2, 0]} value={4} />
      <DiceFace position={[0, 0, 0.51]} rotation={[0, 0, 0]} value={2} />
      <DiceFace position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]} value={5} />
    </group>
  )
}

function DiceFace({
  position,
  rotation,
  value,
}: { position: [number, number, number]; rotation: [number, number, number]; value: number }) {
  const dotPositions = getDotPositions(value)

  return (
    <group position={position} rotation={rotation}>
      {dotPositions.map((pos, idx) => (
        <mesh key={idx} position={[pos[0], pos[1], 0.01]}>
          <circleGeometry args={[0.08, 16]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  )
}

function getDotPositions(value: number): [number, number][] {
  const s = 0.25
  switch (value) {
    case 1:
      return [[0, 0]]
    case 2:
      return [
        [-s, s],
        [s, -s],
      ]
    case 3:
      return [
        [-s, s],
        [0, 0],
        [s, -s],
      ]
    case 4:
      return [
        [-s, s],
        [s, s],
        [-s, -s],
        [s, -s],
      ]
    case 5:
      return [
        [-s, s],
        [s, s],
        [0, 0],
        [-s, -s],
        [s, -s],
      ]
    case 6:
      return [
        [-s, s],
        [-s, 0],
        [-s, -s],
        [s, s],
        [s, 0],
        [s, -s],
      ]
    default:
      return []
  }
}

function Ground() {
  const [ref] = usePlane<THREE.Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -1.5, 0],
    material: { friction: 0.8, restitution: 0.2 },
  }))

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#1a472a" roughness={0.9} />
    </mesh>
  )
}

function Walls() {
  const wallProps = { material: { friction: 0.5, restitution: 0.5 } }

  const [back] = usePlane<THREE.Mesh>(() => ({ ...wallProps, position: [0, 0, -6], rotation: [0, 0, 0] }))
  const [front] = usePlane<THREE.Mesh>(() => ({ ...wallProps, position: [0, 0, 6], rotation: [0, Math.PI, 0] }))
  const [left] = usePlane<THREE.Mesh>(() => ({ ...wallProps, position: [-6, 0, 0], rotation: [0, Math.PI / 2, 0] }))
  const [right] = usePlane<THREE.Mesh>(() => ({ ...wallProps, position: [6, 0, 0], rotation: [0, -Math.PI / 2, 0] }))

  return (
    <>
      <mesh ref={back}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#2d1810" transparent opacity={0.3} />
      </mesh>
      <mesh ref={front}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#2d1810" transparent opacity={0.3} />
      </mesh>
      <mesh ref={left}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#2d1810" transparent opacity={0.3} />
      </mesh>
      <mesh ref={right}>
        <planeGeometry args={[12, 8]} />
        <meshStandardMaterial color="#2d1810" transparent opacity={0.3} />
      </mesh>
    </>
  )
}

function ThrowZone({
  diceCount,
  canThrow,
  dragState,
}: {
  diceCount: number
  canThrow: boolean
  dragState: {
    isDragging: boolean
    startWorld: { x: number; z: number } | null
    currentWorld: { x: number; z: number } | null
  }
}) {
  const { isDragging, startWorld, currentWorld } = dragState

  const arrowPoints: [number, number, number][] =
    isDragging && startWorld && currentWorld
      ? [
          [startWorld.x, -1.4, startWorld.z],
          [currentWorld.x, -1.4, currentWorld.z],
        ]
      : []

  return (
    <>
      {/* Visual throw zone indicator */}
      {canThrow && (
        <mesh position={[0, -1.49, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2, 3, 32]} />
          <meshBasicMaterial color="#4ade80" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Drag direction arrow */}
      {isDragging && arrowPoints.length === 2 && <Line points={arrowPoints} color="#ef4444" lineWidth={4} />}

      {/* Instruction text */}
      {canThrow && !isDragging && (
        <Text
          position={[0, -1.4, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {`Arrastra para lanzar ${diceCount} dado${diceCount > 1 ? "s" : ""}`}
        </Text>
      )}
    </>
  )
}

function WaitingDice({ count, colors }: { count: number; colors: string[] }) {
  return (
    <group position={[0, 0, 4]}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI - Math.PI / 2
        const radius = count > 1 ? 1.2 : 0
        return (
          <group key={i} position={[Math.cos(angle) * radius, -0.5, Math.sin(angle) * radius]}>
            <RoundedBox args={[0.8, 0.8, 0.8]} radius={0.06} smoothness={4} castShadow>
              <meshStandardMaterial color={colors[i % colors.length]} roughness={0.2} metalness={0.1} />
            </RoundedBox>
            <DiceFace position={[0, 0, 0.41]} rotation={[0, 0, 0]} value={i + 1} />
          </group>
        )
      })}
    </group>
  )
}

interface Dice3DSceneProps {
  diceCount: number
  onRollComplete: (values: number[]) => void
  onReady?: () => void
}

export function Dice3DScene({ diceCount, onRollComplete, onReady }: Dice3DSceneProps) {
  const [throwForce, setThrowForce] = useState<{ x: number; y: number; z: number } | null>(null)
  const [diceValues, setDiceValues] = useState<Map<number, number>>(new Map())
  const [isThrown, setIsThrown] = useState(false)
  const [rollComplete, setRollComplete] = useState(false)
  const hasCalledComplete = useRef(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null)
  const [dragWorldStart, setDragWorldStart] = useState<{ x: number; z: number } | null>(null)
  const [dragWorldCurrent, setDragWorldCurrent] = useState<{ x: number; z: number } | null>(null)

  const DICE_COLORS = ["#dc2626", "#2563eb", "#16a34a", "#ca8a04", "#9333ea", "#db2777"]

  // Convert screen coordinates to world coordinates on the table plane
  const screenToWorld = useCallback((screenX: number, screenY: number, rect: DOMRect) => {
    const x = ((screenX - rect.left) / rect.width) * 2 - 1
    const y = -((screenY - rect.top) / rect.height) * 2 + 1
    const worldX = x * 8
    const worldZ = -y * 6 + 2
    return { x: worldX, z: worldZ }
  }, [])

  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      if (isThrown) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      setIsDragging(true)
      setDragStart({ x: clientX, y: clientY })
      setDragCurrent({ x: clientX, y: clientY })

      const world = screenToWorld(clientX, clientY, rect)
      setDragWorldStart(world)
      setDragWorldCurrent(world)
    },
    [isThrown, screenToWorld],
  )

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      setDragCurrent({ x: clientX, y: clientY })
      const world = screenToWorld(clientX, clientY, rect)
      setDragWorldCurrent(world)
    },
    [isDragging, screenToWorld],
  )

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !dragStart || !dragCurrent || isThrown) {
      setIsDragging(false)
      setDragStart(null)
      setDragCurrent(null)
      setDragWorldStart(null)
      setDragWorldCurrent(null)
      return
    }

    const dx = dragCurrent.x - dragStart.x
    const dy = dragCurrent.y - dragStart.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance > 30) {
      const force = Math.min(distance / 30, 8)
      setThrowForce({
        x: (dx / distance) * force,
        y: force * 0.8,
        z: (-dy / distance) * force,
      })
      setIsThrown(true)
      setDiceValues(new Map())
      setRollComplete(false)
      hasCalledComplete.current = false
    }

    setIsDragging(false)
    setDragStart(null)
    setDragCurrent(null)
    setDragWorldStart(null)
    setDragWorldCurrent(null)
  }, [isDragging, dragStart, dragCurrent, isThrown])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleDragStart(touch.clientX, touch.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const touch = e.touches[0]
      handleDragMove(touch.clientX, touch.clientY)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      handleDragEnd()
    }

    // Add event listeners with passive: false to allow preventDefault
    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd, { passive: false })
    container.addEventListener("touchcancel", handleTouchEnd, { passive: false })

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
      container.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [handleDragStart, handleDragMove, handleDragEnd])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleDragStart(e.clientX, e.clientY)
    },
    [handleDragStart],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleDragMove(e.clientX, e.clientY)
    },
    [handleDragMove],
  )

  const handleMouseUp = useCallback(() => {
    handleDragEnd()
  }, [handleDragEnd])

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleDragEnd()
    }
  }, [isDragging, handleDragEnd])

  const getStartPositions = useCallback((): [number, number, number][] => {
    return Array.from({ length: diceCount }).map((_, i) => {
      const angle = (i / diceCount) * Math.PI * 2
      const radius = diceCount > 1 ? 1.5 : 0
      return [Math.cos(angle) * radius + (Math.random() - 0.5) * 0.5, 3 + i * 0.5, Math.sin(angle) * radius + 2] as [
        number,
        number,
        number,
      ]
    })
  }, [diceCount])

  const handleValueDetermined = useCallback(
    (id: number, value: number) => {
      setDiceValues((prev) => {
        const newMap = new Map(prev)
        newMap.set(id, value)

        if (newMap.size === diceCount && !hasCalledComplete.current) {
          hasCalledComplete.current = true
          setRollComplete(true)
          const values = Array.from({ length: diceCount }).map((_, i) => newMap.get(i) || 1)
          setTimeout(() => {
            onRollComplete(values)
          }, 2000)
        }

        return newMap
      })
    },
    [diceCount, onRollComplete],
  )

  useEffect(() => {
    onReady?.()
  }, [onReady])

  const startPositions = getStartPositions()

  const dragState = {
    isDragging,
    startWorld: dragWorldStart,
    currentWorld: dragWorldCurrent,
  }

  // Calculate arrow position for SVG overlay
  const getArrowCoords = () => {
    if (!dragStart || !dragCurrent || !containerRef.current) return null
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x1: dragStart.x - rect.left,
      y1: dragStart.y - rect.top,
      x2: dragCurrent.x - rect.left,
      y2: dragCurrent.y - rect.top,
    }
  }

  const arrowCoords = getArrowCoords()

  return (
    <div
      ref={containerRef}
      className="w-full h-[450px] bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700 relative select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isThrown ? "default" : isDragging ? "grabbing" : "grab", touchAction: "none" }}
    >
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
        <color attach="background" args={["#0f172a"]} />
        <fog attach="fog" args={["#0f172a", 15, 30]} />

        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ffd700" />

        <Physics gravity={[0, -25, 0]}>
          <Ground />
          <Walls />

          {!isThrown && <WaitingDice count={diceCount} colors={DICE_COLORS} />}

          <ThrowZone diceCount={diceCount} canThrow={!isThrown} dragState={dragState} />

          {isThrown &&
            throwForce &&
            startPositions.map((pos, i) => (
              <Die3DPhysics
                key={i}
                id={i}
                color={DICE_COLORS[i % DICE_COLORS.length]}
                startPosition={pos}
                throwForce={throwForce}
                onValueDetermined={handleValueDetermined}
              />
            ))}
        </Physics>

        <Environment preset="city" />
      </Canvas>

      {/* SVG overlay for drag arrow */}
      {isDragging && arrowCoords && (
        <svg className="absolute inset-0 pointer-events-none z-20" style={{ width: "100%", height: "100%" }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
          </defs>
          <line
            x1={arrowCoords.x1}
            y1={arrowCoords.y1}
            x2={arrowCoords.x2}
            y2={arrowCoords.y2}
            stroke="#ef4444"
            strokeWidth="4"
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
          />
          <circle cx={arrowCoords.x1} cy={arrowCoords.y1} r="8" fill="#ef4444" opacity="0.6" />
        </svg>
      )}

      {/* Status indicator */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-10">
        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
          {!isThrown ? (
            <p className="text-green-400 text-sm font-medium">
              {isDragging ? "Suelta para lanzar..." : "Arrastra sobre la mesa para lanzar los dados"}
            </p>
          ) : !rollComplete ? (
            <p className="text-yellow-400 text-sm font-medium animate-pulse">Esperando que los dados se detengan...</p>
          ) : (
            <p className="text-emerald-400 text-sm font-medium">
              Resultado: {Array.from(diceValues.values()).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
