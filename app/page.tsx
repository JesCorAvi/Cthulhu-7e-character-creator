"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CharacterCard } from "@/components/character-card"
import { EraSelector } from "@/components/era-selector"
import { CharacterForm } from "@/components/character-form"
import { CharacterViewer } from "@/components/character-viewer"
import type { Character, CharacterEra } from "@/lib/character-types"
import { getCharacters, getCharacter, deleteCharacter } from "@/lib/character-storage"
import { createNewCharacter } from "@/lib/character-utils"
import { Plus, Users, Skull } from "lucide-react"

type View = "list" | "create" | "edit" | "view"

export default function HomePage() {
  const [view, setView] = useState<View>("list")
  const [characters, setCharacters] = useState<Character[]>([])
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null)

  useEffect(() => {
    setCharacters(getCharacters())
  }, [])

  const refreshCharacters = () => {
    setCharacters(getCharacters())
  }

  const handleCreateNew = (era: CharacterEra) => {
    const newChar = createNewCharacter(era)
    setCurrentCharacter(newChar)
    setView("edit")
  }

  const handleView = (id: string) => {
    const char = getCharacter(id)
    if (char) {
      setCurrentCharacter(char)
      setView("view")
    }
  }

  const handleEdit = (id: string) => {
    const char = getCharacter(id)
    if (char) {
      setCurrentCharacter(char)
      setView("edit")
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este personaje?")) {
      deleteCharacter(id)
      refreshCharacters()
    }
  }

  const handleBack = () => {
    setView("list")
    setCurrentCharacter(null)
    refreshCharacters()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skull className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Call of Cthulhu 7e</h1>
              <p className="text-xs text-muted-foreground">Creador de Personajes</p>
            </div>
          </div>
          {view === "list" && (
            <Button onClick={() => setView("create")}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Personaje
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Lista de personajes */}
        {view === "list" && (
          <div className="space-y-6">
            {characters.length === 0 ? (
              <div className="text-center py-16">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">No hay personajes</h2>
                <p className="text-muted-foreground mb-6">Crea tu primer investigador para comenzar tu aventura</p>
                <Button onClick={() => setView("create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Personaje
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">Tus Investigadores</h2>
                  <span className="text-sm text-muted-foreground">{characters.length} personaje(s)</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {characters.map((char) => (
                    <CharacterCard
                      key={char.id}
                      character={char}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Selector de era */}
        {view === "create" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Nuevo Investigador</h2>
              <p className="text-muted-foreground">Selecciona la época para tu personaje</p>
            </div>
            <EraSelector onSelect={handleCreateNew} />
            <div className="text-center">
              <Button variant="ghost" onClick={handleBack}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Formulario de edición */}
        {view === "edit" && currentCharacter && (
          <CharacterForm character={currentCharacter} onBack={handleBack} onSave={refreshCharacters} />
        )}

        {/* Vista del personaje */}
        {view === "view" && currentCharacter && (
          <CharacterViewer character={currentCharacter} onBack={handleBack} onEdit={() => setView("edit")} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Call of Cthulhu es una marca registrada de Chaosium Inc.
        </div>
      </footer>
    </div>
  )
}
