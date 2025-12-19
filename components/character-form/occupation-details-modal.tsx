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
import { AlertCircle, Plus, Trash2, Settings2, Calculator } from "lucide-react"
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

const STAT_OPTIONS = [
    { value: "STR", label: "FUE (STR)" },
    { value: "DEX", label: "DES (DEX)" },
    { value: "POW", label: "POD (POW)" },
    { value: "APP", label: "APA (APP)" },
    { value: "EDU", label: "EDU (EDU)" },
    { value: "INT", label: "INT (INT)" },
    { value: "SIZ", label: "TAM (SIZ)" },
    { value: "CON", label: "CON (CON)" },
];

export function OccupationDetailsModal({ isOpen, onClose, character, onChange }: OccupationDetailsModalProps) {
  const currentOccupation = PRESET_OCCUPATIONS.find(occ => occ.name === character.occupation);
  const isCustomOccupation = character.occupation === "Otra";
  
  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  const [addedElectiveSkills, setAddedElectiveSkills] = useState<string[]>([]);
  const [skillToAdd, setSkillToAdd] = useState<string>("");

  const [customStat1, setCustomStat1] = useState<string>("EDU");
  const [customStat2, setCustomStat2] = useState<string>("DEX");

  const getCharacteristicVal = (key: string): number => {
    const mapToKey: Record<string, string> = { 
        "FUE": "STR", "DES": "DEX", "POD": "POW", "APA": "APP", "TAM": "SIZ", "INT": "INT" 
    };
    const realKey = mapToKey[key] || key;
    // @ts-ignore
    const stat = character.characteristics[realKey as keyof typeof character.characteristics];
    
    if (typeof stat === 'object' && stat !== null && 'value' in stat) {
        return (stat as CharacteristicValue).value;
    }
    if (typeof stat === 'number') {
        return stat;
    }
    return 0;
  };

  useEffect(() => {
    if (isCustomOccupation) {
        const newFormula = `${customStat1}*2 + ${customStat2}*2`;
        if (character.occupationFormula !== newFormula) {
             onChange({ occupationFormula: newFormula });
        }
    }
  }, [customStat1, customStat2, isCustomOccupation, character.occupationFormula, onChange]);

  const formulaAnalysis = useMemo(() => {
    if (isCustomOccupation || !character.occupationFormula) return { type: "simple", options: [] as string[], label: "" };
    
    const f = character.occupationFormula.toUpperCase();
    const hasChoice = f.includes(" O ") || f.includes(" OR ") || f.includes("||") || f.includes("/");

    if (hasChoice) {
       const hasStr = f.includes("STR") || f.includes("FUE");
       const hasDex = f.includes("DEX") || f.includes("DES");
       if (hasStr && hasDex) return { type: "choice", options: ["STR", "DEX"], label: "Elige característica:" };
       
       const hasApp = f.includes("APP") || f.includes("APA");
       const hasPow = f.includes("POW") || f.includes("POD");
       if (hasApp && hasPow) return { type: "choice", options: ["APP", "POW"], label: "Elige característica:" };
    }
    return { type: "simple", options: [] as string[], label: "" };
  }, [character.occupationFormula, isCustomOccupation]);

  useEffect(() => {
    if (formulaAnalysis.type === "choice" && formulaAnalysis.options.length > 0 && !selectedAttribute) {
      setSelectedAttribute(formulaAnalysis.options[0]);
    }
  }, [formulaAnalysis, selectedAttribute]);

  const totalPoints = useMemo(() => {
    if (isCustomOccupation) {
        return getCharacteristicVal(customStat1) * 2 + getCharacteristicVal(customStat2) * 2;
    }

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
      } else {
         ["STR", "DEX", "POW", "APP", "SIZ", "INT", "FUE", "DES", "POD", "APA"].forEach(stat => {
            if (stat !== "EDU" && formula.includes(stat)) {
                total += getCharacteristicVal(stat) * 2;
            }
         });
      }
    }
    return total > 0 ? total : edu * 4;
  }, [character.characteristics, character.occupationFormula, selectedAttribute, formulaAnalysis, isCustomOccupation, customStat1, customStat2]);

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

  const rawAvailableSkills = character.skills.filter(s => 
     !relevantSkillNames.includes(s.name) && 
     !Object.values(SKILL_GROUPS).flat().includes(s.name)
  );
  
  const uniqueAvailableSkillNames = Array.from(new Set(rawAvailableSkills.map(s => s.name))).sort();

  const displayedSkills = character.skills.filter(skill => 
    relevantSkillNames.includes(skill.name) || 
    (skill.occupationalPoints && skill.occupationalPoints > 0)
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
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

        {/* CONTENEDOR CON SCROLL FIJO DE 60VH */}
        <ScrollArea className="h-[60vh] pr-4 -mr-4">
           <div className="space-y-4 pr-4">
                {isCustomOccupation && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900 space-y-4">
                        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold border-b border-amber-200 dark:border-amber-800 pb-2">
                            <Settings2 className="w-4 h-4" />
                            Configuración de "Otra" Ocupación
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                                    <Calculator className="w-3 h-3"/> Fórmula de Puntos
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Select value={customStat1} onValueChange={setCustomStat1}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STAT_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span className="font-bold text-muted-foreground">x2</span>
                                    <span className="font-bold text-lg">+</span>
                                    <Select value={customStat2} onValueChange={setCustomStat2}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STAT_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span className="font-bold text-muted-foreground">x2</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Elige las 2 características que definen esta profesión.
                                </p>
                            </div>

                            <div className="flex flex-col justify-center items-center md:items-end">
                                <Label className="text-xs text-muted-foreground uppercase font-bold mb-1">Habilidades Elegidas</Label>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-3xl font-bold ${displayedSkills.length > 7 ? "text-destructive" : "text-primary"}`}>
                                        {displayedSkills.length}
                                    </span>
                                    <span className="text-sm font-bold text-muted-foreground">/ 7</span>
                                </div>
                                {displayedSkills.length > 7 && (
                                    <span className="text-[10px] text-destructive font-bold animate-pulse">
                                        Recomendado: máx 7
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {!isCustomOccupation && formulaAnalysis.type === "choice" && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900 mb-2">
                    <Label className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3 block flex items-center gap-2">
                        <AlertCircle className="w-4 h-4"/>
                        {formulaAnalysis.label}
                    </Label>
                    <RadioGroup value={selectedAttribute || ""} onValueChange={setSelectedAttribute} className="flex flex-wrap gap-4">
                        {formulaAnalysis.options.map(opt => {
                            const labelMap: Record<string, string> = { "STR": "FUE", "DEX": "DES", "APP": "APA", "POW": "POD" };
                            return (
                            <div key={opt} className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition-all ${selectedAttribute === opt ? "bg-white border-blue-500 ring-1 ring-blue-500" : "bg-white/50 border-transparent hover:bg-white"}`}>
                                <RadioGroupItem value={opt} id={`opt-${opt}`} />
                                <Label htmlFor={`opt-${opt}`} className="cursor-pointer font-bold">{labelMap[opt] || opt} ({getCharacteristicVal(opt)})</Label>
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
                    <Progress value={totalPoints > 0 ? (occupationalSpent / totalPoints) * 100 : 0} className={isOverLimit ? "[&>div]:bg-destructive h-2.5" : "h-2.5 [&>div]:bg-primary"} />
                </div>

                <div className="border rounded-md p-2 bg-stone-50/50 dark:bg-stone-950/30 min-h-[150px]">
                    {displayedSkills.length === 0 && isCustomOccupation ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                            <Plus className="w-10 h-10 opacity-20" />
                            <p className="text-sm">Añade habilidades usando el selector inferior</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {displayedSkills.map((skill, index) => {
                                const isElective = addedElectiveSkills.includes(skill.name) || (isCustomOccupation && !currentOccupation.skills.includes(skill.name));
                                const uniqueKey = `${skill.name}-${index}`; 
                                
                                return (
                                    <div key={uniqueKey} className="flex items-center gap-3 p-4 rounded-md border bg-card relative group">
                                        {isElective && (
                                            <button onClick={() => handleRemoveElective(skill.name)} className="absolute top-1 right-1 text-stone-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        <div className="flex-1">
                                            <Label className="font-bold text-sm block">{skill.name}</Label>
                                            <span className="text-xs text-muted-foreground">Base: {skill.baseValue}% | Total: <span className="text-foreground font-bold">{skill.value}%</span></span>
                                        </div>
                                        <div className="flex items-center bg-background border rounded px-2">
                                            <span className="text-[10px] text-muted-foreground mr-1">PTS</span>
                                            <Input 
                                                type="number" 
                                                className="h-8 w-14 text-right border-0 p-0 focus-visible:ring-0 font-bold" 
                                                value={skill.occupationalPoints || 0}
                                                onChange={(e) => handleSkillPointChange(skill.name, e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="pt-2 border-t space-y-3 pb-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                        <Plus className="w-4 h-4 text-blue-500" />
                        {isCustomOccupation ? "Añadir Habilidades de Ocupación" : "Añadir Habilidades Electivas"}
                    </Label>
                    <div className="flex gap-2">
                        <Select value={skillToAdd} onValueChange={setSkillToAdd}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Selecciona habilidad..." />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(SKILL_GROUPS).map(([group, skills]) => (
                                <div key={group}>
                                    <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground bg-stone-100 dark:bg-stone-800">{group}</div>
                                    {skills.map(skillName => (
                                        <SelectItem key={skillName} value={skillName} disabled={relevantSkillNames.includes(skillName)}>{skillName}</SelectItem>
                                    ))}
                                </div>
                                ))}
                                <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground bg-stone-100 dark:bg-stone-800">Otras de tu ficha</div>
                                {uniqueAvailableSkillNames.slice(0, 30).map(name => (
                                    <SelectItem key={name} value={name}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAddElective} disabled={!skillToAdd}>Añadir</Button>
                    </div>
                </div>
           </div>
        </ScrollArea>

        <DialogFooter className="mt-4 pt-2 border-t">
          <Button onClick={onClose}>Listo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}