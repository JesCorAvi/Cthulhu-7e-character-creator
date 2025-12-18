"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Character } from "@/lib/character-types"
import { ERA_LABELS } from "@/lib/character-types"
import { CharacterSheet } from "./character-sheet"
import { BackstoryEquipmentModal } from "./backstory-equipment-modal"
import { saveCharacter } from "@/lib/character-storage"
import { Save, ArrowLeft, BookOpen } from "lucide-react"

interface CharacterFormProps {
  character: Character
  onBack: () => void
  onSave: () => void
}

export function CharacterForm({ character: initialCharacter, onBack, onSave }: CharacterFormProps) {
  const [character, setCharacter] = useState<Character>(initialCharacter)
  const [saved, setSaved] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    setSaved(false)
  }, [character])

  const handleSave = () => {
    saveCharacter(character)
    setSaved(true)
    onSave()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{character.name || "Nuevo Investigador"}</h2>
            <Badge variant="outline" className="text-xs">
              {ERA_LABELS[character.era]}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-1" />
                Trasfondo y Equipo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Trasfondo y Equipo</DialogTitle>
              </DialogHeader>
              <BackstoryEquipmentModal character={character} onChange={setCharacter} />
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} size="sm" className="gap-1">
            <Save className="h-4 w-4" />
            {saved ? "Guardado" : "Guardar"}
          </Button>
        </div>
      </div>

      <CharacterSheet character={character} onChange={setCharacter} />
    </div>
  )
}
