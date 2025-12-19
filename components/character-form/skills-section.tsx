"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings2, Search, Briefcase, User } from "lucide-react"

import type { Character } from "@/lib/character-types"
import { PRESET_OCCUPATIONS, type OccupationFormula } from "@/lib/occupations-data"
import { calculateOccupationalPoints, calculatePersonalInterestPoints } from "@/lib/occupation-utils"
import { OccupationDetailsModal } from "./occupation-details-modal"

interface SkillsSectionProps {
  character: Character
  onChange: (character: Character) => void
}

export function SkillsSection({ character, onChange }: SkillsSectionProps) {
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Detectamos si es profesión personalizada
  const isCustomMode = character.occupation === "Otra"

  // 1. Cálculos de Puntos Totales
  const personalTotal = useMemo(() => calculatePersonalInterestPoints(character), [character])

  const occupationTotal = useMemo(() => {
    const formula = (character.occupationFormula as OccupationFormula) || "EDU*4"
    let effectiveStat: "STR" | "DEX" | "APP" | "POW" | undefined = undefined

    if (formula.includes("STR") && formula.includes("DEX")) {
      effectiveStat = character.characteristics.STR.value > character.characteristics.DEX.value ? "STR" : "DEX"
    }

    return calculateOccupationalPoints(character, formula, effectiveStat)
  }, [character])

  // 2. Cálculo de Puntos Gastados
  const { occSpent, perSpent } = useMemo(() => {
    let o = 0
    let p = 0
    character.skills.forEach((s) => {
      o += s.occupationalPoints || 0
      p += s.personalPoints || 0
    })
    return { occSpent: o, perSpent: p }
  }, [character.skills])

  // Manejo de cambio de profesión
  const handleOccupationChange = (value: string) => {
    if (value === "custom") {
      // ... (mantener tu lógica de reset para custom)
      const resetSkills = character.skills.map((s) => ({
        ...s,
        isOccupational: false,
        occupationalPoints: 0,
      }))

      onChange({
        ...character,
        occupation: "Otra",
        occupationLabel: "Nueva Profesión",
        occupationFormula: "EDU*4",
        skills: resetSkills,
      })
      setIsModalOpen(true)
    } else {
      const preset = PRESET_OCCUPATIONS.find((p) => p.name === value)
      if (preset) {
        // 1. Resetear todas las habilidades
        const resetSkills = character.skills.map((s) => ({
          ...s,
          isOccupational: false,
          occupationalPoints: 0,
        }))

        // 2. Extraer requerimientos
        const fixedSkillNames = preset.skills.filter((s) => typeof s === "string") as string[]

        const choiceCategories = preset.skills
          .filter((s) => typeof s !== "string" && s.type === "choice")
          .flatMap((s) => (s as any).options as string[])

        // 3. Mapeo profundo de habilidades
        const newSkills = resetSkills.map((s) => {
          // A. Coincidencia exacta (ej: "Psicología")
          if (fixedSkillNames.includes(s.name)) {
            return { ...s, isOccupational: true }
          }

          // B. Coincidencia por categoría o sub-habilidad (ej: "Ciencia: Biología" o el slot de "Ciencia")
          // Buscamos si el nombre de la habilidad contiene alguna de las opciones (Ciencia, Arte, etc.)
          const isChoice = choiceCategories.some((cat) => s.name === cat || s.name.startsWith(`${cat}:`))

          if (isChoice) {
            return { ...s, isOccupational: true }
          }

          // C. IMPORTANTE: Si la profesión pide una categoría (ej: "Ciencia"),
          // debemos marcar también los "Field Slots" (campos vacíos) para que puedas escribir en ellos.
          const isFieldSlotForChoice = choiceCategories.some((cat) => s.isFieldSlot && s.name === cat)

          if (isFieldSlotForChoice) {
            return { ...s, isOccupational: true }
          }

          return s
        })

        onChange({
          ...character,
          occupation: preset.name,
          occupationFormula: preset.formula,
          skills: newSkills,
        })

        // Abrir modal si hay elecciones para que el usuario defina la especialidad
        if (preset.skills.some((s) => typeof s !== "string")) {
          setIsModalOpen(true)
        }
      }
    }
  }
  const handlePointAssignment = (skillName: string, newValue: number, type: "occupation" | "personal") => {
    const skillIndex = character.skills.findIndex((s) => s.name === skillName)
    if (skillIndex === -1) return

    const skill = character.skills[skillIndex]
    const base = skill.baseValue
    const currentOcc = skill.occupationalPoints || 0
    const currentPers = skill.personalPoints || 0

    const diff = newValue - skill.value

    if (newValue < base) return

    const newSkills = [...character.skills]

    if (type === "occupation") {
      if (diff > 0 && occSpent + diff > occupationTotal) return
      newSkills[skillIndex] = {
        ...skill,
        occupationalPoints: Math.max(0, currentOcc + diff),
        value: newValue,
        isOccupational: true,
      }
    } else {
      if (diff > 0 && perSpent + diff > personalTotal) return
      newSkills[skillIndex] = {
        ...skill,
        personalPoints: Math.max(0, currentPers + diff),
        value: newValue,
      }
    }
    onChange({ ...character, skills: newSkills })
  }

  const filteredSkills = character.skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(search.toLowerCase()) ||
      (skill.customName && skill.customName.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <OccupationDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        character={character}
        onChange={(updates) => onChange({ ...character, ...updates })}
      />

      <Card className="bg-slate-50 dark:bg-slate-900 border-dashed border-slate-200 dark:border-slate-800">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label>Profesión</Label>
              <div className="flex gap-2">
                <Select value={isCustomMode ? "custom" : character.occupation} onValueChange={handleOccupationChange}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecciona una profesión" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_OCCUPATIONS.filter((o) => o.name !== "Otra").map((occ) => (
                      <SelectItem key={occ.name} value={occ.name}>
                        {occ.name}
                      </SelectItem>
                    ))}
                    <SelectItem
                      value="custom"
                      className="font-semibold text-amber-600 dark:text-amber-500 border-t dark:border-slate-800 mt-1"
                    >
                      🛠️ Personalizada / Otra
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant={isCustomMode ? "default" : "outline"}
                  onClick={() => setIsModalOpen(true)}
                  className="shrink-0 gap-2"
                >
                  <Settings2 className="w-4 h-4" />
                  {isCustomMode ? "Configurar" : "Elegir Habilidades"}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white dark:bg-black/40 p-2 rounded border dark:border-slate-800">
            <InfoIcon className="w-3 h-3" />
            <span>
              Fórmula: <b>{character.occupationFormula}</b>
            </span>
            {isCustomMode && (
              <span className="ml-auto text-amber-600 dark:text-amber-500 font-bold">Modo Personalizado</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                  <Briefcase className="w-4 h-4" /> Ocupación ({occupationTotal})
                </span>
                <span className={occSpent > occupationTotal ? "text-red-500 dark:text-red-400 font-bold" : ""}>
                  {occSpent} gastados
                </span>
              </div>
              <Progress
                value={Math.min(100, (occSpent / occupationTotal) * 100)}
                className={`h-2 bg-amber-100 dark:bg-amber-950 ${occSpent > occupationTotal ? "[&>div]:bg-red-500" : "[&>div]:bg-amber-600"}`}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400">
                  <User className="w-4 h-4" /> Interés Personal ({personalTotal})
                </span>
                <span className={perSpent > personalTotal ? "text-red-500 dark:text-red-400 font-bold" : ""}>
                  {perSpent} gastados
                </span>
              </div>
              <Progress
                value={Math.min(100, (perSpent / personalTotal) * 100)}
                className={`h-2 bg-blue-100 dark:bg-blue-950 ${perSpent > personalTotal ? "[&>div]:bg-red-500" : "[&>div]:bg-blue-600"}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar habilidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="outline" className="hidden md:flex h-9 px-3">
          Total Habilidades: {character.skills.length}
        </Badge>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-h-[600px] overflow-y-auto pr-2 pb-20">
        {filteredSkills.map((skill) => {
          const isOccupational = skill.isOccupational

          const getDisplayName = () => {
            // If it's a field slot with a customName, show "Field: CustomName"
            if (skill.isFieldSlot && skill.customName) {
              return `${skill.name}: ${skill.customName}`
            }
            // Otherwise use customName if available, or fall back to name
            return skill.customName || skill.name
          }

          const skillKey = skill.isFieldSlot && skill.customName ? `${skill.name}: ${skill.customName}` : skill.name

          return (
            <div
              key={skillKey}
              className={`p-3 rounded-lg border transition-all ${
                isOccupational
                  ? "bg-amber-50/50 border-amber-200 shadow-sm dark:bg-amber-950/20 dark:border-amber-900/50"
                  : "bg-card border-border opacity-90 hover:opacity-100 dark:bg-slate-900/50"
              }`}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-1">
                    {isOccupational && <Briefcase className="w-3 h-3 text-amber-600 dark:text-amber-500 shrink-0" />}
                    <Label
                      className={`truncate font-bold text-sm ${isOccupational ? "text-amber-900 dark:text-amber-400" : ""}`}
                      title={getDisplayName()}
                    >
                      {getDisplayName()}
                    </Label>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Base: {skill.baseValue}%</span>
                </div>

                <div
                  className={`text-xl font-black w-12 text-center rounded ${skill.value >= 70 ? "text-green-600 dark:text-green-500" : ""}`}
                >
                  {skill.value}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="relative">
                  <Input
                    type="number"
                    disabled={!isOccupational}
                    value={skill.occupationalPoints || ""}
                    placeholder={isOccupational ? "0" : "-"}
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value) || 0
                      const newVal = skill.baseValue + (skill.personalPoints || 0) + val
                      handlePointAssignment(skill.name, newVal, "occupation")
                    }}
                    onFocus={(e) => e.target.select()}
                    className={`h-8 text-xs pr-1 text-right font-mono ${
                      !isOccupational
                        ? "opacity-20 bg-transparent border-transparent shadow-none pointer-events-none"
                        : "border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900 focus-visible:ring-amber-500 text-amber-900 dark:text-amber-200 font-bold"
                    }`}
                  />
                  {isOccupational && (
                    <span className="absolute left-1.5 top-2 text-[9px] text-amber-600/50 dark:text-amber-500/50 pointer-events-none font-bold uppercase">
                      Ocu
                    </span>
                  )}
                </div>

                <div className="relative">
                  <Input
                    type="number"
                    value={skill.personalPoints || ""}
                    placeholder="0"
                    onChange={(e) => {
                      const val = Number.parseInt(e.target.value) || 0
                      const newVal = skill.baseValue + (skill.occupationalPoints || 0) + val
                      handlePointAssignment(skill.name, newVal, "personal")
                    }}
                    onFocus={(e) => e.target.select()}
                    className="h-8 text-xs pr-1 text-right font-mono border-blue-100 dark:border-blue-900 focus-visible:ring-blue-500 bg-blue-50/20 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200"
                  />
                  <span className="absolute left-1.5 top-2 text-[9px] text-blue-400 dark:text-blue-500/70 pointer-events-none font-bold uppercase">
                    Per
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}
