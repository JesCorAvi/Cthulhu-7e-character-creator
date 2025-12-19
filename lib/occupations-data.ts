// lib/occupations-data.ts

export type OccupationFormula = string

export type FieldRequirement = {
  type: "field"
  field: string
  options?: string[]
  count: number
  label?: string
  requiresBaseValue?: boolean // Para campos donde el jugador debe especificar el valor base
}

export type SkillRequirement =
  | string
  | { type: "choice"; options: (string | FieldRequirement)[]; count: number; label: string }
  | { type: "any"; count: number; label?: string }
  | FieldRequirement

export interface OccupationDefinition {
  name: string
  formula: OccupationFormula
  skills: SkillRequirement[]
  creditRating: [number, number]
  description?: string
}

export const OCCUPATION_FORMULAS: { label: string; value: OccupationFormula }[] = [
  { label: "EDU x 4", value: "EDU*4" },
  { label: "EDU x 2 + FUE x 2", value: "EDU*2 + STR*2" },
  { label: "EDU x 2 + DES x 2", value: "EDU*2 + DEX*2" },
  { label: "EDU x 2 + APA x 2", value: "EDU*2 + APP*2" },
  { label: "EDU x 2 + POD x 2", value: "EDU*2 + POW*2" },
]

const INTERPERSONAL_OPTIONS = ["Charlatanería", "Encanto", "Intimidar", "Persuasión"]

export const FIELD_SKILLS = {
  Ciencia: { hasFixedBase: true, defaultBase: 1 },
  "Arte/Artesanía": { hasFixedBase: true, defaultBase: 5 },
  "Armas de fuego": { hasFixedBase: false, defaultBase: 0 }, // Jugador especifica base
  Combatir: { hasFixedBase: false, defaultBase: 0 }, // Jugador especifica base
  Supervivencia: { hasFixedBase: true, defaultBase: 10 },
  Pilotar: { hasFixedBase: true, defaultBase: 1 },
  "Lengua propia": { hasFixedBase: true, defaultBase: 0, isSpecial: true },
  "Otras lenguas": { hasFixedBase: true, defaultBase: 1 },
} as const

export type FieldSkillName = keyof typeof FIELD_SKILLS

export const PRESET_OCCUPATIONS: OccupationDefinition[] = [
  {
    name: "Otra",
    formula: "EDU*2 + DEX*2",
    skills: [{ type: "any", count: 8, label: "Habilidades a elección" }],
    creditRating: [0, 99],
    description: "Personalizada. Elige características y habilidades libremente.",
  },
  {
    name: "Acróbata",
    formula: "EDU*2 + DEX*2",
    skills: ["Descubrir", "Esquivar", "Lanzar", "Nadar", "Saltar", "Trepar", { type: "any", count: 2 }],
    creditRating: [9, 20],
  },
  {
    name: "Actor",
    formula: "EDU*2 + APP*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía" },
      "Disfrazarse",
      "Escuchar",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Interpersonales" },
      { type: "any", count: 1 },
    ],
    creditRating: [9, 40],
  },
  {
    name: "Agente Federal",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego" },
      "Conducir automóvil",
      { type: "field", field: "Combatir", count: 1, requiresBaseValue: true, label: "Combatir" },
      "Derecho",
      "Descubrir",
      "Persuasión",
      "Sigilo",
      { type: "any", count: 1, label: "Especialidad personal" },
    ],
    creditRating: [20, 40],
  },
  {
    name: "Alienista",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Ciencia", count: 2, label: "Ciencia" },
      "Derecho",
      "Escuchar",
      "Medicina",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas" },
      "Psicoanálisis",
      "Psicología",
    ],
    creditRating: [10, 60],
  },
  {
    name: "Anticuario",
    formula: "EDU*4",
    skills: [
      "Tasación",
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía" },
      "Historia",
      "Buscar libros",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas" },
      "Descubrir",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" },
      { type: "any", count: 1 },
    ],
    creditRating: [30, 70],
  },
  {
    name: "Arqueólogo",
    formula: "EDU*4",
    skills: [
      "Arqueología",
      "Buscar libros",
      "Descubrir",
      "Historia",
      "Mecánica",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas" },
      "Tasación",
      {
        type: "choice",
        count: 1,
        label: "Ciencia u Orientarse",
        options: [{ type: "field", field: "Ciencia", count: 1 }, "Orientarse"],
      },
    ],
    creditRating: [10, 40],
  },
  {
    name: "Cirujano Forense",
    formula: "EDU*4",
    skills: [
      "Buscar libros",
      { type: "field", field: "Ciencia", count: 3, label: "Ciencia" },
      "Descubrir",
      "Medicina",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas" },
      "Persuasión",
    ],
    creditRating: [40, 60],
  },
  {
    name: "Detective Privado",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía" },
      "Buscar libros",
      "Derecho",
      "Descubrir",
      "Disfrazarse",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" },
      { type: "any", count: 1 },
    ],
    creditRating: [9, 30],
  },
  {
    name: "Médico",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Ciencia", count: 2, label: "Ciencia" },
      "Medicina",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas" },
      "Primeros auxilios",
      "Psicología",
      { type: "any", count: 2 },
    ],
    creditRating: [30, 80],
  },
  {
    name: "Oficial de Policía",
    formula: "EDU*2 + STR*2",
    skills: [
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego" },
      { type: "field", field: "Combatir", count: 1, requiresBaseValue: true, label: "Combatir" },
      "Derecho",
      "Descubrir",
      "Primeros auxilios",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" },
      { type: "choice", options: ["Conducir automóvil", "Equitación"], count: 1, label: "Conducir o Equitación" },
    ],
    creditRating: [9, 30],
  },
  {
    name: "Periodista",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía" },
      "Buscar libros",
      "Historia",
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia" },
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" },
      { type: "any", count: 2 },
    ],
    creditRating: [9, 30],
  },
  {
    name: "Soldado",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Armas de fuego", count: 2, requiresBaseValue: true, label: "Armas de fuego" },
      { type: "field", field: "Combatir", count: 1, requiresBaseValue: true, label: "Combatir" },
      "Esquivar",
      "Primeros auxilios",
      "Sigilo",
      { type: "field", field: "Supervivencia", count: 1, label: "Supervivencia" },
      { type: "any", count: 1 },
    ],
    creditRating: [9, 30],
  },
  {
    name: "Piloto",
    formula: "EDU*4",
    skills: [
      "Electricidad",
      "Mecánica",
      "Orientarse",
      { type: "field", field: "Pilotar", count: 2, label: "Pilotar" },
      { type: "field", field: "Ciencia", count: 1, label: "Ciencia" },
      { type: "any", count: 2 },
    ],
    creditRating: [20, 70],
  },
  {
    name: "Explorador",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego" },
      { type: "field", field: "Combatir", count: 1, requiresBaseValue: true, label: "Combatir" },
      "Orientarse",
      "Nadar",
      "Trepar",
      { type: "field", field: "Supervivencia", count: 1, label: "Supervivencia" },
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas" },
      { type: "any", count: 1 },
    ],
    creditRating: [20, 60],
  },
  {
    name: "Profesor",
    formula: "EDU*4",
    skills: [
      "Buscar libros",
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia" },
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas" },
      "Psicología",
      { type: "field", field: "Ciencia", count: 2, label: "Ciencia o especialidad" },
      { type: "any", count: 2 },
    ],
    creditRating: [20, 70],
  },
  {
    name: "Artista",
    formula: "EDU*2 + POW*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 2, label: "Arte/Artesanía" },
      "Historia",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas" },
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" },
      { type: "any", count: 2 },
    ],
    creditRating: [9, 50],
  },
]
