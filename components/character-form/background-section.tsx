"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Character } from "@/lib/character-types"

interface BackgroundSectionProps {
  character: Character
  onChange: (character: Character) => void
}

const backgroundFields = [
  { key: "personalDescription", label: "Descripción Personal" },
  { key: "ideology", label: "Ideología/Creencias" },
  { key: "significantPeople", label: "Allegados" },
  { key: "significantPlaces", label: "Lugares Significativos" },
  { key: "preciousPossessions", label: "Posesiones Preciadas" },
  { key: "traits", label: "Rasgos" },
  { key: "injuriesScars", label: "Lesiones y Cicatrices" },
  { key: "phobiasManias", label: "Fobias y Manías" },
  { key: "arcaneTomes", label: "Tomos Arcanos, Hechizos y Artefactos" },
  { key: "strangeEncounters", label: "Encuentros con Entidades Extrañas" },
] as const

export function BackgroundSection({ character, onChange }: BackgroundSectionProps) {
  const updateBackground = (key: keyof typeof character.background, value: string) => {
    onChange({
      ...character,
      background: { ...character.background, [key]: value },
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {backgroundFields.map(({ key, label }) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{label}</Label>
          <Textarea
            id={key}
            value={character.background[key]}
            onChange={(e) => updateBackground(key, e.target.value)}
            className="min-h-[80px] resize-none"
            placeholder={`${label}...`}
          />
        </div>
      ))}
    </div>
  )
}
