"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Character } from "@/lib/character-types"

interface BasicInfoProps {
  character: Character
  onChange: (field: keyof Character, value: string | number) => void
}

export function BasicInfo({ character, onChange }: BasicInfoProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Personaje</Label>
        <Input
          id="name"
          value={character.name}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Nombre del investigador"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="player">Jugador</Label>
        <Input
          id="player"
          value={character.player}
          onChange={(e) => onChange("player", e.target.value)}
          placeholder="Tu nombre"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="occupation">Ocupación</Label>
        <Input
          id="occupation"
          value={character.occupation}
          onChange={(e) => onChange("occupation", e.target.value)}
          placeholder="Profesión del personaje"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Género</Label>
        <Input
          id="gender"
          value={character.gender}
          onChange={(e) => onChange("gender", e.target.value)}
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
          onChange={(e) => onChange("age", Number.parseInt(e.target.value) || 25)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="residence">Lugar de Residencia</Label>
        <Input
          id="residence"
          value={character.residence}
          onChange={(e) => onChange("residence", e.target.value)}
          placeholder="Ciudad, país"
        />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="birthplace">Lugar de Nacimiento</Label>
        <Input
          id="birthplace"
          value={character.birthplace}
          onChange={(e) => onChange("birthplace", e.target.value)}
          placeholder="Ciudad, país"
        />
      </div>
    </div>
  )
}
