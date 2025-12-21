"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CharacterEra } from "@/lib/character-types"
import { Scroll, Building2, Castle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface EraSelectorProps {
  onSelect: (era: CharacterEra) => void
}

export function EraSelector({ onSelect }: EraSelectorProps) {
  const { t } = useLanguage()

  const eraData = [
    {
      era: "1920s" as CharacterEra,
      icon: Scroll,
      label: t("era_1920s"),
      description: t("desc_1920s"),
      color: "from-amber-900/20 to-amber-700/20 hover:from-amber-900/30 hover:to-amber-700/30 border-amber-700/50",
      disabled: false,
    },
    {
      era: "modern" as CharacterEra,
      icon: Building2,
      label: t("era_modern"),
      description: t("desc_modern"),
      color: "from-slate-800/20 to-slate-600/20 border-slate-600/50",
      disabled: true,
    },
    {
      era: "darkAges" as CharacterEra,
      icon: Castle,
      label: t("era_darkAges"),
      description: t("desc_darkAges"),
      color: "from-stone-900/20 to-stone-700/20 border-stone-600/50",
      disabled: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {eraData.map(({ era, icon: Icon, label, description, color, disabled }) => (
        <Card
          key={era}
          className={`relative transition-all duration-300 bg-gradient-to-br ${color} border-2 
            ${disabled ? "opacity-60 cursor-not-allowed grayscale-[0.5]" : "cursor-pointer hover:scale-[1.02]"}`}
          onClick={() => !disabled && onSelect(era)}
        >
          {disabled && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                {t("coming_soon")}
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center">
            <div className={`mx-auto mb-2 p-3 rounded-full bg-background/50 ${disabled ? "opacity-70" : ""}`}>
              <Icon className="h-8 w-8 text-foreground" />
            </div>
            <CardTitle className="text-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center text-muted-foreground">{description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}