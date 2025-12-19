"use client" // Importante: esto indica que es código de cliente

import { useEffect } from "react"

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Registramos el SW que está en public/sw.js
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registrado con scope:", reg.scope))
        .catch((err) => console.error("Error al registrar Service Worker:", err))
    }
  }, [])

  return null // Este componente no renderiza nada visual
}