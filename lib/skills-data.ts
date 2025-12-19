import type { CharacterEra, Skill } from "./character-types"

export interface SkillDefinition {
  name: string
  baseValue: number | "special"
  isFieldHeader?: boolean
  fieldSlots?: number
  subSkills?: { name: string; baseValue: number }[]
}

const skills1920sAndModern: SkillDefinition[] = [
  { name: "Antropología", baseValue: 1 },
  {
    name: "Armas de fuego",
    baseValue: 0,
    isFieldHeader: true,
    fieldSlots: 1,
    subSkills: [
      { name: "Arma corta", baseValue: 20 },
      { name: "Fusil/Escopeta", baseValue: 25 },
    ],
  },
  { name: "Arqueología", baseValue: 1 },
  { name: "Arte/Artesanía", baseValue: 5, isFieldHeader: true, fieldSlots: 3 },
  { name: "Buscar libros", baseValue: 20 },
  { name: "Cerrajería", baseValue: 1 },
  { name: "Charlatanería", baseValue: 5 },
  { name: "Ciencia", baseValue: 1, isFieldHeader: true, fieldSlots: 3 },
  { name: "Ciencias ocultas", baseValue: 5 },
  {
    name: "Combatir",
    baseValue: 0,
    isFieldHeader: true,
    fieldSlots: 2,
    subSkills: [{ name: "Pelea", baseValue: 25 }],
  },
  { name: "Conducir automóvil", baseValue: 20 },
  { name: "Conducir maquinaria", baseValue: 1 },
  { name: "Contabilidad", baseValue: 5 },
  { name: "Crédito", baseValue: 0 },
  { name: "Derecho", baseValue: 5 },
  { name: "Descubrir", baseValue: 25 },
  { name: "Disfrazarse", baseValue: 5 },
  { name: "Electricidad", baseValue: 10 },
  { name: "Encanto", baseValue: 15 },
  { name: "Equitación", baseValue: 5 },
  { name: "Escuchar", baseValue: 20 },
  { name: "Esquivar", baseValue: "special" },
  { name: "Historia", baseValue: 5 },
  { name: "Intimidar", baseValue: 15 },
  { name: "Juego de manos", baseValue: 10 },
  { name: "Lanzar", baseValue: 20 },
  { name: "Lengua propia", baseValue: "special", isFieldHeader: true, fieldSlots: 1 },
  { name: "Otras lenguas", baseValue: 1, isFieldHeader: true, fieldSlots: 3 },
  { name: "Mecánica", baseValue: 10 },
  { name: "Medicina", baseValue: 1 },
  { name: "Mitos de Cthulhu", baseValue: 0 },
  { name: "Nadar", baseValue: 20 },
  { name: "Naturaleza", baseValue: 10 },
  { name: "Orientarse", baseValue: 10 },
  { name: "Persuasión", baseValue: 10 },
  { name: "Pilotar", baseValue: 1, isFieldHeader: true, fieldSlots: 1 },
  { name: "Primeros auxilios", baseValue: 30 },
  { name: "Psicoanálisis", baseValue: 1 },
  { name: "Psicología", baseValue: 10 },
  { name: "Saltar", baseValue: 20 },
  { name: "Seguir rastros", baseValue: 10 },
  { name: "Sigilo", baseValue: 20 },
  { name: "Supervivencia", baseValue: 10, isFieldHeader: true, fieldSlots: 1 },
  { name: "Tasación", baseValue: 5 },
  { name: "Trepar", baseValue: 20 },
]

const modernOnlySkills: SkillDefinition[] = [
  { name: "Electrónica", baseValue: 1 },
  { name: "Informática", baseValue: 5 },
]

const skillsDarkAges: SkillDefinition[] = [
  {
    name: "Armas a distancia",
    baseValue: 0,
    isFieldHeader: true,
    fieldSlots: 2,
    subSkills: [{ name: "Arte/Artesanía", baseValue: 5 }],
  },
  { name: "Buscar libros", baseValue: 5 },
  { name: "Charlatanería", baseValue: 5 },
  { name: "Ciencia", baseValue: 1, isFieldHeader: true, fieldSlots: 2 },
  { name: "Ciencias ocultas", baseValue: 5 },
  {
    name: "Combatir",
    baseValue: 0,
    isFieldHeader: true,
    fieldSlots: 3,
    subSkills: [{ name: "Pelea", baseValue: 25 }],
  },
  { name: "Conducir animales de tiro", baseValue: 20 },
  { name: "Contabilidad", baseValue: 10 },
  { name: "Descubrir", baseValue: 25 },
  { name: "Encanto", baseValue: 15 },
  { name: "Equitación", baseValue: 5 },
  { name: "Escuchar", baseValue: 25 },
  { name: "Esquivar", baseValue: "special" },
  { name: "Historia", baseValue: 5 },
  { name: "Intimidar", baseValue: 15 },
  { name: "Juego de manos", baseValue: 25 },
  { name: "Lanzar", baseValue: 25 },
  { name: "Leer/Escribir", baseValue: 1, isFieldHeader: true, fieldSlots: 2 },
  { name: "Lengua propia", baseValue: "special", isFieldHeader: true, fieldSlots: 1 },
  { name: "Otras lenguas", baseValue: 1, isFieldHeader: true, fieldSlots: 2 },
  { name: "Medicina", baseValue: 1 },
  { name: "Mitos de Cthulhu", baseValue: 0 },
  { name: "Nadar", baseValue: 25 },
  { name: "Naturaleza", baseValue: 20, isFieldHeader: true, fieldSlots: 2 },
  { name: "Orientarse", baseValue: 10 },
  { name: "Otros reinos", baseValue: 10, isFieldHeader: true, fieldSlots: 2 },
  { name: "Perspicacia", baseValue: 5 },
  { name: "Pilotar (Embarcación)", baseValue: 1 },
  { name: "Posición social", baseValue: 0 },
  { name: "Primeros auxilios", baseValue: 30 },
  { name: "Reino propio", baseValue: 20, isFieldHeader: true, fieldSlots: 1 },
  { name: "Religión", baseValue: 20 },
  { name: "Reparar y construir", baseValue: 20 },
  { name: "Saltar", baseValue: 25 },
  { name: "Seguir rastros", baseValue: 10, isFieldHeader: true, fieldSlots: 2 },
  { name: "Sigilo", baseValue: 20 },
  { name: "Persuasión", baseValue: 15 },
  { name: "Psicología", baseValue: 10 },
  { name: "Tasación", baseValue: 5 },
  { name: "Trato con animales", baseValue: 15 },
  { name: "Trepar", baseValue: 20 },
]

export const getSkillDefinitionsForEra = (era: CharacterEra): SkillDefinition[] => {
  if (era === "darkAges") {
    return skillsDarkAges
  } else if (era === "modern") {
    const skills = [...skills1920sAndModern]
    const elecIndex = skills.findIndex((s) => s.name === "Electricidad")
    skills.splice(elecIndex + 1, 0, modernOnlySkills[0])
    const histIndex = skills.findIndex((s) => s.name === "Historia")
    skills.splice(histIndex + 1, 0, modernOnlySkills[1])
    return skills
  }
  return skills1920sAndModern
}

export const getBaseSkillsForEra = (era: CharacterEra): Skill[] => {
  const definitions = getSkillDefinitionsForEra(era)
  const skills: Skill[] = []

  for (const def of definitions) {
    if (def.isFieldHeader) {
      skills.push({
        name: def.name,
        baseValue: typeof def.baseValue === "number" ? def.baseValue : 0,
        value: typeof def.baseValue === "number" ? def.baseValue : 0,
        isOccupational: false,
        isFieldHeader: true,
      })
      if (def.subSkills) {
        for (const sub of def.subSkills) {
          skills.push({
            name: `${def.name}: ${sub.name}`,
            baseValue: sub.baseValue,
            value: sub.baseValue,
            isOccupational: false,
          })
        }
      }
      for (let i = 0; i < (def.fieldSlots || 0); i++) {
        const isSpecial = def.baseValue === "special"
        const initialValue = typeof def.baseValue === "number" ? def.baseValue : 1
        
        skills.push({
          name: def.name,
          baseValue: initialValue,
          value: initialValue,
          isOccupational: false,
          isFieldSlot: true,
          isCustom: true,
          isSpecialCalc: isSpecial,
          customName: "",
        })
      }
    } else {
      skills.push({
        name: def.name,
        baseValue: typeof def.baseValue === "number" ? def.baseValue : 0,
        value: typeof def.baseValue === "number" ? def.baseValue : 0,
        isOccupational: false,
        isSpecialCalc: def.baseValue === "special",
      })
    }
  }

  // Añadir 6 habilidades personalizadas vacías
  for (let i = 0; i < 6; i++) {
    skills.push({
      name: "Habilidad personalizada",
      baseValue: 0,
      value: 0,
      isOccupational: false,
      isCustom: true,
      customName: "",
    })
  }

  return skills
}