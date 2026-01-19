import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import * as Icons from "lucide-react"

interface CreateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (category: {
    name: string
    description?: string
    icon: string
    color: string
  }) => Promise<void>
}

export const CreateCategoryDialog = ({
  open,
  onOpenChange,
  onCreate,
}: CreateCategoryDialogProps) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("Folder")
  const [color, setColor] = useState("#6366f1")
  const [creating, setCreating] = useState(false)

  const availableIcons = [
    "Folder",
    "FileText",
    "Image",
    "User",
    "Users",
    "Briefcase",
    "Scale",
    "Heart",
    "DollarSign",
    "Home",
    "Car",
    "GraduationCap",
    "Music",
    "Film",
    "Book",
    "Award",
  ]

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

  const handleCreate = async () => {
    if (!name.trim()) {
      alert("Por favor, insira um nome para a categoria")
      return
    }

    try {
      setCreating(true)

      await onCreate({
        name,
        description: description || undefined,
        icon,
        color,
      })

      // Limpar formulário
      setName("")
      setDescription("")
      setIcon("Folder")
      setColor("#6366f1")
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
      alert("Erro ao criar categoria. Tente novamente.")
    } finally {
      setCreating(false)
    }
  }

  const handleCancel = () => {
    setName("")
    setDescription("")
    setIcon("Folder")
    setColor("#6366f1")
    onOpenChange(false)
  }

  const renderIconPreview = () => {
    const IconComponent = (Icons as any)[icon] || Icons.Folder
    return <IconComponent className="h-6 w-6" style={{ color }} />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para organizar seus documentos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome da categoria */}
          <div className="space-y-2">
            <Label htmlFor="create-cat-name">Nome da Categoria *</Label>
            <Input
              id="create-cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Documentos Acadêmicos"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="create-cat-description">Descrição</Label>
            <Textarea
              id="create-cat-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o tipo de documentos desta categoria..."
              rows={3}
            />
          </div>

          {/* Ícone */}
          <div className="space-y-2">
            <Label htmlFor="create-cat-icon">Ícone</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um ícone" />
              </SelectTrigger>
              <SelectContent>
                {availableIcons.map((iconName) => {
                  const IconComponent = (Icons as any)[iconName]
                  return (
                    <SelectItem key={iconName} value={iconName}>
                      <div className="flex items-center gap-2">
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                        {iconName}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label htmlFor="create-cat-color">Cor</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="create-cat-color"
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
              className="p-4 rounded-lg border-2 text-center flex flex-col items-center gap-2"
              style={{ borderColor: color }}
            >
              {renderIconPreview()}
              <p className="font-semibold" style={{ color }}>
                {name || "Nome da Categoria"}
              </p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={creating}
          >
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? "Criando..." : "Criar Categoria"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
