"use client"

import { createPortal } from "react-dom"
import { useState, useEffect, Suspense } from "react" // ✅ Añadido useEffect
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Dices } from "lucide-react"
import { Dice3DScene } from "./dice-3d"
import { cn } from "@/lib/utils"
import type { Skill } from "@/lib/character-types"
import { useLanguage } from "@/components/language-provider"
import { getTranslatedSkillName } from "@/lib/skills-data"

interface SkillImprovementModalProps {
  skill: Skill
  onComplete: (improvementAmount: number) => void
  onCancel: () => void
}

export function SkillImprovementModal({ skill, onComplete, onCancel }: SkillImprovementModalProps) {
  const { t, language } = useLanguage()
  const [mounted, setMounted] = useState(false) // ✅ Estado para SSR
  const [stage, setStage] = useState<"initial" | "roll-d100" | "result-d100" | "roll-d10" | "final">("initial")
  const [d100Result, setD100Result] = useState<number | null>(null)
  const [d10Result, setD10Result] = useState<number | null>(null)
  const [manualResult, setManualResult] = useState("")

  useEffect(() => {
    setMounted(true)
  }, []) // ✅ Montaje en cliente

  const translatedSkillName = skill.customName || getTranslatedSkillName(skill.name, language)

  const handleD100Complete = (values: number[]) => {
    const result = values[0]
    setD100Result(result)
    setStage("result-d100")
  }

  const handleD10Complete = (values: number[]) => {
    const result = values[0]
    setD10Result(result)
    setStage("final")
  }

  const checkSuccess = () => {
    if (d100Result === null) return false
    if (skill.value >= 95) return d100Result >= 96
    return d100Result > skill.value
  }

  const handleManualResult = () => {
    const amount = Number.parseInt(manualResult) || 0
    if (amount > 0) onComplete(amount)
  }

  // ✅ Evita renderizado en SSR
  if (!mounted) return null

  // ✅ Envuelve el modal en createPortal
  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-card border-2 border-primary rounded-xl p-6 max-w-2xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{t("improve_title")}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {translatedSkillName} ({t("current_value")}: {skill.value}%)
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {stage === "initial" && (
          <div className="space-y-6">
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-sm">{t("how_to_proceed")}</h3>
              <p className="text-xs text-muted-foreground">{t("how_to_proceed_desc")}</p>
            </div>

            <div className="grid gap-3">
              <Button onClick={() => setStage("roll-d100")} className="gap-2 justify-start h-auto p-4">
                <Dices className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-semibold">{t("roll_dice_button")}</div>
                  <div className="text-xs opacity-80">{t("roll_d100_hint")}</div>
                </div>
              </Button>

              <div className="space-y-2">
                <Label htmlFor="manual-result" className="text-sm">
                  {t("manual_input")}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="manual-result"
                    type="number"
                    placeholder={t("amount_placeholder")}
                    value={manualResult}
                    onChange={(e) => setManualResult(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleManualResult} disabled={!manualResult}>
                    {t("apply")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "roll-d100" && (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">{t("check_d100_title")}</h3>
              <p className="text-xs text-muted-foreground">
                {skill.value >= 95
                  ? t("check_d100_desc_high")
                  : t("check_d100_desc_normal", { value: skill.value })}
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
              <Dice3DScene diceConfig={["d100"]} onRollComplete={handleD100Complete} />
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
              <div className="text-lg font-semibold">{checkSuccess() ? t("success_msg") : t("fail_msg")}</div>
              <p className="text-sm text-muted-foreground">
                {checkSuccess()
                  ? t("rolled_more", { value: skill.value })
                  : t("needed_more", { value: skill.value })}
              </p>
            </div>

            {checkSuccess() ? (
              <Button onClick={() => setStage("roll-d10")} className="w-full gap-2">
                <Dices className="h-4 w-4" />
                {t("roll_d10_button")}
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                  {t("close")}
                </Button>
                <Button onClick={() => onComplete(0)} className="flex-1">
                  {t("continue_no_change")}
                </Button>
              </div>
            )}
          </div>
        )}

        {stage === "roll-d10" && (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="font-semibold text-sm mb-2">{t("roll_d10_title")}</h3>
              <p className="text-xs text-muted-foreground">{t("roll_d10_desc")}</p>
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
              <div className="text-lg font-semibold">{t("skill_improved")}</div>
              <p className="text-sm text-muted-foreground">
                {t("skill_improved_desc", {
                  name: translatedSkillName,
                  old: skill.value,
                  new: skill.value + d10Result,
                })}
              </p>
            </div>

            <Button onClick={() => onComplete(d10Result)} className="w-full">
              {t("apply_improvement")}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
