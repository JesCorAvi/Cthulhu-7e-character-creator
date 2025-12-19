// lib/occupations-data.ts

export type OccupationFormula = string;

export type FieldRequirement = { 
  type: "field"; 
  field: string; 
  options?: string[]; 
  count: number; 
  label?: string 
};

export type SkillRequirement = 
  | string 
  | { type: "choice"; options: (string | FieldRequirement)[]; count: number; label: string } 
  | { type: "any"; count: number; label?: string }
  | FieldRequirement;

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

const INTERPERSONAL_OPTIONS = ["Charlatanería", "Encanto", "Intimidar", "Persuasión"];

export const PRESET_OCCUPATIONS: OccupationDefinition[] = [
  {
    name: "Otra",
    formula: "EDU*2 + DEX*2",
    skills: [{ type: "any", count: 8, label: "Habilidades a elección" }],
    creditRating: [0, 99],
    description: "Personalizada. Elige características y habilidades libremente."
  },
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
      { type: "field", field: "Arte/Artesanía", options: ["Actuar"], count: 1 },
      "Disfrazarse", "Escuchar", "Psicología", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 2, label: "Interpersonales" }, 
      { type: "any", count: 1 }
    ],
    creditRating: [9, 40]
  },
  {
    name: "Agente Federal",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Armas de fuego", options: ["Arma corta", "Fusil/Escopeta"], count: 1 },
      "Conducir automóvil", "Combatir: Pelea", "Derecho", "Descubrir", "Persuasión", "Sigilo",
      { type: "any", count: 1, label: "Especialidad personal" }
    ],
    creditRating: [20, 40]
  },
  {
    name: "Alienista",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Ciencia", options: ["Biología", "Química"], count: 2, label: "Ciencias especializadas" },
      "Derecho", "Escuchar", "Medicina", "Otras lenguas", "Psicoanálisis", "Psicología"
    ],
    creditRating: [10, 60]
  },
  {
    name: "Anticuario",
    formula: "EDU*4",
    skills: [
      "Tasación", { type: "field", field: "Arte/Artesanía", count: 1 }, "Historia", "Buscar libros", "Otras lenguas", "Descubrir",
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, { type: "any", count: 1 }
    ],
    creditRating: [30, 70]
  },
  {
    name: "Arqueólogo",
    formula: "EDU*4",
    skills: [
      "Arqueología", "Buscar libros", "Descubrir", "Historia", "Mecánica", "Otras lenguas", "Tasación",
      { 
        type: "choice", 
        count: 1, 
        label: "Ciencia u Orientarse",
        options: [
          { type: "field", field: "Ciencia", count: 1 }, 
          "Orientarse"
        ] 
      }
    ],
    creditRating: [10, 40]
  },
  {
    name: "Cirujano Forense",
    formula: "EDU*4",
    skills: [
      "Buscar libros", 
      { type: "field", field: "Ciencia", options: ["Biología", "Farmacia", "Medicina forense"], count: 3 },
      "Descubrir", "Medicina", "Otras lenguas", "Persuasión"
    ],
    creditRating: [40, 60]
  },
  {
    name: "Detective Privado",
    formula: "EDU*2 + DEX*2",
    skills: [
      { type: "field", field: "Arte/Artesanía", options: ["Fotografía"], count: 1 },
      "Buscar libros", "Derecho", "Descubrir", "Disfrazarse", "Psicología", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "any", count: 1 }
    ],
    creditRating: [9, 30]
  },
  {
    name: "Médico",
    formula: "EDU*4",
    skills: [
        { type: "field", field: "Ciencia", options: ["Biología", "Farmacia"], count: 2 },
        "Medicina", "Otras lenguas", "Primeros auxilios", "Psicología", { type: "any", count: 2 }
    ],
    creditRating: [30, 80]
  },
  {
    name: "Oficial de Policía",
    formula: "EDU*2 + STR*2",
    skills: [
      { type: "field", field: "Armas de fuego", options: ["Arma corta", "Fusil/Escopeta"], count: 1 },
      "Combatir: Pelea", "Derecho", "Descubrir", "Primeros auxilios", "Psicología", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "choice", options: ["Conducir automóvil", "Equitación"], count: 1, label: "Conducir o Equitación" }
    ],
    creditRating: [9, 30]
  },
  {
    name: "Periodista",
    formula: "EDU*4",
    skills: [
      { type: "field", field: "Arte/Artesanía", options: ["Fotografía"], count: 1 },
      "Buscar libros", "Historia", "Lengua propia", "Psicología", 
      { type: "choice", options: INTERPERSONAL_OPTIONS, count: 1, label: "Interpersonal" }, 
      { type: "any", count: 2 }
    ],
    creditRating: [9, 30]
  }
];