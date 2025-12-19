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
import { Plus, Trash2, Settings2 } from "lucide-react"
import { Character, CharacteristicValue, Skill } from "@/lib/character-types"
import { PRESET_OCCUPATIONS } from "@/lib/occupations-data"
import { calculateSpentPoints } from "@/lib/occupation-utils"

interface OccupationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  character: Character
  onChange: (updates: Partial<Character>) => void
}

const SKILL_GROUPS: Record<string, string[]> = {
  "Interpersonal": ["Charlatanería", "Encanto", "Intimidar", "Persuasión", "Psicología"],
  "Combate": ["Pelea", "Armas de Fuego (Pistola)", "Armas de Fuego (Fusil/Escopeta)", "Lanzar"],
  "Académicas": ["Historia", "Bibliotecología", "Ocultismo", "Ciencias (Biología)", "Ciencias (Química)", "Antropología", "Arqueología"],
  "Otras": ["Conducir automóvil", "Cerrajería", "Sigilo", "Ocultarse", "Escuchar", "Descubrir", "Electricidad", "Mecánica", "Primeros auxilios"]
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
  const [specializationInput, setSpecializationInput] = useState<Record<string, string>>({});
  
  const [customStat1, setCustomStat1] = useState<string>("EDU");
  const [customStat2, setCustomStat2] = useState<string>("DEX");

  const getCharacteristicVal = (key: string): number => {
    const mapToKey: Record<string, string> = { 
        "FUE": "STR", "DES": "DEX", "POD": "POW", "APA": "APP", "TAM": "SIZ", "INT": "INT" 
    };
    const realKey = mapToKey[key] || key;
    // @ts-ignore
    const stat = character.characteristics[realKey as keyof typeof character.characteristics];
    if (typeof stat === 'object' && stat !== null && 'value' in stat) return (stat as CharacteristicValue).value;
    if (typeof stat === 'number') return stat;
    return 0;
  };

  const formulaAnalysis = useMemo(() => {
    if (isCustomOccupation || !character.occupationFormula) return { type: "simple", options: [] as string[], label: "" };
    const f = character.occupationFormula.toUpperCase();
    const hasChoice = f.includes(" O ") || f.includes(" OR ") || f.includes("||") || f.includes("/");
    if (hasChoice) {
       if ((f.includes("STR") || f.includes("FUE")) && (f.includes("DEX") || f.includes("DES"))) 
          return { type: "choice", options: ["STR", "DEX"], label: "Elige característica:" };
       if ((f.includes("APP") || f.includes("APA")) && (f.includes("POW") || f.includes("POD"))) 
          return { type: "choice", options: ["APP", "POW"], label: "Elige característica:" };
       if (f.includes("STR") || f.includes("FUE")) return { type: "choice", options: ["STR", "DEX"], label: "Elige característica (FUE/DES):" }; 
    }
    return { type: "simple", options: [] as string[], label: "" };
  }, [character.occupationFormula, isCustomOccupation]);

  useEffect(() => {
    if (isCustomOccupation) {
        const newFormula = `${customStat1}*2 + ${customStat2}*2`;
        if (character.occupationFormula !== newFormula) onChange({ occupationFormula: newFormula });
    }
  }, [customStat1, customStat2, isCustomOccupation, character.occupationFormula, onChange]);

  useEffect(() => {
    if (formulaAnalysis.type === "choice" && formulaAnalysis.options.length > 0 && !selectedAttribute) {
      setSelectedAttribute(formulaAnalysis.options[0]);
    }
  }, [formulaAnalysis, selectedAttribute]);

  const totalPoints = useMemo(() => {
    if (isCustomOccupation) return getCharacteristicVal(customStat1) * 2 + getCharacteristicVal(customStat2) * 2;
    if (!character.occupationFormula) return 0;
    
    const edu = getCharacteristicVal("EDU");
    const formula = character.occupationFormula.toUpperCase();
    let total = 0;

    if (formula === "EDU*4" || (formula.includes("EDU") && !formula.includes("+"))) return edu * 4;

    if (formula.includes("EDU*2")) {
      total += edu * 2;
      if (formulaAnalysis.type === "choice" && selectedAttribute) {
         total += getCharacteristicVal(selectedAttribute) * 2;
      } else {
         ["STR", "DEX", "POW", "APP", "SIZ", "INT", "FUE", "DES", "POD", "APA"].forEach(stat => {
            if (stat !== "EDU" && formula.includes(stat)) total += getCharacteristicVal(stat) * 2;
         });
      }
    }
    return total > 0 ? total : edu * 4;
  }, [character.characteristics, character.occupationFormula, selectedAttribute, formulaAnalysis, isCustomOccupation, customStat1, customStat2]);

  // --- CORRECCIÓN PRINCIPAL AQUÍ ---
  const slotAnalysis = useMemo(() => {
      if (!currentOccupation) return []; 
      
      const requiredSlots: { type: string, count: number, originalName: string }[] = [];
      const fixedSkills: string[] = [];

      currentOccupation.skills.forEach(s => {
          if (typeof s === 'string') {
              fixedSkills.push(s);
          } else {
              if (s.isAny) {
                  if (s.name.includes("Arte") || s.name.includes("Ciencia") || s.name.includes("Idioma") || s.name.includes("Otras lenguas")) {
                      // Manual creation
                  } else {
                      requiredSlots.push({ 
                          type: s.name.includes("Interpersonal") ? "Interpersonal" : "Cualquiera",
                          count: s.count || 1,
                          originalName: s.name
                      });
                  }
              } else {
                  fixedSkills.push(s.name);
              }
          }
      });

      const filledSlots: Record<string, number> = { "Interpersonal": 0, "Cualquiera": 0 };
      
      const userElectives = character.skills.filter(s => 
          s.isOccupational && 
          !fixedSkills.includes(s.name) &&
          !fixedSkills.includes(s.customName || "") &&
          !s.name.includes("(") 
      );

      userElectives.forEach(skill => {
          const isInterpersonal = SKILL_GROUPS["Interpersonal"].includes(skill.name);
          
          // Solo contamos como interpersonal si la ocupación realmente tiene ese slot
          const hasInterpersonalSlot = requiredSlots.some(r => r.type === "Interpersonal");

          if (isInterpersonal && hasInterpersonalSlot && filledSlots["Interpersonal"] < (requiredSlots.find(r => r.type === "Interpersonal")?.count || 0)) {
              filledSlots["Interpersonal"]++;
          } else {
               filledSlots["Cualquiera"]++;
          }
      });

      const finalSlots = requiredSlots.map(req => ({
          ...req,
          used: 0 // Lo asignamos después
      }));
      
      const consolidatedSlots: Record<string, {type: string, count: number, used: number}> = {};
      finalSlots.forEach(slot => {
          if (!consolidatedSlots[slot.type]) {
              consolidatedSlots[slot.type] = { type: slot.type, count: 0, used: 0 };
          }
          consolidatedSlots[slot.type].count += slot.count;
      });

      // --- ASIGNACIÓN SEGURA ---
      // Solo asignamos si la key existe en el objeto (evita el crash en Bibliotecario)
      if (consolidatedSlots["Interpersonal"]) {
          consolidatedSlots["Interpersonal"].used = filledSlots["Interpersonal"];
      }
      if (consolidatedSlots["Cualquiera"]) {
          consolidatedSlots["Cualquiera"].used = filledSlots["Cualquiera"];
      }

      return Object.values(consolidatedSlots).filter(s => s.count > 0);

  }, [currentOccupation, character.skills]);

  const handleSkillPointChange = (skillName: string, inputValue: string) => {
    const points = parseInt(inputValue);
    const cleanPoints = isNaN(points) ? 0 : Math.max(0, points);
    const newSkills = character.skills.map(skill => {
      if (skill.name === skillName || skill.customName === skillName) {
        return { ...skill, occupationalPoints: cleanPoints, value: skill.baseValue + cleanPoints + (skill.personalPoints || 0), isOccupational: true };
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
    const newSkills = character.skills.map(s => {
        if (s.name === skillToAdd) return { ...s, isOccupational: true };
        return s;
    });
    onChange({ skills: newSkills });
    setSkillToAdd("");
  };

  const handleRemoveElective = (skillName: string) => {
    setAddedElectiveSkills(prev => prev.filter(s => s !== skillName));
    const newSkills = character.skills.map(s => {
        if (s.name === skillName) return { ...s, isOccupational: false, occupationalPoints: 0, value: s.baseValue + (s.personalPoints || 0) };
        return s;
    });
    onChange({ skills: newSkills });
  };

  const handleCreateSpecialization = (baseName: string, specName: string) => {
    if (!specName.trim()) return;
    const fullName = `${baseName} (${specName})`;
    if (character.skills.some(s => s.name === fullName)) return;
    const parentBase = character.skills.find(s => s.name.startsWith(baseName))?.baseValue || 5;
    
    const newSkill: Skill = {
        name: fullName, baseValue: parentBase, value: parentBase, occupationalPoints: 0, personalPoints: 0, isOccupational: true, isCustom: true
    };
    const newSkillsList = [...character.skills, newSkill];
    setAddedElectiveSkills([...addedElectiveSkills, fullName]);
    onChange({ skills: newSkillsList });
    setSpecializationInput(prev => ({ ...prev, [baseName]: "" }));
  };

  if (!currentOccupation) return null;

  const { occupationalSpent } = calculateSpentPoints(character);
  const remainingPoints = totalPoints - occupationalSpent;
  const isOverLimit = remainingPoints < 0;

  const manualSpecializations = currentOccupation.skills.filter(s => 
      typeof s === 'object' && s.isAny && 
      (s.name.includes("Arte") || s.name.includes("Ciencia") || s.name.includes("lengua") || s.name.includes("Idioma"))
  ).map(s => (typeof s === 'object' ? s.name : s));

  const relevantSkillNames = [
     ...currentOccupation.skills.map(s => typeof s === 'string' ? s : s.isAny ? null : s.name).filter(Boolean),
     ...addedElectiveSkills,
     ...character.skills.filter(s => s.isOccupational).map(s => s.name)
  ];
  
  const displayedSkills = character.skills.filter(skill => relevantSkillNames.includes(skill.name)).sort((a,b) => a.name.localeCompare(b.name));
  
  const rawAvailableSkills = character.skills.filter(s => !relevantSkillNames.includes(s.name));
  const uniqueAvailableSkillNames = Array.from(new Set(rawAvailableSkills.map(s => s.name))).sort();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {currentOccupation.name}
            </DialogTitle>
            <Badge variant="outline">Crédito: {currentOccupation.creditRating[0]} - {currentOccupation.creditRating[1]}%</Badge>
          </div>
          <DialogDescription>Fórmula: {character.occupationFormula}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4 -mr-4">
           <div className="space-y-4 pr-4">
                
                {/* --- CONFIGURACIÓN CUSTOM --- */}
                {isCustomOccupation && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-100 space-y-4">
                        <Label className="font-bold flex items-center gap-2"><Settings2 className="w-4 h-4"/> Configuración Personalizada</Label>
                        <div className="flex items-center gap-2">
                             <Select value={customStat1} onValueChange={setCustomStat1}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{STAT_OPTIONS.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                             <span>x2 +</span>
                             <Select value={customStat2} onValueChange={setCustomStat2}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{STAT_OPTIONS.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                             <span>x2</span>
                        </div>
                    </div>
                )}

                {!isCustomOccupation && formulaAnalysis.type === "choice" && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-100">
                        <Label className="text-blue-900 font-bold mb-2 block">{formulaAnalysis.label}</Label>
                        <RadioGroup value={selectedAttribute || ""} onValueChange={setSelectedAttribute} className="flex gap-4">
                            {formulaAnalysis.options.map(opt => (
                                <div key={opt} className="flex items-center space-x-2 bg-white px-3 py-1 rounded border">
                                    <RadioGroupItem value={opt} id={opt} />
                                    <Label htmlFor={opt}>{opt} ({getCharacteristicVal(opt)})</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                )}

                <div className="bg-stone-100 dark:bg-stone-900 p-4 rounded-lg border">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Puntos: <b>{occupationalSpent}</b> / {totalPoints}</span>
                        <span className={isOverLimit ? "text-red-500 font-bold" : "text-green-600 font-bold"}>{remainingPoints} restantes</span>
                    </div>
                    <Progress value={(occupationalSpent/totalPoints)*100} className={isOverLimit ? "[&>div]:bg-red-500" : ""} />
                </div>

                {slotAnalysis.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {slotAnalysis.map(slot => (
                            <div key={slot.type} className={`p-3 rounded border text-center ${slot.used > slot.count ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{slot.type}</div>
                                <div className="text-xl font-bold">
                                    <span className={slot.used > slot.count ? "text-red-600" : "text-green-700"}>{slot.used}</span>
                                    <span className="text-stone-400"> / </span>
                                    <span>{slot.count}</span>
                                </div>
                                <div className="text-[10px] text-stone-500 mt-1">Habilidades elegidas</div>
                            </div>
                        ))}
                    </div>
                )}

                {manualSpecializations.length > 0 && (
                    <div className="space-y-2 p-3 bg-stone-50 rounded border">
                        <Label className="text-xs font-bold uppercase text-stone-500">Especializaciones Requeridas</Label>
                        <div className="grid md:grid-cols-2 gap-2">
                            {manualSpecializations.map((baseName, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input placeholder={`Ej: ${baseName} (Pintura)`} className="h-8 text-sm" 
                                        value={specializationInput[baseName as string] || ""}
                                        onChange={e => setSpecializationInput({...specializationInput, [baseName as string]: e.target.value})}
                                    />
                                    <Button size="sm" variant="outline" className="h-8" onClick={() => handleCreateSpecialization(baseName as string, specializationInput[baseName as string])} disabled={!specializationInput[baseName as string]}>
                                        <Plus className="w-3 h-3"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[100px]">
                    {displayedSkills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded border bg-card relative group">
                            {!currentOccupation.skills.includes(skill.name) && !manualSpecializations.includes(skill.name.split(" (")[0]) && (
                                <button onClick={() => handleRemoveElective(skill.name)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                            )}
                            <div className="flex-1 overflow-hidden">
                                <div className="font-bold text-sm truncate">{skill.customName || skill.name}</div>
                                <div className="text-xs text-muted-foreground">Base: {skill.baseValue}% | Total: <b>{skill.value}%</b></div>
                            </div>
                            <Input type="number" className="w-16 text-right font-bold h-8" value={skill.occupationalPoints || 0} onChange={e => handleSkillPointChange(skill.name, e.target.value)} onFocus={e => e.target.select()} />
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t">
                    <Label className="mb-2 block font-bold flex items-center gap-2"><Plus className="w-4 h-4 text-blue-500"/> Añadir Habilidad Electiva / Interpersonal</Label>
                    <div className="flex gap-2">
                        <Select value={skillToAdd} onValueChange={setSkillToAdd}>
                            <SelectTrigger className="flex-1"><SelectValue placeholder="Selecciona..."/></SelectTrigger>
                            <SelectContent>
                                {Object.entries(SKILL_GROUPS).map(([grp, list]) => (
                                    <div key={grp}>
                                        <div className="bg-stone-100 px-2 py-1 text-xs font-bold text-stone-500">{grp}</div>
                                        {list.map(s => <SelectItem key={s} value={s} disabled={displayedSkills.some(ds => ds.name === s)}>{s}</SelectItem>)}
                                    </div>
                                ))}
                                <div className="bg-stone-100 px-2 py-1 text-xs font-bold text-stone-500">Todas</div>
                                {uniqueAvailableSkillNames.slice(0,50).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAddElective} disabled={!skillToAdd}>Añadir</Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        Usa esto para llenar los cupos de "Interpersonal" o "Cualquiera".
                    </p>
                </div>

           </div>
        </ScrollArea>
        <DialogFooter className="mt-4"><Button onClick={onClose}>Listo</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}