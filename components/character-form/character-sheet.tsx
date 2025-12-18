"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import type { Character, CharacteristicValue, Skill, Weapon } from "@/lib/character-types"
import {
  createCharacteristicValue,
  calculateDamageBonus,
  calculateBuild,
  calculateMovement,
  calculateHitPoints,
  calculateMagicPoints,
  createDefaultWeapon,
} from "@/lib/character-utils"
import { Plus, Trash2, Search, Heart, Brain, Sparkles, Clover, Moon, Sun } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

interface CharacterSheetProps {
  character: Character
  onChange: (character: Character) => void
}

// Configuración de la cuadrícula de características solicitada (3 filas x 3 columnas)
const CHAR_GRID = [
  ["STR", "DEX", "POW"],
  ["CON", "APP", "EDU"],
  ["SIZ", "INT", "MOV"],
] as const

const CHAR_LABELS: Record<string, string> = {
  STR: "FUE",
  DEX: "DES",
  POW: "POD",
  CON: "CON",
  APP: "APA",
  EDU: "EDU",
  SIZ: "TAM",
  INT: "INT",
  MOV: "MOV",
}

// Componente visual para los bloques de números (estilo denso)
function SheetTracker({
  max = 99,
  current,
  onChange,
  className,
}: {
  max?: number
  current: number
  onChange: (value: number) => void
  className?: string
}) {
  const rows = [
    { start: 1, end: 15 },
    { start: 16, end: 36 },
    { start: 37, end: 57 },
    { start: 58, end: 78 },
    { start: 79, end: 99 },
  ]

  return (
    <div className={cn("flex flex-col gap-[1px] select-none", className)}>
      {rows.map((row, rIdx) => {
        const numbers = Array.from({ length: row.end - row.start + 1 }, (_, i) => row.start + i)
        return (
          <div key={rIdx} className="flex justify-between text-[8px] leading-[9px] gap-[1px]">
            {numbers.map((num) => (
              <div
                key={num}
                onClick={() => onChange(num)}
                className={cn(
                  "cursor-pointer w-full text-center hover:font-bold hover:text-primary transition-all flex items-center justify-center h-[10px]",
                  current === num
                    ? "font-extrabold text-primary-foreground bg-primary rounded-[1px] scale-125 z-10"
                    : "text-muted-foreground/60",
                  num > (max || 99) && "opacity-20 pointer-events-none"
                )}
              >
                {num}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export function CharacterSheet({ character, onChange }: CharacterSheetProps) {
  const [skillSearch, setSkillSearch] = useState("")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evitar hidratación incorrecta con el tema
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleBasicChange = (field: keyof Character, value: string | number) => {
    onChange({ ...character, [field]: value })
  }

  const handleCharChange = (key: keyof typeof character.characteristics, value: number) => {
    if (key === "MOV") return
    const newChar = createCharacteristicValue(value)
    const newCharacteristics = { ...character.characteristics, [key]: newChar }
    
    // Recálculos derivados
    const str = newCharacteristics.STR.value
    const dex = newCharacteristics.DEX.value
    const siz = newCharacteristics.SIZ.value
    const con = newCharacteristics.CON.value
    const pow = newCharacteristics.POW.value
    const edu = newCharacteristics.EDU.value

    const hp = calculateHitPoints(con, siz)
    const magic = calculateMagicPoints(pow)
    const mov = calculateMovement(dex, str, siz, character.age)

    const updatedSkills = character.skills.map((skill) => {
      if (skill.name === "Esquivar" && !skill.isFieldSlot) {
        return { ...skill, baseValue: Math.floor(dex / 2), value: Math.floor(dex / 2) }
      }
      if (skill.name === "Lengua propia" && !skill.isFieldSlot) {
        return { ...skill, baseValue: edu, value: edu }
      }
      return skill
    })

    onChange({
      ...character,
      characteristics: { ...newCharacteristics, MOV: mov },
      hitPoints: { ...character.hitPoints, max: hp, current: Math.min(character.hitPoints.current, hp) },
      sanity: { ...character.sanity, starting: pow, current: character.sanity.current === character.sanity.starting ? pow : character.sanity.current },
      magicPoints: { ...character.magicPoints, max: magic, current: Math.min(character.magicPoints.current, magic) },
      damageBonus: calculateDamageBonus(str, siz),
      build: calculateBuild(str, siz),
      dodge: Math.floor(dex / 2),
      skills: updatedSkills,
    })
  }

  // --- Lógica de Habilidades ---

  const updateSkill = (index: number, updates: Partial<Skill>) => {
    const newSkills = [...character.skills]
    newSkills[index] = { ...newSkills[index], ...updates }
    onChange({ ...character, skills: newSkills })
  }

  const addFieldSlot = (headerIndex: number) => {
    const header = character.skills[headerIndex]
    const newSlot: Skill = {
      name: header.name,
      baseValue: header.baseValue,
      value: header.baseValue,
      isOccupational: false,
      isFieldSlot: true,
      customName: "",
    }
    // Insertar justo después de la cabecera o de los slots existentes de esa cabecera
    let insertIndex = headerIndex + 1
    while (
      insertIndex < character.skills.length &&
      character.skills[insertIndex].isFieldSlot &&
      (character.skills[insertIndex].name === header.name || character.skills[insertIndex].name.startsWith(header.name))
    ) {
      insertIndex++
    }
    
    const newSkills = [...character.skills]
    newSkills.splice(insertIndex, 0, newSlot)
    onChange({ ...character, skills: newSkills })
  }

  const addCustomSkill = () => {
    onChange({ ...character, skills: [...character.skills, { name: "", baseValue: 1, value: 1, isOccupational: false, isCustom: true, customName: "" }] })
  }

  const removeSkill = (index: number) => {
    onChange({ ...character, skills: character.skills.filter((_, i) => i !== index) })
  }

  const updateWeapon = (index: number, updates: Partial<Weapon>) => {
    const newWeapons = [...character.weapons]
    newWeapons[index] = { ...newWeapons[index], ...updates }
    onChange({ ...character, weapons: newWeapons })
  }

  const addWeapon = () => {
    onChange({ ...character, weapons: [...character.weapons, createDefaultWeapon()] })
  }

  const removeWeapon = (index: number) => {
    onChange({ ...character, weapons: character.weapons.filter((_, i) => i !== index) })
  }

  const filteredSkills = character.skills.filter((skill) => {
    if (!skillSearch) return true
    const term = skillSearch.toLowerCase()
    return skill.name.toLowerCase().includes(term) || (skill.customName && skill.customName.toLowerCase().includes(term))
  })

  // Renderizado de Fila de Habilidad
  const renderSkillRow = (skill: Skill, idx: number) => {
    const actualIndex = character.skills.indexOf(skill)
    const half = Math.floor(skill.value / 2)
    const fifth = Math.floor(skill.value / 5)

    // A) CABECERA DE GRUPO (Ej: Arte y Oficio, Armas de Fuego)
    if (skill.isFieldHeader) {
       return (
         <div key={`header-${idx}`} className="flex items-center justify-between py-1 mt-2 border-b-2 border-muted-foreground/20 bg-muted/10 px-1">
            <span className="font-bold text-[10px] uppercase text-muted-foreground tracking-wider">
               {skill.name} {skill.baseValue > 0 ? `(${skill.baseValue}%)` : ""}
            </span>
            <Button 
               variant="ghost" 
               size="icon" 
               className="h-5 w-5 hover:bg-muted" 
               onClick={() => addFieldSlot(actualIndex)}
               title={`Añadir especialidad a ${skill.name}`}
            >
               <Plus className="h-3 w-3" />
            </Button>
         </div>
       )
    }

    // B) SLOT DE GRUPO (Ej: Pintura, Pistola) o HABILIDAD NORMAL
    const isSlot = skill.isFieldSlot
    const displayName = skill.customName || skill.name
    
    return (
      <div 
         key={idx} 
         className={cn(
            "flex items-center gap-2 text-[10px] border-b border-dotted border-border py-1 hover:bg-muted/30 px-1",
            isSlot && "pl-4 bg-muted/5 border-l-2 border-l-muted-foreground/20" // Indentación visual para slots
         )}
      >
         <Checkbox 
           className="h-3.5 w-3.5 rounded-sm border-muted-foreground/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
           checked={skill.isOccupational}
           onCheckedChange={(c) => updateSkill(actualIndex, { isOccupational: !!c })}
           title="Marcada como Ocupacional"
         />
         
         {/* Nombre de la Habilidad - Expandido (flex-1) */}
         <div className="flex-1 min-w-0 font-serif">
            {skill.isCustom || isSlot ? (
               <Input 
                 value={skill.customName} 
                 onChange={(e) => updateSkill(actualIndex, { customName: e.target.value })}
                 className="h-5 p-1 text-[11px] border-none bg-transparent w-full focus-visible:ring-0 font-serif placeholder:text-muted-foreground/50"
                 placeholder={isSlot ? `Especialidad de ${skill.name}` : "Nombre habilidad..."}
               />
            ) : (
               <span className={cn("text-[11px]", skill.isOccupational && "font-bold text-primary")}>
                  {displayName} <span className="text-muted-foreground text-[9px]">({skill.baseValue}%)</span>
               </span>
            )}
         </div>

         {/* Valor Principal */}
         <Input 
            type="number" 
            value={skill.value}
            onChange={(e) => updateSkill(actualIndex, { value: parseInt(e.target.value) || 0 })}
            className="h-6 w-10 text-center text-[11px] p-0 border border-input rounded-sm focus-visible:ring-1 font-bold bg-background"
         />
         
         {/* Valores Derivados */}
         <div className="flex flex-col text-[8px] leading-none text-muted-foreground w-5 text-center font-mono">
            <span>{half}</span>
            <span className="border-t border-muted-foreground/30">{fifth}</span>
         </div>

         {/* Botón Borrar (solo para custom o slots añadidos) */}
         {(skill.isCustom || isSlot) && (
            <button 
               onClick={() => removeSkill(actualIndex)} 
               className="text-muted-foreground/50 hover:text-destructive transition-colors px-1"
               title="Eliminar habilidad"
            >
               <Trash2 className="h-3 w-3"/>
            </button>
         )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-card text-card-foreground font-sans p-6 shadow-xl border border-border rounded-lg transition-colors duration-300">
      
      {/* --- SECCIÓN 1: CABECERA (DATOS) --- */}
      <div className="border-b-2 border-foreground/10 pb-4 mb-6 relative">
        {/* Selector de Tema Flotante */}
        {mounted && (
            <Button
               variant="ghost"
               size="icon"
               className="absolute top-0 right-0 rounded-full"
               onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
               title="Cambiar tema"
            >
               <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
               <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
        )}

        <div className="flex flex-col md:flex-row gap-8 pt-2">
          {/* Logo Placeholder */}
          <div className="md:w-1/4 flex items-center justify-center md:border-r border-foreground/10 pr-4">
            <h1 className="text-3xl md:text-4xl font-serif font-black text-center leading-none tracking-tighter text-foreground">
              LA LLAMADA DE<br/><span className="text-4xl md:text-5xl">CTHULHU</span>
            </h1>
          </div>
          
          {/* Datos Personales Grid */}
          <div className="md:w-3/4 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
             <div className="col-span-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nombre</Label>
                <Input 
                  value={character.name} onChange={(e) => handleBasicChange("name", e.target.value)} 
                  className="h-8 border-0 border-b border-foreground/20 rounded-none px-0 focus-visible:ring-0 font-serif text-xl bg-transparent font-bold placeholder:text-muted-foreground/30"
                  placeholder="Nombre del Investigador"
                />
             </div>
             <div className="col-span-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Ocupación</Label>
                <Input 
                  value={character.occupation} onChange={(e) => handleBasicChange("occupation", e.target.value)} 
                  className="h-8 border-0 border-b border-foreground/20 rounded-none px-0 focus-visible:ring-0 bg-transparent text-base"
                  placeholder="Profesión"
                />
             </div>
             <div>
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Edad</Label>
                <Input type="number" value={character.age} onChange={(e) => handleBasicChange("age", e.target.value)} className="h-8 border-0 border-b border-foreground/20 rounded-none px-0 focus-visible:ring-0 bg-transparent"/>
             </div>
             <div>
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Género</Label>
                <Input value={character.gender} onChange={(e) => handleBasicChange("gender", e.target.value)} className="h-8 border-0 border-b border-foreground/20 rounded-none px-0 focus-visible:ring-0 bg-transparent"/>
             </div>
             <div className="col-span-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Residencia</Label>
                <Input value={character.residence} onChange={(e) => handleBasicChange("residence", e.target.value)} className="h-8 border-0 border-b border-foreground/20 rounded-none px-0 focus-visible:ring-0 bg-transparent"/>
             </div>
             <div className="col-span-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Lugar de Nacimiento</Label>
                <Input value={character.birthplace} onChange={(e) => handleBasicChange("birthplace", e.target.value)} className="h-8 border-0 border-b border-foreground/20 rounded-none px-0 focus-visible:ring-0 bg-transparent"/>
             </div>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN 2: CARACTERÍSTICAS (GRID 3x3) --- */}
      <div className="mb-8 max-w-2xl mx-auto">
         <div className="grid grid-cols-3 gap-4">
             {CHAR_GRID.map((row, rowIdx) => (
                row.map((key) => {
                   let value = 0;
                   let half = 0;
                   let fifth = 0;
                   let label = "";

                   if (key === "MOV") {
                      value = character.characteristics.MOV;
                      label = "MOV";
                   } else {
                      const char = character.characteristics[key as keyof typeof character.characteristics] as CharacteristicValue;
                      value = char.value;
                      half = char.half;
                      fifth = char.fifth;
                      label = CHAR_LABELS[key];
                   }

                   return (
                     <div key={key} className="flex flex-col items-center border border-border p-2 rounded shadow-sm bg-accent/20">
                        <span className="text-xs font-black text-muted-foreground mb-1">{label}</span>
                        {key === "MOV" ? (
                           <div className="h-10 w-full flex items-center justify-center text-2xl font-black bg-background rounded border border-input">{value}</div>
                        ) : (
                           <Input 
                              type="number"
                              value={value}
                              onChange={(e) => handleCharChange(key as any, parseInt(e.target.value))}
                              className="h-10 w-full text-center text-2xl font-black border-input bg-background focus-visible:ring-1"
                           />
                        )}
                        {key !== "MOV" && (
                           <div className="flex w-full justify-between px-2 mt-1 text-[9px] text-muted-foreground font-mono">
                              <span title="Mitad">{half}</span>
                              <span title="Quinto">{fifth}</span>
                           </div>
                        )}
                     </div>
                   )
                })
             ))}
         </div>
      </div>

      {/* --- SECCIÓN 3: ESTADÍSTICAS DERIVADAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* PUNTOS DE VIDA */}
        <div className="border border-border p-3 rounded-lg bg-card shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
           <div className="flex items-center gap-2 mb-3 pl-3">
              <Heart className="w-4 h-4 text-red-500 fill-red-500"/> 
              <h3 className="font-serif font-bold text-lg">Puntos de Vida</h3>
           </div>
           
           <div className="flex gap-4 mb-4 pl-2">
              <div className="flex-1 text-center">
                 <Label className="text-[9px] uppercase text-muted-foreground block mb-1">Actual</Label>
                 <Input 
                   type="number" 
                   value={character.hitPoints.current} 
                   onChange={(e) => onChange({...character, hitPoints: {...character.hitPoints, current: parseInt(e.target.value)}})}
                   className="h-12 text-center text-3xl font-bold border-red-200 bg-red-50 dark:bg-red-950/20"
                 />
              </div>
              <div className="flex-1 text-center">
                 <Label className="text-[9px] uppercase text-muted-foreground block mb-1">Máx</Label>
                 <div className="h-12 flex items-center justify-center text-xl font-bold text-muted-foreground border border-input bg-muted/50 rounded">
                    {character.hitPoints.max}
                 </div>
              </div>
           </div>
           
           <div className="flex justify-between px-2 mb-3">
               <div className="flex items-center gap-1.5 hover:bg-muted/50 p-1 rounded">
                  <Checkbox id="mw" checked={character.hitPoints.majorWound} onCheckedChange={(c) => onChange({...character, hitPoints: {...character.hitPoints, majorWound: !!c}})} />
                  <Label htmlFor="mw" className="text-[9px] cursor-pointer">Herida Grave</Label>
               </div>
               <div className="flex items-center gap-1.5 hover:bg-muted/50 p-1 rounded">
                  <Checkbox id="dy" checked={character.hitPoints.dying} onCheckedChange={(c) => onChange({...character, hitPoints: {...character.hitPoints, dying: !!c}})} />
                  <Label htmlFor="dy" className="text-[9px] cursor-pointer">Moribundo</Label>
               </div>
           </div>

           <SheetTracker 
             current={character.hitPoints.current} 
             max={character.hitPoints.max}
             onChange={(v) => onChange({...character, hitPoints: {...character.hitPoints, current: v}})}
             className="mt-2 px-1"
           />
        </div>

        {/* CORDURA */}
        <div className="border border-border p-3 rounded-lg bg-card shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/50"></div>
           <div className="flex items-center gap-2 mb-3 pl-3">
              <Brain className="w-4 h-4 text-purple-500 fill-purple-500"/> 
              <h3 className="font-serif font-bold text-lg">Cordura</h3>
           </div>
           
           <div className="flex gap-4 mb-4 pl-2">
              <div className="flex-1 text-center">
                 <Label className="text-[9px] uppercase text-muted-foreground block mb-1">Actual</Label>
                 <Input 
                   type="number" 
                   value={character.sanity.current} 
                   onChange={(e) => onChange({...character, sanity: {...character.sanity, current: parseInt(e.target.value)}})}
                   className="h-12 text-center text-3xl font-bold border-purple-200 bg-purple-50 dark:bg-purple-950/20"
                 />
              </div>
              <div className="flex-1 text-center">
                 <Label className="text-[9px] uppercase text-muted-foreground block mb-1">Inicial</Label>
                 <div className="h-12 flex items-center justify-center text-xl font-bold text-muted-foreground border border-input bg-muted/50 rounded">
                    {character.sanity.starting}
                 </div>
              </div>
           </div>

           <div className="flex justify-between px-2 mb-3">
                <div className="flex items-center gap-1.5 hover:bg-muted/50 p-1 rounded">
                  <Checkbox id="ti" checked={character.sanity.temporaryInsanity} onCheckedChange={(c) => onChange({...character, sanity: {...character.sanity, temporaryInsanity: !!c}})} />
                  <Label htmlFor="ti" className="text-[9px] cursor-pointer">Locura Temporal</Label>
                </div>
                <div className="flex items-center gap-1.5 hover:bg-muted/50 p-1 rounded">
                  <Checkbox id="ii" checked={character.sanity.indefiniteInsanity} onCheckedChange={(c) => onChange({...character, sanity: {...character.sanity, indefiniteInsanity: !!c}})} />
                  <Label htmlFor="ii" className="text-[9px] cursor-pointer">Locura Indef.</Label>
                </div>
           </div>

           <SheetTracker 
             current={character.sanity.current} 
             max={99}
             onChange={(v) => onChange({...character, sanity: {...character.sanity, current: v}})}
             className="mt-2 px-1"
           />
        </div>

        {/* SUERTE */}
        <div className="border border-border p-3 rounded-lg bg-card shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/50"></div>
           <div className="flex items-center gap-2 mb-3 pl-3">
              <Clover className="w-4 h-4 text-yellow-500 fill-yellow-500"/> 
              <h3 className="font-serif font-bold text-lg">Suerte</h3>
           </div>
           
           <div className="flex gap-4 mb-4 pl-2">
               <div className="w-1/2 mx-auto">
                 <Label className="text-[9px] uppercase text-muted-foreground block text-center mb-1">Actual</Label>
                 <Input 
                   type="number" 
                   value={character.luck.current} 
                   onChange={(e) => onChange({...character, luck: {...character.luck, current: parseInt(e.target.value)}})}
                   className="h-12 text-center text-3xl font-bold border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
                 />
              </div>
           </div>
            <SheetTracker 
             current={character.luck.current} 
             max={99}
             onChange={(v) => onChange({...character, luck: {...character.luck, current: v}})}
             className="mt-2 px-1"
           />
        </div>

        {/* PUNTOS DE MAGIA */}
        <div className="border border-border p-3 rounded-lg bg-card shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
           <div className="flex items-center gap-2 mb-3 pl-3">
              <Sparkles className="w-4 h-4 text-blue-500 fill-blue-500"/> 
              <h3 className="font-serif font-bold text-lg">Puntos de Magia</h3>
           </div>
           
           <div className="flex gap-4 mb-4 pl-2">
               <div className="flex-1 text-center">
                 <Label className="text-[9px] uppercase text-muted-foreground block text-center mb-1">Actual</Label>
                 <Input 
                   type="number" 
                   value={character.magicPoints.current} 
                   onChange={(e) => onChange({...character, magicPoints: {...character.magicPoints, current: parseInt(e.target.value)}})}
                   className="h-12 text-center text-3xl font-bold border-blue-200 bg-blue-50 dark:bg-blue-950/20"
                 />
              </div>
              <div className="flex-1 text-center">
                 <Label className="text-[9px] uppercase text-muted-foreground block text-center mb-1">Máx</Label>
                 <div className="h-12 flex items-center justify-center text-xl font-bold text-muted-foreground border border-input bg-muted/50 rounded">
                    {character.magicPoints.max}
                 </div>
              </div>
           </div>
            <SheetTracker 
             current={character.magicPoints.current} 
             max={character.magicPoints.max}
             onChange={(v) => onChange({...character, magicPoints: {...character.magicPoints, current: v}})}
             className="mt-2 px-1"
           />
        </div>
      </div>

      {/* --- SECCIÓN 4: HABILIDADES (LISTADO) --- */}
      <div className="mb-8 border border-border rounded-lg p-4 bg-card shadow-sm">
        <div className="flex justify-between items-center border-b border-border mb-4 pb-2">
           <h3 className="font-serif font-bold text-xl">Habilidades del Investigador</h3>
           <div className="flex gap-2">
              <div className="relative">
                 <Search className="absolute left-2 top-1.5 h-4 w-4 text-muted-foreground"/>
                 <Input 
                    placeholder="Buscar..." 
                    value={skillSearch} 
                    onChange={e=>setSkillSearch(e.target.value)} 
                    className="h-8 w-40 pl-8 text-xs bg-muted/20" 
                 />
              </div>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={addCustomSkill}>
                  <Plus className="h-3.5 w-3.5 mr-1"/> Personalizada
              </Button>
           </div>
        </div>
        
        {/* Renderizado en columnas tipo Masonry/Grid Responsivo */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-1 pr-1">
           {filteredSkills.map((skill, i) => (
             <div key={i} className="break-inside-avoid">
                {renderSkillRow(skill, i)}
             </div>
           ))}
        </div>
      </div>

      {/* --- SECCIÓN 5: COMBATE Y ARMAS --- */}
      <div className="border border-border rounded-lg p-4 bg-card shadow-sm">
         <h3 className="font-serif font-bold text-xl mb-4 border-b border-border pb-2">Combate</h3>
         
         {/* Stats de Combate */}
         <div className="flex gap-4 md:gap-12 mb-6 bg-muted/10 p-4 rounded justify-around md:justify-start border border-border">
             <div className="text-center">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Bonif. Daño</Label>
                <span className="font-black text-xl font-serif text-foreground">{character.damageBonus}</span>
             </div>
             <div className="text-center md:border-l md:border-border md:pl-12">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Corpulencia</Label>
                <span className="font-black text-xl font-serif text-foreground">{character.build}</span>
             </div>
             <div className="text-center md:border-l md:border-border md:pl-12">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Esquivar</Label>
                <span className="font-black text-xl font-serif text-foreground">{character.dodge}</span>
             </div>
         </div>

         {/* Tabla de Armas */}
         <div className="w-full overflow-x-auto">
            <table className="w-full text-xs text-left">
               <thead>
                  <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                     <th className="p-2 font-bold rounded-tl">Arma</th>
                     <th className="p-2 text-center font-bold w-16">Regular</th>
                     <th className="p-2 text-center font-bold w-16">Difícil</th>
                     <th className="p-2 text-center font-bold w-16">Extremo</th>
                     <th className="p-2 font-bold w-20">Daño</th>
                     <th className="p-2 font-bold w-16">Alcance</th>
                     <th className="p-2 text-center font-bold w-10">Atq</th>
                     <th className="p-2 font-bold w-12">Mun.</th>
                     <th className="p-2 font-bold w-12 rounded-tr">Avería</th>
                     <th className="p-2 w-8"></th>
                  </tr>
               </thead>
               <tbody>
                  {character.weapons.map((w, i) => (
                     <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-1"><Input value={w.name} onChange={e => updateWeapon(i, {name: e.target.value})} className="h-7 text-xs border-none bg-transparent font-bold"/></td>
                        <td className="p-1"><Input type="number" value={w.normal} onChange={e => updateWeapon(i, {normal: parseInt(e.target.value)||0})} className="h-7 text-center text-xs border-none bg-transparent font-medium"/></td>
                        <td className="p-1"><Input type="number" value={w.difficult} onChange={e => updateWeapon(i, {difficult: parseInt(e.target.value)||0})} className="h-7 text-center text-xs border-none bg-transparent text-muted-foreground"/></td>
                        <td className="p-1"><Input type="number" value={w.extreme} onChange={e => updateWeapon(i, {extreme: parseInt(e.target.value)||0})} className="h-7 text-center text-xs border-none bg-transparent text-muted-foreground/70"/></td>
                        <td className="p-1"><Input value={w.damage} onChange={e => updateWeapon(i, {damage: e.target.value})} className="h-7 text-xs border-none bg-transparent"/></td>
                        <td className="p-1"><Input value={w.range} onChange={e => updateWeapon(i, {range: e.target.value})} className="h-7 text-xs border-none bg-transparent"/></td>
                        <td className="p-1"><Input type="number" value={w.attacks} onChange={e => updateWeapon(i, {attacks: parseInt(e.target.value)||1})} className="h-7 text-center text-xs border-none bg-transparent"/></td>
                        <td className="p-1"><Input value={w.ammo} onChange={e => updateWeapon(i, {ammo: e.target.value})} className="h-7 text-xs border-none bg-transparent"/></td>
                        <td className="p-1"><Input value={w.malfunction} onChange={e => updateWeapon(i, {malfunction: e.target.value})} className="h-7 text-xs border-none bg-transparent"/></td>
                        <td className="p-1 text-center">
                           <button onClick={() => removeWeapon(i)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                              <Trash2 className="h-3.5 w-3.5"/>
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
            <Button 
               variant="outline" 
               className="w-full mt-4 text-xs border-dashed text-muted-foreground hover:text-foreground" 
               onClick={addWeapon}
            >
               <Plus className="h-3.5 w-3.5 mr-2"/> Añadir Arma
            </Button>
         </div>
      </div>
    </div>
  )
}