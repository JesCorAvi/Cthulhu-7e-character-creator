"use client"
import { useEffect } from "react"

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/Cthulhu-7e-character-creator/sw.js", {
          scope: "/Cthulhu-7e-character-creator/",
        }) 
        .then((reg) => {
            console.log("SW registrado:", reg.scope);
        })
        .catch((err) => console.error("Error SW:", err));

      // Escuchar cambios de controlador (ocurre cuando el SW se actualiza y toma el control)
      // Esto recarga la página automáticamente para evitar errores de chunks rotos
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, [])

  return null
}