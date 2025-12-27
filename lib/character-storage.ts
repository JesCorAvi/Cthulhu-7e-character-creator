import { Character } from "./character-types";
import { saveCharacterToCloud, getMyCharacters, deleteCloudCharacter } from "@/actions/character-actions";

export type StorageMode = 'local' | 'cloud';

const STORAGE_KEY = 'cthulhu_characters';

// --- Funciones Internas de LocalStorage ---
function getLocalCharacters(): Character[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error parsing local characters", e);
    return [];
  }
}

function saveLocalCharacter(character: Character) {
  const characters = getLocalCharacters();
  const index = characters.findIndex(c => c.id === character.id);
  
  if (index >= 0) {
    characters[index] = character;
  } else {
    characters.push(character);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

// --- Funciones Públicas ("Smart") ---

/**
 * Guarda el personaje en la nube (si está logueado) o en local (si no).
 */
export async function saveCharacterSmart(character: Character, isAuthenticated: boolean) {
  if (isAuthenticated) {
    return await saveCharacterToCloud(character);
  } else {
    saveLocalCharacter(character);
    return { success: true };
  }
}

/**
 * Carga los personajes.
 * Si isAuthenticated = true, carga desde D1.
 * Si isAuthenticated = false, carga desde LocalStorage.
 */
export async function loadCharactersSmart(isAuthenticated: boolean): Promise<Character[]> {
  if (isAuthenticated) {
    const cloudChars = await getMyCharacters();
    // Aseguramos que lo que viene de la BD se trate como Character[]
    return cloudChars as Character[];
  } else {
    return getLocalCharacters();
  }
}

/**
 * Elimina un personaje.
 */
export async function deleteCharacterSmart(id: string, isAuthenticated: boolean) {
  if (isAuthenticated) {
    return await deleteCloudCharacter(id);
  } else {
    const characters = getLocalCharacters().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
    return { success: true };
  }
}

/**
 * Función auxiliar para migrar todos los personajes locales a la nube.
 * Se usará cuando el usuario haga clic en "Migrar" tras loguearse.
 */
export async function migrateLocalToCloud() {
  const localChars = getLocalCharacters();
  if (localChars.length === 0) return { count: 0 };

  let count = 0;
  for (const char of localChars) {
    // Forzamos un ID nuevo si es necesario, o mantenemos el existente
    await saveCharacterToCloud(char);
    count++;
  }
  
  // Opcional: Borrar locales tras migrar con éxito
  localStorage.removeItem(STORAGE_KEY);
  
  return { count };
}