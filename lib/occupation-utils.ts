import { Character } from "./character-types";
import { OccupationFormula } from "./occupations-data";

export function calculateOccupationalPoints(
  character: Character,
  formula: OccupationFormula,
  selectedStat?: "STR" | "DEX" | "APP" | "POW" // Para fórmulas con elección
): number {
  // Aseguramos que existan las características antes de acceder (fallback a 0)
  const edu = character.characteristics?.EDU?.value || 0;
  const str = character.characteristics?.STR?.value || 0;
  const dex = character.characteristics?.DEX?.value || 0;
  const app = character.characteristics?.APP?.value || 0;
  const pow = character.characteristics?.POW?.value || 0;

  switch (formula) {
    case "EDU*4":
      return edu * 4;
    case "EDU*2 + STR*2":
      return edu * 2 + str * 2;
    case "EDU*2 + DEX*2":
      return edu * 2 + dex * 2;
    case "EDU*2 + APP*2":
      return edu * 2 + app * 2;
    case "EDU*2 + POW*2":
      return edu * 2 + pow * 2;
    case "EDU*2 + (STR*2 or DEX*2)":
      // Si no se especifica, tomamos el mayor para mostrar el potencial máximo
      const bonusStatPhys = selectedStat 
        ? character.characteristics[selectedStat].value 
        : Math.max(str, dex);
      return edu * 2 + bonusStatPhys * 2;
    case "EDU*2 + (APP*2 or POW*2)":
      const bonusStatSoc = selectedStat 
        ? character.characteristics[selectedStat].value 
        : Math.max(app, pow);
      return edu * 2 + bonusStatSoc * 2;
    default:
      return 0;
  }
}

export function calculatePersonalInterestPoints(character: Character): number {
  return (character.characteristics?.INT?.value || 0) * 2;
}

// Calcula cuántos puntos se han gastado ya en las habilidades
export function calculateSpentPoints(character: Character) {
  let occupationalSpent = 0;
  let personalSpent = 0;

  if (character.skills) {
    character.skills.forEach(skill => {
      occupationalSpent += skill.occupationalPoints || 0;
      personalSpent += skill.personalPoints || 0;
    });
  }

  return { occupationalSpent, personalSpent };
}