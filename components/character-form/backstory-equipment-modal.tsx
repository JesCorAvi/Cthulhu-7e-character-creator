"use client"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Character } from "@/lib/character-types"
import { useLanguage } from "@/components/language-provider"

interface BackstoryEquipmentModalProps {
  character: Character
  onChange: (character: Character) => void
}

export function BackstoryEquipmentModal({ character, onChange }: BackstoryEquipmentModalProps) {
  const { t } = useLanguage()

  const updateBackground = (field: keyof typeof character.background, value: string) => {
    onChange({
      ...character,
      background: { ...character.background, [field]: value },
    })
  }

  return (
    <Tabs defaultValue="backstory" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="backstory">{t("tab_backstory")}</TabsTrigger>
        <TabsTrigger value="equipment">{t("tab_equipment")}</TabsTrigger>
        <TabsTrigger value="notes">{t("tab_notes")}</TabsTrigger>
      </TabsList>

      <TabsContent value="backstory" className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="personalDescription">{t("personal_desc_label")}</Label>
            <Textarea
              id="personalDescription"
              value={character.background.personalDescription}
              onChange={(e) => updateBackground("personalDescription", e.target.value)}
              className="min-h-[80px]"
              placeholder={t("personal_desc_ph")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ideology">{t("ideology_label")}</Label>
            <Textarea
              id="ideology"
              value={character.background.ideology}
              onChange={(e) => updateBackground("ideology", e.target.value)}
              className="min-h-[80px]"
              placeholder={t("ideology_ph")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="significantPeople">{t("significant_people_label")}</Label>
            <Textarea
              id="significantPeople"
              value={character.background.significantPeople}
              onChange={(e) => updateBackground("significantPeople", e.target.value)}
              className="min-h-[80px]"
              placeholder={t("significant_people_ph")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="significantPlaces">{t("significant_places_label")}</Label>
            <Textarea
              id="significantPlaces"
              value={character.background.significantPlaces}
              onChange={(e) => updateBackground("significantPlaces", e.target.value)}
              className="min-h-[80px]"
              placeholder={t("significant_places_ph")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preciousPossessions">{t("precious_possessions_label")}</Label>
            <Textarea
              id="preciousPossessions"
              value={character.background.preciousPossessions}
              onChange={(e) => updateBackground("preciousPossessions", e.target.value)}
              className="min-h-[80px]"
              placeholder={t("precious_possessions_ph")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="traits">{t("traits_label")}</Label>
            <Textarea
              id="traits"
              value={character.background.traits}
              onChange={(e) => updateBackground("traits", e.target.value)}
              className="min-h-[80px]"
              placeholder={t("traits_ph")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="injuriesScars">{t("injuries_label")}</Label>
            <Textarea
              id="injuriesScars"
              value={character.background.injuriesScars}
              onChange={(e) => updateBackground("injuriesScars", e.target.value)}
              className="min-h-[80px]"
              placeholder={t("injuries_ph")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phobiasManias">{t("phobias_label")}</Label>
            <Textarea
              id="phobiasManias"
              value={character.background.phobiasManias}
              onChange={(e) => updateBackground("phobiasManias", e.target.value)}
              className="min-h-[80px]"
              placeholder={t("phobias_ph")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="arcaneTomes">{t("arcane_tomes_label")}</Label>
            <Textarea
              id="arcaneTomes"
              value={character.background.arcaneTomes}
              onChange={(e) => updateBackground("arcaneTomes", e.target.value)}
              className="min-h-[80px]"
              placeholder={t("arcane_tomes_ph")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="strangeEncounters">{t("strange_encounters_label")}</Label>
            <Textarea
              id="strangeEncounters"
              value={character.background.strangeEncounters}
              onChange={(e) => updateBackground("strangeEncounters", e.target.value)}
              className="min-h-[80px]"
              placeholder={t("strange_encounters_ph")}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="equipment" className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="equipment">{t("equipment_possessions_label")}</Label>
              <Textarea
                id="equipment"
                value={character.equipment}
                onChange={(e) => onChange({ ...character, equipment: e.target.value })}
                className="min-h-[200px]"
                placeholder={t("equipment_ph")}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="spendingLevel">{t("spending_level_label")}</Label>
              <Input
                id="spendingLevel"
                value={character.money.spendingLevel}
                onChange={(e) =>
                  onChange({ ...character, money: { ...character.money, spendingLevel: e.target.value } })
                }
                placeholder={t("spending_level_ph")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cash">{t("cash_label")}</Label>
              <Input
                id="cash"
                value={character.money.cash}
                onChange={(e) => onChange({ ...character, money: { ...character.money, cash: e.target.value } })}
                placeholder={t("cash_ph")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assets">{t("assets_label")}</Label>
              <Textarea
                id="assets"
                value={character.money.assets}
                onChange={(e) => onChange({ ...character, money: { ...character.money, assets: e.target.value } })}
                className="min-h-[100px]"
                placeholder={t("assets_ph")}
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fellowInvestigators">{t("fellow_investigators_label")}</Label>
          <Textarea
            id="fellowInvestigators"
            value={character.fellowInvestigators}
            onChange={(e) => onChange({ ...character, fellowInvestigators: e.target.value })}
            className="min-h-[100px]"
            placeholder={t("fellow_investigators_ph")}
          />
        </div>
      </TabsContent>

      <TabsContent value="notes" className="mt-4">
        <div className="space-y-2">
          <Label htmlFor="notes">{t("notes_label")}</Label>
          <Textarea
            id="notes"
            value={character.notes}
            onChange={(e) => onChange({ ...character, notes: e.target.value })}
            className="min-h-[300px]"
            placeholder={t("notes_ph")}
          />
        </div>
      </TabsContent>
    </Tabs>
  )
}