"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Character, CharacteristicValue, Skill, Weapon } from "@/lib/character-types"
import { PRESET_OCCUPATIONS } from "@/lib/occupations-data"
import {
  createCharacteristicValue,
  calculateDamageBonus,
  calculateBuild,
  calculateMovement,
  calculateHitPoints,
  calculateMagicPoints,
  createDefaultWeapon,
} from "@/lib/character-utils"
import { Plus, Trash2, Search, Shield, Settings2, Dices, Share2, User, Camera } from "lucide-react" // <--- Iconos User y Camera añadidos
import { useState, useEffect, useRef } from "react" // <--- useRef añadido
import { cn, compressImage } from "@/lib/utils" // <--- compressImage añadido
import { useTheme } from "next-themes"
import { OccupationDetailsModal } from "./occupation-details-modal"
import { DiceRoller } from "@/components/dice-roller"
import { SkillImprovementModal } from "@/components/skill-improvement-modal"
import { useLanguage } from "@/components/language-provider"
import { getTranslatedSkillName } from "@/lib/skills-data"
import { ShareCharacterModal } from "@/components/share-character-modal"

interface CharacterSheetProps {
  character: Character
  onChange: (character: Character) => void
}

const CHAR_ORDER = ["STR", "DEX", "POW", "CON", "APP", "EDU", "SIZ", "INT"] as const

function SheetTracker({
  max = 0,
  current,
  onChange,
  className,
}: {
  max?: number
  current: number
  onChange: (value: number) => void
  className?: string
}) {
  if (!max || max <= 0) {
    return (
      <div className="h-full min-h-[4rem] flex items-center justify-center text-[10px] text-stone-400 italic text-center w-full px-4 border-2 border-dashed border-stone-200 rounded">
        -
      </div>
    )
  }

  const rowCount = Math.ceil(max / 10)
  const rows = Array.from({ length: rowCount }, (_, i) => ({
    start: i * 10 + 1,
    end: (i + 1) * 10,
  }))

  return (
    <div className={cn("flex flex-col gap-1 select-none w-full", className)}>
      {rows.map((row, rIdx) => {
        const numbers = Array.from({ length: 10 }, (_, i) => row.start + i)
        return (
          <div key={rIdx} className="flex justify-between gap-1">
            {numbers.map((num) => {
              if (num > max) return <div key={num} className="flex-1 aspect-square" />
              return (
                <div
                  key={num}
                  onClick={() => onChange(num)}
                  className={cn(
                    "cursor-pointer flex-1 aspect-square flex items-center justify-center rounded-sm transition-all border border-stone-200 dark:border-stone-800",
                    "text-[10px] md:text-xs font-medium",
                    current === num
                      ? "bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900 font-bold scale-110 shadow-sm ring-1 ring-stone-400 z-10"
                      : "bg-stone-50 dark:bg-stone-900/50 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-400",
                  )}
                >
                  {num}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export function CharacterSheet({ character, onChange }: CharacterSheetProps) {
  const { t, language } = useLanguage()
  const [skillSearch, setSkillSearch] = useState("")
  // const { theme, setTheme } = useTheme() // (No se usa setTheme de momento)
  const [mounted, setMounted] = useState(false)
  const [isOccupationModalOpen, setIsOccupationModalOpen] = useState(false)
  const [showDiceRoller, setShowDiceRoller] = useState(false)
  const [hasRolledCharacteristics, setHasRolledCharacteristics] = useState(false)
  const [improvingSkill, setImprovingSkill] = useState<{ skill: Skill; index: number } | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  
  // Ref para el input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
    const hasNonDefaultValues = Object.keys(character.characteristics).some((key) => {
      if (key === "MOV") return false
      const char = character.characteristics[key as keyof typeof character.characteristics] as CharacteristicValue
      return char && char.value !== 50
    })
    setHasRolledCharacteristics(hasNonDefaultValues)
  }, [character.characteristics])

  const cthulhuSkill = character.skills.find((s) => s.name === "Mitos de Cthulhu")
  const cthulhuValue = cthulhuSkill ? cthulhuSkill.value : 0
  const maxSanityCalc = 99 - cthulhuValue

  const handleBasicChange = (field: keyof Character, value: string | number) => {
    onChange({ ...character, [field]: value })
  }

  // MANEJADOR DE IMAGEN
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // Usamos la utilidad compressImage que ya tienes en lib/utils
      const compressedBase64 = await compressImage(file)
      onChange({ ...character, imageUrl: compressedBase64 })
    } catch (error) {
      console.error("Error al procesar imagen", error)
    }
  }

  const handleModalChange = (updates: Partial<Character>) => {
    onChange({ ...character, ...updates })
  }

  const handleOccupationChange = (value: string) => {
    if (value === "custom") {
      onChange({
        ...character,
        occupation: "Personalizada",
        occupationLabel: t("custom_occupation"),
        occupationFormula: "EDU*4",
        occupationalSkills: [],
      })
    } else {
      const preset = PRESET_OCCUPATIONS.find((p) => p.name === value)
      if (preset) {
        onChange({
          ...character,
          occupation: preset.name,
          occupationLabel: preset.name,
          occupationFormula: preset.formula,
          occupationalSkills: preset.skills,
        })
      }
    }
  }

  const handleCharChange = (key: keyof typeof character.characteristics, value: number) => {
    if (key === "MOV") return
    const newChar = createCharacteristicValue(value)
    const newCharacteristics = { ...character.characteristics, [key]: newChar }

    const str = (newCharacteristics.STR as CharacteristicValue).value
    const dex = (newCharacteristics.DEX as CharacteristicValue).value
    const siz = (newCharacteristics.SIZ as CharacteristicValue).value
    const con = (newCharacteristics.CON as CharacteristicValue).value
    const pow = (newCharacteristics.POW as CharacteristicValue).value
    const edu = (newCharacteristics.EDU as CharacteristicValue).value

    const hp = calculateHitPoints(con, siz)
    const magic = calculateMagicPoints(pow)
    const mov = calculateMovement(dex, str, siz, character.age)

    const newSanity = { ...character.sanity }
    if (key === "POW") {
      newSanity.starting = pow
      newSanity.limit = pow
      if (
        newSanity.current === (character.characteristics.POW as CharacteristicValue).value ||
        newSanity.current === 0
      ) {
        newSanity.current = pow
      }
    }

    const updatedSkills = character.skills.map((skill) => {
      if (skill.name === "Esquivar" && !skill.isFieldSlot) {
        return { ...skill, baseValue: Math.floor(dex / 2), value: Math.floor(dex / 2) }
      }
      if (skill.name === "Lengua propia" && !skill.isFieldSlot) {
        return { ...skill, baseValue: edu, value: edu }
      }
      return skill
    })

    onChange({
      ...character,
      characteristics: { ...newCharacteristics, MOV: mov },
      hitPoints: { ...character.hitPoints, max: hp, current: Math.min(character.hitPoints.current, hp) },
      sanity: newSanity,
      magicPoints: { ...character.magicPoints, max: magic, current: Math.min(character.magicPoints.current, magic) },
      damageBonus: calculateDamageBonus(str, siz),
      build: calculateBuild(str, siz),
      dodge: Math.floor(dex / 2),
      skills: updatedSkills,
    })
  }

  const handleDiceRollComplete = (results: Record<string, number>) => {
    const newCharacteristics = { ...character.characteristics }
    Object.entries(results).forEach(([key, value]) => {
      if (key === "LUCK") {
        onChange({
          ...character,
          luck: { ...character.luck, max: value, current: value },
        })
      } else if (key !== "MOV") {
        ;(newCharacteristics as any)[key] = createCharacteristicValue(value)
      }
    })
    
    // Recalcular valores derivados
    const str = (newCharacteristics.STR as CharacteristicValue).value
    const dex = (newCharacteristics.DEX as CharacteristicValue).value
    const siz = (newCharacteristics.SIZ as CharacteristicValue).value
    const con = (newCharacteristics.CON as CharacteristicValue).value
    const pow = (newCharacteristics.POW as CharacteristicValue).value
    const edu = (newCharacteristics.EDU as CharacteristicValue).value

    const hp = calculateHitPoints(con, siz)
    const magic = calculateMagicPoints(pow)
    const mov = calculateMovement(dex, str, siz, character.age)

    const newSanity = {
        ...character.sanity,
        starting: pow,
        current: pow,
        limit: pow,
    }

    const updatedSkills = character.skills.map((skill) => {
        if (skill.name === "Esquivar" && !skill.isFieldSlot) {
        return { ...skill, baseValue: Math.floor(dex / 2), value: Math.floor(dex / 2) }
        }
        if (skill.name === "Lengua propia" && !skill.isFieldSlot) {
        return { ...skill, baseValue: edu, value: edu }
        }
        return skill
    })

    onChange({
        ...character,
        characteristics: { ...newCharacteristics, MOV: mov },
        hitPoints: { ...character.hitPoints, max: hp, current: hp },
        sanity: newSanity,
        magicPoints: { ...character.magicPoints, max: magic, current: magic },
        damageBonus: calculateDamageBonus(str, siz),
        build: calculateBuild(str, siz),
        dodge: Math.floor(dex / 2),
        skills: updatedSkills,
    })

    setShowDiceRoller(false)
    setHasRolledCharacteristics(true)
  }

  const updateSkill = (index: number, updates: Partial<Skill>) => {
    const newSkills = [...character.skills]
    newSkills[index] = { ...newSkills[index], ...updates }
    onChange({ ...character, skills: newSkills })
  }

  const addFieldSlot = (headerIndex: number) => {
    const header = character.skills[headerIndex]
    const newSlot: Skill = {
      name: header.name,
      baseValue: header.baseValue,
      value: header.baseValue,
      isOccupational: false,
      isFieldSlot: true,
      customName: "",
    }
    let insertIndex = headerIndex + 1
    while (
      insertIndex < character.skills.length &&
      character.skills[insertIndex].isFieldSlot &&
      (character.skills[insertIndex].name === header.name || character.skills[insertIndex].name.startsWith(header.name))
    ) {
      insertIndex++
    }
    const newSkills = [...character.skills]
    newSkills.splice(insertIndex, 0, newSlot)
    onChange({ ...character, skills: newSkills })
  }

  const addCustomSkill = () => {
    onChange({
      ...character,
      skills: [
        ...character.skills,
        { name: "", baseValue: 1, value: 1, isOccupational: false, isCustom: true, customName: "" },
      ],
    })
  }

  const removeSkill = (index: number) => {
    onChange({ ...character, skills: character.skills.filter((_, i) => i !== index) })
  }

  const updateWeapon = (index: number, updates: Partial<Weapon>) => {
    const newWeapons = [...character.weapons]
    newWeapons[index] = { ...newWeapons[index], ...updates }
    onChange({ ...character, weapons: newWeapons })
  }

  const addWeapon = () => {
    onChange({ ...character, weapons: [...character.weapons, createDefaultWeapon()] })
  }

  const removeWeapon = (index: number) => {
    onChange({ ...character, weapons: character.weapons.filter((_, i) => i !== index) })
  }

  const filteredSkills = character.skills.filter((skill) => {
    if (!skillSearch) return true
    const term = skillSearch.toLowerCase()
    return (
      skill.name.toLowerCase().includes(term) || (skill.customName && skill.customName.toLowerCase().includes(term))
    )
  })

  const showOccupationButton = character.occupation && character.occupation !== "Personalizada"

  const handleSkillImprovement = (index: number, amount: number) => {
    const updatedSkills = [...character.skills]
    const skill = updatedSkills[index]
    skill.improvementChecked = true
    skill.improvementSuccess = amount > 0
    if (amount > 0) {
      skill.value += amount
      skill.improvementAmount = amount
    }
    onChange({ ...character, skills: updatedSkills })
    setImprovingSkill(null)
  }

  const renderSkillRow = (skill: Skill, idx: number) => {
    const actualIndex = character.skills.indexOf(skill)
    const half = Math.floor(skill.value / 2)
    const fifth = Math.floor(skill.value / 5)
    const translatedName = skill.customName || getTranslatedSkillName(skill.name, language)

    if (skill.isFieldHeader) {
      return (
        <div
          key={`header-${idx}`}
          className="flex items-center justify-between py-1 mt-3 mb-1 border-b border-stone-300 dark:border-stone-700"
        >
          <span className="font-bold text-[11px] uppercase tracking-wider text-stone-600 dark:text-stone-400">
            {translatedName} {skill.baseValue > 0 ? `(${skill.baseValue}%)` : ""}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 hover:bg-stone-200 dark:hover:bg-stone-800"
            onClick={() => addFieldSlot(actualIndex)}
            title={t("add_skill")}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    const isHardcodedSubSkill = skill.name.includes(":")
    const isSlot = skill.isFieldSlot || isHardcodedSubSkill
    
    let displayName = translatedName
    if (isHardcodedSubSkill && translatedName.includes(":")) {
      displayName = translatedName.split(":")[1].trim()
    }

    return (
      <div
        key={idx}
        className={cn(
          "flex items-center gap-1 text-[10px] py-1 px-1 hover:bg-stone-100 dark:hover:bg-stone-800/50 rounded-sm relative group",
          isSlot ? "ml-4 pl-3" : "",
        )}
      >
        {isSlot && (
          <div className="absolute left-0 top-0 bottom-1/2 w-3 border-l border-b border-stone-300 dark:border-stone-600 rounded-bl-sm -translate-y-[2px]" />
        )}

        <button
          onClick={() => {
            updateSkill(actualIndex, { markedForImprovement: !skill.markedForImprovement })
          }}
          className={cn(
            "h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
            skill.markedForImprovement
              ? "bg-emerald-500 border-emerald-500"
              : "bg-transparent border-stone-400 dark:border-stone-600 hover:border-emerald-500",
          )}
        >
          {skill.markedForImprovement && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <button
          onClick={() => {
            if (!skill.markedForImprovement) {
              updateSkill(actualIndex, { markedForImprovement: true })
            } else {
              setImprovingSkill({ skill, index: actualIndex })
            }
          }}
          className={cn(
            "h-5 w-5 rounded shrink-0 flex items-center justify-center transition-all",
            skill.markedForImprovement
              ? "bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
              : "bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-500 dark:text-stone-400",
          )}
        >
          <Dices className="h-3 w-3" />
        </button>

        <div className="flex-1 min-w-0 font-serif flex items-center">
          {skill.isCustom || skill.isFieldSlot ? (
            <Input
              value={skill.customName}
              onChange={(e) => updateSkill(actualIndex, { customName: e.target.value })}
              className="h-5 p-1 text-[11px] border-none bg-transparent w-full focus-visible:ring-0 font-serif placeholder:text-stone-400 italic"
              placeholder={isSlot ? `.......................` : t("filter_skills")}
            />
          ) : (
            <span
              className={cn(
                "text-[11px] truncate",
                skill.isOccupational && "font-bold text-stone-900 dark:text-stone-100",
              )}
            >
              {displayName} <span className="text-stone-400 text-[9px]">({skill.baseValue}%)</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {skill.isOccupational && (
            <div className="h-4 px-1.5 flex items-center justify-center bg-amber-500 dark:bg-amber-600 text-white rounded-sm text-[9px] font-bold tracking-wide shrink-0">
              PROF
            </div>
          )}
          <Input
            type="number"
            value={skill.value}
            onChange={(e) => updateSkill(actualIndex, { value: Number.parseInt(e.target.value) || 0 })}
            className="h-6 w-9 text-center text-[11px] p-0 border border-stone-300 dark:border-stone-700 rounded-sm font-bold bg-white dark:bg-stone-900"
          />
        </div>

        <div className="flex flex-col text-[9px] leading-none text-stone-500 w-6 text-center font-mono gap-[2px]">
          <span>{half}</span>
          <span className="border-t border-stone-300 dark:border-stone-700 pt-[1px]">{fifth}</span>
        </div>

        {(skill.isCustom || skill.isFieldSlot || isHardcodedSubSkill) && (
          <button
            onClick={() => removeSkill(actualIndex)}
            className="text-stone-300 hover:text-red-500 transition-colors px-0.5 opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto bg-[#fdfaf5] dark:bg-stone-950 text-stone-900 dark:text-stone-200 font-sans p-4 md:p-8 shadow-2xl border border-stone-300 dark:border-stone-800 min-h-screen relative transition-colors duration-300">
      {showDiceRoller && <DiceRoller onComplete={handleDiceRollComplete} onCancel={() => setShowDiceRoller(false)} />}

      {improvingSkill && (
        <SkillImprovementModal
          skill={improvingSkill.skill}
          onComplete={(amount) => handleSkillImprovement(improvingSkill.index, amount)}
          onCancel={() => setImprovingSkill(null)}
        />
      )}
   
      {/* CABECERA (DATOS PERSONALES) */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          
          {/* --- COLUMNA IZQUIERDA: FOTO DEL INVESTIGADOR --- */}
          <div className="lg:w-1/4 flex flex-col items-center justify-start lg:border-r border-stone-300 dark:border-stone-800 pb-4 lg:pb-0 lg:pr-4">
             {/* Marco Foto */}
             <div className="relative group mb-3">
                 <div 
                    className="w-32 h-40 bg-stone-100 dark:bg-stone-900 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden hover:border-primary transition-colors shadow-sm"
                    onClick={() => fileInputRef.current?.click()}
                 >
                    {character.imageUrl ? (
                        <img 
                            src={character.imageUrl} 
                            alt="Character" 
                            className="w-full h-full object-cover sepia-[0.2]" 
                        />
                    ) : (
                        <div className="text-center p-4">
                            <User className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                            <span className="text-[10px] text-stone-400 uppercase font-bold">{t("add_photo") || "FOTO"}</span>
                        </div>
                    )}
                    
                    {/* Overlay al pasar el ratón */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-bold">CAMBIAR</span>
                    </div>
                 </div>
                 {/* Input oculto */}
                 <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                 />
             </div>
             
             {/* Título de la App debajo de la foto */}
             <div className="text-center opacity-60">
                <h1 className="text-xl font-serif font-black leading-none tracking-tighter text-stone-900 dark:text-stone-100">
                {t("app_title")}
                </h1>
                <span className="text-[10px] tracking-[0.3em] text-stone-500 font-bold">7E EDITION</span>
             </div>
          </div>

          {/* --- COLUMNA DERECHA: DATOS --- */}
          <div className="lg:w-3/4 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2">
            <div className="col-span-2 space-y-1">
              <Label className="text-[9px] uppercase font-bold text-stone-500">{t("name")}</Label>
              <Input
                value={character.name}
                onChange={(e) => handleBasicChange("name", e.target.value)}
                className="h-8 border-x-0 border-t-0 border-b border-stone-400 rounded-none px-0 focus-visible:ring-0 font-serif text-xl bg-transparent font-bold"
              />
            </div>

            {/* --- SECCIÓN DE OCUPACIÓN --- */}
            <div className="col-span-2 space-y-1">
              <Label className="text-[9px] uppercase font-bold text-stone-500">{t("occupation")}</Label>
              <div className="relative">
                <Select
                  value={
                    PRESET_OCCUPATIONS.some((p) => p.name === character.occupation)
                      ? character.occupation
                      : character.occupation
                        ? "custom"
                        : ""
                  }
                  onValueChange={handleOccupationChange}
                >
                  <SelectTrigger className="w-full h-8 border-x-0 border-t-0 border-b border-stone-400 rounded-none px-0 focus:ring-0 bg-transparent text-left font-serif text-base font-medium p-0">
                    <SelectValue placeholder={t("select_occupation")} />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_OCCUPATIONS.map((occ) => (
                      <SelectItem key={occ.name} value={occ.name}>
                        {language === 'en' ? occ.nameEn : occ.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" className="font-semibold text-primary">
                      {t("custom_occupation")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {character.occupation !== "" &&
                  (!PRESET_OCCUPATIONS.some((p) => p.name === character.occupation) ||
                    character.occupation === "Personalizada") && (
                    <Input
                      value={character.occupation === "Personalizada" ? "" : character.occupation}
                      onChange={(e) => handleBasicChange("occupation", e.target.value)}
                      className="h-8 border-x-0 border-t-0 border-b border-stone-400 rounded-none px-0 focus-visible:ring-0 bg-transparent mt-1 placeholder:italic"
                      placeholder={t("new_occupation_placeholder")}
                    />
                  )}

                {showOccupationButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-1 h-7 text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900"
                    onClick={() => setIsOccupationModalOpen(true)}
                  >
                    <Settings2 className="mr-1 h-3 w-3" />
                    {t("manage_skills")}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[9px] uppercase font-bold text-stone-500">{t("age")}</Label>
              <Input
                type="number"
                value={character.age}
                onChange={(e) => handleBasicChange("age", e.target.value)}
                className="h-7 border-x-0 border-t-0 border-b border-stone-300 rounded-none px-0 bg-transparent"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] uppercase font-bold text-stone-500">{t("gender")}</Label>
              <Input
                value={character.gender}
                onChange={(e) => handleBasicChange("gender", e.target.value)}
                className="h-7 border-x-0 border-t-0 border-b border-stone-300 rounded-none px-0 bg-transparent"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-[9px] uppercase font-bold text-stone-500">{t("residence")}</Label>
              <Input
                value={character.residence}
                onChange={(e) => handleBasicChange("residence", e.target.value)}
                className="h-7 border-x-0 border-t-0 border-b border-stone-300 rounded-none px-0 bg-transparent"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-[9px] uppercase font-bold text-stone-500">{t("birthplace")}</Label>
              <Input
                value={character.birthplace}
                onChange={(e) => handleBasicChange("birthplace", e.target.value)}
                className="h-7 border-x-0 border-t-0 border-b border-stone-300 rounded-none px-0 bg-transparent"
              />
            </div>
          </div>
        </div>

        {!hasRolledCharacteristics && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="text-center md:text-left">
                <h3 className="font-bold text-foreground mb-1">{t("roll_dice")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("auto_roll_desc")}
                </p>
              </div>
              <Button onClick={() => setShowDiceRoller(true)} className="gap-2 whitespace-nowrap">
                <Dices className="h-4 w-4" />
                {t("roll_dice")}
              </Button>
            </div>
          </div>
        )}

        {/* TIRA DE CARACTERÍSTICAS */}
        <div className="bg-stone-200/50 dark:bg-stone-900/50 p-3 rounded border border-stone-300 dark:border-stone-700">
          <div className="flex flex-wrap justify-between gap-2 md:gap-4">
            {CHAR_ORDER.map((key) => {
              const char = character.characteristics[
                key as keyof typeof character.characteristics
              ] as CharacteristicValue
              return (
                <div
                  key={key}
                  className="flex-1 min-w-[70px] flex flex-col items-center bg-white dark:bg-stone-950 p-1.5 rounded shadow-sm border border-stone-200 dark:border-stone-800"
                >
                  <span className="text-[10px] font-black text-stone-500 mb-1">{t(key.toLowerCase())}</span>
                  <Input
                    type="number"
                    value={char.value}
                    onChange={(e) => handleCharChange(key as any, Number.parseInt(e.target.value) || 0)}
                    className="h-10 w-full text-center text-2xl font-black border-stone-200 dark:border-stone-700 bg-transparent p-0 focus-visible:ring-1"
                  />
                  <div className="flex w-full justify-between px-1 mt-1 text-[10px] text-stone-500 font-mono font-bold">
                    <span title={t("half")}>{char.half}</span>
                    <span title={t("fifth")}>{char.fifth}</span>
                  </div>
                </div>
              )
            })}
            <div className="flex-1 min-w-[70px] flex flex-col items-center bg-stone-100 dark:bg-stone-900 p-1.5 rounded border border-stone-200 dark:border-stone-800">
              <span className="text-[10px] font-black text-stone-500 mb-1">{t("mov")}</span>
              <div className="h-10 w-full flex items-center justify-center text-2xl font-black">
                {character.characteristics.MOV}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS DERIVADAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* PUNTOS DE VIDA */}
        <div className="border border-stone-300 dark:border-stone-700 p-4 rounded bg-white dark:bg-stone-900 relative overflow-hidden">
          <Label className="font-serif font-bold text-sm uppercase block mb-2">{t("hp")}</Label>
          <div className="flex gap-2 mb-3 items-end">
            <div className="flex-1">
              <Input
                type="number"
                value={character.hitPoints.current}
                onChange={(e) =>
                  onChange({
                    ...character,
                    hitPoints: { ...character.hitPoints, current: Number.parseInt(e.target.value) || 0 },
                  })
                }
                className="h-14 text-center text-3xl font-bold border-stone-300 bg-stone-50 dark:bg-stone-800 dark:border-stone-600"
              />
              <Label className="text-[8px] uppercase text-stone-400 block text-center mt-1">{t("current")}</Label>
            </div>
            <div className="w-14">
              <div className="h-10 flex items-center justify-center text-lg font-bold text-stone-500 border border-dashed border-stone-300 rounded bg-stone-100 dark:bg-stone-950">
                {character.hitPoints.max}
              </div>
              <Label className="text-[8px] uppercase text-stone-400 block text-center mt-1">{t("max")}</Label>
            </div>
          </div>
          <div className="flex justify-between gap-1 mb-3">
            <div className="flex items-center gap-1">
              <Checkbox
                className="h-4 w-4"
                id="mw"
                checked={character.hitPoints.majorWound}
                onCheckedChange={(c) =>
                  onChange({ ...character, hitPoints: { ...character.hitPoints, majorWound: !!c } })
                }
              />
              <Label htmlFor="mw" className="text-[10px] cursor-pointer">
                {t("major_wound")}
              </Label>
            </div>
            <div className="flex items-center gap-1">
              <Checkbox
                className="h-4 w-4"
                id="dy"
                checked={character.hitPoints.dying}
                onCheckedChange={(c) => onChange({ ...character, hitPoints: { ...character.hitPoints, dying: !!c } })}
              />
              <Label htmlFor="dy" className="text-[10px] cursor-pointer">
                {t("dying")}
              </Label>
            </div>
          </div>
          <SheetTracker
            current={character.hitPoints.current}
            max={character.hitPoints.max}
            onChange={(v) => onChange({ ...character, hitPoints: { ...character.hitPoints, current: v } })}
          />
        </div>

        {/* CORDURA */}
        <div className="border border-stone-300 dark:border-stone-700 p-4 rounded bg-white dark:bg-stone-900 relative overflow-hidden">
          <Label className="font-serif font-bold text-sm uppercase block mb-2">{t("sanity")} (SAN)</Label>
          <div className="flex gap-2 mb-3 items-end">
            <div className="flex-1">
              <Input
                type="number"
                value={character.sanity.limit || ""}
                onChange={(e) =>
                  onChange({
                    ...character,
                    sanity: { ...character.sanity, limit: Number.parseInt(e.target.value) || 0 },
                  })
                }
                className="h-14 text-center text-3xl font-bold border-stone-300 bg-stone-50 dark:bg-stone-800 dark:border-stone-600 placeholder:text-stone-300"
                placeholder="0"
              />
              <Label className="text-[8px] uppercase text-stone-400 block text-center mt-1">{t("start")} ({t("pow")})</Label>
            </div>

            <div className="w-14">
              <div className="h-10 flex items-center justify-center text-lg font-bold text-stone-500 border border-stone-200 rounded mb-1 bg-stone-50 dark:bg-stone-900">
                {maxSanityCalc}
              </div>
              <Label className="text-[8px] uppercase text-stone-400 block text-center">{t("max")}</Label>
            </div>
          </div>

          <div className="flex justify-between gap-1 mb-3">
            <div className="flex items-center gap-1">
              <Checkbox
                className="h-4 w-4"
                id="ti"
                checked={character.sanity.temporaryInsanity}
                onCheckedChange={(c) =>
                  onChange({ ...character, sanity: { ...character.sanity, temporaryInsanity: !!c } })
                }
              />
              <Label htmlFor="ti" className="text-[10px] cursor-pointer">
                {t("temp_insanity")}
              </Label>
            </div>
            <div className="flex items-center gap-1">
              <Checkbox
                className="h-4 w-4"
                id="ii"
                checked={character.sanity.indefiniteInsanity}
                onCheckedChange={(c) =>
                  onChange({ ...character, sanity: { ...character.sanity, indefiniteInsanity: !!c } })
                }
              />
              <Label htmlFor="ii" className="text-[10px] cursor-pointer">
                {t("indef_insanity")}
              </Label>
            </div>
          </div>

          <SheetTracker
            current={character.sanity.current}
            max={character.sanity.limit || 0}
            onChange={(v) => onChange({ ...character, sanity: { ...character.sanity, current: v } })}
          />
        </div>

        {/* SUERTE */}
        <div className="border border-stone-300 dark:border-stone-700 p-4 rounded bg-white dark:bg-stone-900 relative overflow-hidden">
          <Label className="font-serif font-bold text-sm uppercase block mb-2">{t("luck")}</Label>
          <div className="flex gap-2 mb-6 items-end justify-center">
            <div className="w-2/3">
              <Input
                type="number"
                value={character.luck.limit || ""}
                placeholder="Valor Inicial"
                onChange={(e) =>
                  onChange({ ...character, luck: { ...character.luck, limit: Number.parseInt(e.target.value) || 0 } })
                }
                className="h-14 text-center text-3xl font-bold border-stone-300 bg-stone-50 dark:bg-stone-800 dark:border-stone-600 placeholder:text-stone-300 text-stone-900 dark:text-stone-100"
              />
              <Label className="text-[8px] uppercase text-stone-400 block text-center mt-1">{t("start")}</Label>
            </div>
          </div>
          <SheetTracker
            current={character.luck.current}
            max={character.luck.limit || 0}
            onChange={(v) => onChange({ ...character, luck: { ...character.luck, current: v } })}
          />
        </div>

        {/* PUNTOS DE MAGIA */}
        <div className="border border-stone-300 dark:border-stone-700 p-4 rounded bg-white dark:bg-stone-900 relative overflow-hidden">
          <Label className="font-serif font-bold text-sm uppercase block mb-2">{t("magic_points")}</Label>
          <div className="flex gap-2 mb-6 items-end">
            <div className="flex-1">
              <Input
                type="number"
                value={character.magicPoints.current}
                onChange={(e) =>
                  onChange({
                    ...character,
                    magicPoints: { ...character.magicPoints, current: Number.parseInt(e.target.value) || 0 },
                  })
                }
                className="h-14 text-center text-3xl font-bold border-stone-300 bg-stone-50 dark:bg-stone-800 dark:border-stone-600"
              />
              <Label className="text-[8px] uppercase text-stone-400 block text-center mt-1">{t("current")}</Label>
            </div>
            <div className="w-14">
              <div className="h-10 flex items-center justify-center text-lg font-bold text-stone-500 border border-dashed border-stone-300 rounded bg-stone-100 dark:bg-stone-950">
                {character.magicPoints.max}
              </div>
              <Label className="text-[8px] uppercase text-stone-400 block text-center mt-1">{t("max")}</Label>
            </div>
          </div>
          <SheetTracker
            current={character.magicPoints.current}
            max={character.magicPoints.max}
            onChange={(v) => onChange({ ...character, magicPoints: { ...character.magicPoints, current: v } })}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h3 className="font-serif font-bold text-lg uppercase border-b-2 border-stone-800 pb-1 flex-1">
          {t("investigator_skills")}
        </h3>
      </div>

      {/* HABILIDADES */}
      <div className="mb-8">
        <div className="flex justify-end items-center mb-4 gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1.5 h-3 w-3 text-stone-400" />
            <Input
              placeholder={t("filter_skills")}
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="h-7 w-32 pl-7 text-[10px] bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700"
            />
          </div>
          <Button size="sm" variant="outline" className="h-7 text-[10px] bg-transparent" onClick={addCustomSkill}>
            <Plus className="h-3 w-3 mr-1" /> {t("add_skill")}
          </Button>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8 gap-y-2 pr-1">
          {filteredSkills.map((skill, i) => (
            <div key={i} className="break-inside-avoid">
              {renderSkillRow(skill, i)}
            </div>
          ))}
        </div>
      </div>

      {/* COMBATE */}
      <div className="mt-8">
        <h3 className="font-serif font-bold text-lg uppercase border-b-2 border-stone-800 pb-1 mb-4">{t("combat")}</h3>

        <div className="flex gap-4 md:gap-12 mb-6 bg-stone-100 dark:bg-stone-900 p-4 rounded border border-stone-200 dark:border-stone-800">
          <div className="text-center">
            <Label className="text-[9px] uppercase font-bold text-stone-500 block mb-1">{t("db")}</Label>
            <span className="font-black text-xl font-serif">{character.damageBonus}</span>
          </div>
          <div className="text-center border-l border-stone-300 pl-4 md:pl-12">
            <Label className="text-[9px] uppercase font-bold text-stone-500 block mb-1">{t("build")}</Label>
            <span className="font-black text-xl font-serif">{character.build}</span>
          </div>
          <div className="text-center border-l border-stone-300 pl-4 md:pl-12">
            <Label className="text-[9px] uppercase font-bold text-stone-500 block mb-1">{t("dodge")}</Label>
            <span className="font-black text-xl font-serif">{character.dodge}</span>
          </div>
          <div className="flex-1"></div>
          <Shield className="h-10 w-10 text-stone-200" />
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                <th className="p-2 font-bold rounded-tl">{t("weapon")}</th>
                <th className="p-2 text-center font-bold w-16">{t("regular")}</th>
                <th className="p-2 text-center font-bold w-16">{t("difficult")}</th>
                <th className="p-2 text-center font-bold w-16">{t("extreme")}</th>
                <th className="p-2 font-bold w-20">{t("damage")}</th>
                <th className="p-2 font-bold w-16">{t("range")}</th>
                <th className="p-2 text-center font-bold w-10">{t("attacks")}</th>
                <th className="p-2 font-bold w-12">{t("ammo")}</th>
                <th className="p-2 font-bold w-12 rounded-tr">{t("malfunction")}</th>
                <th className="p-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {character.weapons.map((w, i) => (
                <tr key={i} className="hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
                  <td className="p-1">
                    <Input
                      value={w.name}
                      onChange={(e) => updateWeapon(i, { name: e.target.value })}
                      className="h-8 text-sm border-none bg-transparent font-bold"
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      type="number"
                      value={w.normal}
                      onChange={(e) => updateWeapon(i, { normal: Number.parseInt(e.target.value) || 0 })}
                      className="h-8 text-center text-sm border-none bg-transparent font-medium"
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      type="number"
                      value={w.difficult}
                      onChange={(e) => updateWeapon(i, { difficult: Number.parseInt(e.target.value) || 0 })}
                      className="h-8 text-center text-sm border-none bg-transparent text-stone-600"
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      type="number"
                      value={w.extreme}
                      onChange={(e) => updateWeapon(i, { extreme: Number.parseInt(e.target.value) || 0 })}
                      className="h-8 text-center text-sm border-none bg-transparent text-stone-400"
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      value={w.damage}
                      onChange={(e) => updateWeapon(i, { damage: e.target.value })}
                      className="h-8 text-sm border-none bg-transparent"
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      value={w.range}
                      onChange={(e) => updateWeapon(i, { range: e.target.value })}
                      className="h-8 text-sm border-none bg-transparent"
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      type="number"
                      value={w.attacks}
                      onChange={(e) => updateWeapon(i, { attacks: Number.parseInt(e.target.value) || 1 })}
                      className="h-8 text-center text-sm border-none bg-transparent"
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      value={w.ammo}
                      onChange={(e) => updateWeapon(i, { ammo: e.target.value })}
                      className="h-8 text-sm border-none bg-transparent"
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      value={w.malfunction}
                      onChange={(e) => updateWeapon(i, { malfunction: e.target.value })}
                      className="h-8 text-sm border-none bg-transparent"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <button
                      onClick={() => removeWeapon(i)}
                      className="text-stone-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button
            variant="ghost"
            className="w-full mt-2 text-xs border border-dashed border-stone-300 text-stone-500 hover:text-stone-900"
            onClick={addWeapon}
          >
            <Plus className="h-3.5 w-3.5 mr-2" /> {t("add_weapon")}
          </Button>
        </div>
      </div>
      <ShareCharacterModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        character={character}
        onImport={(importedChar) => {
          onChange(importedChar) // Reemplaza el personaje actual
          setIsShareModalOpen(false)
        }}
      />
      <OccupationDetailsModal
        isOpen={isOccupationModalOpen}
        onClose={() => setIsOccupationModalOpen(false)}
        character={character}
        onChange={handleModalChange}
      />
    </div>
  )
}