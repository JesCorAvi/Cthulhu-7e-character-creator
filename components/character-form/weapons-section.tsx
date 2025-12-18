"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Character, Weapon } from "@/lib/character-types"
import { createDefaultWeapon } from "@/lib/character-utils"
import { Plus, Trash2 } from "lucide-react"

interface WeaponsSectionProps {
  character: Character
  onChange: (character: Character) => void
}

export function WeaponsSection({ character, onChange }: WeaponsSectionProps) {
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

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Arma</th>
              <th className="text-center p-2">Normal</th>
              <th className="text-center p-2">Difícil</th>
              <th className="text-center p-2">Extremo</th>
              <th className="text-center p-2">Daño</th>
              <th className="text-center p-2">Alcance</th>
              <th className="text-center p-2">Ataques</th>
              <th className="text-center p-2">Munición</th>
              <th className="text-center p-2">Avería</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {character.weapons.map((weapon, index) => (
              <tr key={index} className="border-b">
                <td className="p-1">
                  <Input
                    value={weapon.name}
                    onChange={(e) => updateWeapon(index, { name: e.target.value })}
                    className="h-8"
                    placeholder="Nombre"
                  />
                </td>
                <td className="p-1">
                  <Input
                    type="number"
                    value={weapon.normal}
                    onChange={(e) => updateWeapon(index, { normal: Number.parseInt(e.target.value) || 0 })}
                    className="h-8 w-16 text-center"
                  />
                </td>
                <td className="p-1">
                  <Input
                    type="number"
                    value={weapon.difficult}
                    onChange={(e) => updateWeapon(index, { difficult: Number.parseInt(e.target.value) || 0 })}
                    className="h-8 w-16 text-center"
                  />
                </td>
                <td className="p-1">
                  <Input
                    type="number"
                    value={weapon.extreme}
                    onChange={(e) => updateWeapon(index, { extreme: Number.parseInt(e.target.value) || 0 })}
                    className="h-8 w-16 text-center"
                  />
                </td>
                <td className="p-1">
                  <Input
                    value={weapon.damage}
                    onChange={(e) => updateWeapon(index, { damage: e.target.value })}
                    className="h-8 w-20"
                    placeholder="1D6"
                  />
                </td>
                <td className="p-1">
                  <Input
                    value={weapon.range}
                    onChange={(e) => updateWeapon(index, { range: e.target.value })}
                    className="h-8 w-16"
                    placeholder="10m"
                  />
                </td>
                <td className="p-1">
                  <Input
                    type="number"
                    value={weapon.attacks}
                    onChange={(e) => updateWeapon(index, { attacks: Number.parseInt(e.target.value) || 1 })}
                    className="h-8 w-12 text-center"
                  />
                </td>
                <td className="p-1">
                  <Input
                    value={weapon.ammo}
                    onChange={(e) => updateWeapon(index, { ammo: e.target.value })}
                    className="h-8 w-16"
                    placeholder="6"
                  />
                </td>
                <td className="p-1">
                  <Input
                    value={weapon.malfunction}
                    onChange={(e) => updateWeapon(index, { malfunction: e.target.value })}
                    className="h-8 w-16"
                    placeholder="100"
                  />
                </td>
                <td className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWeapon(index)}
                    disabled={character.weapons.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="outline" onClick={addWeapon}>
        <Plus className="h-4 w-4 mr-1" />
        Añadir Arma
      </Button>
    </div>
  )
}
