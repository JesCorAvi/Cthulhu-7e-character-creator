// lib/occupations-data.ts

export type OccupationFormula = string;

// count: Número de habilidades que se pueden elegir de este tipo
export type SkillDefinition = string | { name: string; isAny?: boolean; count?: number };

export interface OccupationDefinition {
  name: string;
  formula: OccupationFormula;
  skills: SkillDefinition[];
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

export const PRESET_OCCUPATIONS: OccupationDefinition[] = [
  // --- PROFESIÓN PERSONALIZADA (SOLICITUD: 7 A ELEGIR) ---
  {
    name: "Otra",
    formula: "EDU*2 + DEX*2",
    skills: [
        { name: "Cualquiera", isAny: true, count: 7 }
    ],
    creditRating: [0, 99],
    description: "Personalizada. Elige 2 características y 7 habilidades cualesquiera."
  },

  // --- MANUAL DEL INVESTIGADOR (SELECCIÓN) ---
  {
    name: "Acróbata",
    formula: "EDU*2 + DEX*2",
    skills: ["Descubrir", "Esquivar", "Lanzar", "Nadar", "Saltar", "Trepar", { name: "Cualquiera", isAny: true, count: 2 }],
    creditRating: [9, 20]
  },
  {
    name: "Actor",
    formula: "EDU*2 + APP*2", 
    skills: [{ name: "Arte/Artesanía (Actuar)", isAny: true }, "Disfrazarse", "Escuchar", "Psicología", { name: "Habilidad Interpersonal", isAny: true, count: 2 }, { name: "Cualquiera", isAny: true }],
    creditRating: [9, 40]
  },
  {
    name: "Anticuario",
    formula: "EDU*4",
    skills: [
      "Tasación", 
      { name: "Arte/Artesanía", isAny: true },
      "Historia", 
      "Buscar libros", 
      "Otras lenguas", 
      { name: "Habilidad Interpersonal", isAny: true }, // 1 slot interpersonal
      "Descubrir",
      { name: "Cualquiera", isAny: true } // 1 slot libre
    ],
    creditRating: [30, 70]
  },
  {
    name: "Arqueólogo",
    formula: "EDU*4",
    skills: ["Arqueología", "Buscar libros", "Descubrir", "Historia", "Mecánica", { name: "Ciencia o Orientarse", isAny: true }, "Otras lenguas", "Tasación"],
    creditRating: [10, 40]
  },
  {
    name: "Artista",
    formula: "EDU*2 + (APP*2 or DEX*2)",
    skills: [{ name: "Arte/Artesanía", isAny: true }, "Descubrir", "Historia", "Otras lenguas", "Psicología", { name: "Habilidad Interpersonal", isAny: true }, { name: "Cualquiera", isAny: true, count: 2 }],
    creditRating: [9, 50]
  },
  {
    name: "Atleta",
    formula: "EDU*2 + (DEX*2 or STR*2)",
    skills: ["Combatir (Pelea)", "Equitación", "Lanzar", "Nadar", "Saltar", "Trepar", { name: "Habilidad Interpersonal", isAny: true }, { name: "Cualquiera", isAny: true }],
    creditRating: [9, 70]
  },
  {
    name: "Bibliotecario",
    formula: "EDU*4",
    skills: ["Buscar libros", "Contabilidad", "Lengua propia", "Otras lenguas", { name: "Cualquiera", isAny: true, count: 4 }],
    creditRating: [9, 35]
  },
  {
    name: "Clérigo",
    formula: "EDU*4",
    skills: ["Buscar libros", "Contabilidad", "Escuchar", "Historia", "Otras lenguas", "Psicología", { name: "Habilidad Interpersonal", isAny: true }, { name: "Cualquiera", isAny: true }],
    creditRating: [9, 60]
  },
  {
    name: "Criminal",
    formula: "EDU*2 + (STR*2 or DEX*2)",
    skills: [{ name: "Habilidad Interpersonal", isAny: true, count: 2 }, "Psicología", "Sigilo", "Descubrir", { name: "Cualquiera", isAny: true, count: 3 }], // Genérico flexible
    creditRating: [5, 60]
  },
  {
    name: "Detective Privado",
    formula: "EDU*2 + (STR*2 or DEX*2)",
    skills: [{ name: "Arte/Artesanía (Fotografía)", isAny: true }, "Buscar libros", "Derecho", "Descubrir", "Disfrazarse", "Psicología", { name: "Habilidad Interpersonal", isAny: true }, { name: "Cualquiera", isAny: true }],
    creditRating: [9, 30]
  },
  {
    name: "Diletante",
    formula: "EDU*2 + APA*2",
    skills: [{ name: "Arte/Artesanía", isAny: true }, "Armas de fuego", "Otras lenguas", "Equitación", { name: "Habilidad Interpersonal", isAny: true }, { name: "Cualquiera", isAny: true, count: 3 }],
    creditRating: [50, 99]
  },
  {
    name: "Escritor",
    formula: "EDU*4",
    skills: [{ name: "Arte (Literatura)", isAny: true }, "Buscar libros", "Historia", "Lengua propia", "Otras lenguas", "Psicología", { name: "Naturaleza o C.Ocultas", isAny: true }, { name: "Cualquiera", isAny: true }],
    creditRating: [9, 30]
  },
  {
    name: "Médico",
    formula: "EDU*4",
    skills: ["Ciencia (Biología)", "Ciencia (Farmacia)", "Medicina", "Otras lenguas (Latín)", "Primeros auxilios", "Psicología", { name: "Cualquiera", isAny: true, count: 2 }],
    creditRating: [30, 80]
  },
  {
    name: "Músico",
    formula: "EDU*2 + (DEX*2 or APA*2)",
    skills: [{ name: "Arte/Artesanía (Instrumento)", isAny: true }, "Escuchar", "Psicología", { name: "Habilidad Interpersonal", isAny: true }, { name: "Cualquiera", isAny: true, count: 4 }],
    creditRating: [9, 30]
  },
  {
    name: "Oficial de Policía",
    formula: "EDU*2 + (STR*2 or DEX*2)",
    skills: ["Armas de fuego", "Combatir (Pelea)", "Derecho", "Descubrir", "Primeros auxilios", "Psicología", { name: "Habilidad Interpersonal", isAny: true }, { name: "Conducir o Equitación", isAny: true }],
    creditRating: [9, 30]
  },
  {
    name: "Periodista",
    formula: "EDU*4",
    skills: [{ name: "Arte/Artesanía (Fotografía)", isAny: true }, "Buscar libros", "Historia", "Lengua propia", "Psicología", { name: "Habilidad Interpersonal", isAny: true }, { name: "Cualquiera", isAny: true, count: 2 }],
    creditRating: [9, 30]
  },
  {
    name: "Profesor",
    formula: "EDU*4",
    skills: ["Buscar libros", "Lengua propia", "Otras lenguas", "Psicología", { name: "Cualquiera", isAny: true, count: 4 }],
    creditRating: [20, 70]
  }
];