import type { Character, CharacterEra, CharacteristicValue, Weapon } from "./character-types"
import { getBaseSkillsForEra } from "./skills-data"
import { generateId } from "./character-storage"

export const createCharacteristicValue = (value: number): CharacteristicValue => ({
  value,
  half: Math.floor(value / 2),
  fifth: Math.floor(value / 5),
})

export const calculateDamageBonus = (str: number, siz: number): string => {
  const total = str + siz
  if (total <= 64) return "-2"
  if (total <= 84) return "-1"
  if (total <= 124) return "0"
  if (total <= 164) return "+1D4"
  if (total <= 204) return "+1D6"
  return "+2D6"
}

export const calculateBuild = (str: number, siz: number): number => {
  const total = str + siz
  if (total <= 64) return -2
  if (total <= 84) return -1
  if (total <= 124) return 0
  if (total <= 164) return 1
  if (total <= 204) return 2
  return 3
}

export const calculateMovement = (dex: number, str: number, siz: number, age: number): number => {
  let mov = 8
  if (dex < siz && str < siz) mov = 7
  else if (dex > siz && str > siz) mov = 9

  if (age >= 40) mov -= 1
  if (age >= 50) mov -= 1
  if (age >= 60) mov -= 1
  if (age >= 70) mov -= 1
  if (age >= 80) mov -= 1

  return Math.max(1, mov)
}

export const calculateHitPoints = (con: number, siz: number): number => {
  return Math.floor((con + siz) / 10)
}

export const calculateMagicPoints = (pow: number): number => {
  return Math.floor(pow / 5) * 3
}

export const createDefaultWeapon = (): Weapon => ({
  name: "",
  normal: 0,
  difficult: 0,
  extreme: 0,
  damage: "",
  range: "",
  attacks: 1,
  ammo: "",
  malfunction: "",
})

// MODIFICADO: Acepta unarmedName
export const createNewCharacter = (era: CharacterEra, unarmedName: string = "Desarmado"): Character => {
  const defaultPow = 50
  const defaultCon = 50
  const defaultSiz = 50
  const defaultEdu = 50
  const defaultDex = 50
  
  const skills = getBaseSkillsForEra(era)

  skills.forEach(skill => {
    if (skill.name === "Lengua propia" && skill.isFieldSlot) {
      skill.baseValue = defaultEdu
      skill.value = defaultEdu
    }
    else if (skill.name === "Esquivar") {
      const halfDex = Math.floor(defaultDex / 2)
      skill.baseValue = halfDex
      skill.value = halfDex
    }
  })

  const initialMagic = calculateMagicPoints(defaultPow)
  const initialHP = calculateHitPoints(defaultCon, defaultSiz)

  return {
    id: generateId(),
    era,
    createdAt: Date.now(),
    name: "",
    player: "",
    occupation: "",
    gender: "",
    age: 25,
    residence: "",
    birthplace: "",
    characteristics: {
      STR: createCharacteristicValue(50),
      DEX: createCharacteristicValue(defaultDex),
      POW: createCharacteristicValue(defaultPow),
      CON: createCharacteristicValue(defaultCon),
      APP: createCharacteristicValue(50),
      EDU: createCharacteristicValue(defaultEdu),
      SIZ: createCharacteristicValue(defaultSiz),
      INT: createCharacteristicValue(50),
      MOV: 8,
    },
    hitPoints: {
      current: initialHP,
      max: initialHP,
      majorWound: false,
      dying: false,
      unconscious: false,
    },
    sanity: {
      current: defaultPow,
      max: 99,
      starting: defaultPow,
      limit: defaultPow,
      temporaryInsanity: false,
      indefiniteInsanity: false,
    },
    magicPoints: {
      current: initialMagic,
      max: initialMagic,
    },
    luck: {
      current: 50,
      max: 99,
      limit: 0,
    },
    damageBonus: "0",
    build: 0,
    dodge: Math.floor(defaultDex / 2),
    skills,
    weapons: [
      {
        name: unarmedName, // USAR NOMBRE PASADO
        normal: 25,
        difficult: 12,
        extreme: 5,
        damage: "1D3+BD",
        range: "-",
        attacks: 1,
        ammo: "-",
        malfunction: "-",
      },
    ],
    armor: era === "darkAges" ? [] : undefined,
    background: {
      personalDescription: "",
      ideology: "",
      significantPeople: "",
      significantPlaces: "",
      preciousPossessions: "",
      traits: "",
      injuriesScars: "",
      phobiasManias: "",
      arcaneTomes: "",
      strangeEncounters: "",
    },
    equipment: "",
    money: {
      spendingLevel: "",
      cash: "",
      assets: "",
    },
    fellowInvestigators: "",
    notes: "",
  }
}