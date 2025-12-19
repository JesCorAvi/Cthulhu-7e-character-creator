// lib/occupation-utils.ts
import { Character, CharacteristicValue } from "./character-types";
import { OccupationFormula } from "./occupations-data";

export function calculateOccupationalPoints(
  character: Character,
  formula: OccupationFormula,
  selectedStat?: "STR" | "DEX" | "APP" | "POW" // Para fórmulas con elección
): number {
  const edu = character.characteristics.EDU.value;
  const str = character.characteristics.STR.value;
  const dex = character.characteristics.DEX.value;
  const app = character.characteristics.APP.value;
  const pow = character.characteristics.POW.value;

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
  return character.characteristics.INT.value * 2;
}

// Calcula cuántos puntos se han gastado ya en las habilidades
export function calculateSpentPoints(character: Character) {
  let occupationalSpent = 0;
  let personalSpent = 0;

  // IMPORTANTE: Necesitarás añadir un campo a tus Skills en character-types.ts
  // para saber cuántos puntos son "de ocupación" y cuántos "personales".
  // Por ahora, asumiremos que la UI maneja esto o que sumamos el total añadido sobre la base.
  
  // Como tu tipo Skill actual solo tiene 'value' y 'baseValue',
  // necesitaremos una forma de rastrear de dónde vienen los puntos.
  // SUGERENCIA: Añade 'occupationalPoints' y 'personalPoints' a la interfaz Skill.
  
  character.skills.forEach(skill => {
    // Esta lógica es provisional si no modificas el tipo Skill.
    // Lo ideal es modificar Skill para guardar { occupationalPoints: number, personalPoints: number }
    const addedPoints = skill.value - skill.baseValue;
    if (addedPoints > 0) {
      // Sin la distinción en el tipo, es difícil saber cuál es cuál.
      // Asumiremos para este ejemplo visual que el componente maneja el estado localmente
      // o que modificamos el tipo.
    }
  });

  return { occupationalSpent, personalSpent };
}