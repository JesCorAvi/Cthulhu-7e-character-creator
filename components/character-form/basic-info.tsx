"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Character } from "@/lib/character-types"
import { PRESET_OCCUPATIONS } from "@/lib/occupations-data" // Asegúrate de tener este archivo creado

interface BasicInfoProps {
  character: Character
  // Actualizamos esto para permitir actualizaciones múltiples
  onChange: (updates: Partial<Character>) => void
}

export function BasicInfo({ character, onChange }: BasicInfoProps) {
  
  // Manejador simple para inputs de texto (wrappeado para adaptarse al nuevo onChange)
  const handleChange = (field: keyof Character, value: string | number) => {
    onChange({ [field]: value } as Partial<Character>)
  }

  // Lógica inteligente para cuando se selecciona una profesión
  const handleOccupationChange = (value: string) => {
    if (value === "custom") {
      onChange({
        occupation: "Personalizada",
        occupationLabel: "Nueva Profesión",
        occupationFormula: "EDU*4",
        occupationalSkills: [] // Limpiamos para que el usuario elija manual
      })
    } else {
      const preset = PRESET_OCCUPATIONS.find((p) => p.name === value)
      if (preset) {
        onChange({
          occupation: preset.name,
          occupationLabel: preset.name,
          occupationFormula: preset.formula,
          occupationalSkills: preset.skills,
          // Opcional: Podrías asignar el rango de Crédito aquí si tuvieras ese campo
        })
      }
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Personaje</Label>
        <Input
          id="name"
          value={character.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Nombre del investigador"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="player">Jugador</Label>
        <Input
          id="player"
          value={character.player}
          onChange={(e) => handleChange("player", e.target.value)}
          placeholder="Tu nombre"
        />
      </div>

      {/* --- SECCIÓN DE OCUPACIÓN ACTUALIZADA --- */}
      <div className="space-y-2">
        <Label htmlFor="occupation">Ocupación</Label>
        <Select 
          value={PRESET_OCCUPATIONS.some(p => p.name === character.occupation) ? character.occupation : "custom"} 
          onValueChange={handleOccupationChange}
        >
          <SelectTrigger id="occupation">
            <SelectValue placeholder="Selecciona una profesión" />
          </SelectTrigger>
          <SelectContent>
            {PRESET_OCCUPATIONS.map((occ) => (
              <SelectItem key={occ.name} value={occ.name}>
                {occ.name}
              </SelectItem>
            ))}
            <SelectItem value="custom" className="font-semibold text-primary">
              Personalizada / Otra...
            </SelectItem>
          </SelectContent>
        </Select>
        
        {/* Si es personalizada, permitimos escribir el nombre manualmente */}
        {(!PRESET_OCCUPATIONS.some(p => p.name === character.occupation) || character.occupation === "Personalizada") && (
           <Input 
             className="mt-2"
             placeholder="Escribe el nombre de la profesión..."
             value={character.occupation === "Personalizada" ? "" : character.occupation}
             onChange={(e) => handleChange("occupation", e.target.value)}
           />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Género</Label>
        <Input
          id="gender"
          value={character.gender}
          onChange={(e) => handleChange("gender", e.target.value)}
          placeholder="Género"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="age">Edad</Label>
        <Input
          id="age"
          type="number"
          min={15}
          max={90}
          value={character.age}
          onChange={(e) => handleChange("age", Number.parseInt(e.target.value) || 25)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="residence">Lugar de Residencia</Label>
        <Input
          id="residence"
          value={character.residence}
          onChange={(e) => handleChange("residence", e.target.value)}
          placeholder="Ciudad, país"
        />
      </div>
      
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="birthplace">Lugar de Nacimiento</Label>
        <Input
          id="birthplace"
          value={character.birthplace}
          onChange={(e) => handleChange("birthplace", e.target.value)}
          placeholder="Ciudad, país"
        />
      </div>
    </div>
  )
}