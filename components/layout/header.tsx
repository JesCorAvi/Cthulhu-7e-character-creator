"use client"

import { Skull, Share2, Sun, Moon, HardDrive, Cloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/components/language-provider"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Character } from "@/lib/character-types"
import { ShareCharacterModal } from "@/components/share-character-modal"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { StorageMode } from "@/lib/character-storage"

interface HeaderProps {
  character?: Character | null
  showShare?: boolean
  storageMode?: StorageMode
  onStorageChange?: (checked: boolean) => void
  isGoogleReady?: boolean
}

export function Header({ 
  character, 
  showShare, 
  storageMode, 
  onStorageChange, 
  isGoogleReady 
}: HeaderProps) {
  const { t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="border-b bg-card sticky top-0 z-50 print:hidden">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
<svg xmlns="http://www.w3.org/2000/svg" width="37" height="37" viewBox="0 0 24 24" fill="none" stroke="#338634" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M12 2c-4.5 0-8 3-8 7 0 3.5 2.5 6 4 7.5" />
  <path d="M12 2c4.5 0 8 3 8 7 0 3.5-2.5 6-4 7.5" />
  
  <circle cx="8.5" cy="9" r="1.2" fill="#338634" />
  <circle cx="15.5" cy="9" r="1.2" fill="#338634" />
  
  <path d="M12 14v7c0 1.5-1 2.5-2.5 2.5" />
  <path d="M12 14v5c0 2 1.5 3.5 3 3.5" />
  
  <path d="M8 15.5c-2 2-4 2.5-5.5 1" />
  <path d="M16 15.5c2 2 4 2.5 5.5 1" />
  
  <path d="M10 16c-1 3-2.5 4-4 4" />
  <path d="M14 16c1 3 2.5 4 4 4" />
</svg>
  <div className="hidden md:block">
            <h1 className="text-lg font-bold text-foreground leading-none">{t("app_title")}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("app_subtitle")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Selector de Almacenamiento (Nuevo en Header) */}
          {onStorageChange && (
            <div className="flex items-center gap-2 border px-2 py-1 rounded-md bg-background/50 h-9">
              {storageMode === 'local' ? (
                <HardDrive className="h-3.5 w-3.5 text-stone-500" />
              ) : (
                <Cloud className="h-3.5 w-3.5 text-blue-500" />
              )}
              <Switch 
                checked={storageMode === 'cloud'}
                onCheckedChange={onStorageChange}
                id="header-storage-mode"
                className="scale-75"
              />
              <Label htmlFor="header-storage-mode" className="text-[10px] font-bold cursor-pointer hidden lg:inline-block">
                {storageMode === 'cloud' ? t("storage_cloud") : t("storage_local")}
              </Label>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {/* Compartir */}
            {showShare && character && (
              <>
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setIsShareModalOpen(true)} title={t("share")}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <ShareCharacterModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} character={character} onImport={() => {}} />
              </>
            )}

            <LanguageSelector />

            {mounted && (
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-500" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}