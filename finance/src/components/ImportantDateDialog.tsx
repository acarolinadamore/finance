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
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Category {
  id: number
  name: string
  icon: string
  color: string
}

interface ImportantDate {
  id: number
  date: string
  title: string
  description?: string
  link?: string
  tags: Category[]
}

interface ImportantDateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date?: ImportantDate | null
  categories: Category[]
  onSave: (data: {
    date: string
    title: string
    description?: string
    link?: string
    tags?: number[]
  }) => Promise<void>
  onUpdate?: (
    id: number,
    data: {
      date?: string
      title?: string
      description?: string
      link?: string
      tags?: number[]
    }
  ) => Promise<void>
}

export const ImportantDateDialog = ({
  open,
  onOpenChange,
  date: existingDate,
  categories,
  onSave,
  onUpdate,
}: ImportantDateDialogProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [dateInputValue, setDateInputValue] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [link, setLink] = useState("")
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open && existingDate) {
      const date = new Date(existingDate.date)
      setSelectedDate(date)
      setDateInputValue(format(date, "dd/MM/yyyy"))
      setTitle(existingDate.title)
      setDescription(existingDate.description || "")
      setLink(existingDate.link || "")
      setSelectedTags(existingDate.tags.map((t) => t.id))
    } else if (open && !existingDate) {
      const today = new Date()
      setSelectedDate(today)
      setDateInputValue(format(today, "dd/MM/yyyy"))
      setTitle("")
      setDescription("")
      setLink("")
      setSelectedTags([])
    }
  }, [open, existingDate])

  const handleToggleTag = (categoryId: number) => {
    if (selectedTags.includes(categoryId)) {
      setSelectedTags(selectedTags.filter((id) => id !== categoryId))
    } else {
      setSelectedTags([...selectedTags, categoryId])
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Por favor, insira um título")
      return
    }

    try {
      setSaving(true)
      const dateString = format(selectedDate, "yyyy-MM-dd")

      if (existingDate && onUpdate) {
        await onUpdate(existingDate.id, {
          date: dateString,
          title,
          description: description || undefined,
          link: link || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        })
      } else {
        await onSave({
          date: dateString,
          title,
          description: description || undefined,
          link: link || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar data importante. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingDate ? "Editar Data Importante" : "Adicionar Data Importante"}
          </DialogTitle>
          <DialogDescription>
            Registre momentos memoráveis e acontecimentos importantes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Data */}
          <div className="space-y-2">
            <Label>Data *</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={dateInputValue}
                onChange={(e) => {
                  const value = e.target.value
                  setDateInputValue(value)

                  // Tenta converter para Date quando estiver no formato correto
                  const parts = value.split('/')
                  if (parts.length === 3 && parts[0].length >= 1 && parts[1].length >= 1 && parts[2].length === 4) {
                    const day = parseInt(parts[0])
                    const month = parseInt(parts[1]) - 1
                    const year = parseInt(parts[2])

                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                      const newDate = new Date(year, month, day)
                      if (!isNaN(newDate.getTime()) && day >= 1 && day <= 31 && month >= 0 && month <= 11) {
                        setSelectedDate(newDate)
                      }
                    }
                  }
                }}
                placeholder="dd/mm/aaaa"
                className="flex-1"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date)
                        setDateInputValue(format(date, "dd/MM/yyyy"))
                      }
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Formatura, Casamento, Primeiro emprego..."
            />
          </div>

          {/* Tags/Categorias */}
          <div className="space-y-2">
            <Label>Áreas da Vida (pode selecionar múltiplas)</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedTags.includes(category.id)
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleToggleTag(category.id)}
                    className="transition-all"
                  >
                    <Badge
                      variant={isSelected ? "default" : "outline"}
                      style={{
                        backgroundColor: isSelected ? category.color : undefined,
                        borderColor: category.color,
                        color: isSelected ? "white" : category.color,
                      }}
                      className="cursor-pointer hover:opacity-80"
                    >
                      {category.name}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva detalhes sobre este momento..."
              rows={4}
            />
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="link">Link (opcional)</Label>
            <Input
              id="link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://exemplo.com/fotos"
            />
            <p className="text-xs text-muted-foreground">
              URL para fotos, documentos ou qualquer referência relacionada
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : existingDate ? "Salvar Alterações" : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
