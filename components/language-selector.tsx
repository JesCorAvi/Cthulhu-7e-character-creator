"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex gap-2">
      <Button 
        variant={language === "es" ? "default" : "outline"} 
        size="sm" 
        onClick={() => setLanguage("es")}
      >
        ES
      </Button>
      <Button 
        variant={language === "en" ? "default" : "outline"} 
        size="sm" 
        onClick={() => setLanguage("en")}
      >
        EN
      </Button>
    </div>
  )
}