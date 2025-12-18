import type { Character } from "./character-types"

const STORAGE_KEY = "cthulhu_characters"

export const saveCharacter = (character: Character): void => {
  const characters = getCharacters()
  const existingIndex = characters.findIndex((c) => c.id === character.id)

  if (existingIndex >= 0) {
    characters[existingIndex] = character
  } else {
    characters.push(character)
  }

  // Guardar en localStorage (cookies tienen límite de 4KB)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
}

export const getCharacters = (): Character[] => {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export const getCharacter = (id: string): Character | null => {
  const characters = getCharacters()
  return characters.find((c) => c.id === id) || null
}

export const deleteCharacter = (id: string): void => {
  const characters = getCharacters().filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
}

export const generateId = (): string => {
  return `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
