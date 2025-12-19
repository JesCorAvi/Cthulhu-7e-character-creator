// lib/occupations-data.ts

export type OccupationFormula = 
  | "EDU*4"
  | "EDU*2 + STR*2"
  | "EDU*2 + DEX*2"
  | "EDU*2 + APP*2"
  | "EDU*2 + POW*2"
  | "EDU*2 + (STR*2 or DEX*2)"
  | "EDU*2 + (APP*2 or POW*2)";

export interface OccupationDefinition {
  name: string;
  formula: OccupationFormula;
  skills: string[]; // Lista de nombres de habilidades fijas
  creditRating: [number, number]; // Min, Max
  description?: string;
  // Algunas profesiones permiten elegir entre varias habilidades (ej. "Una interpersonal")
  // Para simplificar este ejemplo, usaremos una lista plana, pero podrías expandirlo.
}

export const OCCUPATION_FORMULAS: { label: string; value: OccupationFormula }[] = [
  { label: "EDU x 4", value: "EDU*4" },
  { label: "EDU x 2 + FUE x 2", value: "EDU*2 + STR*2" },
  { label: "EDU x 2 + DES x 2", value: "EDU*2 + DEX*2" },
  { label: "EDU x 2 + APA x 2", value: "EDU*2 + APP*2" },
  { label: "EDU x 2 + POD x 2", value: "EDU*2 + POW*2" },
  { label: "EDU x 2 + (FUE x 2 o DES x 2)", value: "EDU*2 + (STR*2 or DEX*2)" },
];

export const PRESET_OCCUPATIONS: OccupationDefinition[] = [
  {
    name: "Anticuario",
    formula: "EDU*4",
    skills: ["Tasación", "Arte/Artesanía", "Historia", "Buscar libros", "Otras lenguas", "Encanto", "Descubrir"], // +1 interpersonal u otra
    creditRating: [30, 70]
  },
  {
    name: "Autor",
    formula: "EDU*4",
    skills: ["Arte/Artesanía", "Historia", "Buscar libros", "Naturaleza", "Otras lenguas", "Lengua propia", "Psicología"],
    creditRating: [9, 30]
  },
  {
    name: "Detective Privado",
    formula: "EDU*2 + (STR*2 or DEX*2)",
    skills: ["Arte/Artesanía", "Disfrazarse", "Derecho", "Buscar libros", "Charlatanería", "Psicología", "Descubrir"], // +1 combate/armas
    creditRating: [9, 30]
  },
  {
    name: "Médico",
    formula: "EDU*4",
    skills: ["Primeros auxilios", "Otras lenguas", "Medicina", "Psicología", "Ciencia: Biología", "Ciencia: Farmacia"], // +2 académicas
    creditRating: [30, 80]
  },
  {
    name: "Oficial de Policía",
    formula: "EDU*2 + (STR*2 or DEX*2)",
    skills: ["Combatir: Pelea", "Armas de fuego: Arma corta", "Primeros auxilios", "Intimidar", "Derecho", "Psicología", "Descubrir", "Conducir automóvil"],
    creditRating: [9, 30]
  },
  {
    name: "Profesor",
    formula: "EDU*4",
    skills: ["Buscar libros", "Otras lenguas", "Lengua propia", "Psicología"], // +4 académicas/personales
    creditRating: [20, 70]
  }
];