"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2, Settings2, Plus, X } from "lucide-react"
import { Character, CharacteristicValue } from "@/lib/character-types"
import { PRESET_OCCUPATIONS, SkillRequirement, FieldRequirement } from "@/lib/occupations-data"
import { calculateSpentPoints } from "@/lib/occupation-utils"

const COMMON_SKILLS = [
  "Antropología", "Arqueología", "Charlatanería", "Conducir automóvil", "Derecho", "Descubrir", 
  "Disfrazarse", "Electricidad", "Encanto", "Equitación", "Escuchar", "Esquivar",
  "Historia", "Intimidar", "Lanzar", "Mecánica", "Medicina", "Mitos de Cthulhu", "Nadar", "Ocultismo", 
  "Orientarse", "Persuasión", "Primeros auxilios", "Psicoanálisis", "Psicología", "Saltar", "Sigilo", 
  "Seguir rastros", "Trepar"
];

const FIELDS = ["Ciencia", "Arte/Artesanía", "Otras lenguas", "Armas de fuego", "Combatir", "Supervivencia", "Lengua propia", "Pilotar"];

const STAT_OPTIONS = [
    { value: "STR", label: "FUE (STR)" }, { value: "DEX", label: "DES (DEX)" }, { value: "POW", label: "POD (POW)" },
    { value: "APP", label: "APA (APP)" }, { value: "EDU", label: "EDU (EDU)" }, { value: "INT", label: "INT (INT)" },
    { value: "SIZ", label: "TAM (SIZ)" }, { value: "CON", label: "CON (CON)" },
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
  // Usamos una clave única para el input activo para evitar saltos entre secciones
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [tempSpecValue, setTempSpecValue] = useState("");
  const [customStat1, setCustomStat1] = useState<string>("EDU");
  const [customStat2, setCustomStat2] = useState<string>("DEX");

  const getCharacteristicVal = (key: string): number => {
    const map: Record<string, string> = { "FUE": "STR", "DES": "DEX", "POD": "POW", "APA": "APP", "TAM": "SIZ", "INT": "INT" };
    const realKey = map[key] || key;
    // @ts-ignore
    const stat = character.characteristics[realKey as keyof typeof character.characteristics];
    return (stat as CharacteristicValue)?.value || 0;
  };

  const formulaAnalysis = useMemo(() => {
    if (isCustomOccupation || !character.occupationFormula) return { type: "simple", options: [] as string[] };
    const f = character.occupationFormula.toUpperCase();
    if (f.includes("STR") && f.includes("DEX") && (f.includes("OR") || f.includes("O"))) return { type: "choice", options: ["STR", "DEX"], label: "Elige característica:" };
    if (f.includes("APP") && f.includes("POW") && (f.includes("OR") || f.includes("O"))) return { type: "choice", options: ["APP", "POW"], label: "Elige característica:" };
    return { type: "simple", options: [] as string[] };
  }, [character.occupationFormula, isCustomOccupation]);

  const totalPoints = useMemo(() => {
    if (isCustomOccupation) return getCharacteristicVal(customStat1) * 2 + getCharacteristicVal(customStat2) * 2;
    if (!character.occupationFormula) return 0;
    const edu = getCharacteristicVal("EDU");
    if (character.occupationFormula === "EDU*4") return edu * 4;
    let total = edu * 2;
    if (selectedAttribute) total += getCharacteristicVal(selectedAttribute) * 2;
    else ["STR", "DEX", "POW", "APP"].forEach(s => { if (s !== "EDU" && character.occupationFormula?.includes(s)) total += getCharacteristicVal(s) * 2; });
    return total;
  }, [character.characteristics, character.occupationFormula, selectedAttribute, isCustomOccupation, customStat1, customStat2]);

  const { occupationalSpent } = calculateSpentPoints(character);
  const remainingPoints = totalPoints - occupationalSpent;

  if (!currentOccupation && !isCustomOccupation) return null;

  const updateSkillPoints = (name: string, pts: number) => {
    const existing = character.skills.find(s => s.name === name);
    let newSkills = [...character.skills];
    if (existing) {
        newSkills = newSkills.map(s => s.name === name ? { ...s, occupationalPoints: pts, value: s.baseValue + pts + (s.personalPoints || 0), isOccupational: pts > 0 } : s);
    } else {
        newSkills.push({ name, baseValue: 0, value: pts, occupationalPoints: pts, personalPoints: 0, isOccupational: true, isCustom: true });
    }
    onChange({ skills: newSkills });
  };

  const FieldSelector = ({ req, uniqueId, isInsideChoice = false }: { req: FieldRequirement, uniqueId: string, isInsideChoice?: boolean }) => {
    const added = character.skills.filter(s => s.isOccupational && s.name.startsWith(`${req.field}: `));
    const isAdding = activeFieldKey === uniqueId;

    const handleAdd = () => {
        if (tempSpecValue.trim()) {
            updateSkillPoints(`${req.field}: ${tempSpecValue.trim()}`, 10);
            setTempSpecValue("");
            setActiveFieldKey(null);
        }
    };

    return (
        <div className={`space-y-2 ${!isInsideChoice ? "mb-4 p-3 border rounded bg-slate-50 dark:bg-slate-900/40" : ""}`}>
            {!isInsideChoice && (
                <div className="flex justify-between mb-1">
                    <Label className="font-bold">{req.label || req.field}</Label>
                    <span className="text-xs font-bold">{added.length} / {req.count}</span>
                </div>
            )}
            <div className="space-y-1">
                {added.map(s => (
                    <div key={s.name} className="flex items-center gap-2 bg-white dark:bg-slate-950 p-1 rounded border">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => updateSkillPoints(s.name, 0)}><Trash2 className="w-3 h-3"/></Button>
                        <span className="flex-1 text-xs truncate">{s.name}</span>
                        <Input className="w-14 h-6 text-right text-xs" value={s.occupationalPoints} onChange={(e) => updateSkillPoints(s.name, parseInt(e.target.value) || 0)} onFocus={(e) => e.target.select()}/>
                    </div>
                ))}
                
                {added.length < req.count && !isAdding && (
                    <Button variant="outline" size="sm" className="w-full h-8 border-dashed text-xs" onClick={() => {setActiveFieldKey(uniqueId); setTempSpecValue("");}}>
                        <Plus className="w-3 h-3 mr-1"/> Definir {req.field}
                    </Button>
                )}

                {isAdding && (
                    <div className="flex gap-1 animate-in fade-in zoom-in-95 duration-200">
                        <Input 
                            autoFocus 
                            placeholder="Ej: Biología, Escopeta..." 
                            className="h-8 text-xs flex-1" 
                            value={tempSpecValue} 
                            onChange={(e) => setTempSpecValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <Button size="sm" className="h-8 px-2" onClick={handleAdd}>Ok</Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => {setActiveFieldKey(null); setTempSpecValue("");}}><X className="w-3 h-3"/></Button>
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderRequirement = (req: SkillRequirement, index: number) => {
    if (typeof req === "string") {
      const skill = character.skills.find(s => s.name === req);
      return (
        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 border rounded mb-2">
          <div className="flex-1 font-medium text-sm">{req}</div>
          <Input type="number" className="w-20 text-right h-9" value={skill?.occupationalPoints || ""} placeholder="0" onChange={(e) => updateSkillPoints(req, parseInt(e.target.value) || 0)} onFocus={(e) => e.target.select()}/>
        </div>
      );
    }

    if (req.type === "field") return <FieldSelector key={index} req={req} uniqueId={`field-${index}`} />;

    if (req.type === "choice") {
      const selectedCount = req.options.filter(opt => {
        if (typeof opt === "string") {
            const s = character.skills.find(sk => sk.name === opt);
            return s && s.isOccupational && (s.occupationalPoints || 0) > 0;
        }
        return character.skills.some(s => s.isOccupational && s.name.startsWith(`${opt.field}: `));
      }).length;

      return (
        <div key={index} className="mb-4 p-3 border rounded bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900">
          <div className="flex justify-between mb-2">
            <Label className="font-bold text-blue-800 dark:text-blue-300">{req.label}</Label>
            <span className="text-xs font-bold">{selectedCount} / {req.count}</span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {req.options.map((opt, i) => {
              if (typeof opt === "string") {
                const skill = character.skills.find(s => s.name === opt);
                const isSelected = !!(skill?.isOccupational && (skill.occupationalPoints || 0) > 0);
                return (
                  <div key={i} className="flex items-center gap-2 p-2 rounded border bg-white dark:bg-slate-950">
                    <Checkbox checked={isSelected} onCheckedChange={(c) => c ? (selectedCount < req.count && updateSkillPoints(opt, 10)) : updateSkillPoints(opt, 0)} disabled={!isSelected && selectedCount >= req.count}/>
                    <span className="text-sm flex-1">{opt}</span>
                    {isSelected && <Input className="w-16 h-7 text-right" value={skill?.occupationalPoints} onChange={(e) => updateSkillPoints(opt, parseInt(e.target.value) || 0)}/>}
                  </div>
                );
              } else {
                return (
                  <div key={i} className="p-2 rounded border bg-white dark:bg-slate-950">
                     <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{opt.field}</Badge>
                        <span className="text-xs text-muted-foreground">Especialización</span>
                     </div>
                     <FieldSelector req={opt} uniqueId={`choice-${index}-${i}`} isInsideChoice={true} />
                  </div>
                );
              }
            })}
          </div>
        </div>
      );
    }

    if (req.type === "any") {
        const baseSkillNames = currentOccupation?.skills.filter(r => typeof r === "string") as string[] || [];
        // Habilidades que no son fijas de la profesión ni pertenecen a un campo ya definido arriba
        const added = character.skills.filter(s => 
            s.isOccupational && 
            (s.occupationalPoints || 0) > 0 && 
            !baseSkillNames.includes(s.name) &&
            !FIELDS.some(f => s.name.startsWith(`${f}: `))
        );
        
        return (
          <div key={index} className="mb-4 p-3 border rounded bg-amber-50/50 dark:bg-amber-900/10 border-amber-100">
            <div className="flex justify-between mb-2"><Label className="font-bold">{req.label}</Label><span className="text-xs font-bold">{added.length} / {req.count}</span></div>
            
            {/* Primero mostramos los campos dinámicos que se hayan añadido vía "any" */}
            {FIELDS.map(f => {
                const fieldSkills = character.skills.filter(s => s.isOccupational && s.name.startsWith(`${f}: `) && !currentOccupation?.skills.some(r => typeof r === 'object' && r.type === 'field' && r.field === f));
                if (fieldSkills.length === 0) return null;
                return (
                    <div key={f} className="mb-2 p-2 border rounded bg-white/30">
                        <Badge variant="outline" className="mb-1">{f}</Badge>
                        {fieldSkills.map(s => (
                            <div key={s.name} className="flex items-center gap-2 mb-1 bg-white dark:bg-slate-950 p-1 rounded border">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => updateSkillPoints(s.name, 0)}><Trash2 className="w-3 h-3"/></Button>
                                <span className="flex-1 text-xs truncate">{s.name}</span>
                                <Input className="w-14 h-6 text-right text-xs" value={s.occupationalPoints} onChange={(e) => updateSkillPoints(s.name, parseInt(e.target.value) || 0)}/>
                            </div>
                        ))}
                    </div>
                );
            })}

            {/* Habilidades comunes añadidas */}
            {added.map(s => (
                <div key={s.name} className="flex items-center gap-2 mb-2 bg-white/50 dark:bg-black/20 p-1 rounded border">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => updateSkillPoints(s.name, 0)}><Trash2 className="w-4 h-4"/></Button>
                    <span className="flex-1 text-sm">{s.name}</span>
                    <Input className="w-20 text-right h-8" value={s.occupationalPoints} onChange={(e) => updateSkillPoints(s.name, parseInt(e.target.value) || 0)}/>
                </div>
            ))}

            {added.length < req.count && (
              <div className="flex gap-2 mt-2">
                <Select onValueChange={(v) => FIELDS.includes(v) ? setActiveFieldKey(`any-${v}`) : updateSkillPoints(v, 10)}>
                  <SelectTrigger className="h-9 bg-white dark:bg-slate-950"><SelectValue placeholder="Añadir..." /></SelectTrigger>
                  <SelectContent>
                    <div className="text-xs font-bold p-2 text-muted-foreground">Especialidades</div>
                    {FIELDS.map(f => <SelectItem key={f} value={f}>{f}...</SelectItem>)}
                    <div className="border-t my-1"></div>
                    {COMMON_SKILLS.filter(n => !character.skills.some(s => s.name === n && s.isOccupational)).map(sk => <SelectItem key={sk} value={sk}>{sk}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {activeFieldKey?.startsWith("any-") && (
              <div className="mt-2 flex gap-1 bg-white dark:bg-slate-950 p-2 rounded border border-amber-200">
                <Badge variant="outline" className="h-8">{activeFieldKey.split("-")[1]}:</Badge>
                <Input 
                    autoFocus 
                    placeholder="Escribe la especialidad..." 
                    className="h-8 text-xs flex-1" 
                    value={tempSpecValue} 
                    onChange={(e) => setTempSpecValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && tempSpecValue && (updateSkillPoints(`${activeFieldKey.split("-")[1]}: ${tempSpecValue}`, 10), setTempSpecValue(""), setActiveFieldKey(null))}
                />
                <Button size="sm" className="h-8" onClick={() => {if(tempSpecValue) updateSkillPoints(`${activeFieldKey.split("-")[1]}: ${tempSpecValue}`, 10); setTempSpecValue(""); setActiveFieldKey(null);}}>Ok</Button>
                <Button size="sm" variant="ghost" onClick={() => {setActiveFieldKey(null); setTempSpecValue("");}}><X className="w-3 h-3"/></Button>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl">{currentOccupation?.name || "Otra"}</DialogTitle>
            <div className="flex gap-2 text-sm mt-1">
                <Badge variant="outline">Crédito: {currentOccupation?.creditRating.join("-") || "0-99"}</Badge>
                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Fórmula: {character.occupationFormula}</span>
            </div>
        </DialogHeader>
        <div className="px-6 py-2 bg-slate-50 dark:bg-slate-900 border-y">
           <div className="flex justify-between text-sm font-bold mb-1">
              <span>Puntos de Ocupación</span>
              <span className={remainingPoints < 0 ? "text-red-500" : "text-green-600"}>{remainingPoints} disponibles</span>
           </div>
           <Progress value={Math.min(100, (occupationalSpent / totalPoints) * 100)} className={`h-2 ${remainingPoints < 0 ? "[&>div]:bg-red-500" : ""}`} />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
             {isCustomOccupation && (
                <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-lg border border-amber-100 space-y-4">
                    <Label className="font-bold flex items-center gap-2"><Settings2 className="w-4 h-4"/> Configuración</Label>
                    <div className="flex items-center gap-2">
                        <Select value={customStat1} onValueChange={setCustomStat1}><SelectTrigger className="bg-white dark:bg-black"><SelectValue/></SelectTrigger><SelectContent>{STAT_OPTIONS.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                        <span>x2 +</span>
                        <Select value={customStat2} onValueChange={setCustomStat2}><SelectTrigger className="bg-white dark:bg-black"><SelectValue/></SelectTrigger><SelectContent>{STAT_OPTIONS.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
                        <span>x2</span>
                    </div>
                </div>
             )}
             {(currentOccupation?.skills || (isCustomOccupation ? [{ type: "any", count: 8, label: "Habilidades a elección" } as SkillRequirement] : [])).map((req, i) => renderRequirement(req, i))}
        </div>
        <DialogFooter className="p-4 border-t bg-slate-50 dark:bg-slate-900"><Button onClick={onClose} className="w-full">Guardar y Cerrar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}