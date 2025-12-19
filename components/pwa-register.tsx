"use client"
import { useEffect } from "react"

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/Cthulhu-7e-character-creator/sw.js", {
          scope: "/Cthulhu-7e-character-creator/",
        }) 
        .then((reg) => console.log("SW registrado:", reg.scope))
        .catch((err) => console.error("Error SW:", err))
    }
  }, [])

  return null
}