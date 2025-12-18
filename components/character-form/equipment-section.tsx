"use client"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Character } from "@/lib/character-types"

interface EquipmentSectionProps {
  character: Character
  onChange: (character: Character) => void
}

export function EquipmentSection({ character, onChange }: EquipmentSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="equipment">Equipo y Posesiones</Label>
          <Textarea
            id="equipment"
            value={character.equipment}
            onChange={(e) => onChange({ ...character, equipment: e.target.value })}
            className="min-h-[150px]"
            placeholder="Lista de objetos que lleva el personaje..."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="spendingLevel">Nivel de Gasto</Label>
          <Input
            id="spendingLevel"
            value={character.money.spendingLevel}
            onChange={(e) => onChange({ ...character, money: { ...character.money, spendingLevel: e.target.value } })}
            placeholder="Nivel de gasto semanal"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cash">Dinero</Label>
          <Input
            id="cash"
            value={character.money.cash}
            onChange={(e) => onChange({ ...character, money: { ...character.money, cash: e.target.value } })}
            placeholder="Dinero en efectivo"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assets">Bienes</Label>
          <Textarea
            id="assets"
            value={character.money.assets}
            onChange={(e) => onChange({ ...character, money: { ...character.money, assets: e.target.value } })}
            className="min-h-[80px]"
            placeholder="Propiedades, inversiones..."
          />
        </div>
      </div>

      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="fellowInvestigators">Compañeros Investigadores</Label>
        <Textarea
          id="fellowInvestigators"
          value={character.fellowInvestigators}
          onChange={(e) => onChange({ ...character, fellowInvestigators: e.target.value })}
          className="min-h-[100px]"
          placeholder="Otros investigadores del grupo..."
        />
      </div>

      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={character.notes}
          onChange={(e) => onChange({ ...character, notes: e.target.value })}
          className="min-h-[100px]"
          placeholder="Notas adicionales..."
        />
      </div>
    </div>
  )
}
