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
    loadCharactersSmart, 
    deleteCharacterSmart, 
    migrateLocalToCloud,
    type StorageMode 
} from "@/lib/character-storage"
import { createNewCharacter } from "@/lib/character-utils"
import { parseCharacterCode } from "@/lib/sharing"
import { Plus, Users, Cloud, RefreshCw, Trash2, Search, ArrowUpDown, Loader2, Check, HardDrive } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/components/language-provider"
import { useSession, signIn } from "next-auth/react"

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
  
  // Auth State
  const { data: session, status: authStatus } = useSession()
  const isAuthenticated = authStatus === "authenticated"
  
  // Derived Storage Mode (Visual only)
  const storageMode: StorageMode = isAuthenticated ? 'cloud' : 'local'
  
  const [searchQuery, setSearchQuery] = useState("")
  const [eraFilter, setEraFilter] = useState<CharacterEra | "all">("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [charToDelete, setCharToDelete] = useState<string | null>(null)
  
  // MIGRACIÓN
  const [isMigrateOpen, setIsMigrateOpen] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [showMigrateSuccess, setShowMigrateSuccess] = useState(false)
  
  const isDirtyRef = useRef(false)
  const isManualBackRef = useRef(false)
  
  const { t } = useLanguage()
  const searchParams = useSearchParams()

  // Carga de personajes
  const loadCharacters = useCallback(async () => {
    if (authStatus === "loading") return
    
    setLoading(true)
    try {
        const chars = await loadCharactersSmart(isAuthenticated)
        setCharacters(chars)
    } catch (error) {
        console.error("Error cargando personajes:", error)
        toast.error("Error al cargar personajes")
    } finally {
        setLoading(false)
    }
  }, [isAuthenticated, authStatus])

  // Recargar cuando cambia el estado de autenticación
  useEffect(() => {
    loadCharacters()
  }, [loadCharacters])

  // Detectar si hay personajes locales cuando el usuario se loguea
  useEffect(() => {
    if (isAuthenticated && view === 'list') {
      // Comprobación rápida: ¿Hay algo en localStorage?
      const localData = localStorage.getItem('cthulhu_characters')
      if (localData && JSON.parse(localData).length > 0) {
         // Sugerir migración (Podrías activar esto automáticamente o mostrar un botón)
         // Por ahora lo dejamos manual a través del Header si se desea, 
         // o mostramos un Toast.
         toast("Se han detectado personajes locales", {
           description: "¿Quieres moverlos a tu cuenta en la nube?",
           action: {
             label: "Importar",
             onClick: () => setIsMigrateOpen(true)
           }
         })
      }
    }
  }, [isAuthenticated, view])

  // --- NAVEGACIÓN (History API) ---
  const navigateTo = useCallback((newView: ViewMode, char?: Character) => {
    const url = new URL(window.location.href);
    if (newView === "list") {
        url.searchParams.delete("mode");
        window.history.pushState(null, "", url);
    } else {
        url.searchParams.set("mode", newView);
        window.history.pushState({ mode: newView }, "", url);
    }
    isDirtyRef.current = false;
    if (char) setCurrentCharacter(char);
    setView(newView);
    if (newView === "list") loadCharacters();
  }, [loadCharacters]);

  useEffect(() => {
    const handlePopState = () => {
      if (isManualBackRef.current) {
        isManualBackRef.current = false;
      } else if (isDirtyRef.current) {
         const confirmLeave = window.confirm(t("unsaved_changes_warning") || "¿Salir sin guardar?");
         if (!confirmLeave) {
            const currentMode = view;
            const url = new URL(window.location.href);
            if (currentMode !== 'list') url.searchParams.set("mode", currentMode);
            window.history.pushState({ mode: currentMode }, "", url);
            return;
         }
         isDirtyRef.current = false;
      }
      
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode") as ViewMode | null;

      if (!mode || mode === 'list') {
        setView("list");
        setCurrentCharacter(null);
        loadCharacters();
      } else {
        if (currentCharacter) setView(mode);
        else {
             // Si intentan entrar directo a edit/view sin personaje cargado, volver a lista
             const url = new URL(window.location.href);
             url.searchParams.delete("mode");
             window.history.replaceState(null, "", url);
             setView("list");
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentCharacter, view, t, loadCharacters]);

  const handleBack = useCallback(() => {
    if (view !== "list") {
        isManualBackRef.current = true;
        window.history.back();
    } else {
        setView("list");
        setCurrentCharacter(null);
        loadCharacters();
    }
  }, [view, loadCharacters]);

  const onCharacterChange = useCallback((c: Character) => {
      setCurrentCharacter(c);
      isDirtyRef.current = true; 
  }, []);

  const onCharacterSaved = useCallback(() => {
      loadCharacters();
      isDirtyRef.current = false; 
  }, [loadCharacters]);

  // --- FILTROS Y ORDEN ---
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
        case "oldest": return (a.createdAt || 0) - (b.createdAt || 0)
        case "alpha": return (a.name || "").localeCompare(b.name || "")
        case "newest": default: return (b.createdAt || 0) - (a.createdAt || 0)
      }
    })

  // --- IMPORTACIÓN POR URL ---
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
        toast.success(t("character_imported_url"))
      }
    }
  }, [searchParams, t])


  // --- ACCIONES ---
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
        await deleteCharacterSmart(charToDelete, isAuthenticated)
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

  // --- LÓGICA DE MIGRACIÓN (Local -> Cloud) ---
  const handleMigrate = async () => {
    setIsMigrating(true)
    try {
        const result = await migrateLocalToCloud();
        setIsMigrating(false)
        if (result.count > 0) {
            setShowMigrateSuccess(true)
            await loadCharacters() // Recargar lista desde la nube
            setTimeout(() => {
                setShowMigrateSuccess(false)
                setIsMigrateOpen(false)
            }, 2000)
        } else {
            toast.info("No hay personajes locales para migrar")
            setIsMigrateOpen(false)
        }
    } catch (e) {
        console.error(e)
        setIsMigrating(false)
        toast.error("Error en la migración")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <Header 
        character={currentCharacter} 
        showShare={view === "edit" || view === "view"} 
        storageMode={storageMode}
        // Eliminamos el toggle manual, el login es el toggle ahora
        onStorageChange={undefined} 
        // Botón de migración solo visible si estamos logueados y en lista
        onMigrate={isAuthenticated && view === 'list' ? () => setIsMigrateOpen(true) : undefined}
        isGoogleReady={true} // Dummy, ya no usamos la librería de GDrive
      />
      
      <main className="container mx-auto px-4 py-8 flex-1 overflow-hidden">
        {loading && !currentCharacter ? (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-medium">{t("loading") || "Cargando..."}</p>
            </div>
        ) : (
            <>
                {view === "list" && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h2 className="text-2xl font-serif font-bold text-foreground">
                                {isAuthenticated ? t("your_investigators") + " (Cloud)" : t("your_investigators") + " (Local)"}
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
                                placeholder="Buscar..."
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
                                    <SelectItem value="all">Todas</SelectItem>
                                    {Object.entries(ERA_LABELS).map(([key, label]) => (
                                      <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select 
                                  value={sortOrder} 
                                  onValueChange={(value) => setSortOrder(value as SortOrder)}
                                >
                                  <SelectTrigger className="w-full md:w-[180px] bg-background/50">
                                    <ArrowUpDown className="h-3.5 w-3.5 mr-2 opacity-70" />
                                    <SelectValue placeholder="Orden" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="newest">Más recientes</SelectItem>
                                    <SelectItem value="oldest">Más antiguos</SelectItem>
                                    <SelectItem value="alpha">A-Z</SelectItem>
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
                                    {isAuthenticated 
                                        ? "No tienes personajes en la nube. ¡Crea uno o migra tus locales!" 
                                        : "No hay personajes locales. Inicia sesión para ver tu nube o crea uno local."}
                                </p>
                                <Button onClick={() => navigateTo("create")} variant="outline">
                                  <Plus className="h-4 w-4 mr-2" /> {t("create_char_button")}
                                </Button>
                            </div>
                        ) : filteredCharacters.length === 0 ? (
                            <div className="text-center py-16 border border-dashed rounded-xl bg-muted/20">
                               <p className="text-muted-foreground">No se encontraron investigadores.</p>
                               <Button variant="link" onClick={() => { setSearchQuery(""); setEraFilter("all"); }}>
                                    Limpiar filtros
                               </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredCharacters.map((char) => (
                                    <CharacterCard 
                                      key={char.id} 
                                      character={char} 
                                      onView={() => navigateTo("view", char)}
                                      onEdit={() => navigateTo("edit", char)}
                                      onDelete={requestDelete} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                )}

                {view === "create" && (
                    <div className="animate-in fade-in zoom-in-95 duration-500 ease-out">
                        <div className="max-w-4xl mx-auto space-y-8 text-center">
                            <h2 className="text-3xl font-serif font-bold">{t("new_investigator")}</h2>
                            <EraSelector onSelect={handleCreateNew} />
                            <Button variant="ghost" onClick={handleBack}>{t("cancel")}</Button>
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
              <AlertDialogDescription>{t("delete_confirm")}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                <Trash2 className="w-4 h-4 mr-2" /> {t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* MODAL DE MIGRACIÓN */}
        <AlertDialog open={isMigrateOpen} onOpenChange={setIsMigrateOpen}>
            <AlertDialogContent>
                {isMigrating ? (
                    <div className="flex flex-col items-center py-8">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
                        <p>Migrando personajes...</p>
                    </div>
                ) : showMigrateSuccess ? (
                    <div className="flex flex-col items-center py-8">
                        <Check className="h-10 w-10 text-green-500 mb-2" />
                        <p className="font-bold">¡Migración completada!</p>
                    </div>
                ) : (
                    <>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Importar personajes locales</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se han detectado personajes guardados en este navegador. ¿Quieres subirlos a tu cuenta en la nube?
                            <br/><span className="text-xs text-muted-foreground mt-2 block">Los personajes locales se borrarán tras subirse.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMigrate}>Importar ahora</AlertDialogAction>
                    </AlertDialogFooter>
                    </>
                )}
            </AlertDialogContent>
        </AlertDialog>

      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-screen grid place-items-center"><RefreshCw className="animate-spin" /></div>}>
      <CharacterApp />
    </Suspense>
  )
}