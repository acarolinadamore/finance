import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface LifeArea {
  id: number
  name: string
  description: string
  color: string
  satisfaction_level: number
  display_order: number
  created_at: string
  updated_at: string
}

interface EditLifeAreaDialogProps {
  area: LifeArea | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (id: number, level: number) => Promise<void>
}

const getLevelDescription = (level: number): string => {
  if (level <= 3) return "Muito baixo - precisa de atenção urgente"
  if (level <= 5) return "Neutro - há espaço para melhorias"
  if (level <= 7) return "Bom - caminhando bem"
  if (level <= 9) return "Muito bom - está excelente"
  return "Perfeito - não poderia estar melhor!"
}

const getLevelColor = (level: number): string => {
  if (level <= 3) return "text-red-600"
  if (level <= 5) return "text-yellow-600"
  if (level <= 7) return "text-blue-600"
  if (level <= 9) return "text-green-600"
  return "text-emerald-600"
}

export const EditLifeAreaDialog = ({
  area,
  open,
  onOpenChange,
  onSave,
}: EditLifeAreaDialogProps) => {
  const [level, setLevel] = useState(5)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (area) {
      setLevel(area.satisfaction_level)
    }
  }, [area])

  const handleSave = async () => {
    if (!area) return

    try {
      setSaving(true)
      await onSave(area.id, level)
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  if (!area) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: area.color }}
            />
            {area.name}
          </DialogTitle>
          <DialogDescription>{area.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Nível de satisfação atual
              </label>
              <span
                className="text-2xl font-bold"
                style={{ color: area.color }}
              >
                {level}/10
              </span>
            </div>

            <Slider
              value={[level]}
              onValueChange={(values) => setLevel(values[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          <div
            className={`text-center text-sm font-medium ${getLevelColor(
              level
            )}`}
          >
            {getLevelDescription(level)}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
