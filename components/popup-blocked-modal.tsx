"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { Shield, LogIn, ExternalLink, ArrowUpLeft, Cookie } from "lucide-react"

interface PopupBlockedModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PopupBlockedModal({ isOpen, onClose }: PopupBlockedModalProps) {
  const { t } = useLanguage()
  const [step, setStep] = useState<1 | 2>(1)

  useEffect(() => {
    if (isOpen) {
      setStep(1)
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        
        {/* ETAPA 1: Confirmación Visual (Sin cambios) */}
        {step === 1 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5 text-primary" />
                {t("popup_google_title") || "Iniciar sesión con Google"}
              </DialogTitle>
              <DialogDescription className="pt-2 text-base">
                {t("popup_google_desc") || "Por favor, autoriza el inicio de sesión en la ventana emergente."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-10 text-center relative overflow-hidden">
              

               <div className="relative mt-4">
                 <ExternalLink className="h-20 w-20 text-muted-foreground/20 scale-x-[-1]" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-amber-400 opacity-20"></span>
                 </div>
               </div>
               
               <p className="text-sm text-muted-foreground mt-6 max-w-xs">
                 {t("popup_check_top_left") || "La ventana suele aparecer en la esquina superior izquierda."}
               </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="secondary" onClick={() => setStep(2)}>
                {t("popup_not_visible_btn") || "No funciona / No veo la ventana"}
              </Button>
              <Button onClick={onClose}>{t("close")}</Button>
            </DialogFooter>
          </>
        )}

        {/* ETAPA 2: Explicación exclusiva para Brave */}
        {step === 2 && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <Cookie className="h-5 w-5" />
                {t("login_blocked_title") || "Inicio de sesión bloqueado"}
              </DialogTitle>
              <DialogDescription className="pt-2">
                {t("login_blocked_desc") || "Sigue estos pasos para permitir el inicio de sesión:"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
                 <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 mb-4 flex gap-3">
                    <Shield className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {t("brave_new_permission_desc")}
                    </p>
                 </div>

                 <div className="space-y-4 px-1">
                    <p className="font-medium text-sm flex items-center gap-2">
                      {t("solution_title") || "Solución:"}
                    </p>
                    <div className="space-y-3 text-sm text-muted-foreground pl-2 border-l-2 border-muted ml-2">
                        <p className="flex gap-2">
                          <span className="font-bold text-foreground min-w-[1.2rem]">1.</span> 
                          {t("tut_brave_1")}
                        </p>
                        <p className="flex gap-2">
                          <span className="font-bold text-foreground min-w-[1.2rem]">2.</span> 
                          {t("tut_brave_2")}
                        </p>
                        <p className="flex gap-2">
                          <span className="font-bold text-foreground min-w-[1.2rem]">3.</span> 
                          {t("tut_brave_3")}
                        </p>
                        <p className="flex gap-2">
                          <span className="font-bold text-foreground min-w-[1.2rem]">4.</span> 
                          {t("tut_brave_4")}
                        </p>
                    </div>
                 </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" onClick={() => setStep(1)} className="mr-auto">
                {t("back") || "Atrás"}
              </Button>
              <Button onClick={onClose} className="w-full sm:w-auto">{t("close")}</Button>
            </DialogFooter>
          </>
        )}

      </DialogContent>
    </Dialog>
  )
}