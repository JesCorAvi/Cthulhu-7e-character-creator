"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Settings2, Plus, X, Check, ChevronsUpDown } from "lucide-react"
import type { Character, CharacteristicValue } from "@/lib/character-types"
import { PRESET_OCCUPATIONS, type SkillRequirement, type FieldRequirement } from "@/lib/occupations-data"
import { calculateSpentPoints } from "@/lib/occupation-utils"
import { useLanguage } from "@/components/language-provider"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// --- DICCIONARIO DE TRADUCCIÓN DE HABILIDADES ---
const SKILL_TRANSLATIONS: Record<string, string> = {
  // Habilidades Base
  "Antropología": "Anthropology",
  "Arqueología": "Archaeology",
  "Charlatanería": "Fast Talk",
  "Conducir automóvil": "Drive Auto",
  "Derecho": "Law",
  "Descubrir": "Spot Hidden",
  "Disfrazarse": "Disguise",
  "Electricidad": "Electrical Repair",
  "Encanto": "Charm",
  "Equitación": "Ride",
  "Escuchar": "Listen",
  "Esquivar": "Dodge",
  "Historia": "History",
  "Intimidar": "Intimidate",
  "Lanzar": "Throw",
  "Mecánica": "Mechanical Repair",
  "Medicina": "Medicine",
  "Mitos de Cthulhu": "Cthulhu Mythos",
  "Nadar": "Swim",
  "Ocultismo": "Occult",
  "Orientarse": "Navigate",
  "Persuasión": "Persuade",
  "Primeros auxilios": "First Aid",
  "Psicoanálisis": "Psychoanalysis",
  "Psicología": "Psychology",
  "Saltar": "Jump",
  "Sigilo": "Stealth",
  "Seguir rastros": "Track",
  "Trepar": "Climb",
  "Buscar libros": "Library Use",
  "Tasación": "Appraise",
  "Contabilidad": "Accounting",
  
  // Campos
  "Ciencia": "Science",
  "Arte/Artesanía": "Art/Craft",
  "Otras lenguas": "Language (Other)",
  "Armas de fuego": "Firearms",
  "Combatir": "Fighting",
  "Supervivencia": "Survival",
  "Lengua propia": "Language (Own)",
  "Pilotar": "Pilot",

  // Especialidades (Opciones)
  "Alpino": "Alpine",
  "Actuar": "Acting",
  "Cantar": "Singing",
  "Comedia": "Comedy",
  "Dibujo técnico": "Technical Drawing",
  "Matemáticas": "Mathematics",
  "Literatura": "Literature",
  "Aviación": "Aircraft",
  "Pelea": "Brawl",
  "Bote": "Boat",
  "Biología": "Biology",
  "Botánica": "Botany",
  "Zoología": "Zoology",
  "Farmacia": "Pharmacy",
  "Química": "Chemistry",
  "Geología": "Geology",
  "Historia Natural": "Natural History",
  "Naturaleza": "Natural World", // A veces se usa como sinónimo
  "Ingeniería": "Engineering",
  "Física": "Physics",
  "Astronomía": "Astronomy",
  "Fotografía": "Photography",
  "Falsificación": "Forgery",
  "Latín": "Latin",
  "Agricultura": "Farming",
  "Mecanografía": "Typing",
  "Motosierra": "Chainsaw",
  "Soldadura": "Welding",
  "Carpintería": "Carpentry",
  "Mar": "Sea",
  "Rifle/Escopeta": "Rifle/Shotgun"
}

function PointsInput({
  value = 0,
  onChange,
  className,
  placeholder,
}: {
  value?: number
  onChange: (val: number) => void
  className?: string
  placeholder?: string
}) {
  const [localValue, setLocalValue] = useState(String(value))

  useEffect(() => {
    setLocalValue(String(value))
  }, [value])

  const handleBlur = () => {
    const parsed = Number.parseInt(localValue) || 0
    if (parsed !== value) {
      onChange(parsed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const parsed = Number.parseInt(localValue) || 0
      onChange(parsed)
      ;(e.target as HTMLInputElement).blur()
    }
  }

  return (
    <Input
      type="number"
      className={className}
      value={localValue}
      placeholder={placeholder}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={(e) => e.target.select()}
    />
  )
}

function TextInput({
  value,
  onChange,
  className,
  placeholder,
  autoFocus,
  onKeyDown,
}: {
  value: string
  onChange: (val: string) => void
  className?: string
  placeholder?: string
  autoFocus?: boolean
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue)
    }
  }

  return (
    <Input
      type="text"
      className={className}
      value={localValue}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onChange(localValue)
        }
        onKeyDown?.(e)
      }}
    />
  )
}

function BaseValueInput({
  value,
  onChange,
  className,
  placeholder,
  onKeyDown,
}: {
  value: string
  onChange: (val: string) => void
  className?: string
  placeholder?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue)
    }
  }

  return (
    <Input
      type="number"
      className={className}
      value={localValue}
      placeholder={placeholder}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onChange(localValue)
        }
        onKeyDown?.(e)
      }}
    />
  )
}

// --- COMPONENTE COMBOBOX BUSCABLE ---
function SkillCombobox({
  fields,
  commonSkills,
  onSelect,
  t,
  tSkill,
  placeholder
}: {
  fields: string[]
  commonSkills: string[]
  onSelect: (value: string) => void
  t: any
  tSkill: (s: string) => string
  placeholder: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder={t("filter_skills") || "Buscar..."} />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup heading={t("specialties")}>
              {fields.map((f) => (
                <CommandItem
                  key={f}
                  value={tSkill(f)}
                  onSelect={() => {
                    onSelect(f)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                  {tSkill(f)}...
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Habilidades Comunes">
              {commonSkills.map((sk) => (
                <CommandItem
                  key={sk}
                  value={tSkill(sk)}
                  onSelect={() => {
                    onSelect(sk)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                  {tSkill(sk)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const COMMON_SKILLS = [
  "Antropología",
  "Arqueología",
  "Charlatanería",
  "Conducir automóvil",
  "Derecho",
  "Descubrir",
  "Disfrazarse",
  "Electricidad",
  "Encanto",
  "Equitación",
  "Escuchar",
  "Esquivar",
  "Historia",
  "Intimidar",
  "Lanzar",
  "Mecánica",
  "Medicina",
  "Mitos de Cthulhu",
  "Nadar",
  "Ocultismo",
  "Orientarse",
  "Persuasión",
  "Primeros auxilios",
  "Psicoanálisis",
  "Psicología",
  "Saltar",
  "Sigilo",
  "Seguir rastros",
  "Trepar",
]

const FIELDS = [
  "Ciencia",
  "Arte/Artesanía",
  "Otras lenguas",
  "Armas de fuego",
  "Combatir",
  "Supervivencia",
  "Lengua propia",
  "Pilotar",
]

const STAT_OPTIONS = [
  { value: "STR", label: "FUE (STR)" },
  { value: "DEX", label: "DES (DEX)" },
  { value: "POW", label: "POD (POW)" },
  { value: "APP", label: "APA (APP)" },
  { value: "EDU", label: "EDU (EDU)" },
  { value: "INT", label: "INT (INT)" },
  { value: "SIZ", label: "TAM (SIZ)" },
  { value: "CON", label: "CON (CON)" },
]

interface OccupationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  character: Character
  onChange: (updates: Partial<Character>) => void
}

export function OccupationDetailsModal({ isOpen, onClose, character, onChange }: OccupationDetailsModalProps) {
  const { t, language } = useLanguage()
  const currentOccupation = PRESET_OCCUPATIONS.find((occ) => occ.name === character.occupation)
  
  // MODIFICADO: Si no encontramos la ocupación en los presets (currentOccupation es undefined),
  // o el nombre es explícitamente "Otra", lo tratamos como una ocupación personalizada.
  const isCustomOccupation = !currentOccupation || character.occupation === "Otra"

  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null)
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null)
  const [tempSpecValue, setTempSpecValue] = useState("")
  const [tempBaseValue, setTempBaseValue] = useState("")
  const [customStat1, setCustomStat1] = useState<string>("EDU")
  const [customStat2, setCustomStat2] = useState<string>("DEX")

  // Helper to translate skill names
  const tSkill = (name: string) => {
    if (language === "es") return name
    
    // Handle specializations e.g. "Ciencia: Biología"
    if (name.includes(": ")) {
      const [field, spec] = name.split(": ")
      const translatedField = SKILL_TRANSLATIONS[field] || field
      return `${translatedField}: ${spec}`
    }
    
    return SKILL_TRANSLATIONS[name] || name
  }

  const getCharacteristicVal = (key: string): number => {
    const map: Record<string, string> = { FUE: "STR", DES: "DEX", POD: "POW", APA: "APP", TAM: "SIZ", INT: "INT" }
    const realKey = map[key] || key
    // @ts-ignore
    const stat = character.characteristics[realKey as keyof typeof character.characteristics]
    return (stat as CharacteristicValue)?.value || 0
  }

  const formulaAnalysis = useMemo(() => {
    if (isCustomOccupation || !character.occupationFormula) return { type: "simple", options: [] as string[] }
    const f = character.occupationFormula.toUpperCase()
    if (f.includes("STR") && f.includes("DEX") && (f.includes("OR") || f.includes("O")))
      return { type: "choice", options: ["STR", "DEX"], label: t("occupation_choose_stat") }
    if (f.includes("APP") && f.includes("POW") && (f.includes("OR") || f.includes("O")))
      return { type: "choice", options: ["APP", "POW"], label: t("occupation_choose_stat") }
    return { type: "simple", options: [] as string[] }
  }, [character.occupationFormula, isCustomOccupation, t])

  const totalPoints = useMemo(() => {
    if (isCustomOccupation) return getCharacteristicVal(customStat1) * 2 + getCharacteristicVal(customStat2) * 2
    if (!character.occupationFormula) return 0
    const edu = getCharacteristicVal("EDU")
    if (character.occupationFormula === "EDU*4") return edu * 4
    let total = edu * 2
    if (selectedAttribute) total += getCharacteristicVal(selectedAttribute) * 2
    else
      ["STR", "DEX", "POW", "APP"].forEach((s) => {
        if (s !== "EDU" && character.occupationFormula?.includes(s)) total += getCharacteristicVal(s) * 2
      })
    return total
  }, [
    character.characteristics,
    character.occupationFormula,
    selectedAttribute,
    isCustomOccupation,
    customStat1,
    customStat2,
  ])

  const { occupationalSpent } = calculateSpentPoints(character)
  const remainingPoints = totalPoints - occupationalSpent

  // Si no es custom y no se encuentra la ocupación, no mostramos nada.
  // Pero gracias al cambio en isCustomOccupation, si el usuario escribió un nombre manual, isCustomOccupation será true.
  if (!currentOccupation && !isCustomOccupation) return null

  // Helper to get localized properties
  const loc = (obj: any, key: string = "label") => {
    if (!obj) return ""
    if (language === "en" && obj[key + "En"]) {
      return obj[key + "En"]
    }
    return obj[key]
  }

  const updateSkillPoints = (name: string, pts: number, customBaseValue?: number, remove: boolean = false) => {
    const newSkills = [...character.skills]
    const isFieldSpecialization = name.includes(": ")

    if (isFieldSpecialization) {
      const [fieldName, specName] = name.split(": ")

      const existingSpecIndex = newSkills.findIndex(
        (s) => s.name === name || (s.name === fieldName && s.customName === specName),
      )

      if (existingSpecIndex >= 0) {
        const skill = newSkills[existingSpecIndex]
        if (remove) {
          if (skill.isFieldSlot) {
            newSkills[existingSpecIndex] = {
              ...skill,
              customName: "",
              occupationalPoints: 0,
              isOccupational: false,
              value: skill.baseValue,
            }
          } else {
            newSkills.splice(existingSpecIndex, 1)
          }
        } else {
          const baseVal = customBaseValue !== undefined ? customBaseValue : skill.baseValue
          newSkills[existingSpecIndex] = {
            ...skill,
            baseValue: baseVal,
            occupationalPoints: pts,
            value: baseVal + pts + (skill.personalPoints || 0),
            isOccupational: true,
          }
        }
      } else if (!remove) {
        const emptySlotIndex = newSkills.findIndex(
          (s) => s.isFieldSlot && s.name === fieldName && (!s.customName || s.customName === ""),
        )

        if (emptySlotIndex >= 0) {
          const slot = newSkills[emptySlotIndex]
          const baseVal = customBaseValue !== undefined ? customBaseValue : slot.baseValue
          newSkills[emptySlotIndex] = {
            ...slot,
            customName: specName,
            baseValue: baseVal,
            occupationalPoints: pts,
            value: baseVal + pts,
            isOccupational: true,
          }
        } else {
          const baseVal = customBaseValue !== undefined ? customBaseValue : 0
          newSkills.push({
            name: name,
            baseValue: baseVal,
            value: baseVal + pts,
            occupationalPoints: pts,
            personalPoints: 0,
            isOccupational: true,
            isCustom: true,
          })
        }
      }
    } else {
      const existingIndex = newSkills.findIndex((s) => s.name === name)
      if (existingIndex >= 0) {
        const skill = newSkills[existingIndex]
        if (remove) {
          if (skill.isCustom) {
            newSkills.splice(existingIndex, 1)
          } else {
            newSkills[existingIndex] = {
              ...skill,
              occupationalPoints: 0,
              value: skill.baseValue + (skill.personalPoints || 0),
              isOccupational: false,
            }
          }
        } else {
          newSkills[existingIndex] = {
            ...skill,
            occupationalPoints: pts,
            value: skill.baseValue + pts + (skill.personalPoints || 0),
            isOccupational: true,
          }
        }
      } else if (!remove) {
        newSkills.push({
          name: name,
          baseValue: 0,
          value: pts,
          occupationalPoints: pts,
          personalPoints: 0,
          isOccupational: true,
          isCustom: true,
        })
      }
    }

    onChange({ skills: newSkills })
  }

const FieldSelector = ({
    req,
    uniqueId,
    isInsideChoice = false,
  }: { req: FieldRequirement; uniqueId: string; isInsideChoice?: boolean }) => {
    const added = character.skills.filter(
      (s) =>
        s.isOccupational &&
        ((s.name === req.field && s.customName && s.customName !== "") || s.name.startsWith(`${req.field}: `)),
    )
    const isAdding = activeFieldKey === uniqueId
    const needsBaseValue = req.requiresBaseValue || false

    const handleAdd = () => {
      const specName = tempSpecValue.trim()
      if (specName) {
        const fullName = `${req.field}: ${specName}`
        const baseVal = needsBaseValue ? Number.parseInt(tempBaseValue) || 0 : undefined
        updateSkillPoints(fullName, 0, baseVal)
        setTempSpecValue("")
        setTempBaseValue("")
        setActiveFieldKey(null)
      }
    }

    const getDisplayName = (s: (typeof character.skills)[0]) => {
      if (s.customName && s.name === req.field) {
        // CORRECCIÓN: Traducimos también la especialidad si es una de las conocidas
        const translatedSpec = SKILL_TRANSLATIONS[s.customName] || s.customName
        return `${tSkill(req.field)}: ${translatedSpec}`
      }
      return tSkill(s.name)
    }

    const getSkillKey = (s: (typeof character.skills)[0]) => {
      if (s.customName && s.name === req.field) {
        return `${req.field}: ${s.customName}`
      }
      return s.name
    }

    const label = loc(req, "label") || tSkill(req.field)
    const placeholderText = language === "en" 
        ? (needsBaseValue ? "Ex: Brawl, Sword..." : "Ex: Biology, Photography...") 
        : (needsBaseValue ? "Ej: Pelea, Espada..." : "Ej: Biología, Fotografía...")

    return (
      <div className={`space-y-2 ${!isInsideChoice ? "mb-4 p-3 border rounded bg-slate-50 dark:bg-slate-900/40" : ""}`}>
        {!isInsideChoice && (
          <div className="flex justify-between mb-1">
            <Label className="font-bold">{label}</Label>
            <span className="text-xs font-bold">
              {added.length} / {req.count}
            </span>
          </div>
        )}
        <div className="space-y-1">
          {added.map((s) => (
            <div
              key={getDisplayName(s)}
              className="flex items-center gap-2 bg-white dark:bg-slate-950 p-1 rounded border"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-400"
                onClick={() => updateSkillPoints(getSkillKey(s), 0, undefined, true)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <span className="flex-1 text-xs truncate">
                {getDisplayName(s)} <span className="text-muted-foreground">({s.baseValue}%)</span>
              </span>
              <PointsInput
                className="w-14 h-6 text-right text-xs"
                value={s.occupationalPoints}
                onChange={(val) => updateSkillPoints(getSkillKey(s), val)}
              />
            </div>
          ))}

          {added.length < req.count && !isAdding && (
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 border-dashed text-xs bg-transparent"
              onClick={() => {
                setActiveFieldKey(uniqueId)
                const prefill = req.options && req.options.length === 1 ? req.options[0] : ""
                setTempSpecValue(prefill)
                setTempBaseValue("")
              }}
            >
              <Plus className="w-3 h-3 mr-1" /> {t("define")} {label}
            </Button>
          )}

          {isAdding && (
            <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex gap-1">
                {req.options && req.options.length > 0 ? (
                  req.options.length === 1 ? (
                    // Caso 1 opción: Input bloqueado pero mostrando la TRADUCCIÓN
                    <Input
                      readOnly
                      className="h-8 text-xs flex-1 bg-muted font-medium opacity-100"
                      value={tSkill(tempSpecValue)} 
                    />
                  ) : (
                    // Caso múltiples opciones: Select mostrando TRADUCCIONES
                    <Select value={tempSpecValue} onValueChange={setTempSpecValue}>
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {req.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {tSkill(opt)} 
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
                ) : (
                  <TextInput
                    autoFocus
                    placeholder={placeholderText}
                    className="h-8 text-xs flex-1"
                    value={tempSpecValue}
                    onChange={setTempSpecValue}
                    onKeyDown={(e) => e.key === "Enter" && !needsBaseValue && handleAdd()}
                  />
                )}

                {!needsBaseValue && (
                  <>
                    <Button 
                      size="sm" 
                      className="h-8 px-2" 
                      onClick={handleAdd}
                      disabled={!tempSpecValue}
                    >
                      Ok
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      onClick={() => {
                        setActiveFieldKey(null)
                        setTempSpecValue("")
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
              {needsBaseValue && (
                <div className="flex gap-1 items-center">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{t("base_value_label")}</span>
                  <BaseValueInput
                    placeholder="Ej: 25"
                    className="h-8 text-xs w-20"
                    value={tempBaseValue}
                    onChange={setTempBaseValue}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  />
                  <Button size="sm" className="h-8 px-2" onClick={handleAdd} disabled={!tempSpecValue}>
                    Ok
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2"
                    onClick={() => {
                      setActiveFieldKey(null)
                      setTempSpecValue("")
                      setTempBaseValue("")
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              {needsBaseValue && (
                <p className="text-xs text-muted-foreground">{t("base_value_hint")}</p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderRequirement = (req: SkillRequirement, index: number) => {
    if (typeof req === "string") {
      const skill = character.skills.find((s) => s.name === req)
      return (
        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 border rounded mb-2">
          <div className="flex-1 font-medium text-sm">{tSkill(req)}</div>
          <PointsInput
            className="w-20 text-right h-9"
            value={skill?.occupationalPoints || 0}
            placeholder="0"
            onChange={(val) => updateSkillPoints(req, val)}
          />
        </div>
      )
    }

    if (req.type === "field") return <FieldSelector key={index} req={req} uniqueId={`field-${index}`} />

    if (req.type === "choice") {
      const selectedCount = req.options.filter((opt) => {
        if (typeof opt === "string") {
          const s = character.skills.find((sk) => sk.name === opt)
          return s && s.isOccupational 
        }
        return character.skills.some((s) => s.isOccupational && s.name.startsWith(`${opt.field}: `))
      }).length

      const label = loc(req, "label")

      return (
        <div
          key={index}
          className="mb-4 p-3 border rounded bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900"
        >
          <div className="flex justify-between mb-2">
            <Label className="font-bold text-blue-800 dark:text-blue-300">{label}</Label>
            <span className="text-xs font-bold">
              {selectedCount} / {req.count}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {req.options.map((opt, i) => {
              if (typeof opt === "string") {
                const skill = character.skills.find((s) => s.name === opt)
                const isSelected = !!(skill?.isOccupational)
                return (
                  <div key={i} className="flex items-center gap-2 p-2 rounded border bg-white dark:bg-slate-950">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(c) =>
                        c 
                        ? selectedCount < req.count && updateSkillPoints(opt, 0) 
                        : updateSkillPoints(opt, 0, undefined, true)
                      }
                      disabled={!isSelected && selectedCount >= req.count}
                    />
                    <span className="text-sm flex-1">{tSkill(opt)}</span>
                    {isSelected && (
                      <PointsInput
                        className="w-16 h-7 text-right"
                        value={skill?.occupationalPoints || 0}
                        onChange={(val) => updateSkillPoints(opt, val)}
                      />
                    )}
                  </div>
                )
              } else {
                return (
                  <div key={i} className="p-2 rounded border bg-white dark:bg-slate-950">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{loc(opt, "field") || tSkill(opt.field)}</Badge>
                      <span className="text-xs text-muted-foreground">{t("specialization")}</span>
                    </div>
                    <FieldSelector req={opt} uniqueId={`choice-${index}-${i}`} isInsideChoice={true} />
                  </div>
                )
              }
            })}
          </div>
        </div>
      )
    }

    if (req.type === "any") {
      // Recopilamos todas las habilidades que ya están siendo usadas en otras secciones
      // (fijas o como opción en un 'choice') para EXCLUIRLAS de 'any'
      const reservedSkills = new Set<string>()
      
      // Habilidades fijas (strings directos en skills[])
      currentOccupation?.skills.forEach((r) => {
        if (typeof r === "string") {
          reservedSkills.add(r)
        } else if (typeof r === "object" && r.type === "choice") {
          // Opciones dentro de un 'choice'
          r.options.forEach((opt) => {
            if (typeof opt === "string") {
              reservedSkills.add(opt)
            }
          })
        }
      })

      const added = character.skills.filter(
        (s) =>
          s.isOccupational &&
          !reservedSkills.has(s.name) && // Excluir si ya está reservada/usada por otra regla
          !FIELDS.some((f) => s.name.startsWith(`${f}: `)),
      )
      
      const label = loc(req, "label")
      const placeholderSpec = language === "en" ? "Enter specialization..." : "Escribe la especialidad..."

      // Skills available to pick (not already picked as occupational)
      const availableCommonSkills = COMMON_SKILLS.filter(
        (n) => !character.skills.some((s) => s.name === n && s.isOccupational)
      )

      return (
        <div key={index} className="mb-4 p-3 border rounded bg-amber-50/50 dark:bg-amber-900/10 border-amber-100">
          <div className="flex justify-between mb-2">
            <Label className="font-bold">{label}</Label>
            <span className="text-xs font-bold">
              {added.length} / {req.count}
            </span>
          </div>

          {FIELDS.map((f) => {
            const fieldSkills = character.skills.filter(
              (s) =>
                s.isOccupational &&
                s.name.startsWith(`${f}: `) &&
                !currentOccupation?.skills.some((r) => typeof r === "object" && r.type === "field" && r.field === f),
            )
            if (fieldSkills.length === 0) return null
            return (
              <div key={f} className="mb-2 p-2 border rounded bg-white/30">
                <Badge variant="outline" className="mb-1">
                  {tSkill(f)}
                </Badge>
                {fieldSkills.map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center gap-2 mb-1 bg-white dark:bg-slate-950 p-1 rounded border"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400"
                      onClick={() => updateSkillPoints(s.name, 0, undefined, true)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <span className="flex-1 text-sm">{tSkill(s.name)}</span>
                    <PointsInput
                      className="w-20 text-right h-8"
                      value={s.occupationalPoints}
                      onChange={(val) => updateSkillPoints(s.name, val)}
                    />
                  </div>
                ))}
              </div>
            )
          })}

          {added.map((s) => (
            <div key={s.name} className="flex items-center gap-2 mb-2 bg-white/50 dark:bg-black/20 p-1 rounded border">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-400"
                onClick={() => updateSkillPoints(s.name, 0, undefined, true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <span className="flex-1 text-sm">{tSkill(s.name)}</span>
              <PointsInput
                className="w-20 text-right h-8"
                value={s.occupationalPoints}
                onChange={(val) => updateSkillPoints(s.name, val)}
              />
            </div>
          ))}

          {added.length < req.count && (
            <div className="flex gap-2 mt-2">
              <SkillCombobox 
                fields={FIELDS}
                commonSkills={availableCommonSkills}
                t={t}
                tSkill={tSkill}
                placeholder={t("add_custom")}
                onSelect={(v) => {
                  if (FIELDS.includes(v)) {
                    setActiveFieldKey(`any-${v}`)
                  } else {
                    updateSkillPoints(v, 0)
                  }
                }}
              />
            </div>
          )}

          {activeFieldKey?.startsWith("any-") && (
            <div className="mt-2 flex gap-1 bg-white dark:bg-slate-950 p-2 rounded border border-amber-200">
              <Badge variant="outline" className="h-8">
                {tSkill(activeFieldKey.split("-")[1])}:
              </Badge>
              <TextInput
                autoFocus
                placeholder={placeholderSpec}
                className="h-8 text-xs flex-1"
                value={tempSpecValue}
                onChange={setTempSpecValue}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  tempSpecValue &&
                  (updateSkillPoints(`${activeFieldKey.split("-")[1]}: ${tempSpecValue}`, 0),
                  setTempSpecValue(""),
                  setActiveFieldKey(null))
                }
              />
              <Button
                size="sm"
                className="h-8"
                onClick={() => {
                  if (tempSpecValue) updateSkillPoints(`${activeFieldKey.split("-")[1]}: ${tempSpecValue}`, 0)
                  setTempSpecValue("")
                  setActiveFieldKey(null)
                }}
              >
                Ok
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setActiveFieldKey(null)
                  setTempSpecValue("")
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl">
            {currentOccupation ? loc(currentOccupation, "name") : (character.occupation === "Otra" ? t("custom_occupation") : character.occupation)}
          </DialogTitle>
          <div className="flex gap-2 text-sm mt-1">
            <Badge variant="outline">{t("credit_rating")}: {currentOccupation?.creditRating.join("-") || "0-99"}</Badge>
            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              {t("formula")}: {character.occupationFormula}
            </span>
          </div>
        </DialogHeader>
        <div className="px-6 py-2 bg-slate-50 dark:bg-slate-900 border-y">
          <div className="flex justify-between text-sm font-bold mb-1">
            <span>{t("occupation_points")}</span>
            <span className={remainingPoints < 0 ? "text-red-500" : "text-green-600"}>
              {remainingPoints} {t("available")}
            </span>
          </div>
          <Progress
            value={Math.min(100, (occupationalSpent / totalPoints) * 100)}
            className={`h-2 ${remainingPoints < 0 ? "[&>div]:bg-red-500" : ""}`}
          />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {isCustomOccupation && (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 space-y-4">
              <Label className="font-bold flex items-center gap-2">
                <Settings2 className="w-4 h-4" /> {t("configuration")}
              </Label>
              <div className="flex items-center gap-2">
                <Select value={customStat1} onValueChange={setCustomStat1}>
                  <SelectTrigger className="bg-white dark:bg-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {t(o.value.toLowerCase())} {language === "es" ? `(${o.value})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>x2 +</span>
                <Select value={customStat2} onValueChange={setCustomStat2}>
                  <SelectTrigger className="bg-white dark:bg-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {t(o.value.toLowerCase())} {language === "es" ? `(${o.value})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>x2</span>
              </div>
            </div>
          )}
          {(
            currentOccupation?.skills ||
            (isCustomOccupation ? [{ type: "any", count: 8, label: t("skills_choice") } as SkillRequirement] : [])
          ).map((req, i) => renderRequirement(req, i))}
        </div>
        <DialogFooter className="p-4 border-t bg-slate-50 dark:bg-slate-900">
          <Button onClick={onClose} className="w-full">
            {t("save_and_close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}