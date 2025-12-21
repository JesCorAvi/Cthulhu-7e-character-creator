// lib/occupations-data.ts

export type OccupationFormula = string

export type FieldRequirement = {
  type: "field"
  field: string
  options?: string[]
  count: number
  label?: string
  labelEn?: string // Traducción
  requiresBaseValue?: boolean
}

export type SkillRequirement =
  | string
  | { type: "choice"; options: (string | FieldRequirement)[]; count: number; label: string; labelEn: string }
  | { type: "any"; count: number; label?: string; labelEn?: string }
  | FieldRequirement

export interface OccupationDefinition {
  name: string
  nameEn: string // Traducción
  formula: OccupationFormula
  skills: SkillRequirement[]
  creditRating: [number, number]
  description?: string
  descriptionEn?: string // Traducción
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
  "Armas de fuego": { hasFixedBase: false, defaultBase: 0 },
  Combatir: { hasFixedBase: false, defaultBase: 0 },
  Supervivencia: { hasFixedBase: true, defaultBase: 10 },
  Pilotar: { hasFixedBase: true, defaultBase: 1 },
  "Lengua propia": { hasFixedBase: true, defaultBase: 0, isSpecial: true },
  "Otras lenguas": { hasFixedBase: true, defaultBase: 1 },
} as const

export type FieldSkillName = keyof typeof FIELD_SKILLS

export const PRESET_OCCUPATIONS: OccupationDefinition[] = [
  {
    name: "Otra",
    nameEn: "Custom",
    formula: "EDU*2 + DEX*2",
    skills: [{ type: "any", count: 8, label: "Habilidades a elección", labelEn: "Skills of your choice" }],
    creditRating: [0, 99],
    description: "Personalizada. Elige características y habilidades libremente.",
    descriptionEn: "Custom. Choose characteristics and skills freely.",
  },
  {
    name: "Acróbata",
    nameEn: "Acrobat",
    formula: "EDU*2 + DEX*2",
    skills: ["Descubrir", "Esquivar", "Lanzar", "Nadar", "Saltar", "Trepar", { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }],
    creditRating: [9, 20],
  },
  {
    name: "Actor",
    nameEn: "Actor",
    formula: "EDU*2 + APP*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía", labelEn: "Art/Craft" },
      "Disfrazarse",
      "Escuchar",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Interpersonales", labelEn: "Interpersonal" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" },
    ],
    creditRating: [9, 40],
  },
  {
    name: "Agente Federal",
    nameEn: "Federal Agent",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      "Conducir automóvil",
      { type: "field", field: "Combatir", count: 1, requiresBaseValue: true, label: "Combatir", labelEn: "Fighting" },
      "Derecho",
      "Descubrir",
      "Persuasión",
      "Sigilo",
      { type: "any", count: 1, label: "Especialidad personal", labelEn: "Personal specialty" },
    ],
    creditRating: [20, 40],
  },
  {
    name: "Alienista",
    nameEn: "Alienist",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Ciencia", count: 2, label: "Ciencia", labelEn: "Science" },
      "Derecho",
      "Escuchar",
      "Medicina",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Psicoanálisis",
      "Psicología",
    ],
    creditRating: [10, 60],
  },
  {
    name: "Anticuario",
    nameEn: "Antiquarian",
    formula: "EDU*4",
    skills: [
      "Tasación",
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía", labelEn: "Art/Craft" },
      "Historia",
      "Buscar libros",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Descubrir",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" },
    ],
    creditRating: [30, 70],
  },
  {
    name: "Arqueólogo",
    nameEn: "Archaeologist",
    formula: "EDU*4",
    skills: [
      "Arqueología",
      "Buscar libros",
      "Descubrir",
      "Historia",
      "Mecánica",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Tasación",
      {
        type: "choice",
        count: 1,
        label: "Ciencia u Orientarse",
        labelEn: "Science or Navigate",
        options: [{ type: "field", field: "Ciencia", count: 1, labelEn: "Science" }, "Orientarse"],
      },
    ],
    creditRating: [10, 40],
  },
  {
    name: "Cirujano Forense",
    nameEn: "Forensic Surgeon",
    formula: "EDU*4",
    skills: [
      "Buscar libros",
      { type: "field", field: "Ciencia", count: 3, label: "Ciencia", labelEn: "Science" },
      "Descubrir",
      "Medicina",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Persuasión",
    ],
    creditRating: [40, 60],
  },
  {
    name: "Detective Privado",
    nameEn: "Private Investigator",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía", labelEn: "Art/Craft" },
      "Buscar libros",
      "Derecho",
      "Descubrir",
      "Disfrazarse",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" },
    ],
    creditRating: [9, 30],
  },
  {
    name: "Médico",
    nameEn: "Doctor of Medicine",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Ciencia", count: 2, label: "Ciencia", labelEn: "Science" },
      "Medicina",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Primeros auxilios",
      "Psicología",
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" },
    ],
    creditRating: [30, 80],
  },
  {
    name: "Oficial de Policía",
    nameEn: "Police Officer",
    formula: "EDU*2 + STR*2",
    skills: [
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      { type: "field", field: "Combatir", count: 1, requiresBaseValue: true, label: "Combatir", labelEn: "Fighting" },
      "Derecho",
      "Descubrir",
      "Primeros auxilios",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "choice", options: ["Conducir automóvil", "Equitación"], count: 1, label: "Conducir o Equitación", labelEn: "Drive Auto or Ride" },
    ],
    creditRating: [9, 30],
  },
  {
    name: "Periodista",
    nameEn: "Journalist",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía", labelEn: "Art/Craft" },
      "Buscar libros",
      "Historia",
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" },
    ],
    creditRating: [9, 30],
  },
  {
    name: "Soldado",
    nameEn: "Soldier",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Armas de fuego", count: 2, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      { type: "field", field: "Combatir", count: 1, requiresBaseValue: true, label: "Combatir", labelEn: "Fighting" },
      "Esquivar",
      "Primeros auxilios",
      "Sigilo",
      { type: "field", field: "Supervivencia", count: 1, label: "Supervivencia", labelEn: "Survival" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" },
    ],
    creditRating: [9, 30],
  },
  {
    name: "Piloto",
    nameEn: "Pilot",
    formula: "EDU*4",
    skills: [
      "Electricidad",
      "Mecánica",
      "Orientarse",
      { type: "field", field: "Pilotar", count: 2, label: "Pilotar", labelEn: "Pilot" },
      { type: "field", field: "Ciencia", count: 1, label: "Ciencia", labelEn: "Science" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" },
    ],
    creditRating: [20, 70],
  },
  {
    name: "Explorador",
    nameEn: "Explorer",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      { type: "field", field: "Combatir", count: 1, requiresBaseValue: true, label: "Combatir", labelEn: "Fighting" },
      "Orientarse",
      "Nadar",
      "Trepar",
      { type: "field", field: "Supervivencia", count: 1, label: "Supervivencia", labelEn: "Survival" },
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" },
    ],
    creditRating: [20, 60],
  },
  {
    name: "Profesor",
    nameEn: "Professor",
    formula: "EDU*4",
    skills: [
      "Buscar libros",
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Psicología",
      { type: "field", field: "Ciencia", count: 2, label: "Ciencia o especialidad", labelEn: "Science or specialty" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" },
    ],
    creditRating: [20, 70],
  },
  {
    name: "Artista",
    nameEn: "Artist",
    formula: "EDU*2 + POW*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 2, label: "Arte/Artesanía", labelEn: "Art/Craft" },
      "Historia",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" },
    ],
    creditRating: [9, 50],
  },
]