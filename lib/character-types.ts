export type CharacterEra = "1920s" | "modern" | "darkAges"

export interface CharacteristicValue {
  value: number
  half: number
  fifth: number
}

export interface Skill {
  name: string
  baseValue: number
  value: number
  isOccupational: boolean
  isCustom?: boolean
  customName?: string
  isFieldHeader?: boolean // Cabecera de campo (no editable)
  isFieldSlot?: boolean // Slot vacío bajo cabecera de campo
  isSpecialCalc?: boolean // Habilidades calculadas (Esquivar, Lengua propia)
}

export interface Weapon {
  name: string
  normal: number
  difficult: number
  extreme: number
  damage: string
  range: string
  attacks: number
  ammo: string
  malfunction: string
}

export interface Armor {
  type: string
  value: number
}

export interface Character {
  id: string
  era: CharacterEra
  createdAt: number

  // Información básica
  name: string
  player: string
  occupation: string
  gender: string
  age: number
  residence: string
  birthplace: string

  // Características
  characteristics: {
    STR: CharacteristicValue // FUE
    DEX: CharacteristicValue // DES
    POW: CharacteristicValue // POD
    CON: CharacteristicValue // CON
    APP: CharacteristicValue // APA
    EDU: CharacteristicValue // EDU
    SIZ: CharacteristicValue // TAM
    INT: CharacteristicValue // INT
    MOV: number // Movimiento
  }

  // Atributos derivados
  hitPoints: {
    current: number
    max: number
    majorWound: boolean
    dying: boolean
    unconscious: boolean
  }

  sanity: {
    current: number
    max: number
    starting: number
    limit?: number
    temporaryInsanity: boolean
    indefiniteInsanity: boolean
  }

  magicPoints: {
    current: number
    max: number
  }

  luck: {
    current: number
    max: number
    limit?: number
  }

  // Combate
  damageBonus: string
  build: number
  dodge: number

  // Habilidades
  skills: Skill[]

  // Armas
  weapons: Weapon[]

  // Armadura (solo Dark Ages)
  armor?: Armor[]

  // Trasfondo
  background: {
    personalDescription: string
    ideology: string
    significantPeople: string
    significantPlaces: string
    preciousPossessions: string
    traits: string
    injuriesScars: string
    phobiasManias: string
    arcaneTomes: string
    strangeEncounters: string
  }

  // Equipo y dinero
  equipment: string
  money: {
    spendingLevel: string
    cash: string
    assets: string
  }

  // Compañeros
  fellowInvestigators: string

  // Notas
  notes: string
}

export const ERA_LABELS: Record<CharacterEra, string> = {
  "1920s": "Años 20",
  modern: "Actualidad",
  darkAges: "Edad Oscura",
}

export const ERA_COLORS: Record<CharacterEra, string> = {
  "1920s": "from-amber-900 to-amber-700",
  modern: "from-slate-800 to-slate-600",
  darkAges: "from-stone-900 to-stone-700",
}
