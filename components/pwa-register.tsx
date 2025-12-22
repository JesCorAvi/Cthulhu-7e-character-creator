"use client"
import { useEffect } from "react"

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
        }) 
        .then((reg) => {
            console.log("SW registrado:", reg.scope);
        })
        .catch((err) => console.error("Error SW:", err));

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