"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Dices } from "lucide-react"
import { Dice3DScene } from "./dice-3d"
import { cn } from "@/lib/utils"
import type { Skill } from "@/lib/character-types"

interface SkillImprovementModalProps {
  skill: Skill
  onComplete: (improvementAmount: number) => void
  onCancel: () => void
}

export function SkillImprovementModal({ skill, onComplete, onCancel }: SkillImprovementModalProps) {
  const [stage, setStage] = useState<"initial" | "roll-d100" | "result-d100" | "roll-d10" | "final">("initial")
  const [d100Result, setD100Result] = useState<number | null>(null)
  const [d10Result, setD10Result] = useState<number | null>(null)
  const [manualResult, setManualResult] = useState("")

  const handleD100Complete = (values: number[]) => {
    // values[0] es el dado de decenas (00-90), values[1] es el de unidades (0-9)
    const tensValue = values[0] === 10 ? 0 : values[0] * 10 // Si sale 10, es 00
    const unitsValue = values[1] === 10 ? 0 : values[1] // Si sale 10, es 0
    const total = tensValue + unitsValue
    const finalResult = total === 0 ? 100 : total // 00 + 0 = 100

    setD100Result(finalResult)
    setStage("result-d100")
  }

  const handleD10Complete = (values: number[]) => {
    const result = values[0] === 10 ? 10 : values[0] // d10 puede dar 1-10
    setD10Result(result)
    setStage("final")
  }

  const checkSuccess = () => {
    if (d100Result === null) return false

    // Excepción: Si tiene >95, solo acierta con 96-100
    if (skill.value > 95) {
      return d100Result >= 96 && d100Result <= 100
    }

    // Normal: acierta si saca más que su valor actual
    return d100Result > skill.value
  }

  const handleManualResult = () => {
    const amount = Number.parseInt(manualResult) || 0
    if (amount > 0) {
      onComplete(amount)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border-2 border-primary rounded-xl p-6 max-w-2xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Mejorar Habilidad</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {skill.customName || skill.name} (Valor actual: {skill.value}%)
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {stage === "initial" && (
          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-sm">¿Cómo quieres proceder?</h3>
              <p className="text-xs text-muted-foreground">
                Puedes tirar los dados para determinar si la habilidad mejora, o introducir manualmente el resultado si
                ya lo tienes.
              </p>
            </div>

            <div className="grid gap-3">
              <Button onClick={() => setStage("roll-d100")} className="gap-2 justify-start h-auto p-4">
                <Dices className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Tirar los dados</div>
                  <div className="text-xs opacity-80">Lanzar d100 para comprobar mejora</div>
                </div>
              </Button>

              <div className="space-y-2">
                <Label htmlFor="manual-result" className="text-sm">
                  O introduce el resultado manualmente:
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-result"
                    type="number"
                    placeholder="Cantidad a subir (ej: 5)"
                    value={manualResult}
                    onChange={(e) => setManualResult(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleManualResult} disabled={!manualResult}>
                    Aplicar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Si ya tiraste los dados, introduce directamente cuánto subió la habilidad (0 si falló)
                </p>
              </div>
            </div>
          </div>
        )}

        {stage === "roll-d100" && (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Tira d100 (2d10)</h3>
              <p className="text-xs text-muted-foreground">
                {skill.value > 95
                  ? "Tu habilidad es >95. Solo mejorarás si sacas 96-100."
                  : `Necesitas sacar más de ${skill.value} para mejorar.`}
              </p>
            </div>

            <Suspense
              fallback={
                <div className="w-full h-[400px] bg-slate-900 rounded-xl flex items-center justify-center">
                  <div className="text-white flex items-center gap-3">
                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                    Cargando dados 3D...
                  </div>
                </div>
              }
            >
              <Dice3DScene diceCount={2} onRollComplete={handleD100Complete} diceType="d10" />
            </Suspense>

            <p className="text-xs text-center text-muted-foreground">Arrastra los dados sobre la mesa para lanzarlos</p>
          </div>
        )}

        {stage === "result-d100" && (
          <div className="space-y-6">
            <div
              className={cn(
                "p-6 rounded-lg text-center space-y-3",
                checkSuccess()
                  ? "bg-emerald-500/20 border-2 border-emerald-500"
                  : "bg-red-500/20 border-2 border-red-500",
              )}
            >
              <div className="text-6xl font-bold">{d100Result}</div>
              <div className="text-lg font-semibold">{checkSuccess() ? "¡Éxito! Puedes mejorar" : "Fallaste"}</div>
              <p className="text-sm text-muted-foreground">
                {skill.value > 95
                  ? checkSuccess()
                    ? "Sacaste 96-100 con una habilidad >95"
                    : "Necesitabas 96-100 con una habilidad >95"
                  : checkSuccess()
                    ? `Sacaste más de ${skill.value}`
                    : `Necesitabas más de ${skill.value}`}
              </p>
            </div>

            {checkSuccess() ? (
              <Button onClick={() => setStage("roll-d10")} className="w-full gap-2">
                <Dices className="h-4 w-4" />
                Tirar d10 para determinar mejora
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                  Cancelar
                </Button>
                <Button onClick={() => onComplete(0)} className="flex-1">
                  Confirmar (sin mejora)
                </Button>
              </div>
            )}
          </div>
        )}

        {stage === "roll-d10" && (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Tira d10 para la mejora</h3>
              <p className="text-xs text-muted-foreground">El resultado determinará cuántos puntos sube tu habilidad</p>
            </div>

            <Suspense
              fallback={
                <div className="w-full h-[400px] bg-slate-900 rounded-xl flex items-center justify-center">
                  <div className="text-white flex items-center gap-3">
                    <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                    Cargando dados 3D...
                  </div>
                </div>
              }
            >
              <Dice3DScene diceCount={1} onRollComplete={handleD10Complete} diceType="d10" />
            </Suspense>

            <p className="text-xs text-center text-muted-foreground">Arrastra el dado sobre la mesa para lanzarlo</p>
          </div>
        )}

        {stage === "final" && d10Result !== null && (
          <div className="space-y-6">
            <div className="p-6 rounded-lg text-center space-y-3 bg-emerald-500/20 border-2 border-emerald-500">
              <div className="text-6xl font-bold">+{d10Result}</div>
              <div className="text-lg font-semibold">¡Habilidad mejorada!</div>
              <p className="text-sm text-muted-foreground">
                {skill.customName || skill.name} sube de {skill.value}% a {skill.value + d10Result}%
              </p>
            </div>

            <Button onClick={() => onComplete(d10Result)} className="w-full">
              Aplicar mejora
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
