import type { Character } from "./character-types"
import * as drive from "./google-drive"

const STORAGE_KEY = "cthulhu_characters"
const PREF_STORAGE_MODE = "storage_mode_pref"

export type StorageMode = "local" | "cloud"

// Obtener modo actual
export const getStorageMode = (): StorageMode => {
    if (typeof window === "undefined") return "local"
    return (localStorage.getItem(PREF_STORAGE_MODE) as StorageMode) || "local"
}

// Guardar preferencia de modo
export const setStorageMode = (mode: StorageMode) => {
    localStorage.setItem(PREF_STORAGE_MODE, mode)
}

// AHORA ES ASÍNCRONO (Promise<void>)
export const saveCharacter = async (character: Character): Promise<void> => {
  const mode = getStorageMode();

  if (mode === 'cloud') {
      try {
          await drive.saveCharacterToDrive(character);
          return;
      } catch (e) {
          console.error("Error saving to Drive, falling back to local for safety", e);
          alert("Error guardando en Drive. Se intentará guardar en local.");
      }
  }

  // Fallback o modo local
  await saveToLocal(character);
}

// AHORA ES ASÍNCRONO (Promise<Character[]>)
export const getCharacters = async (): Promise<Character[]> => {
  const mode = getStorageMode();
  
  if (mode === 'cloud') {
      try {
          return await drive.getCharactersFromDrive();
      } catch (e) {
          console.error("Error fetching from Drive", e);
          return [];
      }
  }

  return getCharactersLocal();
}

// Helper interno síncrono para local
const getCharactersLocal = async (): Promise<Character[]> => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    try {
        return JSON.parse(stored)
    } catch {
        return []
    }
}

export const getCharacter = async (id: string): Promise<Character | null> => {
  const characters = await getCharacters()
  return characters.find((c) => c.id === id) || null
}

export const deleteCharacter = async (id: string): Promise<void> => {
  const mode = getStorageMode();
  
  if (mode === 'cloud') {
      await drive.deleteCharacterFromDrive(id);
      return;
  }

  await deleteFromLocal(id);
}

export const generateId = (): string => {
  return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// --- NUEVAS FUNCIONES EXPORTADAS PARA MIGRACIÓN ---

/** Guarda explícitamente en LocalStorage */
export const saveToLocal = async (character: Character): Promise<void> => {
  const characters = await getCharactersLocal()
  const existingIndex = characters.findIndex((c) => c.id === character.id)

  const charToSave = { ...character, updatedAt: Date.now() }

  if (existingIndex >= 0) {
    characters[existingIndex] = charToSave
  } else {
    characters.push(charToSave)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
}

/** Elimina explícitamente de LocalStorage */
export const deleteFromLocal = async (id: string): Promise<void> => {
    const characters = await getCharactersLocal()
    const newCharacters = characters.filter((c) => c.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCharacters))
}

/** Guarda explícitamente en Drive */
// CAMBIO: Ahora devuelve Promise<void> para ser consistente y evitar confusiones
export const saveToCloud = async (character: Character): Promise<void> => {
    await drive.saveCharacterToDrive(character);
}

/** Elimina explícitamente de Drive */
export const deleteFromCloud = async (id: string): Promise<void> => {
    await drive.deleteCharacterFromDrive(id);
}