"use client"

import type React from "react"
import { createPortal } from "react-dom"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dices, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dice3DScene } from "./dice-3d"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/components/language-provider"

interface DiceProps {
  value: number
  rolling: boolean
}

function Dice({ value, rolling }: DiceProps) {
  const [currentValue, setCurrentValue] = useState(value)

  useEffect(() => {
    if (rolling) {
      const interval = setInterval(() => {
        setCurrentValue(Math.floor(Math.random() * 6) + 1)
      }, 50)
      return () => clearInterval(interval)
    } else {
      setCurrentValue(value)
    }
  }, [rolling, value])

  const dots = {
    1: [[1, 1]],
    2: [
      [0, 0],
      [2, 2],
    ],
    3: [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    4: [
      [0, 0],
      [0, 2],
      [2, 0],
      [2, 2],
    ],
    5: [
      [0, 0],
      [0, 2],
      [1, 1],
      [2, 0],
      [2, 2],
    ],
    6: [
      [0, 0],
      [0, 1],
      [0, 2],
      [2, 0],
      [2, 1],
      [2, 2],
    ],
  }

  return (
    <div
      className={cn(
        "w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-stone-100 rounded-lg shadow-lg border-2 border-stone-300 dark:border-stone-400 relative transition-transform",
        rolling && "animate-bounce",
      )}
      style={{
        transform: rolling ? `rotate(${Math.random() * 360}deg)` : "rotate(0deg)",
      }}
    >
      <div className="absolute inset-0 p-2 grid grid-cols-3 grid-rows-3 gap-0.5">
        {dots[currentValue as keyof typeof dots]?.map(([row, col], idx) => (
          <div
            key={idx}
            className="col-start-[var(--col)] row-start-[var(--row)]"
            style={
              {
                "--col": col + 1,
                "--row": row + 1,
              } as React.CSSProperties
            }
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-stone-900 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface CharacteristicRoll {
  name: string
  label: string
  formula: "3d6" | "2d6+6" | "4d6kh3" | "3d6+6kh3"
  diceValues: number[]
  droppedValue?: number
  baseResult: number
  finalResult: number
}

interface DiceRollerProps {
  onComplete: (results: Record<string, number>) => void
  onCancel: () => void
}

const CHARACTERISTIC_FORMULAS = [
  { key: "STR", formula: "3d6", alternativeFormula: "4d6kh3" },
  { key: "DEX", formula: "3d6", alternativeFormula: "4d6kh3" },
  { key: "POW", formula: "3d6", alternativeFormula: "4d6kh3" },
  { key: "CON", formula: "3d6", alternativeFormula: "4d6kh3" },
  { key: "APP", formula: "3d6", alternativeFormula: "4d6kh3" },
  { key: "SIZ", formula: "2d6+6", alternativeFormula: "3d6+6kh3" },
  { key: "INT", formula: "2d6+6", alternativeFormula: "3d6+6kh3" },
  { key: "EDU", formula: "2d6+6", alternativeFormula: "3d6+6kh3" },
  { key: "LUCK", formula: "3d6", alternativeFormula: "4d6kh3" },
] as const

export function DiceRoller({ onComplete, onCancel }: DiceRollerProps) {
  const { t } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [rolls, setRolls] = useState<CharacteristicRoll[]>([])
  const [started, setStarted] = useState(false)
  const [useAlternativeMethod, setUseAlternativeMethod] = useState(false)
  const [use3DDice, setUse3DDice] = useState(true)
  const [waitingForNextRoll, setWaitingForNextRoll] = useState(false)
  const processingRoll = useRef(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleStart = () => {
    setStarted(true)
    setCurrentIndex(0)
    setWaitingForNextRoll(false)
    processingRoll.current = false
  }

  const handle3DRollComplete = useCallback(
    (values: number[]) => {
      if (processingRoll.current) return
      processingRoll.current = true

      const characteristic = CHARACTERISTIC_FORMULAS[currentIndex]
      if (!characteristic) {
        processingRoll.current = false
        return
      }

      let droppedValue: number | undefined
      let baseResult: number
      const diceValues = values

      if (useAlternativeMethod && characteristic.alternativeFormula) {
        if (characteristic.alternativeFormula === "4d6kh3") {
          const sorted = [...values].sort((a, b) => a - b)
          droppedValue = sorted[0]
          baseResult = sorted.slice(1).reduce((a, b) => a + b, 0)
        } else {
          const sorted = [...values].sort((a, b) => a - b)
          droppedValue = sorted[0]
          baseResult = sorted.slice(1).reduce((a, b) => a + b, 0) + 6
        }
      } else {
        if (characteristic.formula === "3d6") {
          baseResult = values.reduce((a, b) => a + b, 0)
        } else {
          baseResult = values.reduce((a, b) => a + b, 0) + 6
        }
      }

      const finalResult = baseResult * 5

      const newRoll: CharacteristicRoll = {
        name: characteristic.key,
        label: t(characteristic.key.toLowerCase()),
        formula:
          useAlternativeMethod && characteristic.alternativeFormula
            ? characteristic.alternativeFormula
            : characteristic.formula,
        diceValues,
        droppedValue,
        baseResult,
        finalResult,
      }

      setRolls((prev) => [...prev, newRoll])

      if (currentIndex < CHARACTERISTIC_FORMULAS.length - 1) {
        setWaitingForNextRoll(true)
      }

      processingRoll.current = false
    },
    [currentIndex, useAlternativeMethod, t],
  )

  const handleNextRoll = useCallback(() => {
    setCurrentIndex((prev) => prev + 1)
    setWaitingForNextRoll(false)
    processingRoll.current = false
  }, [])

  const handle2DRoll = () => {
    const characteristic = CHARACTERISTIC_FORMULAS[currentIndex]
    if (!characteristic) return

    const diceCount = getDiceCount()
    const values = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1)

    handle3DRollComplete(values)
  }

  const getDiceCount = () => {
    if (!CHARACTERISTIC_FORMULAS[currentIndex]) return 3
    if (useAlternativeMethod && CHARACTERISTIC_FORMULAS[currentIndex].alternativeFormula) {
      return CHARACTERISTIC_FORMULAS[currentIndex].alternativeFormula?.includes("4d6") ? 4 : 3
    }
    return CHARACTERISTIC_FORMULAS[currentIndex].formula === "3d6" ? 3 : 2
  }

  if (!mounted) return null

  if (!started) {
    return createPortal(
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-card border-2 border-primary rounded-xl p-8 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <Dices className="h-20 w-20 text-primary" />
              <div className="absolute inset-0 animate-ping">
                <Dices className="h-20 w-20 text-primary opacity-30" />
              </div>
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-foreground">{t("dice_roller_title")}</h2>
              <p className="text-muted-foreground text-sm">
               {t("dice_roller_desc")}
              </p>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg w-full space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="alternative-method" className="text-sm font-normal text-left flex-1 cursor-pointer">
                  <div className="font-semibold">{t("heroic_method")}</div>
                  <div className="text-xs text-muted-foreground">{t("heroic_desc")}</div>
                </Label>
                <Switch
                  id="alternative-method"
                  checked={useAlternativeMethod}
                  onCheckedChange={setUseAlternativeMethod}
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/50">
                <Label htmlFor="3d-dice" className="text-sm font-normal text-left flex-1 cursor-pointer">
                  <div className="font-semibold">{t("interactive_dice")}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("interactive_desc")}
                  </div>
                </Label>
                <Switch id="3d-dice" checked={use3DDice} onCheckedChange={setUse3DDice} />
              </div>

              <div className="pt-3 border-t border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-2">{t("formulas_title")}</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {useAlternativeMethod ? (
                    <>
                      <li>• {t("str")}, {t("dex")}, {t("pow")}, {t("con")}, {t("app")}: 4D6 (- min) x 5</li>
                      <li>• {t("siz")}, {t("int")}, {t("edu")}: 3D6+6 (- min) x 5</li>
                      <li>• {t("luck")}: 4D6 (- min) x 5</li>
                    </>
                  ) : (
                    <>
                      <li>• {t("str")}, {t("dex")}, {t("pow")}, {t("con")}, {t("app")}: 3D6 x 5</li>
                      <li>• {t("siz")}, {t("int")}, {t("edu")}: (2D6+6) x 5</li>
                      <li>• {t("luck")}: 3D6 x 5</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
                {t("cancel")}
              </Button>
              <Button onClick={handleStart} className="flex-1 gap-2">
                <Dices className="h-4 w-4" />
                {t("start")}
              </Button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  const currentChar = CHARACTERISTIC_FORMULAS[currentIndex]
  const isComplete = rolls.length === CHARACTERISTIC_FORMULAS.length

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
      <div className="bg-card border-2 border-primary rounded-xl p-6 max-w-4xl w-full shadow-2xl my-8 relative">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            {isComplete ? t("rolls_complete") : (currentChar ? t(currentChar.key.toLowerCase()) : "")}
          </h2>
          {!isComplete && currentChar && (
            <p className="text-sm text-muted-foreground mt-1">
              Formula:{" "}
              {useAlternativeMethod && currentChar.alternativeFormula
                ? currentChar.alternativeFormula.replace("kh3", " (drop low)")
                : currentChar.formula}{" "}
              x 5
            </p>
          )}
          {!isComplete && (
            <div className="flex justify-center gap-1 mt-3">
              {CHARACTERISTIC_FORMULAS.map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    idx < rolls.length
                      ? "bg-primary"
                      : idx === currentIndex
                        ? "bg-primary/50 animate-pulse"
                        : "bg-muted",
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {!isComplete && use3DDice && !waitingForNextRoll && (
          <div className="mb-6">
              <Dice3DScene 
                key={currentIndex} 
                diceCount={getDiceCount()} 
                diceType="d6"
                onRollComplete={handle3DRollComplete} 
              />
          </div>
        )}

        {!isComplete && use3DDice && waitingForNextRoll && (
          <div className="mb-6 flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl">
            <div className="text-center">
              <p className="text-emerald-400 text-lg font-medium mb-2">
                {rolls[rolls.length - 1]?.label}: {rolls[rolls.length - 1]?.finalResult}
              </p>
              <p className="text-white/60 text-sm">Next: {CHARACTERISTIC_FORMULAS[currentIndex + 1] ? t(CHARACTERISTIC_FORMULAS[currentIndex + 1].key.toLowerCase()) : ""}</p>
            </div>
            <Button onClick={handleNextRoll} className="gap-2">
              <Dices className="h-4 w-4" />
              {t("next_roll")}
            </Button>
          </div>
        )}

        {!isComplete && !use3DDice && !waitingForNextRoll && (
          <div className="mb-6">
            <div
              onClick={handle2DRoll}
              className="flex flex-col items-center gap-4 p-8 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl cursor-pointer hover:from-slate-700 hover:to-slate-800 transition-colors group"
            >
              <div className="flex gap-3">
                {Array.from({ length: getDiceCount() }).map((_, idx) => (
                  <Simple2DDice key={idx} />
                ))}
              </div>
              <p className="text-white/80 group-hover:text-white transition-colors">{t("click_to_roll")}</p>
            </div>
          </div>
        )}

        {!isComplete && !use3DDice && waitingForNextRoll && (
          <div className="mb-6 flex flex-col items-center justify-center gap-4 p-8 bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl">
            <div className="text-center">
              <p className="text-emerald-400 text-lg font-medium mb-2">
                {rolls[rolls.length - 1]?.label}: {rolls[rolls.length - 1]?.finalResult}
              </p>
              <p className="text-white/60 text-sm">Next: {CHARACTERISTIC_FORMULAS[currentIndex + 1] ? t(CHARACTERISTIC_FORMULAS[currentIndex + 1].key.toLowerCase()) : ""}</p>
            </div>
            <Button onClick={handleNextRoll} className="gap-2">
              <Dices className="h-4 w-4" />
              {t("next_roll")}
            </Button>
          </div>
        )}

        <div className="space-y-2 max-h-[35vh] overflow-y-auto mb-6 pr-2">
          {rolls.map((roll, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all",
                idx === rolls.length - 1 && !isComplete
                  ? "bg-primary/10 border-primary animate-in slide-in-from-top-2"
                  : "bg-muted/50 border-border",
              )}
            >
              <div className="flex-1">
                <div className="font-bold text-foreground">{roll.label}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                  <span>Dados:</span>
                  {roll.diceValues.map((v, i) => (
                    <span
                      key={i}
                      className={cn(
                        "inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold",
                        roll.droppedValue !== undefined &&
                          v === roll.droppedValue &&
                          roll.diceValues.indexOf(roll.droppedValue) === i
                          ? "bg-destructive/20 text-destructive line-through"
                          : "bg-primary/20 text-primary",
                      )}
                    >
                      {v}
                    </span>
                  ))}
                  {roll.formula.includes("+6") && <span>+ 6</span>}
                  <span>= {roll.baseResult}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">x 5</div>
                <div className="text-2xl font-bold text-primary">{roll.finalResult}</div>
              </div>
            </div>
          ))}
        </div>

        {isComplete && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setRolls([])
                setCurrentIndex(0)
                setStarted(false)
                setWaitingForNextRoll(false)
                processingRoll.current = false
              }}
              className="flex-1 bg-transparent gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t("reroll_all")}
            </Button>
            <Button
              onClick={() => {
                const results: Record<string, number> = {}
                rolls.forEach((roll) => {
                  results[roll.name] = roll.finalResult
                })
                onComplete(results)
              }}
              className="flex-1"
            >
              {t("apply_results")}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

function Simple2DDice() {
  const [value, setValue] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * 6) + 1)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const dots = {
    1: [[1, 1]],
    2: [
      [0, 0],
      [2, 2],
    ],
    3: [
      [0, 0],
      [1, 1],
      [2, 2],
    ],
    4: [
      [0, 0],
      [0, 2],
      [2, 0],
      [2, 2],
    ],
    5: [
      [0, 0],
      [0, 2],
      [1, 1],
      [2, 0],
      [2, 2],
    ],
    6: [
      [0, 0],
      [0, 1],
      [0, 2],
      [2, 0],
      [2, 1],
      [2, 2],
    ],
  }

  return (
    <div className="w-16 h-16 bg-white rounded-lg shadow-lg relative animate-bounce">
      <div className="absolute inset-0 p-2 grid grid-cols-3 grid-rows-3">
        {dots[value as keyof typeof dots]?.map(([row, col], idx) => (
          <div
            key={idx}
            className="flex items-center justify-center"
            style={{
              gridColumn: col + 1,
              gridRow: row + 1,
            }}
          >
            <div className="w-2.5 h-2.5 bg-stone-900 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}