"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { Character, Skill } from "@/lib/character-types"
import { Plus, Search } from "lucide-react"

interface SkillsSectionProps {
  character: Character
  onChange: (character: Character) => void
}

export function SkillsSection({ character, onChange }: SkillsSectionProps) {
  const [search, setSearch] = useState("")

  const updateSkill = (index: number, updates: Partial<Skill>) => {
    const newSkills = [...character.skills]
    newSkills[index] = { ...newSkills[index], ...updates }
    onChange({ ...character, skills: newSkills })
  }

  const addCustomSkill = () => {
    const newSkill: Skill = {
      name: "Nueva habilidad",
      baseValue: 1,
      value: 1,
      isOccupational: false,
      isCustom: true,
      customName: "",
    }
    onChange({ ...character, skills: [...character.skills, newSkill] })
  }

  const filteredSkills = character.skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(search.toLowerCase()) ||
      (skill.customName && skill.customName.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar habilidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={addCustomSkill}>
          <Plus className="h-4 w-4 mr-1" />
          Añadir
        </Button>
      </div>

      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-[400px] overflow-y-auto pr-2">
        {filteredSkills.map((skill, index) => {
          const actualIndex = character.skills.findIndex((s) => s === skill)
          const half = Math.floor(skill.value / 2)
          const fifth = Math.floor(skill.value / 5)

          return (
            <div
              key={`${skill.name}-${actualIndex}`}
              className={`p-2 rounded border ${
                skill.isOccupational ? "bg-primary/10 border-primary/30" : "bg-card border-border"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Checkbox
                  checked={skill.isOccupational}
                  onCheckedChange={(checked) => updateSkill(actualIndex, { isOccupational: checked as boolean })}
                />
                <Label className="text-sm font-medium flex-1 truncate">
                  {skill.isCustom && skill.customName ? skill.customName : skill.name}
                  <span className="text-muted-foreground ml-1">({skill.baseValue}%)</span>
                </Label>
              </div>

              {skill.isCustom && (
                <Input
                  placeholder="Especificar..."
                  value={skill.customName || ""}
                  onChange={(e) => updateSkill(actualIndex, { customName: e.target.value })}
                  className="mb-1 h-7 text-xs"
                />
              )}

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={99}
                  value={skill.value}
                  onChange={(e) => updateSkill(actualIndex, { value: Number.parseInt(e.target.value) || 0 })}
                  className="w-16 h-7 text-center text-sm"
                />
                <span className="text-xs text-muted-foreground">
                  ½:{half} ⅕:{fifth}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
