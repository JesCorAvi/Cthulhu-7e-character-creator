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
        {/* CAMBIOS CLAVE:
           1. w-full: Asegura que el flex ocupe todo el ancho disponible.
           2. overflow-hidden: Evita desbordamientos extraños dentro del grid padre.
        */}
        <div className="flex items-start justify-between gap-3 w-full overflow-hidden">
          {/* CAMBIOS CLAVE:
             1. flex-1: Obliga a este div a ocupar el espacio sobrante.
             2. min-w-0: CRÍTICO. Permite que el flex-item se encoja por debajo de su contenido mínimo, activando el truncate.
          */}
          <div className="flex-1 min-w-0 space-y-1">
            <CardTitle 
              className="text-lg text-foreground truncate block" 
              title={character.name || "Sin nombre"}
            >
              {character.name || "Sin nombre"}
            </CardTitle>
            <p className="text-sm text-muted-foreground truncate block">
              {character.occupation || "Sin ocupación"}
            </p>
          </div>
          
          {/* shrink-0 evita que el badge se aplaste si el nombre es muy largo */}
          <Badge variant="secondary" className="text-xs shrink-0">
            {ERA_LABELS[character.era]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 text-center mb-4">
          <div>
            <p className="text-[10px] text-muted-foreground">FUE</p>
            <p className="font-bold text-sm text-foreground">{character.characteristics.STR.value}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">CON</p>
            <p className="font-bold text-sm text-foreground">{character.characteristics.CON.value}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">TAM</p>
            <p className="font-bold text-sm text-foreground">{character.characteristics.SIZ.value}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">DES</p>
            <p className="font-bold text-sm text-foreground">{character.characteristics.DEX.value}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">APA</p>
            <p className="font-bold text-sm text-foreground">{character.characteristics.APP.value}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">INT</p>
            <p className="font-bold text-sm text-foreground">{character.characteristics.INT.value}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">POD</p>
            <p className="font-bold text-sm text-foreground">{character.characteristics.POW.value}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">EDU</p>
            <p className="font-bold text-sm text-foreground">{character.characteristics.EDU.value}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">MOV</p>
            <p className="font-bold text-sm text-foreground">{character.characteristics.MOV}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">COR</p>
            <p className="font-bold text-sm text-foreground">
              {character.sanity.current}/{character.sanity.starting}
            </p>
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