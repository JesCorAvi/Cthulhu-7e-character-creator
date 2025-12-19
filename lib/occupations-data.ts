// lib/occupations-data.ts

// Cambiamos el tipo a string para permitir fórmulas personalizadas dinámicas
export type OccupationFormula = string;

export interface OccupationDefinition {
  name: string;
  formula: OccupationFormula;
  skills: string[];
  creditRating: [number, number];
  description?: string;
}

// Mantenemos las fórmulas sugeridas para la UI, pero el sistema aceptará strings libres
export const OCCUPATION_FORMULAS: { label: string; value: OccupationFormula }[] = [
  { label: "EDU x 4", value: "EDU*4" },
  { label: "EDU x 2 + FUE x 2", value: "EDU*2 + STR*2" },
  { label: "EDU x 2 + DES x 2", value: "EDU*2 + DEX*2" },
  { label: "EDU x 2 + APA x 2", value: "EDU*2 + APP*2" },
  { label: "EDU x 2 + POD x 2", value: "EDU*2 + POW*2" },
];

export const PRESET_OCCUPATIONS: OccupationDefinition[] = [
  {
    name: "Anticuario",
    formula: "EDU*4",
    skills: ["Tasación", "Arte/Artesanía", "Historia", "Buscar libros", "Otras lenguas", "Encanto", "Descubrir"],
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
    skills: ["Arte/Artesanía", "Disfrazarse", "Derecho", "Buscar libros", "Charlatanería", "Psicología", "Descubrir"],
    creditRating: [9, 30]
  },
  {
    name: "Médico",
    formula: "EDU*4",
    skills: ["Primeros auxilios", "Otras lenguas", "Medicina", "Psicología", "Ciencia: Biología", "Ciencia: Farmacia"],
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
    skills: ["Buscar libros", "Otras lenguas", "Lengua propia", "Psicología"],
    creditRating: [20, 70]
  },
  // AÑADIMOS LA OCUPACIÓN PERSONALIZADA
  {
    name: "Otra",
    formula: "EDU*2 + DEX*2", // Valor inicial temporal
    skills: [], // Sin habilidades predefinidas
    creditRating: [0, 99],
    description: "Personalizada. Elige 2 características y tus habilidades."
  }
];