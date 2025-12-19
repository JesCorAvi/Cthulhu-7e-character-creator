"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import type { Character, Skill } from "@/lib/character-types"
import { PRESET_OCCUPATIONS, OCCUPATION_FORMULAS, OccupationFormula } from "@/lib/occupations-data"
import { calculateOccupationalPoints, calculatePersonalInterestPoints } from "@/lib/occupation-utils"
import { Plus, Search, Briefcase, User, Info } from "lucide-react"

interface SkillsSectionProps {
  character: Character
  onChange: (character: Character) => void
}

export function SkillsSection({ character, onChange }: SkillsSectionProps) {
  const [search, setSearch] = useState("")
  const [isCustomMode, setIsCustomMode] = useState(false)
  
  // Estado local para selección de característica opcional (STR vs DEX)
  const [optionalStat, setOptionalStat] = useState<"STR"|"DEX"|"APP"|"POW" | undefined>(undefined)

  // 1. Cálculos de Puntos Totales
  const personalTotal = useMemo(() => calculatePersonalInterestPoints(character), [character.characteristics]);
  
  const occupationTotal = useMemo(() => {
    const formula = (character.occupationFormula as OccupationFormula) || "EDU*4";
    // Determinar automáticamente el stat opcional si no está seleccionado
    let effectiveStat = optionalStat;
    if (!effectiveStat) {
       if (formula.includes("STR") && formula.includes("DEX")) {
          effectiveStat = character.characteristics.STR.value > character.characteristics.DEX.value ? "STR" : "DEX";
       }
    }
    return calculateOccupationalPoints(character, formula, effectiveStat);
  }, [character, optionalStat]);

  // 2. Cálculo de Puntos Gastados (Iteramos las habilidades)
  const { occSpent, perSpent } = useMemo(() => {
    let o = 0;
    let p = 0;
    character.skills.forEach(s => {
      o += s.occupationalPoints || 0;
      p += s.personalPoints || 0;
    });
    return { occSpent: o, perSpent: p };
  }, [character.skills]);

  // Manejo de cambio de profesión
  const handleOccupationChange = (value: string) => {
    if (value === "custom") {
      setIsCustomMode(true);
      onChange({
        ...character,
        occupation: "Personalizada",
        occupationLabel: "Nueva Profesión",
        occupationFormula: "EDU*4",
        occupationalSkills: []
      });
    } else {
      setIsCustomMode(false);
      const preset = PRESET_OCCUPATIONS.find(p => p.name === value);
      if (preset) {
        // CORRECCIÓN: Convertimos los objetos complejos a strings simples para el estado del personaje
        const flattenedSkills = preset.skills.map(s => {
            if (typeof s === 'string') return s;
            return s.name; // Si es objeto, nos quedamos con el nombre base
        });

        onChange({
          ...character,
          occupation: preset.name,
          occupationFormula: preset.formula,
          occupationalSkills: flattenedSkills
        });
        
        // Resetear stat opcional
        if (preset.formula.includes("or")) setOptionalStat(undefined);
      }
    }
  };

  // Función para asignar puntos (maneja la lógica de qué pool usar)
  const handlePointAssignment = (index: number, newValue: number, type: 'occupation' | 'personal') => {
    const skill = character.skills[index];
    const currentTotal = skill.value;
    const base = skill.baseValue;
    const currentOcc = skill.occupationalPoints || 0;
    const currentPers = skill.personalPoints || 0;
    
    // El nuevo valor total
    let diff = newValue - currentTotal;
    
    // No permitir bajar del base
    if (newValue < base) return;

    const newSkills = [...character.skills];
    
    if (type === 'occupation') {
      // Verificar si hay puntos disponibles en el pool de ocupación
      if (diff > 0 && occSpent + diff > occupationTotal) return; // Cap alcanzado
      newSkills[index] = { 
        ...skill, 
        occupationalPoints: Math.max(0, currentOcc + diff),
        value: newValue 
      };
    } else {
       // Verificar si hay puntos disponibles en el pool personal
      if (diff > 0 && perSpent + diff > personalTotal) return; // Cap alcanzado
      newSkills[index] = { 
        ...skill, 
        personalPoints: Math.max(0, currentPers + diff),
        value: newValue 
      };
    }
    onChange({ ...character, skills: newSkills });
  };

  // Toggle para marcar una habilidad como ocupacional (solo Custom mode)
  const toggleOccupationalSkill = (skillName: string) => {
    const current = character.occupationalSkills || [];
    const exists = current.includes(skillName);
    let newOccList;
    
    if (exists) {
      newOccList = current.filter(s => s !== skillName);
    } else {
      if (current.length >= 8) return; // Máximo 8 habilidades
      newOccList = [...current, skillName];
    }

    onChange({ ...character, occupationalSkills: newOccList });
  };

  const filteredSkills = character.skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(search.toLowerCase()) ||
      (skill.customName && skill.customName.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* --- HEADER: SELECTOR DE PROFESIÓN --- */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label>Profesión</Label>
              <Select 
                value={isCustomMode ? "custom" : character.occupation} 
                onValueChange={handleOccupationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una profesión" />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_OCCUPATIONS.map((occ) => (
                    <SelectItem key={occ.name} value={occ.name}>{occ.name}</SelectItem>
                  ))}
                  <SelectItem value="custom" className="font-semibold text-primary">Creating personalizada...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Configuración extra para Custom o Fórmulas con Opción */}
            {isCustomMode && (
               <div className="flex-1 space-y-2">
                 <Label>Fórmula de Puntos</Label>
                 <Select 
                   value={character.occupationFormula} 
                   onValueChange={(val) => onChange({...character, occupationFormula: val})}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {OCCUPATION_FORMULAS.map(f => (
                       <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
            )}
            
            {/* Selector de característica opcional (si la fórmula lo requiere) */}
            {character.occupationFormula?.includes("or") && (
              <div className="w-32 space-y-2">
                <Label>Bono</Label>
                <Select 
                    value={optionalStat} 
                    onValueChange={(val: any) => setOptionalStat(val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Elegir" />
                  </SelectTrigger>
                  <SelectContent>
                     {character.occupationFormula.includes("STR") && <SelectItem value="STR">FUE</SelectItem>}
                     {character.occupationFormula.includes("DEX") && <SelectItem value="DEX">DES</SelectItem>}
                     {character.occupationFormula.includes("APP") && <SelectItem value="APP">APA</SelectItem>}
                     {character.occupationFormula.includes("POW") && <SelectItem value="POD">POD</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* --- CONTADORES DE PUNTOS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Ocupación */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-500">
                  <Briefcase className="w-4 h-4" /> Puntos de Ocupación
                </span>
                <span>{occSpent} / {occupationTotal}</span>
              </div>
              <Progress value={(occSpent / occupationTotal) * 100} className="h-2 bg-amber-100 dark:bg-amber-950" indicatorClassName="bg-amber-600" />
            </div>
            
            {/* Interés Personal */}
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-500">
                  <User className="w-4 h-4" /> Interés Personal
                </span>
                <span>{perSpent} / {personalTotal}</span>
              </div>
              <Progress value={(perSpent / personalTotal) * 100} className="h-2 bg-blue-100 dark:bg-blue-950" indicatorClassName="bg-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- BUSCADOR --- */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar habilidad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* --- GRID DE HABILIDADES --- */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-[600px] overflow-y-auto pr-2">
        {filteredSkills.map((skill, index) => {
          const actualIndex = character.skills.findIndex((s) => s === skill)
          // Determinar si es habilidad ocupacional (por nombre o customName)
          const skillIdent = skill.customName || skill.name;
          const isOccupational = character.occupationalSkills?.some(s => skillIdent.includes(s));
          
          return (
            <div
              key={`${skill.name}-${actualIndex}`}
              className={`p-3 rounded-lg border transition-colors ${
                isOccupational 
                  ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800" 
                  : "bg-card border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                   {/* Checkbox para seleccionar como Ocupacional (Solo Custom Mode) */}
                   {isCustomMode && (
                     <Checkbox 
                       checked={isOccupational}
                       onCheckedChange={() => toggleOccupationalSkill(skillIdent)}
                       className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                     />
                   )}
                   
                   <div className="flex flex-col truncate">
                      <Label className={`truncate cursor-pointer font-medium ${isOccupational ? "text-amber-800 dark:text-amber-400" : ""}`}>
                        {skill.customName || skill.name}
                      </Label>
                      <span className="text-xs text-muted-foreground">Base: {skill.baseValue}%</span>
                   </div>
                </div>
                
                {/* Valor Total */}
                <div className="text-lg font-bold w-12 text-center">
                  {skill.value}
                </div>
              </div>

              {/* Inputs para asignar puntos */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                 {/* Input Ocupación */}
                 <div className="relative">
                    <Input
                      type="number"
                      disabled={!isOccupational} // Solo editable si es de profesión
                      value={skill.occupationalPoints || 0}
                      onChange={(e) => {
                         const added = parseInt(e.target.value) || 0;
                         // Calculamos el valor final sumando base + personal + NUEVO ocupacional
                         const newVal = skill.baseValue + (skill.personalPoints || 0) + added;
                         handlePointAssignment(actualIndex, newVal, 'occupation');
                      }}
                      className={`h-7 text-xs pr-1 text-right ${!isOccupational ? "opacity-30" : "border-amber-200 focus-visible:ring-amber-500"}`}
                    />
                    <span className="absolute left-1 top-1.5 text-[10px] text-muted-foreground pointer-events-none">Ocu</span>
                 </div>

                 {/* Input Personal */}
                 <div className="relative">
                    <Input
                      type="number"
                      value={skill.personalPoints || 0}
                      onChange={(e) => {
                         const added = parseInt(e.target.value) || 0;
                         // Calculamos el valor final sumando base + ocupacional + NUEVO personal
                         const newVal = skill.baseValue + (skill.occupationalPoints || 0) + added;
                         handlePointAssignment(actualIndex, newVal, 'personal');
                      }}
                      className="h-7 text-xs pr-1 text-right border-blue-200 focus-visible:ring-blue-500"
                    />
                    <span className="absolute left-1 top-1.5 text-[10px] text-muted-foreground pointer-events-none">Per</span>
                 </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}