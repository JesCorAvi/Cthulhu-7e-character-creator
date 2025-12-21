"use client"

import { useEffect, useRef, useState, useId } from "react"
import DiceBox from "@3d-dice/dice-box"
import { Dices } from "lucide-react"

interface Dice3DSceneProps {
  diceCount?: number
  onRollComplete: (values: number[]) => void
  diceType?: "d6" | "d10" | "d20" | "d100"
  diceConfig?: string[]
}

export function Dice3DScene({ 
  diceCount = 1, 
  onRollComplete, 
  diceType = "d6", 
  diceConfig 
}: Dice3DSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const diceBoxRef = useRef<DiceBox | null>(null)
  
  const [isReady, setIsReady] = useState(false)
  const [isRolling, setIsRolling] = useState(false)
  
  const rawId = useId()
  const containerId = `dice-box-${rawId.replace(/[^a-zA-Z0-9-_]/g, "")}`

  // 1. INICIALIZACIÓN CON RETRASO DE SEGURIDAD
  useEffect(() => {
    if (!containerRef.current) return

    // Limpieza inicial
    containerRef.current.innerHTML = ""
    diceBoxRef.current = null

    const BASE_PATH = "/Cthulhu-7e-character-creator"
    
    // Configuración robusta (Fuerzas medias, ni muy flojas ni muy fuertes)
    const boxConfig = {
      id: containerId,
      container: `#${containerId}`,
      assetPath: `${BASE_PATH}/assets/dice-box/`, 
      theme: "default",
      scale: 9,           // Escala grande para visibilidad
      gravity: 3,
      mass: 5,
      friction: 0.8,     
      restitution: 0.5,
      lightIntensity: 1,
      startingHeight: 15, // Altura estándar (no 8, para evitar clipping)
      spinForce: 6,       // Giro normal
      throwForce: 6,      // Fuerza normal (no 1, para evitar estancamiento)
    }

    // EL FIX CLAVE: Esperar a que el Modal termine su animación (300ms)
    // antes de crear el contexto 3D.
    const timer = setTimeout(() => {
        // Doble chequeo de seguridad
        if (!containerRef.current) return;

        const box = new DiceBox(boxConfig)

        box.init().then(() => {
          diceBoxRef.current = box
          setIsReady(true)
          // Forzar resize inmediato tras init
          box.resizeWorld()
        }).catch((e: any) => {
          console.error("Error al inicializar DiceBox:", e)
        })
    }, 500) // 500ms da tiempo de sobra a cualquier animación de CSS/Dialog

    const handleResize = () => {
      if (diceBoxRef.current) {
        diceBoxRef.current.resizeWorld()
      }
    }
    window.addEventListener("resize", handleResize)

    return () => {
        clearTimeout(timer) // Limpiar timer si el usuario cierra rápido
        window.removeEventListener("resize", handleResize)
        diceBoxRef.current = null; 
    }
  }, [containerId])

  // 2. LÓGICA DE LANZAMIENTO
  const handleRoll = async () => {
    if (!diceBoxRef.current || !isReady || isRolling) return

    // PREPARACIÓN DE ESCENA
    try {
        diceBoxRef.current.clear()
        // IMPORTANTE: Recalcular tamaño justo antes de tirar
        diceBoxRef.current.resizeWorld()
    } catch (e) {
        // Ignorar errores de limpieza si el motor no está listo
    }

    setIsRolling(true)

    // Configuración física estándar para asegurar movimiento
    // @ts-ignore
    if (diceBoxRef.current.updateConfig) {
       // @ts-ignore
       diceBoxRef.current.updateConfig({ 
         throwForce: 6,      
         spinForce: 5,
         startingHeight: 15 
       })
    }
    
    // Preparación de notación "1d..." 
    const requestedDice: string[] = []
    
    const addDie = (typeInput: string) => {
      let type = typeInput.toLowerCase()
      if (!type.startsWith('d')) {
         const match = type.match(/d\d+/)
         if (match) type = match[0]
      }
      requestedDice.push(type)
    }

    if (diceConfig && diceConfig.length > 0) {
      diceConfig.forEach(d => addDie(d))
    } else {
      for (let i = 0; i < diceCount; i++) {
        addDie(diceType || "d6")
      }
    }

    const notation = requestedDice.map(d => `1${d}`)

    try {
      const results = await diceBoxRef.current.roll(notation)
      
      // @ts-ignore
      const rawValues = results.map((r: any) => r.value)
      
      const finalValues: number[] = []
      let rawIndex = 0

      // PARSEO ROBUSTO (Tu corrección anterior)
      for (let i = 0; i < requestedDice.length; i++) {
        const type = requestedDice[i]
        
        if (type === 'd100' || type === 'd%') {
          const remainingResults = rawValues.length - rawIndex
          const remainingRequests = requestedDice.length - i
          
          if (remainingResults > remainingRequests) {
             const val1 = rawValues[rawIndex]
             const val2 = rawValues[rawIndex + 1]
             rawIndex += 2
             
             let total = val1 + val2
             if (total === 0) total = 100
             finalValues.push(total)
          } else {
             let val = rawValues[rawIndex]
             if (val === 0) val = 100
             finalValues.push(val)
             rawIndex++
          }
        } else {
          finalValues.push(rawValues[rawIndex])
          rawIndex++
        }
      }
      
      setTimeout(() => {
        onRollComplete(finalValues)
        setIsRolling(false)
      }, 1000)

    } catch (error) {
      console.error("Error al lanzar los dados:", error)
      setIsRolling(false)
    }
  }

  return (
    <div className="relative w-full h-[400px] md:h-[450px] rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 group">
      
      {/* Contenedor 3D */}
      <div 
        id={containerId} 
        ref={containerRef} 
        className="w-full h-full absolute inset-0 z-0 [&>canvas]:w-full [&>canvas]:h-full [&>canvas]:block" 
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-8 pointer-events-none">
        
        {!isReady && (
          <div className="bg-black/60 px-4 py-2 rounded text-white backdrop-blur-sm animate-pulse flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Cargando motor físico...
          </div>
        )}
        
        {isReady && !isRolling && (
          <button 
            onClick={handleRoll}
            className="pointer-events-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border-2 border-white/20 backdrop-blur-sm"
          >
            <Dices className="w-5 h-5" />
            Lanzar Dados
          </button>
        )}

        {isRolling && (
          <div className="text-white/80 font-medium shadow-sm animate-pulse px-4 py-2 bg-black/30 rounded-lg backdrop-blur-sm">
            Rodando...
          </div>
        )}
      </div>
    </div>
  )
}