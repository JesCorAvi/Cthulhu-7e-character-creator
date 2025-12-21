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
import { Save, ArrowLeft, BookOpen, Loader2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { LanguageSelector } from "@/components/language-selector"

interface CharacterFormProps {
  character: Character
  onBack: () => void
  onSave: () => void
}

export function CharacterForm({ character: initialCharacter, onBack, onSave }: CharacterFormProps) {
  const [character, setCharacter] = useState<Character>(initialCharacter)
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  
  const { t } = useLanguage()

  useEffect(() => {
    setSaved(false)
  }, [character])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await saveCharacter(character)
      setSaved(true)
      onSave() 
    } catch (error) {
      console.error("Error al guardar:", error)
      alert(t("error_save"))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} disabled={isSaving}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </Button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{character.name || t("new_investigator")}</h2>
            <Badge variant="outline" className="text-xs">
              {ERA_LABELS[character.era]}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isSaving}>
                <BookOpen className="h-4 w-4 mr-1" />
                {t("backstory_equipment")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("backstory_equipment")}</DialogTitle>
              </DialogHeader>
              <BackstoryEquipmentModal character={character} onChange={setCharacter} />
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleSave} size="sm" className="gap-1" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? t("saving") : saved ? t("saved") : t("save")}
          </Button>
        </div>
      </div>

      <CharacterSheet character={character} onChange={setCharacter} />
    </div>
  )
}