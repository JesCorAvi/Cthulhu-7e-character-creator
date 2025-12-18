"use client"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Character } from "@/lib/character-types"

interface BackstoryEquipmentModalProps {
  character: Character
  onChange: (character: Character) => void
}

export function BackstoryEquipmentModal({ character, onChange }: BackstoryEquipmentModalProps) {
  const updateBackground = (field: keyof typeof character.background, value: string) => {
    onChange({
      ...character,
      background: { ...character.background, [field]: value },
    })
  }

  return (
    <Tabs defaultValue="backstory" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="backstory">Trasfondo</TabsTrigger>
        <TabsTrigger value="equipment">Equipo y Dinero</TabsTrigger>
        <TabsTrigger value="notes">Notas</TabsTrigger>
      </TabsList>

      <TabsContent value="backstory" className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="personalDescription">Descripción Personal</Label>
            <Textarea
              id="personalDescription"
              value={character.background.personalDescription}
              onChange={(e) => updateBackground("personalDescription", e.target.value)}
              className="min-h-[80px]"
              placeholder="Apariencia física, forma de vestir..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ideology">Ideología / Creencias</Label>
            <Textarea
              id="ideology"
              value={character.background.ideology}
              onChange={(e) => updateBackground("ideology", e.target.value)}
              className="min-h-[80px]"
              placeholder="Creencias religiosas, políticas, morales..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="significantPeople">Personas Significativas</Label>
            <Textarea
              id="significantPeople"
              value={character.background.significantPeople}
              onChange={(e) => updateBackground("significantPeople", e.target.value)}
              className="min-h-[80px]"
              placeholder="Familiares, amigos, enemigos..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="significantPlaces">Lugares Significativos</Label>
            <Textarea
              id="significantPlaces"
              value={character.background.significantPlaces}
              onChange={(e) => updateBackground("significantPlaces", e.target.value)}
              className="min-h-[80px]"
              placeholder="Lugares importantes para el personaje..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preciousPossessions">Posesiones Preciadas</Label>
            <Textarea
              id="preciousPossessions"
              value={character.background.preciousPossessions}
              onChange={(e) => updateBackground("preciousPossessions", e.target.value)}
              className="min-h-[80px]"
              placeholder="Objetos de valor sentimental..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="traits">Rasgos</Label>
            <Textarea
              id="traits"
              value={character.background.traits}
              onChange={(e) => updateBackground("traits", e.target.value)}
              className="min-h-[80px]"
              placeholder="Personalidad, manías, hábitos..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="injuriesScars">Heridas y Cicatrices</Label>
            <Textarea
              id="injuriesScars"
              value={character.background.injuriesScars}
              onChange={(e) => updateBackground("injuriesScars", e.target.value)}
              className="min-h-[80px]"
              placeholder="Marcas físicas permanentes..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phobiasManias">Fobias y Manías</Label>
            <Textarea
              id="phobiasManias"
              value={character.background.phobiasManias}
              onChange={(e) => updateBackground("phobiasManias", e.target.value)}
              className="min-h-[80px]"
              placeholder="Miedos irracionales, obsesiones..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arcaneTomes">Tomos Arcanos</Label>
            <Textarea
              id="arcaneTomes"
              value={character.background.arcaneTomes}
              onChange={(e) => updateBackground("arcaneTomes", e.target.value)}
              className="min-h-[80px]"
              placeholder="Libros de los Mitos leídos..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="strangeEncounters">Encuentros con lo Extraño</Label>
            <Textarea
              id="strangeEncounters"
              value={character.background.strangeEncounters}
              onChange={(e) => updateBackground("strangeEncounters", e.target.value)}
              className="min-h-[80px]"
              placeholder="Experiencias sobrenaturales..."
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="equipment" className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipo y Posesiones</Label>
              <Textarea
                id="equipment"
                value={character.equipment}
                onChange={(e) => onChange({ ...character, equipment: e.target.value })}
                className="min-h-[200px]"
                placeholder="Lista de objetos que lleva el personaje..."
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spendingLevel">Nivel de Gasto</Label>
              <Input
                id="spendingLevel"
                value={character.money.spendingLevel}
                onChange={(e) =>
                  onChange({ ...character, money: { ...character.money, spendingLevel: e.target.value } })
                }
                placeholder="Nivel de gasto semanal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cash">Dinero en Efectivo</Label>
              <Input
                id="cash"
                value={character.money.cash}
                onChange={(e) => onChange({ ...character, money: { ...character.money, cash: e.target.value } })}
                placeholder="Dinero disponible"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assets">Bienes y Propiedades</Label>
              <Textarea
                id="assets"
                value={character.money.assets}
                onChange={(e) => onChange({ ...character, money: { ...character.money, assets: e.target.value } })}
                className="min-h-[100px]"
                placeholder="Propiedades, inversiones, vehículos..."
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fellowInvestigators">Compañeros Investigadores</Label>
          <Textarea
            id="fellowInvestigators"
            value={character.fellowInvestigators}
            onChange={(e) => onChange({ ...character, fellowInvestigators: e.target.value })}
            className="min-h-[100px]"
            placeholder="Otros investigadores del grupo..."
          />
        </div>
      </TabsContent>

      <TabsContent value="notes" className="mt-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Notas del Personaje</Label>
          <Textarea
            id="notes"
            value={character.notes}
            onChange={(e) => onChange({ ...character, notes: e.target.value })}
            className="min-h-[300px]"
            placeholder="Notas adicionales, pistas, eventos importantes..."
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}
