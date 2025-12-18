"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { Character } from "@/lib/character-types"
import { Heart, Brain, Sparkles, Dice6 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DerivedStatsProps {
  character: Character
  onChange: (character: Character) => void
}

// Componente para visualizar la cuadrícula de números (Tracker)
// Diseñado para encajar en la disposición clásica de la hoja de personaje (5 filas)
function StatTracker({
  value,
  onChange,
  className,
}: {
  value: number
  onChange: (val: number) => void
  className?: string
}) {
  // Rangos exactos basados en la hoja oficial de 7ª Edición
  const rows = [
    { start: 1, end: 15 },  // Fila 1 corta
    { start: 16, end: 36 }, // Filas largas de ~21 números
    { start: 37, end: 57 },
    { start: 58, end: 78 },
    { start: 79, end: 99 },
  ]

  return (
    <div className={cn("mt-2 select-none flex flex-col items-center gap-[1px]", className)}>
      {rows.map((row, rowIndex) => {
        const numbers = Array.from(
          { length: row.end - row.start + 1 },
          (_, i) => row.start + i
        )

        return (
          <div key={rowIndex} className="flex justify-center w-full">
            {numbers.map((num) => (
              <div
                key={num}
                onClick={() => onChange(num)}
                className={cn(
                  "h-[16px] flex items-center justify-center cursor-pointer text-[9px] font-mono border transition-all duration-75",
                  // Ajuste de ancho flexible para que ocupen todo el ancho disponible si es necesario
                  "w-[16px] sm:w-[18px]",
                  // Estilos activos vs inactivos
                  value === num
                    ? "bg-primary text-primary-foreground border-primary font-bold z-10 scale-125 ring-1 ring-background" 
                    : "text-muted-foreground/60 border-transparent hover:bg-muted-foreground/20 hover:text-foreground hover:scale-110 hover:z-10",
                  // Opacidad reducida para números "gastados"
                  value < num && "opacity-50 grayscale"
                )}
                title={`Valor: ${num}`}
              >
                {num}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export function DerivedStats({ character, onChange }: DerivedStatsProps) {
  return (
    // Cambiado a 2 columnas para dar espacio a las listas de números
    <div className="grid gap-6 md:grid-cols-2">
      
      {/* --- PUNTOS DE VIDA (Arriba Izquierda) --- */}
      <div className="p-4 rounded-lg bg-red-950/10 border border-red-900/20 flex flex-col h-full relative overflow-hidden">
        {/* Decoración de fondo sutil */}
        <Heart className="absolute -right-4 -top-4 w-24 h-24 text-red-500/5 rotate-12 pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-4 border-b border-red-900/10 pb-2">
          <Heart className="h-5 w-5 text-red-600" />
          <Label className="font-bold text-lg text-red-700 dark:text-red-400">Puntos de Vida</Label>
        </div>

        <div className="flex gap-4 mb-4 items-end">
          <div className="w-24">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Actual</Label>
            <Input
              type="number"
              min={0}
              max={character.hitPoints.max}
              value={character.hitPoints.current}
              onChange={(e) =>
                onChange({
                  ...character,
                  hitPoints: { ...character.hitPoints, current: Number.parseInt(e.target.value) || 0 },
                })
              }
              className="text-center text-2xl font-bold h-12 bg-background/80"
            />
          </div>
          <div className="w-20">
            <Label className="text-xs text-muted-foreground text-center block mb-1">Máx</Label>
            <Input 
              type="number" 
              value={character.hitPoints.max} 
              disabled 
              className="text-center font-bold bg-muted/50 border-transparent" 
            />
          </div>
          
          {/* Checkboxes alineados horizontalmente al fondo */}
          <div className="flex-1 flex flex-col gap-2 justify-end pb-1 pl-4 border-l border-red-900/10">
             <div className="flex items-center gap-2">
                <Checkbox
                  id="majorWound"
                  checked={character.hitPoints.majorWound}
                  onCheckedChange={(c) => onChange({ ...character, hitPoints: { ...character.hitPoints, majorWound: !!c } })}
                  className="data-[state=checked]:bg-red-600 border-red-200"
                />
                <Label htmlFor="majorWound" className="text-xs cursor-pointer">Herida Grave</Label>
             </div>
             <div className="flex items-center gap-2">
                <Checkbox
                  id="dying"
                  checked={character.hitPoints.dying}
                  onCheckedChange={(c) => onChange({ ...character, hitPoints: { ...character.hitPoints, dying: !!c } })}
                  className="data-[state=checked]:bg-red-600 border-red-200"
                />
                <Label htmlFor="dying" className="text-xs cursor-pointer">Moribundo</Label>
             </div>
             <div className="flex items-center gap-2">
                <Checkbox
                  id="unconscious"
                  checked={character.hitPoints.unconscious}
                  onCheckedChange={(c) => onChange({ ...character, hitPoints: { ...character.hitPoints, unconscious: !!c } })}
                  className="data-[state=checked]:bg-red-600 border-red-200"
                />
                <Label htmlFor="unconscious" className="text-xs cursor-pointer">Inconsciente</Label>
             </div>
          </div>
        </div>
      </div>

      {/* --- CORDURA (Arriba Derecha) --- */}
      <div className="p-4 rounded-lg bg-purple-950/10 border border-purple-900/20 flex flex-col h-full relative overflow-hidden">
        <Brain className="absolute -right-4 -top-4 w-24 h-24 text-purple-500/5 rotate-12 pointer-events-none" />

        <div className="flex items-center gap-2 mb-2 border-b border-purple-900/10 pb-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <Label className="font-bold text-lg text-purple-700 dark:text-purple-400">Cordura</Label>
        </div>

        {/* Inputs Superiores */}
        <div className="flex gap-4 justify-between items-end mb-2 px-2">
           <div className="w-24">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Actual</Label>
            <Input
              type="number"
              min={0}
              max={99}
              value={character.sanity.current}
              onChange={(e) =>
                onChange({
                  ...character,
                  sanity: { ...character.sanity, current: Number.parseInt(e.target.value) || 0 },
                })
              }
              className="text-center text-2xl font-bold h-12 bg-background/80"
            />
          </div>
          <div className="flex gap-2">
            <div>
              <Label className="text-xs text-muted-foreground text-center block mb-1">Inicial</Label>
              <Input type="number" value={character.sanity.starting} disabled className="w-16 text-center bg-muted/50 border-transparent" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground text-center block mb-1">Máx</Label>
              <Input type="number" value={character.sanity.max} onChange={(e) => onChange({...character, sanity: {...character.sanity, max: parseInt(e.target.value)||99}})} className="w-16 text-center bg-background/50" />
            </div>
          </div>
        </div>

        {/* Tracker Central */}
        <div className="bg-background/40 rounded p-1 mb-2 border border-purple-900/5">
          <StatTracker 
            value={character.sanity.current} 
            onChange={(val) => onChange({ ...character, sanity: { ...character.sanity, current: val } })}
            className="w-full"
          />
        </div>

        {/* Checkboxes Inferiores */}
        <div className="flex gap-4 justify-center mt-auto pt-2 border-t border-purple-900/10">
          <div className="flex items-center gap-2">
            <Checkbox
              id="tempInsanity"
              checked={character.sanity.temporaryInsanity}
              onCheckedChange={(c) => onChange({ ...character, sanity: { ...character.sanity, temporaryInsanity: !!c } })}
              className="data-[state=checked]:bg-purple-600 border-purple-200"
            />
            <Label htmlFor="tempInsanity" className="text-xs cursor-pointer">Locura Temporal</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="indefInsanity"
              checked={character.sanity.indefiniteInsanity}
              onCheckedChange={(c) => onChange({ ...character, sanity: { ...character.sanity, indefiniteInsanity: !!c } })}
              className="data-[state=checked]:bg-purple-600 border-purple-200"
            />
            <Label htmlFor="indefInsanity" className="text-xs cursor-pointer">Locura Indefinida</Label>
          </div>
        </div>
      </div>

      {/* --- SUERTE (Abajo Izquierda) --- */}
      <div className="p-4 rounded-lg bg-yellow-950/10 border border-yellow-900/20 flex flex-col h-full relative overflow-hidden">
        <Dice6 className="absolute -right-4 -top-4 w-24 h-24 text-yellow-500/5 rotate-12 pointer-events-none" />

        <div className="flex items-center gap-2 mb-2 border-b border-yellow-900/10 pb-2">
          <Dice6 className="h-5 w-5 text-yellow-600" />
          <Label className="font-bold text-lg text-yellow-700 dark:text-yellow-400">Suerte</Label>
        </div>

        <div className="flex gap-4 items-end mb-2 px-2">
           <div className="w-24">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Actual</Label>
            <Input
              type="number"
              min={0}
              max={99}
              value={character.luck.current}
              onChange={(e) =>
                onChange({
                  ...character,
                  luck: { ...character.luck, current: Number.parseInt(e.target.value) || 0 },
                })
              }
              className="text-center text-2xl font-bold h-12 bg-background/80"
            />
          </div>
          <div className="w-20">
              <Label className="text-xs text-muted-foreground text-center block mb-1">Máx</Label>
              <Input 
                type="number" 
                value={character.luck.max} 
                onChange={(e) => onChange({...character, luck: {...character.luck, max: parseInt(e.target.value)||99}})} 
                className="text-center bg-background/50" 
              />
          </div>
        </div>

        {/* Tracker Central */}
        <div className="bg-background/40 rounded p-1 border border-yellow-900/5 mt-auto">
          <StatTracker 
            value={character.luck.current} 
            onChange={(val) => onChange({ ...character, luck: { ...character.luck, current: val } })}
            className="w-full"
          />
        </div>
      </div>

      {/* --- PUNTOS DE MAGIA (Abajo Derecha) --- */}
      <div className="p-4 rounded-lg bg-blue-950/10 border border-blue-900/20 flex flex-col h-full relative overflow-hidden">
        <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-blue-500/5 rotate-12 pointer-events-none" />

        <div className="flex items-center gap-2 mb-4 border-b border-blue-900/10 pb-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <Label className="font-bold text-lg text-blue-700 dark:text-blue-400">Puntos de Magia</Label>
        </div>

        <div className="flex gap-4 items-end">
           <div className="w-24">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Actual</Label>
            <Input
              type="number"
              min={0}
              max={character.magicPoints.max}
              value={character.magicPoints.current}
              onChange={(e) =>
                onChange({
                  ...character,
                  magicPoints: { ...character.magicPoints, current: Number.parseInt(e.target.value) || 0 },
                })
              }
              className="text-center text-2xl font-bold h-12 bg-background/80"
            />
          </div>
          <div className="w-20">
              <Label className="text-xs text-muted-foreground text-center block mb-1">Máx</Label>
              <Input 
                type="number" 
                value={character.magicPoints.max} 
                disabled 
                className="text-center font-bold bg-muted/50 border-transparent" 
              />
          </div>
        </div>
        
        {/* Espacio para expansión futura o notas visuales */}
        <div className="mt-4 flex-1 bg-blue-900/5 rounded border border-blue-900/5 flex items-center justify-center text-xs text-blue-900/30 font-mono">
           MANÁ
        </div>
      </div>

    </div>
  )
}