"use client";

import { Share2, Sun, Moon, HardDrive, Cloud, Info, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/language-selector";
import { useLanguage } from "@/components/language-provider";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Character } from "@/lib/character-types";
import { ShareCharacterModal } from "@/components/share-character-modal";
import { StorageMode } from "@/lib/character-storage";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
// CAMBIO: Importamos el botón de autenticación
import { UserAuthBtn } from "@/components/user-auth-btn";

interface HeaderProps {
  character?: Character | null;
  showShare?: boolean;
  storageMode?: StorageMode;
  onStorageChange?: (checked: boolean) => void;
  onMigrate?: () => void;
  isGoogleReady?: boolean;
}

export function Header({
  character,
  showShare,
  storageMode,
  onStorageChange,
  onMigrate,
  isGoogleReady,
}: HeaderProps) {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="border-b bg-card sticky top-0 z-50 print:hidden">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Logo SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="37"
            height="37"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#338634"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
            <h1 className="text-lg font-bold text-foreground leading-none">
              {t("app_title")}
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {t("app_subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {onStorageChange ? (
            <div className="flex flex-row items-center gap-1 border rounded-lg p-1 bg-muted/30">
              <ToggleGroup
                type="single"
                value={storageMode}
                onValueChange={(val) => {
                  if (val === "local") onStorageChange(false);
                }}
                className="flex gap-1"
              >
                <ToggleGroupItem 
                  value="local" 
                  className="h-9 sm:h-10 px-2 sm:px-3 flex items-center gap-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
                >
                  <HardDrive className={`h-4 w-4 ${storageMode === 'local' ? 'text-foreground' : 'text-muted-foreground'}`} />
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-[11px] font-bold">{t("storage_local")}</span>
                    <span className="text-[9px] text-muted-foreground uppercase">{t("storage_local_desc")}</span>
                  </div>
                </ToggleGroupItem>

                <ToggleGroupItem 
                  value="cloud" 
                  onClick={() => {
                    if (storageMode !== 'cloud') {
                       onStorageChange(true);
                    }
                  }}
                  className="h-9 sm:h-10 px-2 sm:px-3 flex items-center gap-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
                >
                  <Cloud className={`h-4 w-4 ${storageMode === 'cloud' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-[11px] font-bold">{t("storage_cloud")}</span>
                    <span className={`text-[9px] uppercase ${!isGoogleReady && storageMode === 'cloud' ? 'text-amber-500' : 'text-muted-foreground'}`}>
                      {t("storage_cloud_desc")}
                    </span>
                  </div>
                  {!isGoogleReady && (
                    <div className="ml-1" title={t("login_msg")}>
                      <Info className="h-3 w-3 text-amber-500" />
                    </div>
                  )}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          ) : (
            <div 
                className={`hidden sm:flex items-center transition-opacity ${onMigrate ? 'cursor-pointer hover:opacity-80 active:scale-95 transition-transform' : 'opacity-80'}`}
                onClick={() => {
                   if (onMigrate) onMigrate();
                }}
            >
                <Badge 
                    variant="outline" 
                    className="gap-2 font-normal py-1.5 h-9 bg-muted/20 border-border/60 select-none"
                >
                    {storageMode === 'cloud' ? (
                        <>
                            <Cloud className="h-3.5 w-3.5 text-blue-500/70" />
                            <span>{t("character_cloud_indicator")}</span>
                        </>
                    ) : (
                        <>
                            <HardDrive className="h-3.5 w-3.5 opacity-70" />
                            <span>{t("character_local_indicator")}</span>
                        </>
                    )}
                    {onMigrate && <ArrowLeftRight className="h-3 w-3 ml-1.5 opacity-40" />}
                </Badge>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {showShare && character && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setIsShareModalOpen(true)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <ShareCharacterModal
                  isOpen={isShareModalOpen}
                  onClose={() => setIsShareModalOpen(false)}
                  character={character}
                  onImport={() => {}}
                />
              </>
            )}

            <LanguageSelector />

            {mounted && (
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-blue-500" />
                )}
              </Button>
            )}

            {/* CAMBIO: Botón de Login/Avatar */}
            <UserAuthBtn />
          </div>
        </div>
      </div>
    </header>
  );
}