"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react"
import { Character, CharacteristicValue } from "@/lib/character-types"
import { PRESET_OCCUPATIONS } from "@/lib/occupations-data"
import { calculateSpentPoints } from "@/lib/occupation-utils"

interface OccupationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  character: Character
  onChange: (updates: Partial<Character>) => void
}

const SKILL_GROUPS = {
  "Interpersonales": ["Charlatanería", "Encanto", "Intimidar", "Persuasión", "Psicología"],
  "Combate": ["Pelea", "Armas de Fuego (Pistola)", "Armas de Fuego (Fusil/Escopeta)"],
  "Académicas": ["Historia", "Bibliotecología", "Ocultismo", "Ciencias (Biología)", "Ciencias (Química)"],
  "Otras": ["Conducir automóvil", "Cerrajería", "Sigilo", "Ocultarse"]
}

export function OccupationDetailsModal({ isOpen, onClose, character, onChange }: OccupationDetailsModalProps) {
  const currentOccupation = PRESET_OCCUPATIONS.find(occ => occ.name === character.occupation);
  
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  const [addedElectiveSkills, setAddedElectiveSkills] = useState<string[]>([]);
  const [skillToAdd, setSkillToAdd] = useState<string>("");

  const getCharacteristicVal = (key: string): number => {
    const mapToKey: Record<string, string> = { 
        "FUE": "STR", "DES": "DEX", "POD": "POW", "APA": "APP", "TAM": "SIZ", "INT": "INT" 
    };
    const realKey = mapToKey[key] || key;
    const stat = character.characteristics[realKey as keyof typeof character.characteristics];
    
    if (typeof stat === 'object' && stat !== null && 'value' in stat) {
        return (stat as CharacteristicValue).value;
    }
    if (typeof stat === 'number') {
        return stat;
    }
    return 0;
  };

  const formulaAnalysis = useMemo(() => {
    if (!character.occupationFormula) return { type: "simple", options: [] as string[], label: "" };
    
    const f = character.occupationFormula.toUpperCase();
    const hasChoice = f.includes(" O ") || f.includes(" OR ") || f.includes("||") || f.includes("/");

    if (hasChoice) {
       const hasStr = f.includes("STR") || f.includes("FUE");
       const hasDex = f.includes("DEX") || f.includes("DES");
       if (hasStr && hasDex) {
          return { type: "choice", options: ["STR", "DEX"], label: "Elige característica para el cálculo:" };
       }
       const hasApp = f.includes("APP") || f.includes("APA");
       const hasPow = f.includes("POW") || f.includes("POD");
       if (hasApp && hasPow) {
          return { type: "choice", options: ["APP", "POW"], label: "Elige característica para el cálculo:" };
       }
    }
    return { type: "simple", options: [] as string[], label: "" };
  }, [character.occupationFormula]);

  useEffect(() => {
    if (formulaAnalysis.type === "choice" && formulaAnalysis.options.length > 0 && !selectedAttribute) {
      setSelectedAttribute(formulaAnalysis.options[0]);
    }
  }, [formulaAnalysis, selectedAttribute]);

  const totalPoints = useMemo(() => {
    if (!character.occupationFormula) return 0;
    
    const edu = getCharacteristicVal("EDU");
    const formula = character.occupationFormula.toUpperCase();
    let total = 0;

    if (formula === "EDU*4" || (formula.includes("EDU") && !formula.includes("+"))) {
      return edu * 4;
    }

    if (formula.includes("EDU*2")) {
      total += edu * 2;
      if (formulaAnalysis.type === "choice" && selectedAttribute) {
         total += getCharacteristicVal(selectedAttribute) * 2;
      } else if (formulaAnalysis.type === "simple") {
         ["STR", "DEX", "POW", "APP", "SIZ", "INT", "FUE", "DES", "POD", "APA", "TAM"].forEach(stat => {
            if (stat !== "EDU" && formula.includes(stat)) {
                total += getCharacteristicVal(stat) * 2;
            }
         });
      }
    }
    return total > 0 ? total : edu * 4;
  }, [character.characteristics, character.occupationFormula, selectedAttribute, formulaAnalysis]);

  const { occupationalSpent } = calculateSpentPoints(character);
  const remainingPoints = totalPoints - occupationalSpent;
  const isOverLimit = remainingPoints < 0;

  const handleSkillPointChange = (skillName: string, inputValue: string) => {
    const points = parseInt(inputValue);
    const cleanPoints = isNaN(points) ? 0 : Math.max(0, points);

    const newSkills = character.skills.map(skill => {
      if (skill.name === skillName) {
        const base = skill.baseValue || 0;
        const personal = skill.personalPoints || 0;
        const newTotal = base + cleanPoints + personal;

        return {
          ...skill,
          occupationalPoints: cleanPoints,
          value: newTotal,
          isOccupational: true 
        };
      }
      return skill;
    });

    onChange({ skills: newSkills });
  };

  const handleAddElective = () => {
    if (!skillToAdd) return;
    if (!addedElectiveSkills.includes(skillToAdd)) {
       setAddedElectiveSkills([...addedElectiveSkills, skillToAdd]);
    }
    setSkillToAdd("");
  };

  const handleRemoveElective = (skillName: string) => {
    setAddedElectiveSkills(prev => prev.filter(s => s !== skillName));
    handleSkillPointChange(skillName, "0");
  };

  if (!currentOccupation) return null;
  
  const relevantSkillNames = [
     ...currentOccupation.skills,
     ...addedElectiveSkills
  ];

  const displayedSkills = character.skills.filter(skill => 
    relevantSkillNames.includes(skill.name) || 
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
             Fórmula: <code className="bg-muted px-1 rounded font-bold text-primary">{character.occupationFormula}</code>
          </DialogDescription>
        </DialogHeader>

        {formulaAnalysis.type === "choice" && (
           <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900 mb-2">
              <Label className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3 block flex items-center gap-2">
                 <AlertCircle className="w-4 h-4"/>
                 {formulaAnalysis.label}
              </Label>
              <RadioGroup 
                 value={selectedAttribute || ""} 
                 onValueChange={setSelectedAttribute}
                 className="flex flex-wrap gap-4"
              >
                 {formulaAnalysis.options.map(opt => {
                    const labelMap: Record<string, string> = { 
                        "STR": "FUE", "DEX": "DES", "APP": "APA", "POW": "POD",
                        "FUE": "FUE", "DES": "DES", "APA": "APA", "POD": "POD"
                    };
                    const displayLabel = labelMap[opt] || opt;
                    const val = getCharacteristicVal(opt);
                    const isSelected = selectedAttribute === opt;

                    return (
                       <div key={opt} className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-all ${isSelected ? "bg-white dark:bg-stone-800 border-blue-500 ring-1 ring-blue-500 shadow-sm" : "bg-white/50 dark:bg-stone-900/50 border-transparent hover:bg-white"}`}>
                          <RadioGroupItem value={opt} id={`opt-${opt}`} />
                          <Label htmlFor={`opt-${opt}`} className="cursor-pointer font-mono font-bold text-lg flex flex-col items-center leading-none gap-1">
                             <span>{displayLabel}</span>
                             <span className="text-xs font-normal text-muted-foreground">({val})</span>
                          </Label>
                       </div>
                    )
                 })}
              </RadioGroup>
           </div>
        )}

        <div className="bg-stone-100 dark:bg-stone-900 p-4 rounded-lg space-y-2 border border-stone-200 dark:border-stone-800">
          <div className="flex justify-between text-sm font-medium">
            <span>Puntos Gastados: <span className="text-foreground font-bold">{occupationalSpent}</span> / {totalPoints}</span>
            <span className={isOverLimit ? "text-destructive font-bold" : "text-emerald-600 dark:text-emerald-400 font-bold"}>
              {remainingPoints} disponibles
            </span>
          </div>
          <Progress 
            value={totalPoints > 0 ? (occupationalSpent / totalPoints) * 100 : 0} 
            className={isOverLimit ? "[&>div]:bg-destructive h-2.5" : "h-2.5 [&>div]:bg-primary"} 
          />
          <div className="flex justify-end h-4">
             {isOverLimit && <span className="text-xs text-destructive flex items-center gap-1 font-bold"><AlertCircle className="w-3 h-3"/> Límite excedido</span>}
             {remainingPoints === 0 && !isOverLimit && totalPoints > 0 && <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 className="w-3 h-3"/> Completado</span>}
          </div>
        </div>

        <ScrollArea className="flex-1 -mr-4 pr-4 border rounded-md p-2 mt-2 bg-stone-50/50 dark:bg-stone-950/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedSkills.map((skill, index) => {
               const uniqueKey = `${skill.name}-${index}`;
               const isElective = addedElectiveSkills.includes(skill.name);

               return (
                <div key={uniqueKey} className="flex items-center gap-3 p-4 rounded-md border bg-card hover:bg-accent/5 transition-colors group relative min-h-[80px]">
                  
                  {isElective && (
                     <button 
                        onClick={() => handleRemoveElective(skill.name)}
                        className="absolute top-1 right-1 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Quitar de la lista de ocupación"
                     >
                        <Trash2 className="h-4 w-4" />
                     </button>
                  )}

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="mb-1.5 pr-2">
                       <Label className="font-bold text-sm leading-tight block whitespace-normal" title={skill.name}>
                          {skill.name}
                          {isElective && <Badge variant="secondary" className="ml-2 text-[10px] h-4 px-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100 align-middle">Electiva</Badge>}
                       </Label>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">Base: {skill.baseValue}%</span>
                      <span>Total: <span className="font-bold text-foreground text-sm">{skill.value}%</span></span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 bg-background p-1 rounded border shadow-sm">
                        <span className="text-[10px] font-semibold text-muted-foreground px-1">PTS</span>
                        <Input 
                        type="number"
                        min={0}
                        className="h-9 w-16 text-right px-2 focus-visible:ring-1 font-bold text-lg"
                        value={skill.occupationalPoints || 0}
                        onChange={(e) => handleSkillPointChange(skill.name, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t space-y-3">
           <Label className="text-sm font-bold flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-500" />
              Añadir Habilidades Electivas
           </Label>
           <div className="flex gap-2">
              <Select value={skillToAdd} onValueChange={setSkillToAdd}>
                 <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecciona una habilidad para añadir..." />
                 </SelectTrigger>
                 <SelectContent>
                    {Object.entries(SKILL_GROUPS).map(([group, skills]) => (
                       <div key={group}>
                          <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground bg-stone-100 dark:bg-stone-800">
                             {group}
                          </div>
                          {skills.map(skillName => (
                             <SelectItem key={skillName} value={skillName} disabled={relevantSkillNames.includes(skillName)}>
                                {skillName}
                             </SelectItem>
                          ))}
                       </div>
                    ))}
                    <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground bg-stone-100 dark:bg-stone-800">
                       Otras de tu ficha
                    </div>
                    {character.skills
                       .filter(s => !relevantSkillNames.includes(s.name) && !Object.values(SKILL_GROUPS).flat().includes(s.name))
                       .slice(0, 15)
                       .map(s => (
                          <SelectItem key={s.name} value={s.name}>
                             {s.name}
                          </SelectItem>
                       ))
                    }
                 </SelectContent>
              </Select>
              <Button onClick={handleAddElective} disabled={!skillToAdd}>
                 Añadir
              </Button>
           </div>
           <p className="text-[10px] text-muted-foreground">
              Utiliza esto para añadir habilidades opcionales (ej. "Una interpersonal", "Dos cualesquiera", etc.) a tu lista de puntos de ocupación.
           </p>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Listo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}