"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip" //
import type { Character } from "@/lib/character-types"
import { ERA_LABELS } from "@/lib/character-types"
import { CharacterSheet } from "./character-sheet"
import { BackstoryEquipmentModal } from "./backstory-equipment-modal"
import { saveCharacter } from "@/lib/character-storage"
import { ArrowLeft, BookOpen, Loader2, Cloud } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface CharacterFormProps {
  character: Character
  onBack: () => void
  onSave: () => void
  onChange?: (updatedCharacter: Character) => void
}

export function CharacterForm({ character: initialCharacter, onBack, onSave, onChange }: CharacterFormProps) {
  const [character, setCharacter] = useState<Character>(initialCharacter)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('saved')
  const [modalOpen, setModalOpen] = useState(false)
  
  const statusRef = useRef<'idle' | 'saving' | 'saved'>('saved')
  const isFirstRender = useRef(true)

  const { t } = useLanguage()

  const updateStatus = (newStatus: 'idle' | 'saving' | 'saved') => {
    setStatus(newStatus)
    statusRef.current = newStatus
  }

  const handleCharacterChange = useCallback((newCharacter: Character) => {
    setCharacter(newCharacter)
    if (statusRef.current !== 'saving') {
      updateStatus('saving')
    }
  }, [])

  useEffect(() => {
    if (onChange) {
      onChange(character)
    }
  }, [character, onChange])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (statusRef.current !== 'saving') updateStatus('saving')

    const timer = setTimeout(async () => {
      try {
        await saveCharacter(character)
        updateStatus('saved')
        onSave()
      } catch (error) {
        console.error("Error al auto-guardar:", error)
        updateStatus('idle')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [character, onSave])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (statusRef.current === 'saving') {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const handleBackSafe = () => {
    if (statusRef.current === 'saving') {
      const confirmLeave = window.confirm(t("unsaved_changes_warning") || "Se están guardando los cambios. ¿Seguro que quieres salir?")
      if (!confirmLeave) return
    }
    onBack()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {/* LÓGICA MODIFICADA: Botón Atrás con Tooltip si está guardando */}
          {status === 'saving' ? (
            <Tooltip>
              <TooltipTrigger asChild>
                {/* Envolvemos en un span porque el botón disabled ignora eventos de ratón */}
                <span className="cursor-not-allowed" tabIndex={0}>
                  <Button variant="ghost" size="sm" disabled>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {t("back")}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("wait_saving") || "Espere a que los datos se guarden"}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleBackSafe}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t("back")}
            </Button>
          )}

          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{character.name || t("new_investigator")}</h2>
            <Badge variant="outline" className="text-xs">
              {ERA_LABELS[character.era]}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Indicador de Estado */}
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-muted/50 rounded-full select-none transition-all">
            {status === 'saving' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span>{t("saving")}...</span>
              </>
            ) : status === 'saved' ? (
              <>
                <Cloud className="h-3 w-3 text-primary" />
                <span>{t("saved")}</span>
              </>
            ) : (
              <span>...</span>
            )}
          </div>

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <BookOpen className="h-4 w-4 mr-1" />
                {t("backstory_equipment")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("backstory_equipment")}</DialogTitle>
              </DialogHeader>
              <BackstoryEquipmentModal character={character} onChange={handleCharacterChange} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <CharacterSheet character={character} onChange={handleCharacterChange} />
    </div>
  )
}