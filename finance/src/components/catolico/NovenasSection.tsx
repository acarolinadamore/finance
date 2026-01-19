import { useState, useEffect } from "react"
import { Plus, GripVertical, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Novena {
  id: number
  title: string
  content: string
  display_order: number
  created_at: string
}

interface SortableNovenaProps {
  novena: Novena
  onEdit: (novena: Novena) => void
  onDelete: (id: number) => void
}

const SortableNovena = ({ novena, onEdit, onDelete }: SortableNovenaProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: novena.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-purple-400 hover:text-purple-600"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-purple-800">{novena.title}</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(novena)}
              className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(novena.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="bg-white p-4 rounded-b-lg">
          <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
            {novena.content}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

const NovenasSection = () => {
  const { toast } = useToast()
  const [novenas, setNovenas] = useState<Novena[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNovena, setEditingNovena] = useState<Novena | null>(null)
  const [formData, setFormData] = useState({ title: "", content: "" })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadNovenas()
  }, [])

  const loadNovenas = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Novena[]>("/api/catolico/novenas")
      setNovenas(response.data)
    } catch (error) {
      console.error("Erro ao carregar novenas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o título e o conteúdo",
        variant: "destructive"
      })
      return
    }

    try {
      if (editingNovena) {
        await api.put(`/api/catolico/novenas/${editingNovena.id}`, formData)
        toast({ title: "Novena atualizada com sucesso" })
      } else {
        await api.post("/api/catolico/novenas", formData)
        toast({ title: "Novena criada com sucesso" })
      }
      setIsDialogOpen(false)
      resetForm()
      loadNovenas()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a novena",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta novena?")) return

    try {
      await api.delete(`/api/catolico/novenas/${id}`)
      toast({ title: "Novena deletada com sucesso" })
      loadNovenas()
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        variant: "destructive"
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = novenas.findIndex((n) => n.id === active.id)
    const newIndex = novenas.findIndex((n) => n.id === over.id)

    const newOrder = arrayMove(novenas, oldIndex, newIndex)
    setNovenas(newOrder)

    try {
      const orders = newOrder.map((novena, index) => ({
        id: novena.id,
        display_order: index
      }))
      await api.post("/api/catolico/novenas/reorder", { orders })
    } catch (error) {
      toast({
        title: "Erro ao reordenar",
        variant: "destructive"
      })
      loadNovenas()
    }
  }

  const resetForm = () => {
    setFormData({ title: "", content: "" })
    setEditingNovena(null)
  }

  const openEditDialog = (novena: Novena) => {
    setEditingNovena(novena)
    setFormData({ title: novena.title, content: novena.content })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Novenas</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Novena
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingNovena ? "Editar Novena" : "Nova Novena"}</DialogTitle>
              <DialogDescription>
                {editingNovena ? "Edite sua novena" : "Adicione uma nova novena"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Novena ao Sagrado Coração de Jesus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite a novena completa..."
                  rows={10}
                  className="resize-none text-lg"
                  style={{ fontFamily: 'Lora, serif' }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
                {editingNovena ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {novenas.length === 0 ? (
        <Card className="border-2 border-dashed border-purple-300">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma novena cadastrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Nova Novena" para começar
            </p>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={novenas.map(n => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {novenas.map((novena) => (
                <SortableNovena
                  key={novena.id}
                  novena={novena}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

export default NovenasSection
