"use client"

import { Button } from "@/components/ui/button"
import type { Character, CharacteristicValue } from "@/lib/character-types"
import { useLanguage } from "@/components/language-provider"
import { getTranslatedSkillName } from "@/lib/skills-data"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Printer, Pencil, Shield, Heart, Zap, Brain, Wallet, Package, BookOpen, User } from "lucide-react"

interface CharacterViewerProps {
  character: Character
  onBack: () => void
  onEdit: () => void
}

export function CharacterViewer({ character, onBack, onEdit }: CharacterViewerProps) {
  const { t, language } = useLanguage()

  const getCharValue = (key: string) => {
    const char = character.characteristics[key as keyof typeof character.characteristics] as CharacteristicValue
    return char?.value || 0
  }

  const visibleSkills = [...character.skills].sort((a, b) => {
    const nameA = a.customName || getTranslatedSkillName(a.name, language)
    const nameB = b.customName || getTranslatedSkillName(b.name, language)
    return nameA.localeCompare(nameB)
  })

  return (
    <div className="space-y-6 pb-10 text-foreground animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out">
      {/* Navegación interna */}
      <div className="flex justify-between items-center print:hidden bg-card/50 p-2 rounded-lg border backdrop-blur-sm">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("back")}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit} size="sm">
            <Pencil className="h-4 w-4 mr-2" /> {t("edit")}
          </Button>
          <Button onClick={() => window.print()} size="sm">
            <Printer className="h-4 w-4 mr-2" /> {t("print")}
          </Button>
        </div>
      </div>

      {/* HOJA DE PERSONAJE */}
      <div className="bg-white dark:bg-stone-900 text-black dark:text-stone-100 p-8 max-w-[210mm] mx-auto shadow-2xl print:shadow-none border dark:border-stone-800 rounded-lg transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        {/* CABECERA */}
        <div className="border-b-4 border-stone-800 dark:border-stone-100 pb-4 mb-6">
          <div className="flex justify-between items-end gap-6">
            
            {/* Texto Cabecera */}
            <div className="flex-1">
              <h1 className="text-4xl font-black font-serif uppercase tracking-tight">{character.name || t("unnamed")}</h1>
              <p className="text-lg font-serif italic text-stone-600 dark:text-stone-400">
                {character.occupationLabel || character.occupation}
              </p>
              
              {/* Datos movidos aquí si hay foto para equilibrar */}
              <div className="mt-2 flex gap-4 text-sm font-mono text-stone-500 dark:text-stone-400">
                  <div>{t("age")}: <span className="font-bold text-black dark:text-white">{character.age}</span></div>
                  <div>{t("birthplace")}: <span className="font-bold text-black dark:text-white">{character.birthplace}</span></div>
              </div>
            </div>

            {/* FOTO (Si existe) */}
            {character.imageUrl ? (
                <div className="shrink-0 w-28 h-36 border-4 border-white bg-stone-200 shadow-md rotate-[-2deg] overflow-hidden relative">
                    <img 
                        src={character.imageUrl} 
                        alt="Portrait" 
                        className="w-full h-full object-cover grayscale-[0.2]" 
                    />
                    {/* Efecto clip visual */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-8 bg-stone-800/10 border border-stone-400 rounded-full"></div>
                </div>
            ) : (
                // Si no hay foto, mostramos el sello de la era o nada
                <div className="text-right text-sm font-mono text-stone-300">
                   <User className="w-16 h-16 opacity-20" />
                </div>
            )}
          </div>
        </div>

        {/* CARACTERÍSTICAS GRID */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-6 p-4 bg-stone-100 dark:bg-stone-800/50 rounded-lg border border-stone-300 dark:border-stone-700">
          {["STR", "DEX", "INT", "CON", "APP", "POW", "SIZ", "EDU"].map((stat) => (
            <div key={stat} className="flex flex-col items-center justify-center p-2 bg-white dark:bg-stone-900 rounded shadow-sm border border-stone-200 dark:border-stone-700">
              <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase">{t(stat.toLowerCase())}</span>
              <span className="text-2xl font-black">{getCharValue(stat)}</span>
              <div className="flex gap-2 text-[9px] text-stone-400 font-mono">
                <span>{Math.floor(getCharValue(stat) / 2)}</span>
                <span>{Math.floor(getCharValue(stat) / 5)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* ESTADÍSTICAS DERIVADAS */}
          <div className="space-y-4">
             <div className="border border-stone-200 dark:border-stone-700 p-3 rounded bg-stone-50 dark:bg-stone-800/30">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm flex items-center gap-1"><Heart className="w-3 h-3"/> {t("hp")}</span>
                    <span className="font-mono text-xs text-stone-500">{t("max")}: {character.hitPoints.max}</span>
                </div>
                <div className="text-3xl font-black text-center border-b border-stone-300 dark:border-stone-700 pb-1">{character.hitPoints.current}</div>
                <div className="flex justify-center gap-4 mt-2 text-[10px] uppercase">
                    <div className={`flex items-center gap-1 ${character.hitPoints.majorWound ? "text-red-600 font-bold" : "text-stone-400"}`}>
                        <div className={`w-2 h-2 rounded-full border ${character.hitPoints.majorWound ? "bg-red-600" : "bg-white dark:bg-stone-900"}`}></div>
                        {t("major_wound")}
                    </div>
                </div>
             </div>

             <div className="border border-stone-200 dark:border-stone-700 p-3 rounded bg-stone-50 dark:bg-stone-800/30">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm flex items-center gap-1"><Brain className="w-3 h-3"/> {t("sanity")}</span>
                    <span className="font-mono text-xs text-stone-500">{t("start")}: {character.sanity.starting}</span>
                </div>
                <div className="text-3xl font-black text-center border-b border-stone-300 dark:border-stone-700 pb-1">{character.sanity.current}</div>
                <div className="flex justify-center gap-4 mt-2 text-[10px] uppercase text-stone-400">
                    {t("temp_insanity")}: {character.sanity.temporaryInsanity ? "X" : "-"} | {t("indef_insanity")}: {character.sanity.indefiniteInsanity ? "X" : "-"}
                </div>
             </div>

             <div className="bg-stone-100 dark:bg-stone-800/50 p-3 rounded border border-stone-200 dark:border-stone-700 text-sm font-mono space-y-1">
                <div className="flex justify-between"><span>{t("mov")}:</span><span className="font-bold">{character.characteristics.MOV}</span></div>
                <div className="flex justify-between"><span>{t("db")}:</span><span className="font-bold">{character.damageBonus}</span></div>
                <div className="flex justify-between"><span>{t("build")}:</span><span className="font-bold">{character.build}</span></div>
                <div className="flex justify-between"><span>{t("luck")}:</span><span className="font-bold">{character.luck.current}</span></div>
                <div className="flex justify-between"><span>MP:</span><span className="font-bold">{character.magicPoints.current}</span></div>
             </div>
          </div>

          {/* HABILIDADES */}
          <div className="md:col-span-2">
            <h3 className="font-serif font-bold text-lg border-b-2 border-stone-800 dark:border-stone-100 mb-3 uppercase flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> {t("investigator_skills")}
            </h3>
            <div className="columns-1 sm:columns-2 gap-x-8 text-sm">
                {visibleSkills.map((skill, i) => {
                    if (skill.isFieldHeader) return null
                    const name = skill.customName || getTranslatedSkillName(skill.name, language)
                    return (
                        <div key={i} className="flex justify-between mb-1 border-b border-dotted dark:border-stone-700 break-inside-avoid">
                            <span className={`${skill.isOccupational ? "font-bold text-black dark:text-white" : "text-stone-700 dark:text-stone-300"}`}>
                                {name} {skill.isOccupational && <span className="text-amber-600 text-[8px] align-top">●</span>}
                            </span>
                            <span className="font-mono font-bold">{skill.value}%</span>
                        </div>
                    )
                })}
            </div>
          </div>
        </div>

        <Separator className="my-6 bg-stone-300 dark:bg-stone-700" />

        {/* COMBATE Y ARMAS */}
        <div className="mb-8">
            <h3 className="font-serif font-bold text-lg border-b-2 border-stone-800 dark:border-stone-100 mb-3 uppercase flex items-center gap-2">
                <Shield className="w-4 h-4" /> {t("combat")}
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                    <thead>
                        <tr className="border-b border-stone-400 dark:border-stone-600 text-stone-500 dark:text-stone-400 font-serif">
                            <th className="pb-1">{t("weapon")}</th>
                            <th className="pb-1 text-center">{t("regular")}</th>
                            <th className="pb-1 text-center font-normal italic">½</th>
                            <th className="pb-1 text-center font-normal italic">⅕</th>
                            <th className="pb-1">{t("damage")}</th>
                            <th className="pb-1">{t("range")}</th>
                            <th className="pb-1 text-center">{t("attacks")}</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono">
                        {character.weapons.map((w, i) => (
                            <tr key={i} className="border-b border-stone-100 dark:border-stone-800">
                                <td className="py-2 font-bold">{w.name}</td>
                                <td className="py-2 text-center">{w.normal}%</td>
                                <td className="py-2 text-center text-stone-500">{Math.floor(w.normal / 2)}</td>
                                <td className="py-2 text-center text-stone-500">{Math.floor(w.normal / 5)}</td>
                                <td className="py-2">{w.damage}</td>
                                <td className="py-2">{w.range}</td>
                                <td className="py-2 text-center">{w.attacks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* TRASFONDO */}
        <div className="mb-8">
            <h3 className="font-serif font-bold text-lg border-b-2 border-stone-800 dark:border-stone-100 mb-4 uppercase">
                {t("backstory")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 text-sm font-serif">
                {[
                    { label: t("personal_desc_label"), value: character.background.personalDescription },
                    { label: t("ideology_label"), value: character.background.ideology },
                    { label: t("significant_people_label"), value: character.background.significantPeople },
                    { label: t("significant_places_label"), value: character.background.significantPlaces },
                    { label: t("precious_possessions_label"), value: character.background.preciousPossessions },
                    { label: t("traits_label"), value: character.background.traits },
                    { label: t("injuries_label"), value: character.background.injuriesScars },
                    { label: t("phobias_label"), value: character.background.phobiasManias },
                    { label: t("arcane_tomes_label"), value: character.background.arcaneTomes },
                    { label: t("strange_encounters_label"), value: character.background.strangeEncounters },
                ].map((item, idx) => item.value && (
                    <div key={idx} className="border-b border-stone-100 dark:border-stone-800 pb-2 break-inside-avoid">
                        <span className="block font-bold text-stone-500 dark:text-stone-400 uppercase text-[10px] mb-1">{item.label}</span>
                        <p className="text-stone-800 dark:text-stone-200 leading-relaxed italic">"{item.value}"</p>
                    </div>
                ))}
            </div>
        </div>

        {/* EQUIPO Y DINERO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <h3 className="font-serif font-bold text-lg border-b-2 border-stone-800 dark:border-stone-100 mb-3 uppercase flex items-center gap-2">
                    <Package className="w-4 h-4" /> {t("tab_equipment")}
                </h3>
                <div className="text-sm font-serif text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed italic">
                    {character.equipment || "..."}
                </div>
            </div>
            <div className="bg-stone-50 dark:bg-stone-800/30 p-4 rounded-lg border border-stone-200 dark:border-stone-700">
                <h3 className="font-serif font-bold text-md border-b border-stone-300 dark:border-stone-600 mb-3 uppercase flex items-center gap-2">
                    <Wallet className="w-4 h-4" /> {t("cash_label")}
                </h3>
                <div className="space-y-3 text-xs">
                    <div>
                        <span className="font-bold block text-stone-500 uppercase text-[9px]">{t("spending_level_label")}</span>
                        <p>{character.money.spendingLevel || "-"}</p>
                    </div>
                    <div>
                        <span className="font-bold block text-stone-500 uppercase text-[9px]">{t("cash_label")}</span>
                        <p>{character.money.cash || "-"}</p>
                    </div>
                    <div>
                        <span className="font-bold block text-stone-500 uppercase text-[9px]">{t("assets_label")}</span>
                        <p>{character.money.assets || "-"}</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}