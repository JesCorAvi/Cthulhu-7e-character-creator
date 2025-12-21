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
    // CORRECCIÓN: Dice3DScene ya devuelve el valor final del d100 (1-100) en la posición 0.
    // No hace falta multiplicar por 10 ni sumar nada manualmente.
    const result = values[0]
    setD100Result(result)
    setStage("result-d100")
  }

  const handleD10Complete = (values: number[]) => {
    // El d10 normal devuelve 1-10, tal cual.
    const result = values[0]
    setD10Result(result)
    setStage("final")
  }

  const checkSuccess = () => {
    if (d100Result === null) return false
    // Reglas de mejora de Cthulhu 7e:
    // Si la habilidad es > 95, necesitas sacar 96-100 para mejorar.
    if (skill.value >= 95) {
      return d100Result >= 96
    }
    // Si no, necesitas sacar MÁS que tu habilidad actual.
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
                Puedes tirar los dados para determinar si la habilidad mejora, o introducir manualmente el resultado.
              </p>
            </div>

            <div className="grid gap-3">
              <Button onClick={() => setStage("roll-d100")} className="gap-2 justify-start h-auto p-4">
                <Dices className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">Tirar los dados</div>
                  <div className="text-xs opacity-80">Lanzar d100 (Decenas + Unidades)</div>
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
                    placeholder="Cantidad a subir"
                    value={manualResult}
                    onChange={(e) => setManualResult(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleManualResult} disabled={!manualResult}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "roll-d100" && (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Tira d100 de Comprobación</h3>
              <p className="text-xs text-muted-foreground">
                {skill.value >= 95
                  ? "Tu habilidad es muy alta (>=95). Solo mejorarás si sacas entre 96 y 100."
                  : `Necesitas sacar más de ${skill.value} en el d100 para mejorar.`}
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
              {/* CORRECCIÓN: Solo pedimos "d100". Dice3DScene se encarga de mostrar 2 dados d10 */}
              <Dice3DScene 
                diceConfig={["d100"]} 
                onRollComplete={handleD100Complete} 
              />
            </Suspense>

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
                {checkSuccess()
                  ? `Sacaste más de ${skill.value}`
                  : `Necesitabas más de ${skill.value}`}
              </p>
            </div>

            {checkSuccess() ? (
              <Button onClick={() => setStage("roll-d10")} className="w-full gap-2">
                <Dices className="h-4 w-4" />
                Tirar 1d10 para ver cuánto mejoras
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                  Cerrar
                </Button>
                <Button onClick={() => onComplete(0)} className="flex-1">
                  Continuar (sin cambios)
                </Button>
              </div>
            )}
          </div>
        )}

        {stage === "roll-d10" && (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">Tira 1d10 de Mejora</h3>
              <p className="text-xs text-muted-foreground">El resultado se sumará a tu habilidad actual.</p>
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
              <Dice3DScene diceCount={1} diceType="d10" onRollComplete={handleD10Complete} />
            </Suspense>

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