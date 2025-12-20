"use client"

import { useRef, useState, useEffect, useCallback, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, RoundedBox } from "@react-three/drei"
import type * as THREE from "three"

console.log("[v0] dice-3d.tsx module loaded")

// Simple dice component with manual animation
interface DieProps {
  id: number
  color: string
  targetValue: number
  isRolling: boolean
  startDelay: number
  position: [number, number, number]
  onSettled: (id: number, value: number) => void
}

function Die({ id, color, targetValue, isRolling, startDelay, position, onSettled }: DieProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [phase, setPhase] = useState<"waiting" | "rolling" | "settling" | "settled">("waiting")
  const [currentPos, setCurrentPos] = useState<[number, number, number]>([position[0], 5, position[2]])
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0])
  const animationTime = useRef(0)
  const hasSettled = useRef(false)

  console.log("[v0] Die rendered", { id, phase, isRolling, targetValue })

  const getFinalRotation = (value: number): [number, number, number] => {
    switch (value) {
      case 1:
        return [Math.PI / 2, 0, 0]
      case 2:
        return [0, 0, 0]
      case 3:
        return [0, 0, -Math.PI / 2]
      case 4:
        return [0, 0, Math.PI / 2]
      case 5:
        return [Math.PI, 0, 0]
      case 6:
        return [-Math.PI / 2, 0, 0]
      default:
        return [0, 0, 0]
    }
  }

  useEffect(() => {
    if (isRolling && phase === "waiting") {
      console.log("[v0] Die starting roll after delay", { id, startDelay })
      const timer = setTimeout(() => {
        setPhase("rolling")
        animationTime.current = 0
      }, startDelay)
      return () => clearTimeout(timer)
    }
  }, [isRolling, startDelay, phase, id])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (phase === "rolling") {
      animationTime.current += delta
      const rollDuration = 2
      const progress = Math.min(animationTime.current / rollDuration, 1)

      const tumbleSpeed = 15 * (1 - progress * 0.8)
      setRotation((prev) => [
        prev[0] + delta * tumbleSpeed * (1 + Math.sin(animationTime.current * 3)),
        prev[1] + delta * tumbleSpeed * 1.3,
        prev[2] + delta * tumbleSpeed * 0.7,
      ])

      const arcHeight = 3 * Math.sin(progress * Math.PI)
      const fallProgress = Math.pow(progress, 0.5)
      const y = 5 - fallProgress * 5.5 + arcHeight * (1 - progress)

      const bounceX = Math.sin(progress * Math.PI * 3) * (1 - progress) * 0.5
      const bounceZ = Math.cos(progress * Math.PI * 2) * (1 - progress) * 0.3

      setCurrentPos([position[0] + bounceX, Math.max(-0.5, y), position[2] + bounceZ])

      if (progress >= 1) {
        console.log("[v0] Die finished rolling, now settling", { id })
        setPhase("settling")
        animationTime.current = 0
      }
    }

    if (phase === "settling") {
      animationTime.current += delta
      const settleDuration = 0.5
      const progress = Math.min(animationTime.current / settleDuration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      const finalRot = getFinalRotation(targetValue)
      const currentRot = rotation.map((r) => r % (Math.PI * 2))

      setRotation([
        currentRot[0] + (finalRot[0] - currentRot[0]) * eased,
        currentRot[1] + (finalRot[1] - currentRot[1]) * eased,
        currentRot[2] + (finalRot[2] - currentRot[2]) * eased,
      ])

      setCurrentPos((prev) => [position[0], -0.5 + (prev[1] + 0.5) * (1 - eased), position[2]])

      if (progress >= 1 && !hasSettled.current) {
        hasSettled.current = true
        setPhase("settled")
        console.log("[v0] Die settled", { id, targetValue })
        onSettled(id, targetValue)
      }
    }

    groupRef.current.position.set(currentPos[0], currentPos[1], currentPos[2])
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2])
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

function SceneContent({
  diceCount,
  isRolling,
  targetValues,
  onDieSettled,
}: {
  diceCount: number
  isRolling: boolean
  targetValues: number[]
  onDieSettled: (id: number, value: number) => void
}) {
  console.log("[v0] SceneContent rendered", { diceCount, isRolling, targetValues })

  const DICE_COLORS = ["#dc2626", "#2563eb", "#16a34a", "#ca8a04", "#9333ea", "#db2777"]

  const getDicePositions = (): [number, number, number][] => {
    if (diceCount === 1) return [[0, 0, 0]]
    if (diceCount === 2)
      return [
        [-1, 0, 0],
        [1, 0, 0],
      ]
    if (diceCount === 3)
      return [
        [-1.2, 0, 0.5],
        [1.2, 0, 0.5],
        [0, 0, -0.8],
      ]
    if (diceCount === 4)
      return [
        [-1.2, 0, -0.8],
        [1.2, 0, -0.8],
        [-1.2, 0, 0.8],
        [1.2, 0, 0.8],
      ]
    return Array.from({ length: diceCount }, (_, i) => {
      const angle = (i / diceCount) * Math.PI * 2
      return [Math.cos(angle) * 1.5, 0, Math.sin(angle) * 1.5] as [number, number, number]
    })
  }

  const positions = getDicePositions()

  return (
    <>
      <color attach="background" args={["#0f172a"]} />
      <fog attach="fog" args={["#0f172a", 12, 25]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[-3, 5, -3]} intensity={0.4} color="#ffd700" />
      <Table />
      {positions.map((pos, i) => (
        <Die
          key={`die-${i}`}
          id={i}
          color={DICE_COLORS[i % DICE_COLORS.length]}
          position={pos}
          targetValue={targetValues[i] || 1}
          isRolling={isRolling}
          startDelay={i * 100}
          onSettled={onDieSettled}
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
  console.log("[v0] Dice3DScene rendered", { diceCount })

  const containerRef = useRef<HTMLDivElement>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [targetValues, setTargetValues] = useState<number[]>([])
  const [settledCount, setSettledCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(null)
  const [canvasError, setCanvasError] = useState<string | null>(null)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    console.log("[v0] Resetting dice state for new roll")
    setIsRolling(false)
    setTargetValues([])
    setSettledCount(0)
    hasCompletedRef.current = false
  }, [diceCount])

  const handleDieSettled = useCallback(
    (id: number, value: number) => {
      console.log("[v0] handleDieSettled called", { id, value, currentSettledCount: settledCount })
      setSettledCount((prev) => {
        const newCount = prev + 1
        console.log("[v0] settledCount updated", { newCount, diceCount })
        if (newCount === diceCount && !hasCompletedRef.current) {
          hasCompletedRef.current = true
          console.log("[v0] All dice settled, completing roll in 2s")
          setTimeout(() => {
            console.log("[v0] Calling onRollComplete", { targetValues })
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
      console.log("[v0] startDrag", { clientX, clientY })
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
    console.log("[v0] endDrag", { isDragging, dragStart, dragEnd, isRolling })
    if (!isDragging || !dragStart || !dragEnd || isRolling) {
      setIsDragging(false)
      setDragStart(null)
      setDragEnd(null)
      return
    }

    const dx = dragEnd.x - dragStart.x
    const dy = dragEnd.y - dragStart.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    console.log("[v0] Drag distance", { distance })

    if (distance > 50) {
      const values = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1)
      console.log("[v0] Starting roll with values", { values })
      setTargetValues(values)
      setIsRolling(true)
      setSettledCount(0)
      hasCompletedRef.current = false
    }

    setIsDragging(false)
    setDragStart(null)
    setDragEnd(null)
  }, [isDragging, dragStart, dragEnd, isRolling, diceCount])

  // Touch handlers with passive: false
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

  // Get relative position for SVG arrow
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
          onCreated={() => console.log("[v0] Canvas created successfully")}
        >
          <SceneContent
            diceCount={diceCount}
            isRolling={isRolling}
            targetValues={targetValues}
            onDieSettled={handleDieSettled}
          />
        </Canvas>
      </Suspense>

      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-10">
        <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg text-center">
          {!isRolling ? (
            <p className="text-green-400 font-medium">
              {isDragging ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Arrastra y suelta para lanzar
                </span>
              ) : (
                `Arrastra sobre la mesa para lanzar ${diceCount} dado${diceCount > 1 ? "s" : ""}`
              )}
            </p>
          ) : settledCount < diceCount ? (
            <p className="text-yellow-400 font-medium animate-pulse">Dados rodando...</p>
          ) : (
            <p className="text-emerald-400 font-medium">
              Resultado: {targetValues.join(" + ")} = {targetValues.reduce((a, b) => a + b, 0)}
            </p>
          )}
        </div>
      </div>

      {/* Drag arrow SVG overlay */}
      {isDragging && relStart && relEnd && (
        <svg className="absolute inset-0 pointer-events-none z-20" width="100%" height="100%">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
            </marker>
          </defs>
          <line
            x1={relStart.x}
            y1={relStart.y}
            x2={relEnd.x}
            y2={relEnd.y}
            stroke="#ef4444"
            strokeWidth="4"
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      )}
    </div>
  )
}
