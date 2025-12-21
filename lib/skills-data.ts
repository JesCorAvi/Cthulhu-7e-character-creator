import type { CharacterEra, Skill } from "./character-types"

export interface SkillDefinition {
  name: string
  nameEn: string // Nuevo campo para inglés
  baseValue: number | "special"
  isFieldHeader?: boolean
  fieldSlots?: number
  subSkills?: { name: string; nameEn: string; baseValue: number }[]
}

const skills1920sAndModern: SkillDefinition[] = [
  { name: "Antropología", nameEn: "Anthropology", baseValue: 1 },
  {
    name: "Armas de fuego",
    nameEn: "Firearms",
    baseValue: 0, 
    isFieldHeader: true,
    fieldSlots: 1,
    subSkills: [
      { name: "Arma corta", nameEn: "Handgun", baseValue: 20 },
      { name: "Fusil/Escopeta", nameEn: "Rifle/Shotgun", baseValue: 25 },
    ],
  },
  { name: "Arqueología", nameEn: "Archaeology", baseValue: 1 },
  { name: "Arte/Artesanía", nameEn: "Art/Craft", baseValue: 5, isFieldHeader: true, fieldSlots: 3 },
  { name: "Buscar libros", nameEn: "Library Use", baseValue: 20 },
  { name: "Cerrajería", nameEn: "Locksmith", baseValue: 1 },
  { name: "Charlatanería", nameEn: "Fast Talk", baseValue: 5 },
  { name: "Ciencia", nameEn: "Science", baseValue: 1, isFieldHeader: true, fieldSlots: 3 },
  { name: "Ciencias ocultas", nameEn: "Occult", baseValue: 5 },
  {
    name: "Combatir",
    nameEn: "Fighting",
    baseValue: 0, 
    isFieldHeader: true,
    fieldSlots: 2,
    subSkills: [{ name: "Pelea", nameEn: "Brawl", baseValue: 25 }],
  },
  { name: "Conducir automóvil", nameEn: "Drive Auto", baseValue: 20 },
  { name: "Conducir maquinaria", nameEn: "Op. Hv. Machine", baseValue: 1 },
  { name: "Contabilidad", nameEn: "Accounting", baseValue: 5 },
  { name: "Crédito", nameEn: "Credit Rating", baseValue: 0 },
  { name: "Derecho", nameEn: "Law", baseValue: 5 },
  { name: "Descubrir", nameEn: "Spot Hidden", baseValue: 25 },
  { name: "Disfrazarse", nameEn: "Disguise", baseValue: 5 },
  { name: "Electricidad", nameEn: "Elec. Repair", baseValue: 10 },
  { name: "Encanto", nameEn: "Charm", baseValue: 15 },
  { name: "Equitación", nameEn: "Ride", baseValue: 5 },
  { name: "Escuchar", nameEn: "Listen", baseValue: 20 },
  { name: "Esquivar", nameEn: "Dodge", baseValue: "special" },
  { name: "Historia", nameEn: "History", baseValue: 5 },
  { name: "Intimidar", nameEn: "Intimidate", baseValue: 15 },
  { name: "Juego de manos", nameEn: "Sleight of Hand", baseValue: 10 },
  { name: "Lanzar", nameEn: "Throw", baseValue: 20 },
  { name: "Lengua propia", nameEn: "Language (Own)", baseValue: "special", isFieldHeader: true, fieldSlots: 1 },
  { name: "Otras lenguas", nameEn: "Language (Other)", baseValue: 1, isFieldHeader: true, fieldSlots: 3 },
  { name: "Mecánica", nameEn: "Mech. Repair", baseValue: 10 },
  { name: "Medicina", nameEn: "Medicine", baseValue: 1 },
  { name: "Mitos de Cthulhu", nameEn: "Cthulhu Mythos", baseValue: 0 },
  { name: "Nadar", nameEn: "Swim", baseValue: 20 },
  { name: "Naturaleza", nameEn: "Natural World", baseValue: 10 },
  { name: "Orientarse", nameEn: "Navigate", baseValue: 10 },
  { name: "Persuasión", nameEn: "Persuade", baseValue: 10 },
  { name: "Pilotar", nameEn: "Pilot", baseValue: 1, isFieldHeader: true, fieldSlots: 1 },
  { name: "Primeros auxilios", nameEn: "First Aid", baseValue: 30 },
  { name: "Psicoanálisis", nameEn: "Psychoanalysis", baseValue: 1 },
  { name: "Psicología", nameEn: "Psychology", baseValue: 10 },
  { name: "Saltar", nameEn: "Jump", baseValue: 20 },
  { name: "Seguir rastros", nameEn: "Track", baseValue: 10 },
  { name: "Sigilo", nameEn: "Stealth", baseValue: 20 },
  { name: "Supervivencia", nameEn: "Survival", baseValue: 10, isFieldHeader: true, fieldSlots: 1 },
  { name: "Tasación", nameEn: "Appraise", baseValue: 5 },
  { name: "Trepar", nameEn: "Climb", baseValue: 20 },
]

const modernOnlySkills: SkillDefinition[] = [
  { name: "Electrónica", nameEn: "Electronics", baseValue: 1 },
  { name: "Informática", nameEn: "Computers", baseValue: 5 },
]

const skillsDarkAges: SkillDefinition[] = [
  {
    name: "Armas a distancia",
    nameEn: "Ranged Weapons",
    baseValue: 0,
    isFieldHeader: true,
    fieldSlots: 2,
    subSkills: [{ name: "Arte/Artesanía", nameEn: "Art/Craft", baseValue: 5 }],
  },
  { name: "Buscar libros", nameEn: "Library Use", baseValue: 5 },
  { name: "Charlatanería", nameEn: "Fast Talk", baseValue: 5 },
  { name: "Ciencia", nameEn: "Science", baseValue: 1, isFieldHeader: true, fieldSlots: 2 },
  { name: "Ciencias ocultas", nameEn: "Occult", baseValue: 5 },
  {
    name: "Combatir",
    nameEn: "Fighting",
    baseValue: 0,
    isFieldHeader: true,
    fieldSlots: 3,
    subSkills: [{ name: "Pelea", nameEn: "Brawl", baseValue: 25 }],
  },
  { name: "Conducir animales de tiro", nameEn: "Drive", baseValue: 20 },
  { name: "Contabilidad", nameEn: "Accounting", baseValue: 10 },
  { name: "Descubrir", nameEn: "Spot Hidden", baseValue: 25 },
  { name: "Encanto", nameEn: "Charm", baseValue: 15 },
  { name: "Equitación", nameEn: "Ride", baseValue: 5 },
  { name: "Escuchar", nameEn: "Listen", baseValue: 25 },
  { name: "Esquivar", nameEn: "Dodge", baseValue: "special" },
  { name: "Historia", nameEn: "History", baseValue: 5 },
  { name: "Intimidar", nameEn: "Intimidate", baseValue: 15 },
  { name: "Juego de manos", nameEn: "Sleight of Hand", baseValue: 25 },
  { name: "Lanzar", nameEn: "Throw", baseValue: 25 },
  { name: "Leer/Escribir", nameEn: "Read/Write", baseValue: 1, isFieldHeader: true, fieldSlots: 2 },
  { name: "Lengua propia", nameEn: "Language (Own)", baseValue: "special", isFieldHeader: true, fieldSlots: 1 },
  { name: "Otras lenguas", nameEn: "Language (Other)", baseValue: 1, isFieldHeader: true, fieldSlots: 2 },
  { name: "Medicina", nameEn: "Medicine", baseValue: 1 },
  { name: "Mitos de Cthulhu", nameEn: "Cthulhu Mythos", baseValue: 0 },
  { name: "Nadar", nameEn: "Swim", baseValue: 25 },
  { name: "Naturaleza", nameEn: "Natural World", baseValue: 20, isFieldHeader: true, fieldSlots: 2 },
  { name: "Orientarse", nameEn: "Navigate", baseValue: 10 },
  { name: "Otros reinos", nameEn: "Other Kingdoms", baseValue: 10, isFieldHeader: true, fieldSlots: 2 },
  { name: "Perspicacia", nameEn: "Insight", baseValue: 5 },
  { name: "Pilotar (Embarcación)", nameEn: "Pilot (Boat)", baseValue: 1 },
  { name: "Posición social", nameEn: "Status", baseValue: 0 },
  { name: "Primeros auxilios", nameEn: "First Aid", baseValue: 30 },
  { name: "Reino propio", nameEn: "Kingdom (Own)", baseValue: 20, isFieldHeader: true, fieldSlots: 1 },
  { name: "Religión", nameEn: "Religion", baseValue: 20 },
  { name: "Reparar y construir", nameEn: "Craft/Repair", baseValue: 20 },
  { name: "Saltar", nameEn: "Jump", baseValue: 25 },
  { name: "Seguir rastros", nameEn: "Track", baseValue: 10, isFieldHeader: true, fieldSlots: 2 },
  { name: "Sigilo", nameEn: "Stealth", baseValue: 20 },
  { name: "Persuasión", nameEn: "Persuade", baseValue: 15 },
  { name: "Psicología", nameEn: "Psychology", baseValue: 10 },
  { name: "Tasación", nameEn: "Appraise", baseValue: 5 },
  { name: "Trato con animales", nameEn: "Animal Handling", baseValue: 15 },
  { name: "Trepar", nameEn: "Climb", baseValue: 20 },
]

export const getSkillDefinitionsForEra = (era: CharacterEra): SkillDefinition[] => {
  if (era === "darkAges") {
    return skillsDarkAges
  } else if (era === "modern") {
    const skills = [...skills1920sAndModern]
    const elecIndex = skills.findIndex((s) => s.name === "Electricidad")
    if (elecIndex !== -1) skills.splice(elecIndex + 1, 0, modernOnlySkills[0])
    const histIndex = skills.findIndex((s) => s.name === "Historia")
    if (histIndex !== -1) skills.splice(histIndex + 1, 0, modernOnlySkills[1])
    return skills
  }
  return skills1920sAndModern
}

export const getBaseSkillsForEra = (era: CharacterEra, language: "es" | "en" = "es"): Skill[] => {
  const definitions = getSkillDefinitionsForEra(era)
  const skills: Skill[] = []

  for (const def of definitions) {
    const displayName = language === "en" ? def.nameEn : def.name

    if (def.isFieldHeader) {
      skills.push({
        name: displayName,
        baseValue: typeof def.baseValue === "number" ? def.baseValue : 0,
        value: typeof def.baseValue === "number" ? def.baseValue : 0,
        isOccupational: false,
        isFieldHeader: true,
      })
      if (def.subSkills) {
        for (const sub of def.subSkills) {
          const subDisplayName = language === "en" ? sub.nameEn : sub.name
          skills.push({
            name: `${displayName}: ${subDisplayName}`,
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
          name: displayName,
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
        name: displayName,
        baseValue: typeof def.baseValue === "number" ? def.baseValue : 0,
        value: typeof def.baseValue === "number" ? def.baseValue : 0,
        isOccupational: false,
        isSpecialCalc: def.baseValue === "special",
      })
    }
  }

  // Añadir 6 habilidades personalizadas vacías
  const customLabel = language === "en" ? "Custom Skill" : "Habilidad personalizada"
  for (let i = 0; i < 6; i++) {
    skills.push({
      name: customLabel,
      baseValue: 0,
      value: 0,
      isOccupational: false,
      isCustom: true,
      customName: "",
    })
  }

  return skills
}