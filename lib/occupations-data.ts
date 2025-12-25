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
  // --- A ---
  {
    name: "Administrativo / Oficinista",
    nameEn: "Clerk",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Derecho",
      "Buscar libros",
      "Escuchar",
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [9, 20],
  },
  {
    name: "Alpinista",
    nameEn: "Mountain Climber",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Trepar",
      "Escuchar",
      "Orientarse",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Primeros auxilios",
      "Saltar",
      { type: "field", field: "Supervivencia", count: 1, options: ["Alpino"], label: "Supervivencia (Alpino)", labelEn: "Survival (Alpine)" },
      { type: "choice", options: ["Seguir rastros", "Ciencia"], count: 1, label: "Seguir rastros o Ciencia", labelEn: "Track or Science" }
    ],
    creditRating: [30, 60],
  },
  {
    name: "Animador",
    nameEn: "Entertainer",
    formula: "EDU*2 + APP*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Actuar", "Cantar", "Comedia"], label: "Arte (Actuar/Cantar)", labelEn: "Art (Act/Sing)" },
      "Disfrazarse",
      "Escuchar",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [9, 60],
  },
  {
    name: "Aristócrata",
    nameEn: "Aristocrat",
    formula: "EDU*2 + APP*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía", labelEn: "Art/Craft" },
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Equitación",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [40, 90],
  },
  {
    name: "Arquitecto",
    nameEn: "Architect",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Dibujo técnico"], label: "Arte (Dibujo técnico)", labelEn: "Art (Technical Drawing)" },
      "Derecho",
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      { type: "field", field: "Ciencia", count: 1, options: ["Matemáticas"], label: "Ciencia (Matemáticas)", labelEn: "Science (Mathematics)" },
      "Buscar libros",
      "Psicología",
      "Persuasión"
    ],
    creditRating: [30, 70],
  },
  {
    name: "Artesano",
    nameEn: "Craftsperson",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Contabilidad",
      { type: "field", field: "Arte/Artesanía", count: 2, label: "Dos Artesanías (A elección)", labelEn: "Two Crafts (Any)" },
      "Descubrir",
      "Mecánica",
      { 
        type: "choice", 
        options: ["Naturaleza", { type: "field", field: "Ciencia", count: 1, options: ["Química"] }], 
        count: 1, 
        label: "Naturaleza o Ciencia (Química)", 
        labelEn: "Natural World or Science (Chemistry)" 
      },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [10, 40],
  },
  {
    name: "Atleta",
    nameEn: "Athlete",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Trepar",
      "Saltar",
      { type: "field", field: "Combatir", count: 1, options: ["Pelea"], requiresBaseValue: true, label: "Combatir (Pelea)", labelEn: "Fighting (Brawl)" },
      "Equitación",
      "Lanzar",
      "Nadar",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 70],
  },
  {
    name: "Autor",
    nameEn: "Author",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Literatura"], label: "Arte (Literatura)", labelEn: "Art (Literature)" },
      "Historia",
      "Buscar libros",
      { type: "choice", options: ["Ciencia", "Ciencias ocultas"], count: 1, label: "Ciencias o Ocultismo", labelEn: "Science or Occult" },
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      "Psicología",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 30],
  },
  {
    name: "Aviador",
    nameEn: "Aviator",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Contabilidad",
      "Electricidad",
      "Mecánica",
      "Orientarse",
      { type: "field", field: "Pilotar", count: 1, options: ["Aviación"], label: "Pilotar (Avión)", labelEn: "Pilot (Aircraft)" },
      "Descubrir",
      { type: "field", field: "Supervivencia", count: 1, label: "Supervivencia", labelEn: "Survival" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [30, 60],
  },
  {
    name: "Ayudante de Laboratorio",
    nameEn: "Laboratory Assistant",
    formula: "EDU*4",
    skills: [
      "Electricidad",
      "Buscar libros",
      "Descubrir",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      { type: "field", field: "Ciencia", count: 3, label: "Tres ciencias", labelEn: "Three sciences" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [10, 30],
  },

  // --- B ---
  {
    name: "Barman",
    nameEn: "Bartender",
    formula: "EDU*2 + APP*2",
    skills: [
      "Contabilidad",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "field", field: "Combatir", count: 1, options: ["Pelea"], requiresBaseValue: true, label: "Combatir (Pelea)", labelEn: "Fighting (Brawl)" },
      "Escuchar",
      "Psicología",
      "Descubrir",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [8, 25],
  },
  {
    name: "Bibliotecario",
    nameEn: "Librarian",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Buscar libros",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      { type: "any", count: 4, label: "Otras cuatro habilidades", labelEn: "Any four other skills" }
    ],
    creditRating: [9, 35],
  },
  {
    name: "Bombero",
    nameEn: "Firefighter",
    formula: "EDU*2 + STR*2",
    skills: [
      "Conducir automóvil",
      "Esquivar",
      "Primeros auxilios",
      "Saltar",
      "Mecánica",
      "Conducir maquinaria",
      "Lanzar",
      "Trepar"
    ],
    creditRating: [9, 30],
  },
  {
    name: "Boxeador / Luchador",
    nameEn: "Boxer / Wrestler",
    formula: "EDU*2 + STR*2",
    skills: [
      "Esquivar",
      { type: "field", field: "Combatir", count: 1, options: ["Pelea"], requiresBaseValue: true, label: "Combatir (Pelea)", labelEn: "Fighting (Brawl)" },
      "Intimidar",
      "Saltar",
      "Psicología",
      "Descubrir",
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [9, 60],
  },
  {
    name: "Buzo",
    nameEn: "Diver",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Nadar",
      "Descubrir",
      "Primeros auxilios",
      "Mecánica",
      { type: "field", field: "Pilotar", count: 1, options: ["Bote"], label: "Pilotar (Bote)", labelEn: "Pilot (Boat)" },
      { type: "field", field: "Ciencia", count: 1, options: ["Biología"], label: "Ciencia (Biología)", labelEn: "Science (Biology)" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [9, 30],
  },

  // --- C ---
  {
    name: "Camarero",
    nameEn: "Waiter/Waitress",
    formula: "EDU*2 + APP*2",
    skills: [
      "Contabilidad",
      "Esquivar",
      "Escuchar",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      "Psicología",
      "Descubrir",
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [9, 20],
  },
  {
    name: "Camillero",
    nameEn: "Hospital Orderly",
    formula: "EDU*2 + STR*2",
    skills: [
      "Electricidad",
      "Primeros auxilios",
      "Escuchar",
      "Mecánica",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      "Psicología",
      "Sigilo",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [6, 15],
  },
  {
    name: "Cazador",
    nameEn: "Big Game Hunter",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Armas de fuego", count: 1, options: ["Rifle/Escopeta"], requiresBaseValue: true, label: "Armas de fuego (Rifle/Escopeta)", labelEn: "Firearms" },
      "Escuchar",
      { type: "field", field: "Ciencia", count: 1, options: ["Biología", "Botánica"], label: "Ciencia (Biología/Botánica)", labelEn: "Science (Bio/Botany)" },
      "Orientarse",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Descubrir",
      "Sigilo",
      { type: "choice", options: ["Seguir rastros", "Supervivencia"], count: 1, label: "Rastrear o Supervivencia", labelEn: "Track or Survival" }
    ],
    creditRating: [20, 50],
  },
  {
    name: "Cazador de Recompensas",
    nameEn: "Bounty Hunter",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Conducir automóvil",
      { type: "choice", options: ["Electricidad", "Mecánica"], count: 1, label: "Electr. o Mec.", labelEn: "Elec or Mech" },
      { type: "field", field: "Combatir", count: 1, requiresBaseValue: true, label: "Combatir", labelEn: "Fighting" },
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      "Derecho",
      "Psicología",
      "Seguir rastros",
      "Sigilo"
    ],
    creditRating: [10, 40],
  },
  {
    name: "Chófer",
    nameEn: "Chauffeur",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Conducir automóvil",
      "Mecánica",
      "Descubrir",
      "Escuchar",
      "Orientarse",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [10, 40],
  },
  {
    name: "Científico",
    nameEn: "Scientist",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Ciencia", count: 3, label: "Tres ciencias", labelEn: "Three sciences" },
      { type: "choice", options: ["Informática", "Buscar libros"], count: 1, label: "Informática o Buscar Libros", labelEn: "Computers or Library Use" },
      "Descubrir",
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" }
    ],
    creditRating: [9, 50],
  },
  {
    name: "Clérigo",
    nameEn: "Clergy",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Historia",
      "Buscar libros",
      "Escuchar",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 60],
  },
  {
    name: "Conductor",
    nameEn: "Driver",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Contabilidad",
      "Conducir automóvil",
      "Escuchar",
      "Mecánica",
      "Orientarse",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 20],
  },
  {
    name: "Conservador de Museo",
    nameEn: "Museum Curator",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Tasación",
      "Arqueología",
      "Historia",
      "Buscar libros",
      "Descubrir",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      { type: "choice", options: ["Ciencia", "Ciencias ocultas"], count: 1, label: "Ciencias u Ocultismo", labelEn: "Science or Occult" }
    ],
    creditRating: [10, 30],
  },
  {
    name: "Contable",
    nameEn: "Accountant",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Derecho",
      "Buscar libros",
      "Escuchar",
      "Persuasión",
      "Descubrir",
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [30, 70],
  },
  {
    name: "Contrabandista",
    nameEn: "Smuggler",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      "Escuchar",
      "Descubrir",
      "Orientarse",
      { type: "choice", options: ["Conducir automóvil", "Pilotar"], count: 1, label: "Conducir o Pilotar", labelEn: "Drive or Pilot" },
      "Juego de manos",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" }
    ],
    creditRating: [20, 60],
  },
  {
    name: "Corresponsal Extranjero",
    nameEn: "Foreign Correspondent",
    formula: "EDU*4",
    skills: [
      "Historia",
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      "Escuchar",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [10, 40],
  },
  {
    name: "Criminal",
    nameEn: "Criminal",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      "Psicología",
      "Descubrir",
      "Sigilo",
      { type: "any", count: 4, label: "Cuatro especialidades criminales", labelEn: "Four criminal specialties" }
    ],
    creditRating: [5, 65],
  },
  {
    name: "Cuidador de Zoo",
    nameEn: "Zookeeper",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Esquivar",
      "Primeros auxilios",
      { type: "field", field: "Ciencia", count: 2, options: ["Zoología", "Biología", "Farmacia"], label: "Zoología y Farmacia", labelEn: "Zoology/Biology and Pharmacy" },
      "Medicina",
      "Seguir rastros",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [10, 40],
  },

  // --- D ---
  {
    name: "Diletante",
    nameEn: "Dilettante",
    formula: "EDU*2 + APP*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía", labelEn: "Art/Craft" },
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Equitación",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 3, label: "Otras tres habilidades", labelEn: "Any three other skills" }
    ],
    creditRating: [50, 99],
  },
  {
    name: "Diseñador",
    nameEn: "Designer",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      { type: "field", field: "Arte/Artesanía", count: 2, options: ["Fotografía"], label: "Arte y Foto", labelEn: "Art and Photography" },
      "Mecánica",
      "Psicología",
      "Descubrir",
      "Buscar libros",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [20, 60],
  },
  
  // --- E ---
  {
    name: "Editor",
    nameEn: "Editor",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Historia",
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      "Psicología",
      "Descubrir",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [10, 30],
  },
  {
    name: "Enfermera",
    nameEn: "Nurse",
    formula: "EDU*4",
    skills: [
      "Primeros auxilios",
      "Escuchar",
      "Medicina",
      "Psicología",
      { type: "field", field: "Ciencia", count: 2, options: ["Biología", "Química"], label: "Ciencia (Biología y Química)", labelEn: "Science (Biology/Chemistry)" },
      "Descubrir",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" }
    ],
    creditRating: [9, 30],
  },
  {
    name: "Enterrador",
    nameEn: "Undertaker",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte (Restauración/Cosmética)", labelEn: "Art (Restoration/Cosmetic)" },
      "Conducir automóvil",
      { type: "field", field: "Ciencia", count: 2, options: ["Biología", "Química"], label: "Ciencia (Biología y Química)", labelEn: "Science (Biology/Chemistry)" },
      "Descubrir",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" }
    ],
    creditRating: [20, 60],
  },
  {
    name: "Entrenador de Animales",
    nameEn: "Animal Trainer",
    formula: "EDU*2 + APP*2",
    skills: [
      "Escuchar",
      { type: "field", field: "Ciencia", count: 1, options: ["Zoología"], label: "Ciencia (Zoología)", labelEn: "Science (Zoology)" },
      "Psicología",
      "Descubrir",
      "Sigilo",
      "Seguir rastros",
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [10, 40],
  },
  {
    name: "Escritor",
    nameEn: "Author",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Literatura"], label: "Arte (Literatura)", labelEn: "Art (Literature)" },
      "Historia",
      "Buscar libros",
      { type: "choice", options: ["Ciencia", "Ciencias ocultas"], count: 1, label: "Naturaleza u Ocultismo", labelEn: "Natural World or Occult" },
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      "Psicología",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 30],
  },
  {
    name: "Espía",
    nameEn: "Spy",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Actuar"], label: "Arte (Actuar)", labelEn: "Art (Acting)" },
      "Disfrazarse",
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      "Escuchar",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Psicología",
      "Juego de manos",
      "Sigilo"
    ],
    creditRating: [20, 60],
  },
  {
    name: "Estafador",
    nameEn: "Confidence Trickster",
    formula: "EDU*2 + APP*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Actuar"], label: "Arte (Actuar)", labelEn: "Art (Acting)" },
      "Disfrazarse",
      "Escuchar",
      "Psicología",
      "Juego de manos",
      { type: "choice", options: ["Charlatanería", "Persuasión"], count: 1, label: "Charlatanería o Persuasión", labelEn: "Fast Talk or Persuade" },
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [10, 65],
  },
  {
    name: "Estudiante",
    nameEn: "Student",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      "Buscar libros",
      "Escuchar",
      { type: "choice", options: ["Ciencia", "Historia", "Otras lenguas"], count: 3, label: "Tres campos de estudio", labelEn: "Three fields of study" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [5, 10],
  },

  // --- F ---
  {
    name: "Falsificador",
    nameEn: "Forger",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Contabilidad",
      "Tasación",
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Falsificación"], label: "Arte (Falsificación)", labelEn: "Art (Forgery)" },
      "Historia",
      "Buscar libros",
      "Descubrir",
      "Juego de manos",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [20, 60],
  },
  {
    name: "Fanático",
    nameEn: "Cult Leader",
    formula: "EDU*2 + APP*2",
    skills: [
      "Contabilidad",
      "Historia",
      "Ciencias ocultas",
      "Psicología",
      "Descubrir",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [30, 60],
  },
  {
    name: "Farmacéutico",
    nameEn: "Pharmacist",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Primeros auxilios",
      { type: "field", field: "Otras lenguas", count: 1, options: ["Latín"], label: "Latín", labelEn: "Latin" },
      "Buscar libros",
      "Psicología",
      { type: "field", field: "Ciencia", count: 2, options: ["Farmacia", "Química"], label: "Farmacia y Química", labelEn: "Pharmacy and Chemistry" },
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" }
    ],
    creditRating: [35, 75],
  },
  {
    name: "Fotógrafo",
    nameEn: "Photographer",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Fotografía"], label: "Arte (Fotografía)", labelEn: "Art (Photography)" },
      { type: "field", field: "Ciencia", count: 1, options: ["Química"], label: "Ciencia (Química)", labelEn: "Science (Chemistry)" },
      "Descubrir",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 3, label: "Otras tres habilidades", labelEn: "Any three other skills" }
    ],
    creditRating: [9, 30],
  },

  // --- G ---
  {
    name: "Gamberro",
    nameEn: "Street Punk",
    formula: "EDU*2 + STR*2",
    skills: [
      { type: "field", field: "Combatir", count: 1, options: ["Pelea"], requiresBaseValue: true, label: "Combatir (Pelea)", labelEn: "Fighting (Brawl)" },
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      "Saltar",
      "Juego de manos",
      "Sigilo",
      "Lanzar",
      "Trepar",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" }
    ],
    creditRating: [3, 10],
  },
  {
    name: "Gánster",
    nameEn: "Gangster",
    formula: "EDU*2 + APP*2",
    skills: [
      { type: "field", field: "Combatir", count: 1, options: ["Pelea"], requiresBaseValue: true, label: "Combatir (Pelea)", labelEn: "Fighting (Brawl)" },
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      "Derecho",
      "Escuchar",
      "Psicología",
      "Descubrir",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
    ],
    creditRating: [9, 60],
  },
  {
    name: "Granjero",
    nameEn: "Farmer",
    formula: "EDU*2 + STR*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Agricultura"], label: "Arte (Agricultura)", labelEn: "Art (Farming)" },
      "Conducir automóvil",
      "Conducir maquinaria",
      "Mecánica",
      { type: "field", field: "Ciencia", count: 1, options: ["Historia Natural", "Naturaleza"], label: "Ciencia (Naturales)", labelEn: "Science (Natural World)" },
      "Seguir rastros",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 30],
  },

  // --- I ---
  {
    name: "Ingeniero",
    nameEn: "Engineer",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Dibujo técnico"], label: "Arte (Dibujo técnico)", labelEn: "Art (Technical Drawing)" },
      "Electricidad",
      "Buscar libros",
      "Mecánica",
      "Conducir maquinaria",
      { type: "field", field: "Ciencia", count: 2, options: ["Ingeniería", "Física"], label: "Ingeniería y Física", labelEn: "Engineering/Physics" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [30, 60],
  },
  {
    name: "Inspector de Policía",
    nameEn: "Police Detective",
    formula: "EDU*2 + STR*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Actuar"], label: "Arte (Actuar) o Disfrazarse", labelEn: "Art (Acting) or Disguise" },
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      "Derecho",
      "Escuchar",
      "Psicología",
      "Descubrir",
      "Persuasión",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [20, 50],
  },
  {
    name: "Intérprete",
    nameEn: "Interpreter",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Otras lenguas", count: 2, label: "Dos lenguas extranjeras", labelEn: "Two other languages" },
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      "Escuchar",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [20, 50],
  },
  {
    name: "Investigador",
    nameEn: "Researcher",
    formula: "EDU*4",
    skills: [
      "Historia",
      "Buscar libros",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Descubrir",
      { type: "choice", options: ["Ciencia", "Ciencias ocultas"], count: 3, label: "Tres campos de estudio", labelEn: "Three fields of study" },
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" }
    ],
    creditRating: [9, 30],
  },
  // --- J ---
  {
    name: "Juez",
    nameEn: "Judge",
    formula: "EDU*4",
    skills: [
      "Historia",
      "Intimidar",
      "Derecho",
      "Buscar libros",
      "Escuchar",
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      "Persuasión",
      "Psicología"
    ],
    creditRating: [50, 80],
  },
  {
    name: "Jugador",
    nameEn: "Gambler",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Contabilidad",
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Actuar"], label: "Arte (Actuar)", labelEn: "Art (Acting)" },
      { type: "choice", options: ["Juego de manos", "Psicología"], count: 1, label: "Juego de Manos o Psicología", labelEn: "Sleight of Hand or Psychology" },
      "Escuchar",
      "Descubrir",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [10, 50],
  },
  {
    name: "Jurista (Abogado)",
    nameEn: "Lawyer",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Derecho",
      "Buscar libros",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [30, 80],
  },

  // --- L ---
  {
    name: "Ladrón",
    nameEn: "Burglar",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Tasación",
      "Trepar",
      { type: "choice", options: ["Electricidad", "Mecánica"], count: 1, label: "Elec. o Mec.", labelEn: "Elec or Mech" },
      "Escuchar",
      "Cerrajería",
      "Juego de manos",
      "Descubrir",
      "Sigilo"
    ],
    creditRating: [5, 40],
  },
  {
    name: "Ladrón de Bancos",
    nameEn: "Bank Robber",
    formula: "EDU*2 + STR*2",
    skills: [
      "Conducir automóvil",
      { type: "choice", options: ["Electricidad", "Mecánica"], count: 1, label: "Elec. o Mec.", labelEn: "Elec or Mech" },
      { type: "field", field: "Combatir", count: 1, options: ["Pelea"], requiresBaseValue: true, label: "Combatir (Pelea)", labelEn: "Fighting (Brawl)" },
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      "Intimidar",
      "Cerrajería",
      "Conducir maquinaria",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [5, 75],
  },
  {
    name: "Leñador",
    nameEn: "Lumberjack",
    formula: "EDU*2 + STR*2",
    skills: [
      "Trepar",
      "Esquivar",
      { type: "field", field: "Combatir", count: 1, options: ["Motosierra"], requiresBaseValue: true, label: "Combatir (Motosierra)", labelEn: "Fighting (Chainsaw)" },
      "Primeros auxilios",
      "Saltar",
      "Mecánica",
      { type: "field", field: "Ciencia", count: 1, options: ["Botánica", "Naturaleza"], label: "Ciencia (Naturaleza)", labelEn: "Science (Nature)" },
      "Lanzar"
    ],
    creditRating: [9, 30],
  },
  {
    name: "Librero",
    nameEn: "Bookseller",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Tasación",
      "Conducir automóvil",
      "Historia",
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      "Buscar libros",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" }
    ],
    creditRating: [20, 40],
  },

  // --- M ---
  {
    name: "Marinero",
    nameEn: "Sailor",
    formula: "EDU*2 + STR*2",
    skills: [
      "Electricidad",
      { type: "field", field: "Combatir", count: 1, options: ["Pelea"], requiresBaseValue: true, label: "Combatir (Pelea)", labelEn: "Fighting (Brawl)" },
      "Primeros auxilios",
      "Orientarse",
      { type: "field", field: "Pilotar", count: 1, options: ["Bote"], label: "Pilotar (Bote)", labelEn: "Pilot (Boat)" },
      { type: "field", field: "Supervivencia", count: 1, options: ["Mar"], label: "Supervivencia (Mar)", labelEn: "Survival (Sea)" },
      "Nadar",
      "Trepar"
    ],
    creditRating: [9, 30],
  },
  {
    name: "Mayordomo",
    nameEn: "Butler/Valet",
    formula: "EDU*4",
    skills: [
      { type: "choice", options: ["Contabilidad", "Tasación"], count: 1, label: "Contabilidad o Tasación", labelEn: "Accounting or Appraise" },
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía", labelEn: "Art/Craft" },
      "Primeros auxilios",
      "Escuchar",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Psicología",
      "Descubrir",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 40],
  },
  {
    name: "Mecánico",
    nameEn: "Mechanic",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Carpintería", "Soldadura"], label: "Arte (Carpintería/Soldadura)", labelEn: "Art (Carpentry/Welding)" },
      "Trepar",
      "Conducir automóvil",
      "Conducir maquinaria",
      "Electricidad",
      "Mecánica",
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [9, 40],
  },
  {
    name: "Miembro de la Tribu",
    nameEn: "Tribe Member",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Trepar",
      { type: "choice", options: ["Combatir", "Lanzar"], count: 1, label: "Combatir o Lanzar", labelEn: "Fight or Throw" },
      "Escuchar",
      { type: "field", field: "Ciencia", count: 1, options: ["Historia Natural"], label: "Ciencia (Naturaleza)", labelEn: "Science (Nature)" },
      "Ciencias ocultas",
      "Descubrir",
      "Nadar",
      "Supervivencia"
    ],
    creditRating: [0, 15],
  },
  {
    name: "Minero",
    nameEn: "Miner",
    formula: "EDU*2 + STR*2",
    skills: [
      "Trepar",
      { type: "field", field: "Ciencia", count: 1, options: ["Geología"], label: "Geología", labelEn: "Geology" },
      "Saltar",
      "Conducir maquinaria",
      "Mecánica",
      "Descubrir",
      "Sigilo",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 30],
  },
  {
    name: "Misionero",
    nameEn: "Missionary",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía", labelEn: "Art/Craft" },
      "Primeros auxilios",
      "Mecánica",
      "Medicina",
      { type: "field", field: "Ciencia", count: 1, options: ["Historia Natural"], label: "Naturaleza", labelEn: "Natural World" },
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [0, 30],
  },
  {
    name: "Montañero",
    nameEn: "Outdoorsman",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      "Primeros auxilios",
      "Escuchar",
      { type: "field", field: "Ciencia", count: 1, options: ["Historia Natural"], label: "Naturaleza", labelEn: "Natural World" },
      "Orientarse",
      "Descubrir",
      "Seguir rastros",
      "Supervivencia"
    ],
    creditRating: [5, 20],
  },
  {
    name: "Músico",
    nameEn: "Musician",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte (Instrumento)", labelEn: "Art (Instrument)" },
      "Escuchar",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 4, label: "Otras cuatro habilidades", labelEn: "Any four other skills" }
    ],
    creditRating: [9, 30],
  },

  // --- O ---
  {
    name: "Ocultista",
    nameEn: "Occultist",
    formula: "EDU*4",
    skills: [
      "Antropología",
      "Historia",
      "Buscar libros",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      { type: "field", field: "Ciencia", count: 1, options: ["Astronomía"], label: "Ciencia (Astronomía)", labelEn: "Science (Astronomy)" },
      "Ciencias ocultas",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 65],
  },
  {
    name: "Oficial Militar",
    nameEn: "Military Officer",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Contabilidad",
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      "Orientarse",
      "Psicología",
      { type: "field", field: "Supervivencia", count: 1, label: "Supervivencia", labelEn: "Survival" },
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [20, 70],
  },

  // --- P ---
  {
    name: "Parapsicólogo",
    nameEn: "Parapsychologist",
    formula: "EDU*4",
    skills: [
      "Antropología",
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Fotografía"], label: "Arte (Fotografía)", labelEn: "Art (Photography)" },
      "Historia",
      "Buscar libros",
      "Ciencias ocultas",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Psicología",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 30],
  },
  {
    name: "Pareja de Gánster",
    nameEn: "Gun Moll",
    formula: "EDU*2 + APP*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía", labelEn: "Art/Craft" },
      { type: "choice", options: ["Combatir", "Armas de fuego"], count: 1, label: "Combatir o Armas", labelEn: "Fight or Firearms" },
      "Conducir automóvil",
      "Escuchar",
      "Sigilo",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [10, 80],
  },
  {
    name: "Perista",
    nameEn: "Fence",
    formula: "EDU*2 + APP*2",
    skills: [
      "Contabilidad",
      "Tasación",
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Falsificación"], label: "Arte (Falsificación)", labelEn: "Art (Forgery)" },
      "Descubrir",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      "Juego de manos",
      "Psicología",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [20, 40],
  },
  {
    name: "Pirata Informático",
    nameEn: "Hacker",
    formula: "EDU*4",
    skills: [
      "Informática",
      "Electricidad",
      "Electrónica",
      "Buscar libros",
      "Descubrir",
      { type: "field", field: "Ciencia", count: 1, options: ["Matemáticas"], label: "Matemáticas", labelEn: "Mathematics" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [10, 40],
  },
  {
    name: "Programador",
    nameEn: "Computer Programmer",
    formula: "EDU*4",
    skills: [
      "Informática",
      "Electricidad",
      "Electrónica",
      "Buscar libros",
      { type: "field", field: "Ciencia", count: 1, options: ["Matemáticas"], label: "Matemáticas", labelEn: "Mathematics" },
      "Lógica",
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [10, 50],
  },
  {
    name: "Prospector",
    nameEn: "Prospector",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Trepar",
      { type: "field", field: "Ciencia", count: 1, options: ["Geología"], label: "Geología", labelEn: "Geology" },
      "Historia",
      "Mecánica",
      "Orientarse",
      "Descubrir",
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [0, 10],
  },
  {
    name: "Prostituta",
    nameEn: "Prostitute",
    formula: "EDU*2 + APP*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", count: 1, label: "Arte/Artesanía", labelEn: "Art/Craft" },
      "Esquivar",
      "Psicología",
      "Juego de manos",
      "Sigilo",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [5, 50],
  },
  {
    name: "Psicólogo",
    nameEn: "Psychologist",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Buscar libros",
      "Escuchar",
      "Persuasión",
      "Psicología",
      "Psicoanálisis",
      { type: "field", field: "Ciencia", count: 1, label: "Ciencia", labelEn: "Science" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [10, 40],
  },
  {
    name: "Psiquiatra",
    nameEn: "Alienist (Psychiatrist)",
    formula: "EDU*4",
    skills: [
      "Derecho",
      "Escuchar",
      "Medicina",
      { type: "field", field: "Otras lenguas", count: 1, label: "Otras lenguas", labelEn: "Language (Other)" },
      "Psicoanálisis",
      "Psicología",
      { type: "field", field: "Ciencia", count: 1, options: ["Biología", "Farmacia"], label: "Ciencia (Biología/Farmacia)", labelEn: "Science (Bio/Pharm)" },
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" }
    ],
    creditRating: [30, 80],
  },

  // --- S ---
  {
    name: "Secretaria",
    nameEn: "Secretary",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Contabilidad",
      { type: "field", field: "Arte/Artesanía", count: 1, options: ["Mecanografía"], label: "Arte (Mecanografía)", labelEn: "Art (Typing)" },
      { type: "field", field: "Lengua propia", count: 1, label: "Lengua propia", labelEn: "Language (Own)" },
      { type: "choice", options: ["Buscar libros", "Informática"], count: 1, label: "Buscar Libros o Informática", labelEn: "Library Use or Computers" },
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 30],
  },
  {
    name: "Sindicalista",
    nameEn: "Union Activist",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      { type: "field", field: "Combatir", count: 1, options: ["Pelea"], requiresBaseValue: true, label: "Combatir (Pelea)", labelEn: "Fighting (Brawl)" },
      "Derecho",
      "Escuchar",
      "Conducir maquinaria",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
    ],
    creditRating: [5, 30],
  },

  // --- T ---
  {
    name: "Taxista",
    nameEn: "Taxi Driver",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Contabilidad",
      "Conducir automóvil",
      "Electricidad",
      "Charlatanería",
      "Mecánica",
      "Orientarse",
      "Descubrir",
      { type: "any", count: 1, label: "Otra habilidad", labelEn: "Any other skill" }
    ],
    creditRating: [9, 30],
  },

  // --- V ---
  {
    name: "Vagabundo",
    nameEn: "Drifter",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Trepar",
      "Saltar",
      "Escuchar",
      "Orientarse",
      "Sigilo",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal", labelEn: "Interpersonal" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [0, 5],
  },
  {
    name: "Vaquero",
    nameEn: "Cowboy",
    formula: "EDU*2 + DEX*2",
    skills: [
      "Esquivar",
      { type: "field", field: "Combatir", count: 1, options: ["Pelea"], requiresBaseValue: true, label: "Combatir (Pelea)", labelEn: "Fighting (Brawl)" },
      { type: "field", field: "Armas de fuego", count: 1, requiresBaseValue: true, label: "Armas de fuego", labelEn: "Firearms" },
      { type: "field", field: "Ciencia", count: 1, options: ["Historia Natural"], label: "Naturaleza", labelEn: "Natural World" },
      "Equitación",
      "Supervivencia",
      "Lanzar",
      "Seguir rastros"
    ],
    creditRating: [9, 20],
  },
  {
    name: "Vendedor",
    nameEn: "Salesperson",
    formula: "EDU*2 + APP*2",
    skills: [
      "Contabilidad",
      "Conducir automóvil",
      "Escuchar",
      "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Dos interpersonales", labelEn: "Two interpersonal skills" },
      { type: "any", count: 2, label: "Otras dos habilidades", labelEn: "Any two other skills" }
    ],
    creditRating: [9, 40],
  },

  // --- Z ---
  {
    name: "Zoólogo",
    nameEn: "Zoologist",
    formula: "EDU*4",
    skills: [
      "Contabilidad",
      "Esquivar",
      "Primeros auxilios",
      { type: "field", field: "Ciencia", count: 3, options: ["Zoología", "Biología", "Farmacia"], label: "Tres Ciencias (Zoología, Bio, Farma)", labelEn: "Three Sciences" },
      "Medicina",
      "Seguir rastros"
    ],
    creditRating: [10, 40],
  },
  // --- OTHERS ---
    {
    name: "Otra",
    nameEn: "Custom",
    formula: "EDU*2 + DEX*2",
    skills: [{ type: "any", count: 8, label: "Habilidades a elección", labelEn: "Skills of your choice" }],
    creditRating: [0, 99],
    description: "Personalizada. Elige características y habilidades libremente.",
    descriptionEn: "Custom. Choose characteristics and skills freely.",
  },
]