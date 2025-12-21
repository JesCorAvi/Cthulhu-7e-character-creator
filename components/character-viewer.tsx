"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Character } from "@/lib/character-types"
import { ERA_LABELS } from "@/lib/character-types"
import { ArrowLeft, Edit, Heart, Brain, Sparkles, Dice6 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface CharacterViewerProps {
  character: Character
  onBack: () => void
  onEdit: () => void
}

export function CharacterViewer({ character, onBack, onEdit }: CharacterViewerProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          {t("edit")}
        </Button>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="mb-2">
          {ERA_LABELS[character.era]}
        </Badge>
        <h1 className="text-3xl font-bold text-foreground">{character.name || t("no_name")}</h1>
        <p className="text-lg text-muted-foreground">{character.occupation || t("no_occupation")}</p>
        <p className="text-sm text-muted-foreground">
          {character.gender} • {character.age} {t("age").toLowerCase()} • {character.residence}
        </p>
      </div>

      <Separator />

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-red-950/20 border border-red-900/30 text-center">
          <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {character.hitPoints.current}/{character.hitPoints.max}
          </p>
          <p className="text-xs text-muted-foreground">{t("hp")}</p>
        </div>
        <div className="p-4 rounded-lg bg-purple-950/20 border border-purple-900/30 text-center">
          <Brain className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {character.sanity.current}/{character.sanity.max}
          </p>
          <p className="text-xs text-muted-foreground">{t("sanity")}</p>
        </div>
        <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-900/30 text-center">
          <Sparkles className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {character.magicPoints.current}/{character.magicPoints.max}
          </p>
          <p className="text-xs text-muted-foreground">{t("magic_points")}</p>
        </div>
        <div className="p-4 rounded-lg bg-yellow-950/20 border border-yellow-900/30 text-center">
          <Dice6 className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{character.luck.current}</p>
          <p className="text-xs text-muted-foreground">{t("luck")}</p>
        </div>
      </div>

      {/* Characteristics */}
      <div className="p-4 rounded-lg bg-card border">
        <h3 className="font-bold mb-4 text-foreground">{t("characteristics")}</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 text-center">
          {[
            { key: "STR", label: t("str") },
            { key: "DEX", label: t("dex") },
            { key: "POW", label: t("pow") },
            { key: "CON", label: t("con") },
            { key: "APP", label: t("app") },
            { key: "EDU", label: t("edu") },
            { key: "SIZ", label: t("siz") },
            { key: "INT", label: t("int") },
          ].map(({ key, label }) => {
            const char = character.characteristics[key as keyof typeof character.characteristics]
            if (typeof char === "number") return null
            return (
              <div key={key}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{char.value}</p>
                <p className="text-xs text-muted-foreground">
                  {t("half")}:{char.half} {t("fifth")}:{char.fifth}
                </p>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t text-center">
          <div>
            <p className="text-xs text-muted-foreground">{t("mov")}</p>
            <p className="font-bold text-foreground">{character.characteristics.MOV}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("db")}</p>
            <p className="font-bold text-foreground">{character.damageBonus}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("build")}</p>
            <p className="font-bold text-foreground">{character.build}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("dodge")}</p>
            <p className="font-bold text-foreground">{character.dodge}</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="p-4 rounded-lg bg-card border">
        <h3 className="font-bold mb-4 text-foreground">{t("skills")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {character.skills
            .filter((s) => s.value > s.baseValue || s.isOccupational)
            .sort((a, b) => b.value - a.value)
            .map((skill, i) => (
              <div
                key={i}
                className={`p-2 rounded text-sm ${
                  skill.isOccupational ? "bg-primary/10 border border-primary/30" : "bg-muted"
                }`}
              >
                <span className="font-medium text-foreground">
                  {skill.isCustom && skill.customName ? skill.customName : skill.name}
                </span>
                <span className="float-right text-foreground">{skill.value}%</span>
              </div>
            ))}
        </div>
      </div>

      {/* Weapons */}
      {character.weapons.length > 0 && (
        <div className="p-4 rounded-lg bg-card border">
          <h3 className="font-bold mb-4 text-foreground">{t("weapons")}</h3>
          <div className="space-y-2">
            {character.weapons.map((weapon, i) => (
              <div key={i} className="p-2 bg-muted rounded flex justify-between items-center">
                <span className="font-medium text-foreground">{weapon.name || t("no_name")}</span>
                <span className="text-sm text-muted-foreground">
                  {weapon.normal}% | {t("damage")}: {weapon.damage || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Background */}
      {Object.values(character.background).some((v) => v) && (
        <div className="p-4 rounded-lg bg-card border">
          <h3 className="font-bold mb-4 text-foreground">{t("background")}</h3>
          <div className="space-y-3">
            {character.background.personalDescription && (
              <div>
                <p className="text-xs text-muted-foreground">{t("personal_description")}</p>
                <p className="text-sm text-foreground">{character.background.personalDescription}</p>
              </div>
            )}
            {character.background.ideology && (
              <div>
                <p className="text-xs text-muted-foreground">{t("ideology")}</p>
                <p className="text-sm text-foreground">{character.background.ideology}</p>
              </div>
            )}
            {character.background.traits && (
              <div>
                <p className="text-xs text-muted-foreground">{t("traits")}</p>
                <p className="text-sm text-foreground">{character.background.traits}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}