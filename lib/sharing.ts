import LZString from "lz-string"
import { Character } from "./character-types"

export function generateCharacterCode(character: Character): string {
  try {
    const jsonString = JSON.stringify(character)
    // Comprime a una cadena segura para URLs
    return LZString.compressToEncodedURIComponent(jsonString)
  } catch (error) {
    console.error("Error generating code:", error)
    return ""
  }
}

export function parseCharacterCode(code: string): Character | null {
  try {
    // Descomprime
    const jsonString = LZString.decompressFromEncodedURIComponent(code)
    if (!jsonString) return null
    return JSON.parse(jsonString) as Character
  } catch (error) {
    console.error("Error parsing code:", error)
    return null
  }
}

export function getShareUrl(code: string): string {
  if (typeof window === "undefined") return ""
  const url = new URL(window.location.href)
  url.searchParams.set("data", code)
  return url.toString()
}