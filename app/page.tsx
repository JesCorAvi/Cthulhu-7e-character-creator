"use client"

import { useState, useEffect, useCallback, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { CharacterCard } from "@/components/character-card"
import { EraSelector } from "@/components/era-selector"
import { CharacterForm } from "@/components/character-form"
import { CharacterViewer } from "@/components/character-viewer"
import { Header } from "@/components/layout/header"
import type { Character, CharacterEra } from "@/lib/character-types"
import { ERA_LABELS } from "@/lib/character-types"
import { 
    getCharacters, getCharacter, deleteCharacter, 
    getStorageMode, setStorageMode, 
    saveToLocal, saveToCloud, deleteFromLocal, deleteFromCloud,
    type StorageMode 
} from "@/lib/character-storage"
import { createNewCharacter } from "@/lib/character-utils"
import { initGoogleDrive, signInToGoogle, checkSessionActive } from "@/lib/google-drive"
import { parseCharacterCode } from "@/lib/sharing"
import { Plus, Users, Cloud, RefreshCw, Trash2, Search, ArrowUpDown, HardDrive, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"
import { PopupBlockedModal } from "@/components/popup-blocked-modal"

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

type SortOrder = "newest" | "oldest" | "alpha"
type ViewMode = "list" | "create" | "edit" | "view"

function CharacterApp() {
  const [view, setView] = useState<ViewMode>("list")
  const [characters, setCharacters] = useState<Character[]>([])
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [storageMode, setStorageModeState] = useState<StorageMode>("local")
  const [isGoogleReady, setIsGoogleReady] = useState(false)
  const [needsLogin, setNeedsLogin] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [eraFilter, setEraFilter] = useState<CharacterEra | "all">("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [charToDelete, setCharToDelete] = useState<string | null>(null)
  
  // Estados para MIGRACIÓN
  const [isMigrateOpen, setIsMigrateOpen] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [isPopupBlockedOpen, setIsPopupBlockedOpen] = useState(false)
  
  // NUEVO: Control de estado sucio (saving) y navegación manual
  const isDirtyRef = useRef(false)
  const isManualBackRef = useRef(false)
  
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

  // -----------------------------------------------------------------------
  // LÓGICA DE NAVEGACIÓN (History API + Dirty Check)
  // -----------------------------------------------------------------------

  const navigateTo = useCallback((newView: ViewMode, char?: Character) => {
    const url = new URL(window.location.href);
    
    if (newView === "list") {
        url.searchParams.delete("mode");
        window.history.pushState(null, "", url);
    } else {
        url.searchParams.set("mode", newView);
        window.history.pushState({ mode: newView }, "", url);
    }

    // Resetear estado sucio al cambiar de vista programáticamente
    isDirtyRef.current = false;

    if (char) setCurrentCharacter(char);
    setView(newView);
    
    if (newView === "list") {
      loadCharacters();
    }
  }, [loadCharacters]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // 1. Si venimos del botón "Volver" de la UI (flecha), CharacterForm ya gestionó la confirmación.
      // Simplemente reseteamos la bandera y dejamos proceder.
      if (isManualBackRef.current) {
        isManualBackRef.current = false;
      } 
      // 2. Si es el botón del navegador y estamos guardando:
      else if (isDirtyRef.current) {
         const warningMsg = t("wait_saving") || "Se están guardando los cambios. ¿Seguro que quieres salir?";
         const confirmLeave = window.confirm(warningMsg);
         
         if (!confirmLeave) {
            // El usuario quiere quedarse.
            // Como el navegador ya cambió la URL (popstate sucede después), debemos restaurarla.
            // Asumimos que estábamos en la vista actual antes de ir atrás.
            const currentMode = view; // 'edit', 'view', etc.
            if (currentMode !== 'list') {
                const url = new URL(window.location.href);
                url.searchParams.set("mode", currentMode);
                window.history.pushState({ mode: currentMode }, "", url);
            }
            return; // ABORTAR el cambio de vista
         } else {
            // El usuario aceptó salir, reseteamos dirty
            isDirtyRef.current = false;
         }
      }

      // Proceceder con el cambio de vista normal
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode") as ViewMode | null;

      if (!mode || mode === 'list') {
        setView("list");
        setCurrentCharacter(null);
        loadCharacters();
      } else {
        if (currentCharacter) {
             setView(mode);
        } else {
             const url = new URL(window.location.href);
             url.searchParams.delete("mode");
             window.history.replaceState(null, "", url);
             setView("list");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [loadCharacters, currentCharacter, view, t]);

  const handleBack = useCallback(() => {
    if (view !== "list") {
        // Marcamos que es navegación manual para evitar doble confirmación en popstate
        // (ya que CharacterForm tiene su propia confirmación en el botón UI)
        isManualBackRef.current = true;
        window.history.back();
    } else {
        setView("list");
        setCurrentCharacter(null);
        loadCharacters();
    }
  }, [view, loadCharacters]);

  // Wrappers para actualizar el estado "sucio" desde el formulario
  const onCharacterChange = useCallback((c: Character) => {
      setCurrentCharacter(c);
      isDirtyRef.current = true; // Empezamos a guardar/modificar
  }, []);

  const onCharacterSaved = useCallback(() => {
      loadCharacters();
      isDirtyRef.current = false; // Guardado completado
  }, [loadCharacters]);

  // -----------------------------------------------------------------------

  const filteredCharacters = characters
    .filter((char) => {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        (char.name?.toLowerCase() || "").includes(query) ||
        (char.occupation?.toLowerCase() || "").includes(query)
      
      const matchesEra = eraFilter === "all" || char.era === eraFilter

      return matchesSearch && matchesEra
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case "oldest":
          return (a.createdAt || 0) - (b.createdAt || 0)
        case "alpha":
          return (a.name || "").localeCompare(b.name || "")
        case "newest":
        default:
          return (b.createdAt || 0) - (a.createdAt || 0)
      }
    })

  useEffect(() => {
    initGoogleDrive((success) => setIsGoogleReady(success))
    const savedMode = getStorageMode()
    setStorageModeState(savedMode)
    if (searchParams.get("d") || searchParams.get("data")) return 
    if (savedMode === 'local') {
        loadCharacters()
    }
  }, [loadCharacters, searchParams])

  useEffect(() => {
    const code = searchParams.get("d") || searchParams.get("data")
    if (code) {
      const importedChar = parseCharacterCode(code)
      if (importedChar) {
        setCurrentCharacter(importedChar)
        const url = new URL(window.location.href);
        url.searchParams.set("mode", "view");
        url.searchParams.delete("d"); 
        url.searchParams.delete("data");
        window.history.replaceState({ mode: "view" }, "", url);
        
        setView("view")
        setLoading(false)
        toast.success(t("character_imported_url"))
      }
    }
  }, [searchParams, t])

  useEffect(() => {
    if (!isGoogleReady) return
    if (searchParams.get("d") || searchParams.get("data")) return 

    const currentMode = getStorageMode()
    if (currentMode === 'cloud') {
        if (checkSessionActive()) {
            setNeedsLogin(false)
            loadCharacters()
        } else {
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
        if (e?.type === 'popup_blocked_by_browser' || e?.type === 'popup_closed_by_user' || e?.type === 'popup_failed_to_open') {
            setIsPopupBlockedOpen(true)
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

  const requestMigrate = () => {
    if (currentCharacter) {
        setIsMigrating(false)
        setIsSuccess(false)
        setIsMigrateOpen(true)
    }
  }

  const confirmMigrate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!currentCharacter) return;
    
    setIsMigrating(true)
    
    const oldId = currentCharacter.id
    const isLocal = storageMode === 'local'
    
    try {
        if (isLocal) {
            if (!isGoogleReady || !checkSessionActive()) {
                 await signInToGoogle()
            }
            const charToMigrate = { ...currentCharacter }
            await saveToCloud(charToMigrate)
            await deleteFromLocal(oldId)
            
            setStorageMode("cloud")
            setStorageModeState("cloud")
            setCurrentCharacter(charToMigrate)
        } else {
            const newLocalChar = { 
                ...currentCharacter, 
                id: crypto.randomUUID(),
                updatedAt: Date.now() 
            }
            await saveToLocal(newLocalChar)
            await deleteFromCloud(oldId)
            
            setStorageMode("local")
            setStorageModeState("local")
            setCurrentCharacter(newLocalChar)
        }
        
        setIsMigrating(false)
        setIsSuccess(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsMigrateOpen(false)

    } catch (error) {
        console.error(error)
        toast.error(t("migration_error"))
        setIsMigrating(false)
        setIsSuccess(false)
    }
  }

  const handleManualLogin = async () => {
    try {
        await signInToGoogle()
        await loadCharacters()
    } catch (e: any) {
         if (e?.type === 'popup_blocked_by_browser' || e?.type === 'popup_failed_to_open') {
            setIsPopupBlockedOpen(true)
        } else {
            toast.error("Error de conexión")
        }
    }
  }

  const handleCreateNew = (era: CharacterEra) => {
    const newChar = createNewCharacter(era, t("unarmed"))
    navigateTo("edit", newChar)
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
        onStorageChange={view === "list" ? handleToggleStorage : undefined}
        onMigrate={view !== "list" && view !== "create" ? requestMigrate : undefined}
        isGoogleReady={isGoogleReady}
      />
      
      <main className="container mx-auto px-4 py-8 flex-1 overflow-hidden">
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
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h2 className="text-2xl font-serif font-bold text-foreground">
                                {t("your_investigators")}
                            </h2>
                            <Button onClick={() => navigateTo("create")} size="sm" className="shadow-md">
                                <Plus className="h-4 w-4 mr-2" /> {t("new")}
                            </Button>
                        </div>

                        {characters.length > 0 && (
                          <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Buscar por nombre o profesión..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-background/50"
                              />
                            </div>
                            <div className="flex gap-3">
                                <Select 
                                  value={eraFilter} 
                                  onValueChange={(value) => setEraFilter(value as CharacterEra | "all")}
                                >
                                  <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                                    <SelectValue placeholder="Época" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">Todas las épocas</SelectItem>
                                    {Object.entries(ERA_LABELS).map(([key, label]) => (
                                      <SelectItem key={key} value={key}>
                                        {label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select 
                                  value={sortOrder} 
                                  onValueChange={(value) => setSortOrder(value as SortOrder)}
                                >
                                  <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                                    <div className="flex items-center gap-2">
                                        <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
                                        <SelectValue placeholder="Orden" />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="newest">Más recientes</SelectItem>
                                    <SelectItem value="oldest">Más antiguos</SelectItem>
                                    <SelectItem value="alpha">Nombre (A-Z)</SelectItem>
                                  </SelectContent>
                                </Select>
                            </div>
                          </div>
                        )}

                        {characters.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed rounded-2xl bg-stone-50/50 dark:bg-stone-900/20">
                                <Users className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                                <h2 className="text-xl font-bold mb-2">{t("no_characters")}</h2>
                                <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                                    {storageMode === 'cloud' ? t("no_characters_cloud") : t("no_characters_local")}
                                </p>
                                <Button onClick={() => navigateTo("create")} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white transition-all">
                                  <Plus className="h-4 w-4 mr-2" /> {t("create_char_button")}
                                </Button>
                            </div>
                        ) : filteredCharacters.length === 0 ? (
                            <div className="text-center py-16 border border-dashed rounded-xl bg-muted/20">
                               <Search className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                               <p className="text-muted-foreground">No se encontraron investigadores con esos filtros.</p>
                               <Button 
                                    variant="link" 
                                    onClick={() => { setSearchQuery(""); setEraFilter("all"); }}
                                    className="mt-2"
                               >
                                    Limpiar filtros
                               </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredCharacters.map((char) => (
                                    <CharacterCard 
                                      key={char.id} 
                                      character={char} 
                                      onView={(id) => getCharacter(id).then(c => navigateTo("view", c ?? undefined))}
                                      onEdit={(id) => getCharacter(id).then(c => navigateTo("edit", c ?? undefined))}
                                      onDelete={requestDelete} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                )}

                {view === "create" && (
                    <div className="animate-in fade-in zoom-in-95 duration-500 ease-out fill-mode-both">
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
                    </div>
                )}

                {view === "edit" && currentCharacter && (
                    <CharacterForm 
                      character={currentCharacter} 
                      onBack={handleBack} 
                      onSave={onCharacterSaved} 
                      onChange={onCharacterChange}
                    />
                )}

                {view === "view" && currentCharacter && (
                    <CharacterViewer 
                        character={currentCharacter} 
                        onBack={handleBack} 
                        onEdit={() => navigateTo("edit", currentCharacter)} 
                    />
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

        <AlertDialog open={isMigrateOpen} onOpenChange={(open) => { 
            if(!isMigrating && !isSuccess) setIsMigrateOpen(open) 
        }}>
          <AlertDialogContent>
            {isMigrating ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-lg font-medium text-foreground animate-pulse">
                        {t("migrating_text")}
                    </p>
                </div>
            ) : isSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-lg font-bold text-center">
                        {storageMode === 'cloud' 
                            ? t("migration_success_cloud")
                            : t("migration_success_local")
                        }
                    </p>
                </div>
            ) : (
                <>
                    <AlertDialogHeader>
                    <AlertDialogTitle>
                        {storageMode === 'local' ? t("migrate_modal_title_cloud") : t("migrate_modal_title_local")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {storageMode === 'local' ? t("migrate_modal_desc_cloud") : t("migrate_modal_desc_local")}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmMigrate} className="bg-primary text-primary-foreground">
                        {storageMode === 'local' ? <Cloud className="mr-2 h-4 w-4" /> : <HardDrive className="mr-2 h-4 w-4" />}
                        {t("move")}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </>
            )}
          </AlertDialogContent>
        </AlertDialog>

        <PopupBlockedModal 
            isOpen={isPopupBlockedOpen} 
            onClose={() => setIsPopupBlockedOpen(false)} 
        />

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