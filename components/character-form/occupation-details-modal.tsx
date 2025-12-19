"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Character } from "@/lib/character-types"
import { PRESET_OCCUPATIONS, OccupationFormula } from "@/lib/occupations-data"
import { calculateOccupationalPoints, calculateSpentPoints } from "@/lib/occupation-utils"

interface OccupationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  character: Character
  onChange: (updates: Partial<Character>) => void
}

export function OccupationDetailsModal({ isOpen, onClose, character, onChange }: OccupationDetailsModalProps) {
  const currentOccupation = PRESET_OCCUPATIONS.find(occ => occ.name === character.occupation);
  
  // 1. Usar tu utilidad para calcular el TOTAL disponible
  const totalPoints = character.occupationFormula 
    ? calculateOccupationalPoints(character, character.occupationFormula as OccupationFormula)
    : 0;

  // 2. Usar tu utilidad para calcular lo GASTADO
  const { occupationalSpent } = calculateSpentPoints(character);

  const remainingPoints = totalPoints - occupationalSpent;
  const isOverLimit = remainingPoints < 0;

  // Manejador para cambiar puntos
  const handleSkillPointChange = (skillName: string, inputValue: string) => {
    const points = parseInt(inputValue);
    
    // Permitimos borrar el input (NaN) tratándolo como 0 temporalmente, o 0 si es negativo
    const cleanPoints = isNaN(points) ? 0 : Math.max(0, points);

    const newSkills = character.skills.map(skill => {
      if (skill.name === skillName) {
        // Recalculamos el valor total: Base + Ocupación + Personal
        const newTotal = skill.baseValue + cleanPoints + (skill.personalPoints || 0);
        
        // Limitamos a 99% (regla general de Cthulhu opcional)
        // if (newTotal > 99) return skill; 

        return {
          ...skill,
          occupationalPoints: cleanPoints,
          value: newTotal,
          isOccupational: true // Aseguramos que quede marcada como ocupacional
        };
      }
      return skill;
    });

    onChange({ skills: newSkills });
  };

  if (!currentOccupation) return null;

  // Filtramos habilidades: Mostramos las que define la profesión O las que ya tienen puntos de ocupación gastados
  const occupationSkills = character.skills.filter(skill => 
    currentOccupation.skills.includes(skill.name) || 
    (skill.occupationalPoints && skill.occupationalPoints > 0)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {currentOccupation.name}
            </DialogTitle>
            <Badge variant="outline" className="text-muted-foreground">
              Crédito: {currentOccupation.creditRating[0]} - {currentOccupation.creditRating[1]}%
            </Badge>
          </div>
          <DialogDescription>
            Fórmula: <code className="bg-muted px-1 rounded">{character.occupationFormula}</code>
          </DialogDescription>
        </DialogHeader>

        {/* BARRA DE PROGRESO */}
        <div className="bg-secondary/30 p-4 rounded-lg space-y-2 border">
          <div className="flex justify-between text-sm font-medium">
            <span>Puntos Gastados: <span className="text-foreground font-bold">{occupationalSpent}</span> / {totalPoints}</span>
            <span className={isOverLimit ? "text-destructive font-bold" : "text-primary font-bold"}>
              {remainingPoints} disponibles
            </span>
          </div>
          <Progress 
            value={totalPoints > 0 ? (occupationalSpent / totalPoints) * 100 : 0} 
            className={isOverLimit ? "[&>div]:bg-destructive h-2" : "h-2"} 
          />
          <div className="flex justify-end h-4">
             {isOverLimit && <span className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Límite excedido</span>}
             {remainingPoints === 0 && !isOverLimit && totalPoints > 0 && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Completado</span>}
          </div>
        </div>

        {/* LISTA DE HABILIDADES */}
        <ScrollArea className="flex-1 -mr-4 pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-2">
            {occupationSkills.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between p-3 rounded-md border bg-card hover:bg-accent/5 transition-colors">
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mr-2">
                     <Label className="font-medium truncate text-sm" title={skill.name}>
                        {skill.name}
                     </Label>
                     <span className="text-xs text-muted-foreground">Base: {skill.baseValue}%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total: <span className="font-bold text-foreground text-sm">{skill.value}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-background p-1 rounded border shadow-sm">
                  <span className="text-[10px] font-semibold text-muted-foreground px-1">PTS</span>
                  <Input 
                    type="number"
                    min={0}
                    className="h-7 w-16 text-right px-2"
                    value={skill.occupationalPoints || 0}
                    onChange={(e) => handleSkillPointChange(skill.name, e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 text-xs text-blue-700 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-900">
             <strong>Nota:</strong> Si la profesión permite habilidades electivas (ej. "Una interpersonal"), búscalas en la lista general de la hoja de personaje y asígnales puntos manualmente; aparecerán aquí automáticamente una vez tengan puntos.
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={onClose}>Listo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}