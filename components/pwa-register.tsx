"use client"
import { useEffect } from "react"

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // AÑADIR EL NOMBRE DEL REPO AQUÍ
      navigator.serviceWorker
        .register("/cthulhu-7e-character-creator/sw.js") 
        .then((reg) => console.log("SW registrado:", reg.scope))
        .catch((err) => console.error("Error SW:", err))
    }
  }, [])

  return null
}