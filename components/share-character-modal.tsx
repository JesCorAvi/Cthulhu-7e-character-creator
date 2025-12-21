"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Import, Check, Link as LinkIcon } from "lucide-react"
import { Character } from "@/lib/character-types"
import { generateCharacterCode, getShareUrl, parseCharacterCode } from "@/lib/sharing"
import { toast } from "sonner" 

interface ShareCharacterModalProps {
  isOpen: boolean
  onClose: () => void
  character: Character
  onImport: (character: Character) => void
}

export function ShareCharacterModal({ isOpen, onClose, character, onImport }: ShareCharacterModalProps) {
  const [code, setCode] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const [importCode, setImportCode] = useState("")
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const c = generateCharacterCode(character)
      setCode(c)
      setShareUrl(getShareUrl(c))
    }
  }, [isOpen, character])

  const copyToClipboard = async (text: string, isLink: boolean) => {
    try {
      await navigator.clipboard.writeText(text)
      if (isLink) {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
        toast.success("Enlace copiado")
      } else {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
        toast.success("Código copiado")
      }
    } catch (err) {
      toast.error("Error al copiar")
    }
  }

  const handleImport = () => {
    if (!importCode.trim()) return
    let codeToParse = importCode.trim()
    try {
      const url = new URL(codeToParse)
      const dataParam = url.searchParams.get("data")
      if (dataParam) {
        codeToParse = dataParam
      }
    } catch (e) {
      // No es URL
    }

    const importedChar = parseCharacterCode(codeToParse)
    if (importedChar) {
      onImport(importedChar)
      onClose()
      setImportCode("")
      toast.success("Personaje importado")
    } else {
      toast.error("Código inválido")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* max-w-[90vw] asegura que nunca sea más ancho que la pantalla del móvil */}
      <DialogContent className="sm:max-w-md w-full max-w-[90vw] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Compartir / Importar</DialogTitle>
          <DialogDescription>
            Copia el enlace o código para compartir tu personaje.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">Compartir</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="share" className="space-y-4 py-2">
            <div className="space-y-2 w-full">
              <Label>Enlace directo</Label>
              <div className="flex gap-2 w-full max-w-full">
                {/* min-w-0 es CRUCIAL para que flex-1 funcione con inputs desbordantes */}
                <Input 
                  value={shareUrl} 
                  readOnly 
                  className="flex-1 min-w-0 bg-muted/50 text-xs" 
                />
                <Button 
                  size="icon" 
                  className="shrink-0"
                  onClick={() => copyToClipboard(shareUrl, true)}
                >
                  {copiedLink ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2 w-full">
              <Label>Código de texto</Label>
              <div className="flex gap-2 w-full max-w-full">
                {/* break-all fuerza a romper la cadena larga base64 para que no estire el contenedor */}
                <Textarea 
                  value={code} 
                  readOnly 
                  className="h-24 font-mono text-[10px] resize-none flex-1 min-w-0 bg-muted/50 leading-tight break-all" 
                />
                <Button 
                  size="icon" 
                  className="h-24 shrink-0" 
                  onClick={() => copyToClipboard(code, false)}
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 py-2 w-full">
            <div className="space-y-2 w-full">
              <Label>Pegar código o enlace</Label>
              <Textarea
                placeholder="Pega aquí..."
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                // break-all aquí también para prevenir expansión al pegar
                className="h-32 font-mono text-xs resize-none break-all"
              />
            </div>
            <Button onClick={handleImport} className="w-full" disabled={!importCode}>
              <Import className="mr-2 h-4 w-4" /> Cargar
            </Button>
            <p className="text-xs text-red-500 font-bold text-center mt-2">
              Esto reemplazará tu personaje actual.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}