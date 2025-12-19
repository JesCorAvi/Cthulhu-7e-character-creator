// lib/occupations-data.ts

export type OccupationFormula = string;

// Definimos los tipos de requisitos para las habilidades
export type SkillRequirement = 
  | string  // Habilidad Fija (ej: "Psicología")
  | { type: "choice"; options: string[]; count: number; label: string } // Elección restringida (ej: "2 Interpersonales")
  | { type: "any"; count: number; label?: string }; // Hueco libre (ej: "2 especialidades personales")

export interface OccupationDefinition {
  name: string;
  formula: OccupationFormula;
  skills: SkillRequirement[];
  creditRating: [number, number];
  description?: string;
}

export const OCCUPATION_FORMULAS: { label: string; value: OccupationFormula }[] = [
  { label: "EDU x 4", value: "EDU*4" },
  { label: "EDU x 2 + FUE x 2", value: "EDU*2 + STR*2" },
  { label: "EDU x 2 + DES x 2", value: "EDU*2 + DEX*2" },
  { label: "EDU x 2 + APA x 2", value: "EDU*2 + APP*2" },
  { label: "EDU x 2 + POD x 2", value: "EDU*2 + POW*2" },
];

// Constante auxiliar para las habilidades interpersonales comunes
const INTERPERSONAL_OPTIONS = ["Charlatanería", "Encanto", "Intimidar", "Persuasión"];

export const PRESET_OCCUPATIONS: OccupationDefinition[] = [
  // --- PROFESIÓN PERSONALIZADA ---
  {
    name: "Otra",
    formula: "EDU*2 + DEX*2",
    skills: [
        { type: "any", count: 8, label: "Habilidades a elección" }
    ],
    creditRating: [0, 99],
    description: "Personalizada. Elige características y habilidades libremente."
  },

  // --- MANUAL DEL INVESTIGADOR Y TEXTOS PROPORCIONADOS ---
  
  {
    name: "Acróbata",
    formula: "EDU*2 + DEX*2",
    skills: ["Descubrir", "Esquivar", "Lanzar", "Nadar", "Saltar", "Trepar", { type: "any", count: 2 }],
    creditRating: [9, 20]
  },
  {
    name: "Actor",
    formula: "EDU*2 + APP*2", 
    skills: [
      "Arte/Artesanía (Actuar)", 
      "Disfrazarse", 
      "Escuchar", 
      "Psicología", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Interpersonales" }, 
      { type: "any", count: 1 }
    ],
    creditRating: [9, 40]
  },
  {
    name: "Agente Federal",
    formula: "EDU*4",
    skills: [
      "Armas de fuego", "Conducir automóvil", "Combatir (Pelea)", "Derecho", "Descubrir", "Persuasión", "Sigilo",
      { type: "any", count: 1, label: "Especialidad personal" }
    ],
    creditRating: [20, 40]
  },
  {
    name: "Alienista",
    formula: "EDU*4",
    skills: [
      "Ciencia (Biología)", "Ciencia (Química)", "Derecho", "Escuchar", "Medicina", "Otras lenguas", "Psicoanálisis", "Psicología"
    ],
    creditRating: [10, 60]
  },
  {
    name: "Alpinista",
    formula: "EDU*2 + (STR*2 or DEX*2)",
    skills: [
      "Escuchar", "Orientarse", "Otras lenguas", "Primeros auxilios", "Saltar", "Seguir rastros", "Supervivencia (Alpino)", "Trepar"
    ],
    creditRating: [30, 60]
  },
  {
    name: "Anticuario",
    formula: "EDU*4",
    skills: [
      "Tasación", "Arte/Artesanía", "Historia", "Buscar libros", "Otras lenguas", "Descubrir",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "any", count: 1 }
    ],
    creditRating: [30, 70]
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
      "Otras lenguas", 
      "Tasación",
      // Volvemos a 'choice' para que SOLO puedas elegir estas dos cosas
      { 
        type: "choice", 
        options: ["Ciencia", "Orientarse"], 
        count: 1, 
        label: "Ciencia u Orientarse" 
      }
    ],
    creditRating: [10, 40]
  },
  {
    name: "Artista",
    formula: "EDU*2 + (APP*2 or DEX*2)",
    skills: [
      "Arte/Artesanía", "Descubrir", "Historia", "Otras lenguas", "Psicología", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "any", count: 2 }
    ],
    creditRating: [9, 50]
  },
  {
    name: "Atleta",
    formula: "EDU*2 + (DEX*2 or STR*2)",
    skills: [
      "Combatir (Pelea)", "Equitación", "Lanzar", "Nadar", "Saltar", "Trepar", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "any", count: 1 }
    ],
    creditRating: [9, 70]
  },
  {
    name: "Bibliotecario",
    formula: "EDU*4",
    skills: ["Buscar libros", "Contabilidad", "Lengua propia", "Otras lenguas", { type: "any", count: 4 }],
    creditRating: [9, 35]
  },
  {
    name: "Cirujano Forense",
    formula: "EDU*4",
    skills: [
      "Buscar libros", "Ciencia (Biología)", "Ciencia (Farmacia)", "Ciencia (Medicina forense)", "Descubrir", "Medicina", "Otras lenguas (Latín)", "Persuasión"
    ],
    creditRating: [40, 60]
  },
  {
    name: "Clérigo",
    formula: "EDU*4",
    skills: [
      "Buscar libros", "Contabilidad", "Escuchar", "Historia", "Otras lenguas", "Psicología", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "any", count: 1 }
    ],
    creditRating: [9, 60]
  },
  {
    name: "Criminal",
    formula: "EDU*2 + (STR*2 or DEX*2)",
    skills: [
      "Psicología", "Sigilo", "Descubrir", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Interpersonales" }, 
      { type: "any", count: 3 }
    ], 
    creditRating: [5, 60]
  },
  {
    name: "Detective Privado",
    formula: "EDU*2 + (STR*2 or DEX*2)",
    skills: [
      "Arte/Artesanía (Fotografía)", "Buscar libros", "Derecho", "Descubrir", "Disfrazarse", "Psicología", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "any", count: 1 }
    ],
    creditRating: [9, 30]
  },
  {
    name: "Diletante",
    formula: "EDU*2 + APA*2",
    skills: [
      "Arte/Artesanía", "Armas de fuego", "Otras lenguas", "Equitación", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "any", count: 3 }
    ],
    creditRating: [50, 99]
  },
  {
    name: "Escritor",
    formula: "EDU*4",
    skills: [
      "Arte/Artesanía (Literatura)", "Buscar libros", "Historia", "Lengua propia", "Otras lenguas", "Psicología", 
      { type: "choice", options: ["Ciencia (Historia Natural)", "Ocultismo"], count: 1, label: "Natural. o C.Ocultas" }, 
      { type: "any", count: 1 }
    ],
    creditRating: [9, 30]
  },
  {
    name: "Estrella de Cine",
    formula: "EDU*2 + APP*2",
    skills: [
      "Arte/Artesanía (Actuar)", "Conducir automóvil", "Disfrazarse", "Psicología",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Interpersonales" },
      { type: "any", count: 2 }
    ],
    creditRating: [20, 90]
  },
  {
    name: "Médico",
    formula: "EDU*4",
    skills: ["Ciencia (Biología)", "Ciencia (Farmacia)", "Medicina", "Otras lenguas (Latín)", "Primeros auxilios", "Psicología", { type: "any", count: 2 }],
    creditRating: [30, 80]
  },
  {
    name: "Músico",
    formula: "EDU*2 + (DEX*2 or APA*2)",
    skills: [
      "Arte/Artesanía (Instrumento)", "Escuchar", "Psicología", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "any", count: 4 }
    ],
    creditRating: [9, 30]
  },
  {
    name: "Oficial de Policía",
    formula: "EDU*2 + (STR*2 or DEX*2)",
    skills: [
      "Armas de fuego", "Combatir (Pelea)", "Derecho", "Descubrir", "Primeros auxilios", "Psicología", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "choice", options: ["Conducir automóvil", "Equitación"], count: 1, label: "Conducir o Equitación" }
    ],
    creditRating: [9, 30]
  },
  {
    name: "Periodista",
    formula: "EDU*4",
    skills: [
      "Arte/Artesanía (Fotografía)", "Buscar libros", "Historia", "Lengua propia", "Psicología", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "any", count: 2 }
    ],
    creditRating: [9, 30]
  },
  {
    name: "Profesor",
    formula: "EDU*4",
    skills: ["Buscar libros", "Lengua propia", "Otras lenguas", "Psicología", { type: "any", count: 4 }],
    creditRating: [20, 70]
  }
];