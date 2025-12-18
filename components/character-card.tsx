"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Character } from "@/lib/character-types"
import { ERA_LABELS } from "@/lib/character-types"
import { Trash2, Eye, Edit } from "lucide-react"

interface CharacterCardProps {
  character: Character
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function CharacterCard({ character, onView, onEdit, onDelete }: CharacterCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-foreground">{character.name || "Sin nombre"}</CardTitle>
            <p className="text-sm text-muted-foreground">{character.occupation || "Sin ocupación"}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {ERA_LABELS[character.era]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 text-center mb-4">
          <div>
            <p className="text-xs text-muted-foreground">FUE</p>
            <p className="font-bold text-foreground">{character.characteristics.STR.value}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CON</p>
            <p className="font-bold text-foreground">{character.characteristics.CON.value}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">POD</p>
            <p className="font-bold text-foreground">{character.characteristics.POW.value}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">COR</p>
            <p className="font-bold text-foreground">{character.sanity.current}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onView(character.id)}>
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={() => onEdit(character.id)}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(character.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
