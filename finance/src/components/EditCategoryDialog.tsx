import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface DocumentCategory {
  id: number
  name: string
  description?: string
  icon: string
  color: string
  display_order: number
}

interface EditCategoryDialogProps {
  category: DocumentCategory | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (
    id: number,
    updates: {
      name?: string
      description?: string
      color?: string
    }
  ) => Promise<void>
}

export const EditCategoryDialog = ({
  category,
  open,
  onOpenChange,
  onUpdate,
}: EditCategoryDialogProps) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [color, setColor] = useState("#6366f1")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (category && open) {
      setName(category.name)
      setDescription(category.description || "")
      setColor(category.color)
    }
  }, [category, open])

  const handleSave = async () => {
    if (!category) return

    if (!name.trim()) {
      alert("Por favor, insira um nome para a categoria")
      return
    }

    try {
      setSaving(true)

      await onUpdate(category.id, {
        name,
        description: description || undefined,
        color,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error)
      alert("Erro ao atualizar categoria. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  const colorPresets = [
    "#3b82f6", // blue
    "#10b981", // green
    "#8b5cf6", // purple
    "#ef4444", // red
    "#ec4899", // pink
    "#f59e0b", // orange
    "#06b6d4", // cyan
    "#6b7280", // gray
    "#f97316", // orange
    "#a855f7", // purple
    "#84cc16", // lime
    "#14b8a6", // teal
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>
            Altere o nome, descrição e cor da categoria
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome da categoria */}
          <div className="space-y-2">
            <Label htmlFor="edit-cat-name">Nome da Categoria *</Label>
            <Input
              id="edit-cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Documentos Pessoais"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="edit-cat-description">Descrição</Label>
            <Textarea
              id="edit-cat-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o tipo de documentos desta categoria..."
              rows={3}
            />
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label htmlFor="edit-cat-color">Cor</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="edit-cat-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#6366f1"
                className="flex-1 font-mono"
              />
            </div>

            {/* Cores pré-definidas */}
            <div className="grid grid-cols-12 gap-2 pt-2">
              {colorPresets.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                    color === presetColor
                      ? "border-gray-900 ring-2 ring-gray-400"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: presetColor }}
                  title={presetColor}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Visualização</Label>
            <div
              className="p-4 rounded-lg border-2 text-center"
              style={{ borderColor: color, color: color }}
            >
              <p className="font-semibold">{name || "Nome da Categoria"}</p>
              {description && (
                <p className="text-xs mt-1 text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
