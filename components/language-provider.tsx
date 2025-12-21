"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type Language = "es" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

// Diccionario simple de traducciones UI generales
const translations = {
  es: {
    "str": "FUE", "dex": "DES", "pow": "POD", "con": "CON", "app": "APA", "edu": "EDU", "siz": "TAM", "int": "INT",
    "mov": "MOV", "db": "Bon. Daño", "build": "Corpulencia", "dodge": "Esquivar",
    "half": "½", "fifth": "⅕"
  },
  en: {
    "str": "STR", "dex": "DEX", "pow": "POW", "con": "CON", "app": "APP", "edu": "EDU", "siz": "SIZ", "int": "INT",
    "mov": "MOV", "db": "Damage Bonus", "build": "Build", "dodge": "Dodge",
    "half": "½", "fifth": "⅕"
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("es")

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations["es"]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider")
  return context
}