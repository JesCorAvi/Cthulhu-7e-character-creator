"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguage } from "@/components/language-provider"
import { Chrome, Compass, AppWindow, Globe, Shield, Monitor } from "lucide-react"

interface PopupBlockedModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PopupBlockedModal({ isOpen, onClose }: PopupBlockedModalProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AppWindow className="h-5 w-5" />
            {t("popup_blocked_title")}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {t("popup_blocked_modal_desc")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
             <h4 className="mb-3 text-sm font-medium text-foreground">{t("popup_instruction_title")}</h4>
             <Tabs defaultValue="brave" className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-auto py-1">
                  <TabsTrigger value="brave" className="flex flex-col gap-1 py-2 text-xs sm:text-sm"><Shield className="w-4 h-4" /> Brave</TabsTrigger>
                  <TabsTrigger value="chrome" className="flex flex-col gap-1 py-2 text-xs sm:text-sm"><Chrome className="w-4 h-4" /> Chrome</TabsTrigger>
                  <TabsTrigger value="safari" className="flex flex-col gap-1 py-2 text-xs sm:text-sm"><Compass className="w-4 h-4" /> Safari</TabsTrigger>
                  <TabsTrigger value="edge" className="flex flex-col gap-1 py-2 text-xs sm:text-sm"><Globe className="w-4 h-4" /> Edge</TabsTrigger>
                  <TabsTrigger value="firefox" className="flex flex-col gap-1 py-2 text-xs sm:text-sm"><Monitor className="w-4 h-4" /> Firefox</TabsTrigger>
                </TabsList>
                
                <div className="mt-4 p-4 bg-muted/50 rounded-md border text-sm text-muted-foreground min-h-[140px]">
                    <TabsContent value="brave" className="mt-0 space-y-3">
                        <p className="flex gap-2"><span className="font-bold text-foreground text-amber-600">1.</span> {t("popup_brave_1")}</p>
                        <p className="flex gap-2"><span className="font-bold text-foreground text-amber-600">2.</span> {t("popup_brave_2")}</p>
                        <p className="text-xs italic mt-2 opacity-80">{t("popup_brave_note")}</p>
                    </TabsContent>
                    <TabsContent value="chrome" className="mt-0 space-y-3">
                        <p className="flex gap-2"><span className="font-bold text-foreground">1.</span> {t("popup_chrome_1")}</p>
                        <p className="flex gap-2"><span className="font-bold text-foreground">2.</span> {t("popup_chrome_2")}</p>
                        <p className="flex gap-2"><span className="font-bold text-foreground">3.</span> {t("popup_chrome_3")}</p>
                    </TabsContent>
                    <TabsContent value="safari" className="mt-0 space-y-3">
                        <p className="flex gap-2"><span className="font-bold text-foreground">1.</span> {t("popup_safari_1")}</p>
                        <p className="flex gap-2"><span className="font-bold text-foreground">2.</span> {t("popup_safari_2")}</p>
                    </TabsContent>
                    <TabsContent value="edge" className="mt-0 space-y-3">
                        <p className="flex gap-2"><span className="font-bold text-foreground">1.</span> {t("popup_edge_1")}</p>
                        <p className="flex gap-2"><span className="font-bold text-foreground">2.</span> {t("popup_edge_2")}</p>
                    </TabsContent>
                     <TabsContent value="firefox" className="mt-0 space-y-3">
                        <p className="flex gap-2"><span className="font-bold text-foreground">1.</span> {t("popup_firefox_1")}</p>
                        <p className="flex gap-2"><span className="font-bold text-foreground">2.</span> {t("popup_firefox_2")}</p>
                    </TabsContent>
                </div>
             </Tabs>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">{t("close")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}