import pako from "pako";
import { Character } from "./character-types";

/**
 * Comprime el personaje a una cadena muy corta usando Zlib (pako)
 * y codificación base64 segura para URLs.
 */
export function generateCharacterCode(character: Character): string {
  try {
    const jsonString = JSON.stringify(character);
    // 1. Convertir string a Uint8Array
    const data = new TextEncoder().encode(jsonString);
    // 2. Comprimir con nivel máximo
    const compressed = pako.deflate(data, { level: 9 });
    // 3. Convertir a Base64 seguro para URL (reemplazando + / =)
    const base64 = btoa(String.fromCharCode(...compressed))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return base64;
  } catch (error) {
    console.error("Error comprimiendo:", error);
    return "";
  }
}

export function parseCharacterCode(code: string): Character | null {
  try {
    // 1. Revertir Base64 seguro para URL
    let base64 = code.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) base64 += "=";
    
    // 2. Decodificar a binario
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    // 3. Descomprimir
    const decompressed = pako.inflate(bytes);
    const jsonString = new TextDecoder().decode(decompressed);
    
    return JSON.parse(jsonString) as Character;
  } catch (error) {
    console.error("Error al importar el código:", error);
    return null;
  }
}

export function getShareUrl(code: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("d", code); // Usamos "d" en lugar de "data" para ahorrar más espacio
  return url.toString();
}