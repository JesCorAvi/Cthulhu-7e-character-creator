"use client"

import { useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Character } from "@/lib/character-types"
import { ERA_LABELS } from "@/lib/character-types"
import { Trash2, Eye, Edit, User, Paperclip, Activity, Skull } from "lucide-react"

interface CharacterCardProps {
  character: Character
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function CharacterCard({ character, onView, onEdit, onDelete }: CharacterCardProps) {
  // Generamos un número de expediente "aleatorio" pero consistente basado en el ID.
  const fileNumber = useMemo(() => {
    const lastChars = character.id.slice(-4)
    const num = parseInt(lastChars, 16)
    if (isNaN(num)) return Math.floor(Math.random() * 9000) + 1000
    return (num % 9000) + 1000
  }, [character.id])

  const sanityPercent = (character.sanity.current / 99) * 100
  const hpPercent = (character.hitPoints.current / character.hitPoints.max) * 100

  return (
    <div className="relative pt-4 h-full group max-w-[300px] mx-auto">
      {/* Clip superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-12 h-12 flex items-start justify-center">
         <Paperclip className="w-8 h-8 text-zinc-400 rotate-45 drop-shadow-md" />
      </div>

      <Card className="flex flex-col h-full bg-[#fdfbf7] dark:bg-stone-900 border-stone-300 dark:border-stone-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-visible relative font-sans rounded-sm">
        
        {/* Textura de papel sutil */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] overflow-hidden rounded-sm"></div>

        <CardHeader className="pb-1 pt-6 px-3 relative z-10 text-center">
             
             {/* WRAPPER DE LA FOTO: Relativo para posicionar el badge fuera, pero sin overflow-hidden en el padre */}
             <div className="relative mx-auto mb-2 w-16 h-20 -rotate-1 group-hover:rotate-1 transition-transform bg-stone-200 dark:bg-stone-800 shadow-sm">
                
                {/* MARCO INTERNO: Este sí tiene overflow-hidden para recortar la imagen/icono si fuera necesario */}
                <div className="w-full h-full border-[3px] border-white dark:border-stone-700 flex items-center justify-center overflow-hidden">
                    <User className="h-8 w-8 text-stone-400 opacity-60" />
                </div>
                
                {/* SELLO ERA: Ahora está fuera del div que recorta, pero dentro del que rota */}
                <div className="absolute -bottom-2 -right-5 rotate-[-15deg] z-20">
                    <Badge variant="destructive" className="font-black text-[8px] px-1 py-0 h-4 border-2 border-dashed border-white/50 shadow-sm uppercase whitespace-nowrap">
                        {ERA_LABELS[character.era]}
                    </Badge>
                </div>
             </div>

             <div className="space-y-0.5 mt-3">
                <div className="font-mono text-[9px] tracking-[0.2em] text-stone-400 uppercase border-b border-stone-200 dark:border-stone-800 pb-1 mb-1">
                    EXP-{fileNumber}
                </div>
                <h3 className="font-serif font-black text-lg leading-5 text-stone-900 dark:text-stone-100 truncate w-full" title={character.name || "Desconocido"}>
                  {character.name || "N.N."}
                </h3>
                <p className="font-serif italic text-xs text-stone-500 truncate">
                  {character.occupation || "---"}
                </p>
             </div>
        </CardHeader>
        
        <CardContent className="flex-1 py-2 px-3 relative z-10 space-y-4">
          
          {/* Barras de Estado */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-bold text-stone-500 flex justify-between uppercase"><Activity className="w-2.5 h-2.5"/> {character.hitPoints.current}</span>
                 <Progress value={hpPercent} className="h-1" indicatorClassName="bg-stone-600" />
            </div>
            <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-bold text-stone-500 flex justify-between uppercase"><Skull className="w-2.5 h-2.5"/> {character.sanity.current}</span>
                 <Progress value={sanityPercent} className="h-1" indicatorClassName="bg-blue-900/70" />
            </div>
          </div>

          {/* Stats Compactos */}
          <div className="bg-stone-100/80 dark:bg-stone-800/40 p-2 rounded border border-stone-200 dark:border-stone-800/60">
            <div className="flex flex-wrap justify-between gap-y-1 text-xs">
                {[
                    { l: "FUE", v: character.characteristics.STR.value },
                    { l: "DES", v: character.characteristics.DEX.value },
                    { l: "POD", v: character.characteristics.POW.value },
                    { l: "CON", v: character.characteristics.CON.value },
                    { l: "APA", v: character.characteristics.APP.value },
                    { l: "EDU", v: character.characteristics.EDU.value },
                    { l: "TAM", v: character.characteristics.SIZ.value },
                    { l: "INT", v: character.characteristics.INT.value },
                ].map((stat) => (
                    <div key={stat.l} className="w-[48%] flex justify-between items-end border-b border-stone-300/50 dark:border-stone-700/50 pb-0.5">
                        <span className="text-[9px] font-bold text-stone-400">{stat.l}</span>
                        <span className="font-mono font-bold text-stone-700 dark:text-stone-300">{stat.v}</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-2 pt-1 border-t border-stone-200 dark:border-stone-700 flex justify-between text-[9px] font-mono text-stone-500">
                <span>MOV:{character.characteristics.MOV}</span>
                <span>SUE:{character.luck.current}</span>
            </div>
          </div>

        </CardContent>

        <CardFooter className="pt-0 pb-3 px-3 flex gap-1 justify-between">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1 h-7 text-[10px] uppercase font-bold tracking-wide border-stone-300 hover:bg-stone-100 dark:border-stone-700 dark:hover:bg-stone-800 px-0" 
            onClick={() => onView(character.id)}
          >
            Ver
          </Button>
          <div className="flex gap-1">
            <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 text-stone-500 hover:text-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800" 
                onClick={() => onEdit(character.id)}
            >
                <Edit className="h-3 w-3" />
            </Button>
            <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" 
                onClick={() => onDelete(character.id)}
            >
                <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}