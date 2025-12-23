"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CharacterCard } from "@/components/character-card"
import { EraSelector } from "@/components/era-selector"
import { CharacterForm } from "@/components/character-form"
import { CharacterViewer } from "@/components/character-viewer"
import { Header } from "@/components/layout/header"
import type { Character, CharacterEra } from "@/lib/character-types"
import { getCharacters, getCharacter, deleteCharacter, getStorageMode, setStorageMode, type StorageMode } from "@/lib/character-storage"
import { createNewCharacter } from "@/lib/character-utils"
// IMPORTANTE: Importamos checkSessionActive
import { initGoogleDrive, signInToGoogle, checkSessionActive } from "@/lib/google-drive"
import { parseCharacterCode } from "@/lib/sharing"
import { Plus, Users, Cloud, RefreshCw, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function CharacterApp() {
  const [view, setView] = useState<"list" | "create" | "edit" | "view">("list")
  const [characters, setCharacters] = useState<Character[]>([])
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [storageMode, setStorageModeState] = useState<StorageMode>("local")
  const [isGoogleReady, setIsGoogleReady] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [charToDelete, setCharToDelete] = useState<string | null>(null)
  
  const { t } = useLanguage()
  const searchParams = useSearchParams()

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

  // 1. Inicialización
  useEffect(() => {
    initGoogleDrive((success) => setIsGoogleReady(success))
    
    const savedMode = getStorageMode()
    setStorageModeState(savedMode)

    if (searchParams.get("d") || searchParams.get("data")) return 

    // Si es local, cargar inmediatamente
    if (savedMode === 'local') {
        loadCharacters()
    }
  }, [loadCharacters, searchParams])

  // 2. Importación URL
  useEffect(() => {
    const code = searchParams.get("d") || searchParams.get("data")
    if (code) {
      const importedChar = parseCharacterCode(code)
      if (importedChar) {
        setCurrentCharacter(importedChar)
        setView("view")
        setLoading(false)
        toast.success(t("character_imported_url"))
        window.history.replaceState({}, "", window.location.pathname)
      }
    }
  }, [searchParams, t])

  // 3. Reacción a Google Ready (CORREGIDO)
  useEffect(() => {
    if (!isGoogleReady) return
    if (searchParams.get("d") || searchParams.get("data")) return 

    const currentMode = getStorageMode()
    
    if (currentMode === 'cloud') {
        // CORRECCIÓN: Comprobamos si la sesión se restauró automáticamente
        if (checkSessionActive()) {
            setNeedsLogin(false)
            loadCharacters()
        } else {
            // Solo si no hay sesión válida pedimos login
            setNeedsLogin(true)
            setLoading(false)
        }
    }
  }, [isGoogleReady, searchParams, loadCharacters])

  const handleToggleStorage = async (checked: boolean) => {
    if (checked) {
      try {
        await signInToGoogle()
        setLoading(true) 
        setStorageMode("cloud")
        setStorageModeState("cloud")
        setNeedsLogin(false)
        await loadCharacters()
      } catch (e: any) {
        console.error("Google Login Error:", e)
        if (e?.type === 'popup_blocked_by_browser' || e?.type === 'popup_closed_by_user') {
            toast.error(t("popup_blocked_title"), { description: t("popup_blocked_desc") })
        } else {
            toast.error(t("error_save"), { description: "Error connecting to Google Drive" })
        }
        setStorageMode("local")
        setStorageModeState("local")
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      setStorageMode("local")
      setStorageModeState("local")
      setNeedsLogin(false)
      await loadCharacters()
      setLoading(false)
    }
  }

  const handleManualLogin = async () => {
    try {
        await signInToGoogle()
        await loadCharacters()
    } catch (e: any) {
        toast.error("Error de conexión")
    }
  }

  const handleCreateNew = (era: CharacterEra) => {
    const newChar = createNewCharacter(era, t("unarmed"))
    setCurrentCharacter(newChar)
    setView("edit")
  }

  const handleBack = () => {
    setView("list")
    setCurrentCharacter(null)
    loadCharacters()
  }

  const requestDelete = (id: string) => {
    setCharToDelete(id)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (charToDelete) {
      try {
        await deleteCharacter(charToDelete)
        await loadCharacters()
        toast.success(t("character_deleted"))
      } catch (error) {
        toast.error("Error al eliminar")
      } finally {
        setIsDeleteOpen(false)
        setCharToDelete(null)
      }
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <Header 
        character={currentCharacter} 
        showShare={view === "edit" || view === "view"} 
        storageMode={storageMode}
        onStorageChange={handleToggleStorage}
        isGoogleReady={isGoogleReady}
      />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        {loading && !currentCharacter ? (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">{t("connecting")}</p>
            </div>
        ) : needsLogin && storageMode === 'cloud' && !currentCharacter ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-xl bg-card/50">
                <Cloud className="h-16 w-16 text-blue-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">{t("login_required")}</h2>
                <Button onClick={handleManualLogin} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> {t("sync_now")}
                </Button>
            </div>
        ) : (
            <>
                {view === "list" && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-serif font-bold text-foreground">
                            {t("your_investigators")}
                        </h2>
                        <Button onClick={() => setView("create")} size="sm" className="shadow-md">
                            <Plus className="h-4 w-4 mr-2" /> {t("new")}
                        </Button>
                    </div>

                    {characters.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-stone-50/50 dark:bg-stone-900/20">
                            <Users className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                            <h2 className="text-xl font-bold mb-2">{t("no_characters")}</h2>
                            <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                                {storageMode === 'cloud' ? t("no_characters_cloud") : t("no_characters_local")}
                            </p>
                            <Button onClick={() => setView("create")} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-all">
                              <Plus className="h-4 w-4 mr-2" /> {t("create_char_button")}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {characters.map((char) => (
                                <CharacterCard 
                                  key={char.id} 
                                  character={char} 
                                  onView={(id) => getCharacter(id).then(c => {setCurrentCharacter(c); setView("view")})}
                                  onEdit={(id) => getCharacter(id).then(c => {setCurrentCharacter(c); setView("edit")})}
                                  onDelete={requestDelete} 
                                />
                            ))}
                        </div>
                    )}
                </div>
                )}

                {view === "create" && (
                    <div className="max-w-4xl mx-auto space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-serif font-bold mb-2">{t("new_investigator")}</h2>
                            <p className="text-muted-foreground">{t("select_era")}</p>
                        </div>
                        <EraSelector onSelect={handleCreateNew} />
                        <div className="text-center">
                          <Button variant="ghost" onClick={handleBack} className="text-muted-foreground underline">{t("cancel")}</Button>
                        </div>
                    </div>
                )}

                {view === "edit" && currentCharacter && (
                    <CharacterForm 
                      character={currentCharacter} 
                      onBack={handleBack} 
                      onSave={loadCharacters} 
                      onChange={setCurrentCharacter}
                    />
                )}

                {view === "view" && currentCharacter && (
                    <CharacterViewer character={currentCharacter} onBack={handleBack} onEdit={() => setView("edit")} />
                )}
            </>
        )}

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("delete_confirm_title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("delete_confirm")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                <Trash2 className="w-4 h-4 mr-2" />
                {t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin" /></div>}>
      <CharacterApp />
    </Suspense>
  )
}