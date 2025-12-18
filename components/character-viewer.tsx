"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Character } from "@/lib/character-types"
import { ERA_LABELS } from "@/lib/character-types"
import { ArrowLeft, Edit, Heart, Brain, Sparkles, Dice6 } from "lucide-react"

interface CharacterViewerProps {
  character: Character
  onBack: () => void
  onEdit: () => void
}

export function CharacterViewer({ character, onBack, onEdit }: CharacterViewerProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <Button onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Title */}
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="mb-2">
          {ERA_LABELS[character.era]}
        </Badge>
        <h1 className="text-3xl font-bold text-foreground">{character.name || "Sin nombre"}</h1>
        <p className="text-lg text-muted-foreground">{character.occupation || "Sin ocupación"}</p>
        <p className="text-sm text-muted-foreground">
          {character.gender} • {character.age} años • {character.residence}
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
          <p className="text-xs text-muted-foreground">Puntos de Vida</p>
        </div>
        <div className="p-4 rounded-lg bg-purple-950/20 border border-purple-900/30 text-center">
          <Brain className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {character.sanity.current}/{character.sanity.max}
          </p>
          <p className="text-xs text-muted-foreground">Cordura</p>
        </div>
        <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-900/30 text-center">
          <Sparkles className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {character.magicPoints.current}/{character.magicPoints.max}
          </p>
          <p className="text-xs text-muted-foreground">Puntos de Magia</p>
        </div>
        <div className="p-4 rounded-lg bg-yellow-950/20 border border-yellow-900/30 text-center">
          <Dice6 className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{character.luck.current}</p>
          <p className="text-xs text-muted-foreground">Suerte</p>
        </div>
      </div>

      {/* Characteristics */}
      <div className="p-4 rounded-lg bg-card border">
        <h3 className="font-bold mb-4 text-foreground">Características</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4 text-center">
          {[
            { key: "STR", label: "FUE" },
            { key: "DEX", label: "DES" },
            { key: "POW", label: "POD" },
            { key: "CON", label: "CON" },
            { key: "APP", label: "APA" },
            { key: "EDU", label: "EDU" },
            { key: "SIZ", label: "TAM" },
            { key: "INT", label: "INT" },
          ].map(({ key, label }) => {
            const char = character.characteristics[key as keyof typeof character.characteristics]
            if (typeof char === "number") return null
            return (
              <div key={key}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-foreground">{char.value}</p>
                <p className="text-xs text-muted-foreground">
                  ½:{char.half} ⅕:{char.fifth}
                </p>
              </div>
            )
          })}
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t text-center">
          <div>
            <p className="text-xs text-muted-foreground">MOV</p>
            <p className="font-bold text-foreground">{character.characteristics.MOV}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Bon. Daño</p>
            <p className="font-bold text-foreground">{character.damageBonus}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Corpulencia</p>
            <p className="font-bold text-foreground">{character.build}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Esquivar</p>
            <p className="font-bold text-foreground">{character.dodge}</p>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="p-4 rounded-lg bg-card border">
        <h3 className="font-bold mb-4 text-foreground">Habilidades</h3>
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
          <h3 className="font-bold mb-4 text-foreground">Armas</h3>
          <div className="space-y-2">
            {character.weapons.map((weapon, i) => (
              <div key={i} className="p-2 bg-muted rounded flex justify-between items-center">
                <span className="font-medium text-foreground">{weapon.name || "Sin nombre"}</span>
                <span className="text-sm text-muted-foreground">
                  {weapon.normal}% | Daño: {weapon.damage || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Background */}
      {Object.values(character.background).some((v) => v) && (
        <div className="p-4 rounded-lg bg-card border">
          <h3 className="font-bold mb-4 text-foreground">Trasfondo</h3>
          <div className="space-y-3">
            {character.background.personalDescription && (
              <div>
                <p className="text-xs text-muted-foreground">Descripción Personal</p>
                <p className="text-sm text-foreground">{character.background.personalDescription}</p>
              </div>
            )}
            {character.background.ideology && (
              <div>
                <p className="text-xs text-muted-foreground">Ideología/Creencias</p>
                <p className="text-sm text-foreground">{character.background.ideology}</p>
              </div>
            )}
            {character.background.traits && (
              <div>
                <p className="text-xs text-muted-foreground">Rasgos</p>
                <p className="text-sm text-foreground">{character.background.traits}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
