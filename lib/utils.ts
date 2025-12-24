import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        
        // LÓGICA DE REDIMENSIÓN (Alto fijo 400px, Ancho proporcional)
        const TARGET_HEIGHT = 400
        const scaleFactor = TARGET_HEIGHT / img.height
        const newWidth = img.width * scaleFactor

        canvas.width = newWidth
        canvas.height = TARGET_HEIGHT
        
        const ctx = canvas.getContext("2d")
        if (!ctx) {
            reject(new Error("No se pudo obtener el contexto del canvas"))
            return
        }

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, newWidth, TARGET_HEIGHT)
        
        // Convertir a JPEG con calidad 0.7 para ahorrar espacio en localStorage
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7) 
        resolve(dataUrl)
      }
      img.onerror = (error) => reject(error)
    }
    reader.onerror = (error) => reject(error)
  })
}