"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CharacterCard } from "@/components/character-card"
import { EraSelector } from "@/components/era-selector"
import { CharacterForm } from "@/components/character-form"
import { CharacterViewer } from "@/components/character-viewer"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner" // Asegúrate de tener un componente spinner o usa un div con texto
import type { Character, CharacterEra } from "@/lib/character-types"
import { getCharacters, getCharacter, deleteCharacter, getStorageMode, setStorageMode, type StorageMode } from "@/lib/character-storage"
import { createNewCharacter } from "@/lib/character-utils"
import { initGoogleDrive, signInToGoogle, signOutFromGoogle } from "@/lib/google-drive"
import { Plus, Users, Skull, Cloud, HardDrive, LogOut } from "lucide-react"

type View = "list" | "create" | "edit" | "view"

export default function HomePage() {
  const [view, setView] = useState<View>("list")
  const [characters, setCharacters] = useState<Character[]>([])
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null)
  
  // Nuevos estados para Cloud
  const [loading, setLoading] = useState(true)
  const [storageMode, setStorageModeState] = useState<StorageMode>("local")
  const [isGoogleReady, setIsGoogleReady] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    // 1. Inicializar Drive API
    initGoogleDrive((success) => {
        setIsGoogleReady(success);
    });

    // 2. Cargar preferencia de almacenamiento
    const mode = getStorageMode();
    setStorageModeState(mode);
    
    // 3. Cargar personajes iniciales
    loadCharacters();
  }, [])

  const loadCharacters = async () => {
    setLoading(true)
    try {
        const chars = await getCharacters()
        setCharacters(chars)
    } finally {
        setLoading(false)
    }
  }

  const handleToggleStorage = async (checked: boolean) => {
      if (checked) {
          // Cambiar a Cloud
          if (!isGoogleReady) return alert("Google API no está lista aún.");
          try {
            await signInToGoogle();
            setStorageMode("cloud");
            setStorageModeState("cloud");
            // Opcional: obtener email del usuario para mostrarlo
            // const token = gapi.client.getToken(); ...
            loadCharacters();
          } catch (e) {
              console.error("Login fallido", e);
          }
      } else {
          // Cambiar a Local
          setStorageMode("local");
          setStorageModeState("local");
          loadCharacters();
      }
  }

  const handleCreateNew = (era: CharacterEra) => {
    const newChar = createNewCharacter(era)
    setCurrentCharacter(newChar)
    setView("edit")
  }

  const handleView = async (id: string) => {
    setLoading(true)
    const char = await getCharacter(id)
    setLoading(false)
    if (char) {
      setCurrentCharacter(char)
      setView("view")
    }
  }

  const handleEdit = async (id: string) => {
    setLoading(true)
    const char = await getCharacter(id)
    setLoading(false)
    if (char) {
      setCurrentCharacter(char)
      setView("edit")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este personaje?")) {
      setLoading(true)
      await deleteCharacter(id)
      await loadCharacters()
    }
  }

  const handleBack = () => {
    setView("list")
    setCurrentCharacter(null)
    loadCharacters() // Recargar para asegurar sincronización
  }

  const handleSaveCallback = async () => {
      // Esta función se pasa al form para que recargue después de guardar
      await loadCharacters();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skull className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Call of Cthulhu 7e</h1>
              <p className="text-xs text-muted-foreground">Creador de Personajes</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Storage Toggle */}
             {view === "list" && (
                 <div className="flex items-center gap-2 border p-2 rounded-lg bg-background/50">
                    {storageMode === 'local' ? <HardDrive className="h-4 w-4" /> : <Cloud className="h-4 w-4 text-blue-500" />}
                    <Switch 
                        checked={storageMode === 'cloud'}
                        onCheckedChange={handleToggleStorage}
                        id="storage-mode"
                    />
                    <Label htmlFor="storage-mode" className="text-xs cursor-pointer">
                        {storageMode === 'cloud' ? 'Google Drive' : 'Local Storage'}
                    </Label>
                 </div>
             )}

            {view === "list" && (
                <Button onClick={() => setView("create")}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo
                </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Cargando investigadores...</p>
            </div>
        ) : (
            <>
                {/* Lista de personajes */}
                {view === "list" && (
                <div className="space-y-6">
                    {characters.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">No hay personajes</h2>
                        <p className="text-muted-foreground mb-6">
                            {storageMode === 'cloud' 
                                ? "No hay personajes en tu Google Drive." 
                                : "Crea tu primer investigador para comenzar tu aventura"}
                        </p>
                        <Button onClick={() => setView("create")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Personaje
                        </Button>
                    </div>
                    ) : (
                    <>
                        <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground">Tus Investigadores ({storageMode === 'cloud' ? 'Nube' : 'Local'})</h2>
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
                // NOTA: Asegúrate de que CharacterForm use await saveCharacter() internamente
                // o pásale una función onSave que maneje la recarga
                <CharacterForm 
                    character={currentCharacter} 
                    onBack={handleBack} 
                    onSave={handleSaveCallback} 
                />
                )}

                {/* Vista del personaje */}
                {view === "view" && currentCharacter && (
                <CharacterViewer character={currentCharacter} onBack={handleBack} onEdit={() => setView("edit")} />
                )}
            </>
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