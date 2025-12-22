"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
  
  // Usamos useRef para tener acceso INSTANTÁNEO al estado 'saving' 
  // sin esperar a que React renderice el componente.
  const statusRef = useRef<'idle' | 'saving' | 'saved'>('saved')
  const isFirstRender = useRef(true)

  const { t } = useLanguage()

  // Helper para actualizar estado visual y referencia lógica al mismo tiempo
  const updateStatus = (newStatus: 'idle' | 'saving' | 'saved') => {
    setStatus(newStatus)
    statusRef.current = newStatus
  }

  // Wrapper para cualquier cambio en el personaje
  // Esto asegura que en el milisegundo que tocas una tecla, ya conste como "saving"
  const handleCharacterChange = useCallback((newCharacter: Character) => {
    setCharacter(newCharacter)
    if (statusRef.current !== 'saving') {
      updateStatus('saving')
    }
  }, []) // No dependencias para que sea estable

  // 1. Sincronización hacia arriba (Header)
  useEffect(() => {
    if (onChange) {
      onChange(character)
    }
  }, [character, onChange])

  // 2. Auto-guardado (Debounce 500ms)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Aseguramos que el estado sea 'saving' al entrar aquí (por si acaso)
    if (statusRef.current !== 'saving') updateStatus('saving')

    const timer = setTimeout(async () => {
      try {
        await saveCharacter(character)
        updateStatus('saved') // Guardado completado
        onSave()
      } catch (error) {
        console.error("Error al auto-guardar:", error)
        updateStatus('idle')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [character, onSave])

  // 3. Protección contra cierre de pestaña (SOLUCIÓN ROBUSTA)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Verificamos directamente la referencia, que está siempre actualizada
      if (statusRef.current === 'saving') {
        // Estándar moderno: preventDefault + returnValue
        e.preventDefault()
        e.returnValue = '' // Necesario para Chrome/Edge
      }
    }

    // Añadimos el evento a la ventana
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, []) // Se ejecuta una sola vez al montar

  // 4. Protección botón "Atrás" de la app
  const handleBackSafe = () => {
    if (statusRef.current === 'saving') { // Usamos ref para máxima seguridad
      const confirmLeave = window.confirm(t("unsaved_changes_warning") || "Se están guardando los cambios. ¿Seguro que quieres salir?")
      if (!confirmLeave) return
    }
    onBack()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackSafe}>
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
              {/* IMPORTANTE: Pasamos handleCharacterChange en lugar de setCharacter directo */}
              <BackstoryEquipmentModal character={character} onChange={handleCharacterChange} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* IMPORTANTE: Pasamos handleCharacterChange aquí también */}
      <CharacterSheet character={character} onChange={handleCharacterChange} />
    </div>
  )
}