"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
// Quitamos ScrollArea para usar scroll nativo
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2, Settings2 } from "lucide-react"
import { Character, CharacteristicValue } from "@/lib/character-types"
import { PRESET_OCCUPATIONS, SkillRequirement } from "@/lib/occupations-data"
import { calculateSpentPoints } from "@/lib/occupation-utils"

// Lista base de habilidades para los desplegables de elección libre
const COMMON_SKILLS = [
  "Antropología", "Arqueología", "Armas de fuego (Pistola)", "Armas de fuego (Rifle/Escopeta)",
  "Charlatanería", "Ciencia", "Combatir (Pelea)", "Conducir automóvil", "Derecho", "Descubrir", 
  "Disfrazarse", "Electricidad", "Encanto", "Equitación", "Escuchar", "Esquivar",
  "Historia", "Intimidar", "Lanzar", "Mecánica", "Medicina", "Mitos de Cthulhu", "Nadar", "Ocultismo", 
  "Orientarse", "Persuasión", "Primeros auxilios", "Psicoanálisis", "Psicología", "Saltar", "Sigilo", 
  "Seguir rastros", "Trepar"
];

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

interface OccupationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onChange: (updates: Partial<Character>) => void;
}

export function OccupationDetailsModal({ isOpen, onClose, character, onChange }: OccupationDetailsModalProps) {
  const currentOccupation = PRESET_OCCUPATIONS.find(occ => occ.name === character.occupation);
  const isCustomOccupation = character.occupation === "Otra";

  const [selectedAttribute, setSelectedAttribute] = useState<string | null>(null);
  const [specializationInput, setSpecializationInput] = useState<string>("");
  const [customStat1, setCustomStat1] = useState<string>("EDU");
  const [customStat2, setCustomStat2] = useState<string>("DEX");

  // Helper para obtener valor de características
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

  // Análisis de fórmula para elecciones (STR o DEX)
  const formulaAnalysis = useMemo(() => {
    if (isCustomOccupation || !character.occupationFormula) return { type: "simple", options: [] as string[], label: "" };
    const f = character.occupationFormula.toUpperCase();
    
    if ((f.includes("STR") || f.includes("FUE")) && (f.includes("DEX") || f.includes("DES")) && (f.includes(" OR ") || f.includes(" O "))) 
        return { type: "choice", options: ["STR", "DEX"], label: "Elige característica:" };
    if ((f.includes("APP") || f.includes("APA")) && (f.includes("POW") || f.includes("POD")) && (f.includes(" OR ") || f.includes(" O "))) 
        return { type: "choice", options: ["APP", "POW"], label: "Elige característica:" };
    if ((f.includes("DEX") || f.includes("DES")) && (f.includes("APP") || f.includes("APA")) && (f.includes(" OR ") || f.includes(" O "))) 
        return { type: "choice", options: ["DEX", "APP"], label: "Elige característica:" };
    
    return { type: "simple", options: [] as string[], label: "" };
  }, [character.occupationFormula, isCustomOccupation]);

  // Actualizar fórmula custom
  useEffect(() => {
    if (isCustomOccupation) {
        const newFormula = `${customStat1}*2 + ${customStat2}*2`;
        if (character.occupationFormula !== newFormula) onChange({ occupationFormula: newFormula });
    }
  }, [customStat1, customStat2, isCustomOccupation, character.occupationFormula, onChange]);

  // Autoseleccionar primera opción de fórmula
  useEffect(() => {
    if (formulaAnalysis.type === "choice" && formulaAnalysis.options.length > 0 && !selectedAttribute) {
      setSelectedAttribute(formulaAnalysis.options[0]);
    }
  }, [formulaAnalysis, selectedAttribute]);

  // Cálculo de puntos totales
  const totalPoints = useMemo(() => {
    if (isCustomOccupation) return getCharacteristicVal(customStat1) * 2 + getCharacteristicVal(customStat2) * 2;
    if (!character.occupationFormula) return 0;
    
    const edu = getCharacteristicVal("EDU");
    const formula = character.occupationFormula.toUpperCase();
    let total = 0;

    if (formula === "EDU*4") return edu * 4;

    if (formula.includes("EDU*2")) {
      total += edu * 2;
      if (formulaAnalysis.type === "choice" && selectedAttribute) {
         total += getCharacteristicVal(selectedAttribute) * 2;
      } else {
         ["STR", "DEX", "POW", "APP"].forEach(stat => {
            if (stat !== "EDU" && formula.includes(stat)) total += getCharacteristicVal(stat) * 2;
         });
      }
    }
    return total > 0 ? total : edu * 4;
  }, [character.characteristics, character.occupationFormula, selectedAttribute, formulaAnalysis, isCustomOccupation, customStat1, customStat2]);

  const { occupationalSpent } = calculateSpentPoints(character);
  const remainingPoints = totalPoints - occupationalSpent;

  // --- MANEJO DE HABILIDADES ---

  const updateSkillPoints = (skillName: string, points: number) => {
    const existing = character.skills.find(s => s.name === skillName || s.customName === skillName);
    let newSkills = [...character.skills];

    if (existing) {
      newSkills = newSkills.map(s => 
        (s.name === skillName || s.customName === skillName) ? 
        { ...s, occupationalPoints: points, value: s.baseValue + points + (s.personalPoints || 0), isOccupational: true } : s
      );
    } else {
      // Nueva habilidad
      newSkills.push({
        name: skillName,
        baseValue: 0,
        value: points,
        occupationalPoints: points,
        personalPoints: 0,
        isOccupational: true,
        isCustom: true
      });
    }
    onChange({ skills: newSkills });
  };

  const removeOccupationalSkill = (skillName: string) => {
    const newSkills = character.skills.map(s => 
      s.name === skillName ? { ...s, occupationalPoints: 0, isOccupational: false, value: s.baseValue + (s.personalPoints || 0) } : s
    );
    onChange({ skills: newSkills });
  };

  if (!currentOccupation) return null;

  // --- RENDERIZADO DE REQUISITOS ---

  const renderRequirement = (req: SkillRequirement, index: number) => {
    // CASO 1: HABILIDAD FIJA (String)
    if (typeof req === "string") {
      const skill = character.skills.find(s => s.name === req);
      const points = skill?.occupationalPoints || 0;
      
      return (
        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded mb-2">
          <div className="flex-1 font-medium text-sm">{req}</div>
          <Input 
            type="number" 
            className="w-20 text-right h-9 bg-white dark:bg-slate-950" 
            value={points || ""} 
            placeholder="0"
            onChange={(e) => updateSkillPoints(req, parseInt(e.target.value) || 0)} 
            onFocus={(e) => e.target.select()}
          />
        </div>
      );
    }

    // CASO 2: ELECCIÓN (Choice)
    if (req.type === "choice") {
      const selectedCount = req.options.filter(opt => {
        const s = character.skills.find(skill => skill.name === opt);
        return s && s.isOccupational && (s.occupationalPoints || 0) > 0;
      }).length;

      return (
        <div key={index} className="mb-4 p-3 border rounded bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900">
          <div className="flex justify-between mb-2">
            <Label className="font-bold text-blue-800 dark:text-blue-300">{req.label || "Elige habilidades"}</Label>
            <span className={`text-xs font-bold ${selectedCount >= req.count ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
              {selectedCount} / {req.count}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {req.options.map(optName => {
              const skill = character.skills.find(s => s.name === optName);
              const isSelected = skill?.isOccupational && (skill.occupationalPoints || 0) > 0;
              
              return (
                <div key={optName} className={`flex items-center gap-2 p-2 rounded border transition-colors ${isSelected ? "bg-white dark:bg-slate-950 shadow-sm border-blue-200 dark:border-blue-800" : "opacity-70 dark:opacity-60 border-transparent hover:bg-white/50 dark:hover:bg-white/5"}`}>
                  <Checkbox 
                    checked={isSelected}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        if (selectedCount < req.count) updateSkillPoints(optName, 10);
                      } else {
                        updateSkillPoints(optName, 0);
                      }
                    }}
                    disabled={!isSelected && selectedCount >= req.count}
                  />
                  <span className="text-sm flex-1">{optName}</span>
                  {isSelected && (
                    <Input 
                      className="w-16 h-7 text-xs text-right bg-white dark:bg-slate-900" 
                      value={skill?.occupationalPoints} 
                      onChange={(e) => updateSkillPoints(optName, parseInt(e.target.value) || 0)}
                      onFocus={(e) => e.target.select()}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // CASO 3: CUALQUIERA (Any)
    if (req.type === "any") {
      const usedSkillsInFixed = currentOccupation.skills.filter(r => typeof r === "string") as string[];
      const usedSkillsInChoice = currentOccupation.skills
        .filter(r => typeof r === "object" && r.type === "choice")
        .flatMap((r: any) => r.options);
        
      const excludedNames = [...usedSkillsInFixed, ...usedSkillsInChoice];

      const customOccupationalSkills = character.skills.filter(s => 
        s.isOccupational && 
        (s.occupationalPoints || 0) > 0 &&
        !excludedNames.includes(s.name)
      );

      const slotsFilled = customOccupationalSkills.length;
      
      return (
        <div key={index} className="mb-4 p-3 border rounded bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900">
           <div className="flex justify-between mb-2">
            <Label className="font-bold text-amber-800 dark:text-amber-400">{req.label || "Habilidades a elección / Especialidades"}</Label>
            <span className={`text-xs font-bold ${slotsFilled > req.count ? "text-red-600 dark:text-red-400" : "text-amber-700 dark:text-amber-500"}`}>{slotsFilled} / {req.count}</span>
          </div>

          {/* Lista de habilidades ya añadidas */}
          {customOccupationalSkills.map(skill => (
             <div key={skill.name} className="flex items-center gap-2 mb-2 bg-white/50 dark:bg-black/20 p-1 rounded border dark:border-white/10">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 dark:hover:text-red-400" onClick={() => removeOccupationalSkill(skill.name)}>
                  <Trash2 className="w-4 h-4"/>
                </Button>
                <div className="flex-1 text-sm font-medium truncate">{skill.name}</div>
                <Input 
                   className="w-20 text-right h-8 bg-white dark:bg-slate-950" 
                   value={skill.occupationalPoints}
                   onChange={(e) => updateSkillPoints(skill.name, parseInt(e.target.value) || 0)}
                   onFocus={(e) => e.target.select()}
                />
             </div>
          ))}

          {/* Selector para añadir */}
          {slotsFilled < req.count && (
            <div className="flex gap-2 items-center mt-2">
              <Select value="" onValueChange={(val) => {
                  if (val === "Ciencia" || val === "Arte/Artesanía" || val === "Otras lenguas") {
                    setSpecializationInput(val);
                  } else {
                    updateSkillPoints(val, 10);
                  }
              }}>
                <SelectTrigger className="flex-1 bg-white dark:bg-slate-950 h-9"><SelectValue placeholder="Añadir habilidad..." /></SelectTrigger>
                <SelectContent>
                  <div className="p-1">
                      <div className="text-xs font-bold text-muted-foreground mb-1 px-2">Especialidades</div>
                      <SelectItem value="Ciencia">Ciencia...</SelectItem>
                      <SelectItem value="Combatir">Combatir...</SelectItem>
                      <SelectItem value="Armas de fuego">Armas de fuego...</SelectItem>
                      <SelectItem value="Arte/Artesanía">Arte/Artesanía...</SelectItem>
                      <SelectItem value="Otras lenguas">Otras lenguas...</SelectItem>
                      <SelectItem value="Lengua propia">Lengua propia...</SelectItem>
                      <SelectItem value="Pilotar">Pilotar...</SelectItem>
                      <SelectItem value="Supervivencia">Supervivencia...</SelectItem>
                      <div className="border-t dark:border-slate-800 my-1"></div>
                      <div className="text-xs font-bold text-muted-foreground mb-1 px-2">Comunes</div>
                      {COMMON_SKILLS.filter(n => !character.skills.some(s => s.name === n && s.isOccupational)).map(sk => (
                        <SelectItem key={sk} value={sk}>{sk}</SelectItem>
                      ))}
                  </div>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Input para especialización */}
          {specializationInput && (
            <div className="flex gap-2 mt-2 items-center animate-in fade-in slide-in-from-top-1 bg-white dark:bg-slate-950 p-2 rounded border dark:border-slate-800 shadow-sm">
              <span className="text-sm font-bold whitespace-nowrap">{specializationInput}:</span>
              <Input 
                placeholder="Ej: Biología, Inglés, Pintura..." 
                id="spec-input"
                className="flex-1 h-8 bg-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                     const val = e.currentTarget.value;
                     if(val) {
                       updateSkillPoints(`${specializationInput} (${val})`, 10);
                       setSpecializationInput("");
                     }
                  }
                }}
              />
              <Button size="sm" className="h-8" onClick={() => {
                const el = document.getElementById("spec-input") as HTMLInputElement;
                if(el && el.value) {
                   updateSkillPoints(`${specializationInput} (${el.value})`, 10);
                   setSpecializationInput("");
                }
              }}>Ok</Button>
              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setSpecializationInput("")}>X</Button>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 85vh fixed height container with flex column layout */}
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-2 shrink-0">
            <div className="flex justify-between items-start">
                <div>
                    <DialogTitle className="text-2xl">{currentOccupation.name}</DialogTitle>
                    <div className="flex gap-2 text-sm text-muted-foreground mt-1 items-center">
                        <Badge variant="outline">Crédito: {currentOccupation.creditRating.join("-")}</Badge>
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Fórmula: {character.occupationFormula}</span>
                    </div>
                </div>
            </div>
        </DialogHeader>

        <div className="px-6 py-2 bg-slate-50 dark:bg-slate-900 border-y dark:border-slate-800 shrink-0">
           <div className="flex justify-between text-sm font-bold mb-1">
              <span>Puntos de Ocupación</span>
              <span className={remainingPoints < 0 ? "text-red-500 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                {remainingPoints} disponibles
              </span>
           </div>
           <Progress value={Math.min(100, (occupationalSpent / totalPoints) * 100)} className={`h-2 ${remainingPoints < 0 ? "[&>div]:bg-red-500" : ""}`} />
        </div>

        {/* Scrollable Content Area - Native Scrollbar */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <div className="space-y-4 pb-10">
                {/* --- CONFIGURACIÓN CUSTOM --- */}
                {isCustomOccupation && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 dark:border-amber-900 space-y-4 mb-4">
                        <Label className="font-bold flex items-center gap-2"><Settings2 className="w-4 h-4"/> Configuración Personalizada</Label>
                        <div className="flex items-center gap-2">
                             <Select value={customStat1} onValueChange={setCustomStat1}><SelectTrigger className="bg-white dark:bg-black"><SelectValue/></SelectTrigger><SelectContent>{STAT_OPTIONS.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                             <span>x2 +</span>
                             <Select value={customStat2} onValueChange={setCustomStat2}><SelectTrigger className="bg-white dark:bg-black"><SelectValue/></SelectTrigger><SelectContent>{STAT_OPTIONS.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                             <span>x2</span>
                        </div>
                    </div>
                )}

                {!isCustomOccupation && formulaAnalysis.type === "choice" && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900 mb-4">
                        <Label className="text-blue-900 dark:text-blue-200 font-bold mb-2 block">{formulaAnalysis.label}</Label>
                        <RadioGroup value={selectedAttribute || ""} onValueChange={setSelectedAttribute} className="flex gap-4">
                            {formulaAnalysis.options.map(opt => (
                                <div key={opt} className="flex items-center space-x-2 bg-white dark:bg-slate-900 px-3 py-1 rounded border dark:border-slate-800">
                                    <RadioGroupItem value={opt} id={opt} />
                                    <Label htmlFor={opt}>{opt} ({getCharacteristicVal(opt)})</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                )}

             {currentOccupation.skills.map((req, i) => renderRequirement(req, i))}
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-slate-50 dark:bg-slate-900 dark:border-slate-800 shrink-0">
          <Button onClick={onClose} className="w-full md:w-auto">Guardar y Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}