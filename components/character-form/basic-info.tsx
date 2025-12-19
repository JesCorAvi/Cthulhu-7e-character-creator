"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Character } from "@/lib/character-types"
import { PRESET_OCCUPATIONS } from "@/lib/occupations-data"
// Asegúrate de que este archivo existe en la misma carpeta:
import { OccupationDetailsModal } from "./occupation-details-modal"

interface BasicInfoProps {
  character: Character
  onChange: (updates: Partial<Character>) => void
}

export function BasicInfo({ character, onChange }: BasicInfoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleChange = (field: keyof Character, value: string | number) => {
    onChange({ [field]: value } as Partial<Character>)
  }

  const handleOccupationChange = (value: string) => {
    if (value === "custom") {
      onChange({
        occupation: "Personalizada",
        occupationLabel: "Nueva Profesión",
        occupationFormula: "EDU*4",
        occupationalSkills: []
      })
    } else {
      const preset = PRESET_OCCUPATIONS.find((p) => p.name === value)
      if (preset) {
        onChange({
          occupation: preset.name,
          occupationLabel: preset.name,
          occupationFormula: preset.formula,
          occupationalSkills: preset.skills,
        })
      }
    }
  }

  const isPresetOccupation = PRESET_OCCUPATIONS.some(p => p.name === character.occupation);
  // El botón estará activo si hay una ocupación seleccionada y NO es "Personalizada"
  const showButton = character.occupation && character.occupation !== "Personalizada";

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Personaje</Label>
          <Input
            id="name"
            value={character.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Nombre del investigador"
          />
        </div>
        
        {/* Jugador */}
        <div className="space-y-2">
          <Label htmlFor="player">Jugador</Label>
          <Input
            id="player"
            value={character.player}
            onChange={(e) => handleChange("player", e.target.value)}
            placeholder="Tu nombre"
          />
        </div>

        {/* --- SECCIÓN DE OCUPACIÓN (Layout Modificado) --- */}
        <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
          <Label htmlFor="occupation" className="font-bold text-primary">Ocupación</Label>
          
          <Select 
            value={
              isPresetOccupation
                ? character.occupation 
                : (character.occupation ? "custom" : "") 
            } 
            onValueChange={handleOccupationChange}
          >
            <SelectTrigger id="occupation" className="w-full bg-background">
              <SelectValue placeholder="Selecciona una profesión..." />
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

          {/* BOTÓN SEPARADO PARA VISIBILIDAD */}
          {showButton && (
            <div className="pt-2">
                <Button 
                  type="button" 
                  variant="default" // Azul sólido para que destaque
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    console.log("Abriendo modal...");
                    setIsModalOpen(true);
                  }}
                >
                  <Settings2 className="mr-2 h-4 w-4" />
                  Gestionar Habilidades de {character.occupation}
                </Button>
            </div>
          )}
          
          {/* Input para personalizada */}
          {character.occupation !== "" && 
           (!isPresetOccupation || character.occupation === "Personalizada") && (
             <Input 
               className="mt-2"
               placeholder="Escribe el nombre de la profesión..."
               value={character.occupation === "Personalizada" ? "" : character.occupation}
               onChange={(e) => handleChange("occupation", e.target.value)}
             />
          )}
        </div>

        {/* Resto de campos... */}
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

      {/* MODAL */}
      <OccupationDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        character={character}
        onChange={onChange}
      />
    </>
  )
}