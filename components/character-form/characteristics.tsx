"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Character, CharacteristicValue } from "@/lib/character-types"
import {
  createCharacteristicValue,
  calculateDamageBonus,
  calculateBuild,
  calculateMovement,
  calculateHitPoints,
} from "@/lib/character-utils"
import { useLanguage } from "@/components/language-provider"

interface CharacteristicsProps {
  character: Character
  onChange: (character: Character) => void
}

// Las claves deben coincidir con las del archivo de traducción en language-provider
const CHAR_KEYS = ["str", "dex", "pow", "con", "app", "edu", "siz", "int"] as const

export function Characteristics({ character, onChange }: CharacteristicsProps) {
  const { t } = useLanguage()

  const handleCharChange = (key: keyof typeof character.characteristics, value: number) => {
    if (key === "MOV") return

    const newChar = createCharacteristicValue(value)
    const newCharacteristics = {
      ...character.characteristics,
      [key]: newChar,
    }

    // Recalcular valores derivados
    const str = newCharacteristics.STR.value
    const dex = newCharacteristics.DEX.value
    const siz = newCharacteristics.SIZ.value
    const con = newCharacteristics.CON.value
    const pow = newCharacteristics.POW.value
    const edu = newCharacteristics.EDU.value

    const hp = calculateHitPoints(con, siz)
    const mov = calculateMovement(dex, str, siz, character.age)

    const updatedSkills = character.skills.map((skill) => {
      // Nota: Aquí se comparan nombres hardcodeados. Para una i18n completa,
      // se debería usar un ID de habilidad, pero esto funciona si el idioma no cambia 
      // mientras se edita, o se requiere lógica extra para mapear nombres antiguos.
      if (skill.name === "Esquivar" || skill.name === "Dodge") {
        return { ...skill, baseValue: Math.floor(dex / 2), value: Math.floor(dex / 2) }
      }
      if (skill.name === "Lengua propia" || skill.name === "Language (Own)") {
        return { ...skill, baseValue: edu, value: edu }
      }
      return skill
    })

    onChange({
      ...character,
      characteristics: {
        ...newCharacteristics,
        MOV: mov,
      },
      hitPoints: {
        ...character.hitPoints,
        max: hp,
        current: Math.min(character.hitPoints.current, hp),
      },
      sanity: {
        ...character.sanity,
        starting: pow,
        current: character.sanity.current === character.sanity.starting ? pow : character.sanity.current,
      },
      magicPoints: {
        ...character.magicPoints,
        max: Math.floor(pow / 5),
        current: Math.min(character.magicPoints.current, Math.floor(pow / 5)),
      },
      damageBonus: calculateDamageBonus(str, siz),
      build: calculateBuild(str, siz),
      dodge: Math.floor(dex / 2),
      skills: updatedSkills,
    })
  }

  const CharacteristicInput = ({
    charKey,
    labelKey,
  }: { charKey: keyof typeof character.characteristics; labelKey: string }) => {
    if (charKey === "MOV") return null
    const char = character.characteristics[charKey] as CharacteristicValue

    return (
      <div className="space-y-1">
        <Label className="text-xs font-bold text-center block">{t(labelKey)}</Label>
        <Input
          type="number"
          min={1}
          max={99}
          value={char.value}
          onChange={(e) => handleCharChange(charKey, Number.parseInt(e.target.value) || 1)}
          className="text-center font-bold"
        />
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>{t("half")}: {char.half}</span>
          <span>{t("fifth")}: {char.fifth}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {CHAR_KEYS.map((key) => (
          <CharacteristicInput
            key={key}
            charKey={key.toUpperCase() as keyof typeof character.characteristics}
            labelKey={key}
          />
        ))}
      </div>

      <div className="grid grid-cols-4 gap-3 pt-4 border-t">
        <div className="text-center">
          <Label className="text-xs">{t("mov")}</Label>
          <p className="font-bold text-lg">{character.characteristics.MOV}</p>
        </div>
        <div className="text-center">
          <Label className="text-xs">{t("db")}</Label>
          <p className="font-bold text-lg">{character.damageBonus}</p>
        </div>
        <div className="text-center">
          <Label className="text-xs">{t("build")}</Label>
          <p className="font-bold text-lg">{character.build}</p>
        </div>
        <div className="text-center">
          <Label className="text-xs">{t("dodge")}</Label>
          <p className="font-bold text-lg">{character.dodge}</p>
        </div>
      </div>
    </div>
  )
}