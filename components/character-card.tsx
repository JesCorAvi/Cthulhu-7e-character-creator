"use client"

import { useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Character } from "@/lib/character-types"
import { ERA_LABELS } from "@/lib/character-types"
import { Trash2, Edit, User, Paperclip, Activity, Skull } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface CharacterCardProps {
  character: Character
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function CharacterCard({ character, onView, onEdit, onDelete }: CharacterCardProps) {
  const { t } = useLanguage()

  const fileNumber = useMemo(() => {
    const lastChars = character.id.slice(-4)
    const num = parseInt(lastChars, 16)
    if (isNaN(num)) return Math.floor(Math.random() * 9000) + 1000
    return (num % 9000) + 1000
  }, [character.id])

  const sanityPercent = (character.sanity.current / 99) * 100
  const hpPercent = (character.hitPoints.current / character.hitPoints.max) * 100

  const stats = [
    { label: t("str"), val: character.characteristics.STR.value },
    { label: t("dex"), val: character.characteristics.DEX.value },
    { label: t("pow"), val: character.characteristics.POW.value },
    { label: t("con"), val: character.characteristics.CON.value },
    { label: t("app"), val: character.characteristics.APP.value },
    { label: t("edu"), val: character.characteristics.EDU.value },
    { label: t("siz"), val: character.characteristics.SIZ.value },
    { label: t("int"), val: character.characteristics.INT.value },
  ]

  return (
    <div className="relative pt-4 h-full group w-full max-w-[320px] mx-auto">
      {/* Clip superior */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 w-12 h-12 flex items-start justify-center">
         <Paperclip className="w-8 h-8 text-zinc-400 rotate-45 drop-shadow-md" />
      </div>

      <Card 
        onClick={() => onView(character.id)}
        className="flex flex-col h-full bg-[#fdfbf7] dark:bg-stone-900 border-stone-300 dark:border-stone-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-visible relative font-sans rounded-sm cursor-pointer select-none"
      >
        
        {/* Textura de papel sutil */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] overflow-hidden rounded-sm"></div>

        <CardHeader className="pb-1 pt-6 px-3 relative z-10 text-center">
             
             {/* WRAPPER DE LA FOTO */}
             <div className="relative mx-auto mb-2 w-32 h-40 -rotate-1 group-hover:rotate-1 transition-transform bg-stone-200 dark:bg-stone-800 shadow-sm">
                
                {/* MARCO INTERNO CON FOTO */}
                <div className="w-full h-full border-[3px] border-white dark:border-stone-700 flex items-center justify-center overflow-hidden relative bg-stone-100 dark:bg-stone-900">
                    {character.imageUrl ? (
                        <img 
                            src={character.imageUrl} 
                            alt={character.name} 
                            className="w-full h-full object-cover sepia-[.3] contrast-125"
                        />
                    ) : (
                        <User className="h-12 w-12 text-stone-300 opacity-50" />
                    )}
                </div>
                
                {/* SELLO ERA */}
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
                  {character.name || t("unnamed") || "N.N."}
                </h3>
                <p className="font-serif italic text-xs text-stone-500 truncate">
                  {character.occupation || "---"}
                </p>
             </div>
        </CardHeader>
        
        <CardContent className="flex-1 py-2 px-3 relative z-10 space-y-4">
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-bold text-stone-500 flex justify-between uppercase items-center">
                    <span className="flex items-center gap-1"><Activity className="w-2.5 h-2.5"/> {t("hp")}</span>
                    <span className="font-mono text-stone-700 dark:text-stone-300">{character.hitPoints.current}</span>
                 </span>
                 <Progress value={hpPercent} className="h-1" indicatorClassName="bg-stone-600" />
            </div>
            <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-bold text-stone-500 flex justify-between uppercase items-center">
                    <span className="flex items-center gap-1"><Skull className="w-2.5 h-2.5"/> {t("sanity")}</span>
                    <span className="font-mono text-stone-700 dark:text-stone-300">{character.sanity.current}</span>
                 </span>
                 <Progress value={sanityPercent} className="h-1" indicatorClassName="bg-blue-900/70" />
            </div>
          </div>

          <div className="bg-stone-100/80 dark:bg-stone-800/40 p-2 rounded border border-stone-200 dark:border-stone-800/60">
            <div className="flex flex-wrap justify-between gap-y-1 text-xs">
                {stats.map((stat) => (
                    <div key={stat.label} className="w-[48%] flex justify-between items-end border-b border-stone-300/50 dark:border-stone-700/50 pb-0.5">
                        <span className="text-[9px] font-bold text-stone-400 uppercase">{stat.label}</span>
                        <span className="font-mono font-bold text-stone-700 dark:text-stone-300">{stat.val}</span>
                    </div>
                ))}
            </div>
            
            <div className="mt-2 pt-1 border-t border-stone-200 dark:border-stone-700 flex justify-between text-[9px] font-mono text-stone-500 font-bold uppercase">
                <span>{t("mov")}: <span className="text-stone-700 dark:text-stone-300 font-normal">{character.characteristics.MOV}</span></span>
                <span>{t("luck")}: <span className="text-stone-700 dark:text-stone-300 font-normal">{character.luck.current}</span></span>
            </div>
          </div>

        </CardContent>

        <CardFooter className="pt-0 pb-3 px-3 flex gap-2 justify-between items-center">
          {/* BOTÓN EDITAR */}
          <Button 
            variant="outline" 
            size="sm"
            // AÑADIDO: cursor-pointer explícitamente aquí
            className="flex-1 cursor-pointer font-bold uppercase tracking-wider border-stone-300 dark:border-stone-700 bg-white/50 dark:bg-stone-950/50 text-stone-600 dark:text-stone-300 shadow-sm hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 hover:border-stone-400 dark:hover:border-stone-500 active:scale-95 active:bg-stone-200 transition-all duration-100 ease-in-out"
            onClick={(e) => {
                e.stopPropagation();
                onEdit(character.id);
            }}
          >
            <Edit className="h-3 w-3 mr-2 opacity-70" />
            {t("edit")}
          </Button>
          
          {/* BOTÓN BORRAR */}
          <Button 
            variant="ghost" 
            size="icon"
             // AÑADIDO: cursor-pointer explícitamente aquí
            className="shrink-0 cursor-pointer h-9 w-9 text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-90 transition-all duration-200"
            onClick={(e) => {
                e.stopPropagation();
                onDelete(character.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}