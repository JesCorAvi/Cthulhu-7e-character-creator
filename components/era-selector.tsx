"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { CharacterEra } from "@/lib/character-types"
import { ERA_LABELS } from "@/lib/character-types"
import { Scroll, Building2, Castle } from "lucide-react"

interface EraSelectorProps {
  onSelect: (era: CharacterEra) => void
}

const eraData = [
  {
    era: "1920s" as CharacterEra,
    icon: Scroll,
    description: "La época clásica de los investigadores de lo oculto. Jazz, prohibición y misterios ancestrales.",
    color: "from-amber-900/20 to-amber-700/20 hover:from-amber-900/30 hover:to-amber-700/30 border-amber-700/50",
    disabled: false,
  },
  {
    era: "modern" as CharacterEra,
    icon: Building2,
    description: "Era moderna con tecnología actual. Internet, globalización y horrores contemporáneos.",
    color: "from-slate-800/20 to-slate-600/20 border-slate-600/50",
    disabled: true,
  },
  {
    era: "darkAges" as CharacterEra,
    icon: Castle,
    description: "La Edad Oscura medieval. Superstición, fe y antiguos males acechando en las sombras.",
    color: "from-stone-900/20 to-stone-700/20 border-stone-600/50",
    disabled: true,
  },
]

export function EraSelector({ onSelect }: EraSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {eraData.map(({ era, icon: Icon, description, color, disabled }) => (
        <Card
          key={era}
          className={`relative transition-all duration-300 bg-gradient-to-br ${color} border-2 
            ${disabled ? "opacity-60 cursor-not-allowed grayscale-[0.5]" : "cursor-pointer hover:scale-[1.02]"}`}
          onClick={() => !disabled && onSelect(era)}
        >
          {disabled && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                Próximamente
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center">
            <div className={`mx-auto mb-2 p-3 rounded-full bg-background/50 ${disabled ? "opacity-70" : ""}`}>
              <Icon className="h-8 w-8 text-foreground" />
            </div>
            <CardTitle className="text-foreground">{ERA_LABELS[era]}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center text-muted-foreground">{description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}