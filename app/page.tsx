"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { CharacterCard } from "@/components/character-card"
import { EraSelector } from "@/components/era-selector"
import { CharacterForm } from "@/components/character-form"
import { CharacterViewer } from "@/components/character-viewer"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Character, CharacterEra } from "@/lib/character-types"
import { getCharacters, getCharacter, deleteCharacter, getStorageMode, setStorageMode, type StorageMode } from "@/lib/character-storage"
import { createNewCharacter } from "@/lib/character-utils"
import { initGoogleDrive, signInToGoogle } from "@/lib/google-drive"
import { Plus, Users, Skull, Cloud, HardDrive, AlertCircle, RefreshCw } from "lucide-react"

type View = "list" | "create" | "edit" | "view"

export default function HomePage() {
  const [view, setView] = useState<View>("list")
  const [characters, setCharacters] = useState<Character[]>([])
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [storageMode, setStorageModeState] = useState<StorageMode>("local")
  const [isGoogleReady, setIsGoogleReady] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)

  // 1. Inicialización de la API de Google
  useEffect(() => {
    initGoogleDrive((success) => {
        setIsGoogleReady(success)
    })
    setStorageModeState(getStorageMode())
  }, [])

  // 2. Función segura de carga
  const loadCharacters = useCallback(async () => {
    setLoading(true)
    setNeedsLogin(false)
    try {
        const chars = await getCharacters()
        setCharacters(chars)
    } catch (error) {
        console.error("Error cargando personajes:", error)
    } finally {
        setLoading(false)
    }
  }, [])

  // 3. Lógica principal: Cuando Google está listo, decidir qué hacer
  useEffect(() => {
      const initializeSession = async () => {
          if (!isGoogleReady) return;

          const currentMode = getStorageMode();
          
          if (currentMode === 'cloud') {
              // CORRECCIÓN: No intentamos login automático aquí.
              // El navegador bloquearía el popup y daría error.
              // En su lugar, pedimos al usuario que reconecte manualmente.
              setNeedsLogin(true);
              setLoading(false);
          } else {
              // Si es local, cargamos directamente
              loadCharacters();
          }
      };

      initializeSession();
  }, [isGoogleReady, loadCharacters]) 

  // Manejador del Switch (Aquí SÍ podemos llamar a login porque es un clic del usuario)
  const handleToggleStorage = async (checked: boolean) => {
      setLoading(true);
      if (checked) {
          // Cambiar a Cloud
          if (!isGoogleReady) {
              alert("Google API no está lista aún.");
              setLoading(false);
              return; 
          }
          try {
            await signInToGoogle(); // Esto abrirá el popup (permitido por ser evento click)
            setStorageMode("cloud");
            setStorageModeState("cloud");
            setNeedsLogin(false);
            await loadCharacters();
          } catch (e) {
              console.error("Login fallido o cancelado", e);
              // Si cancelan el login, volvemos a local visualmente
              setStorageMode("local");
              setStorageModeState("local");
          } finally {
              setLoading(false);
          }
      } else {
          // Cambiar a Local
          setStorageMode("local");
          setStorageModeState("local");
          setNeedsLogin(false);
          await loadCharacters();
          setLoading(false);
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
    loadCharacters()
  }

  const handleSaveCallback = async () => {
      await loadCharacters()
  }

  // Este botón ahora es crucial: permite recuperar la sesión tras recargar
  const handleManualLogin = async () => {
      try {
          await signInToGoogle();
          setNeedsLogin(false);
          loadCharacters();
      } catch(e) {
          console.error("Error en login manual:", e);
      }
  }

  return (
    <div className="min-h-screen bg-background">
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
                <p className="text-muted-foreground">Conectando...</p>
            </div>
        ) : needsLogin && storageMode === 'cloud' ? (
            // Pantalla de Login Requerido
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-card/50">
                <Cloud className="h-16 w-16 text-blue-500 mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">Conectar con Google Drive</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Para ver y guardar tus personajes en la nube, necesitamos reconectar con tu cuenta de Google.
                </p>
                <Button onClick={handleManualLogin} size="lg" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Sincronizar ahora
                </Button>
            </div>
        ) : (
            <>
                {view === "list" && (
                <div className="space-y-6">
                    {characters.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-foreground mb-2">No hay personajes</h2>
                        <p className="text-muted-foreground mb-6">
                            {storageMode === 'cloud' 
                                ? "No se encontraron personajes en tu Drive." 
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

                {view === "edit" && currentCharacter && (
                <CharacterForm 
                    character={currentCharacter} 
                    onBack={handleBack} 
                    onSave={handleSaveCallback} 
                />
                )}

                {view === "view" && currentCharacter && (
                <CharacterViewer character={currentCharacter} onBack={handleBack} onEdit={() => setView("edit")} />
                )}
            </>
        )}
      </main>
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Call of Cthulhu es una marca registrada de Chaosium Inc.
        </div>
      </footer>
    </div>
  )
}