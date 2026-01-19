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

interface Intercession {
  id: number
  title: string
  content: string
  display_order: number
  created_at: string
}

interface SortableIntercessionProps {
  intercession: Intercession
  onEdit: (intercession: Intercession) => void
  onDelete: (id: number) => void
}

const SortableIntercession = ({ intercession, onEdit, onDelete }: SortableIntercessionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: intercession.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-3 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-indigo-400 hover:text-indigo-600"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-indigo-800">{intercession.title}</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(intercession)}
              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(intercession.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="bg-white p-4 rounded-b-lg">
          <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
            {intercession.content}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

const IntercessionsSection = () => {
  const { toast } = useToast()
  const [intercessions, setIntercessions] = useState<Intercession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIntercession, setEditingIntercession] = useState<Intercession | null>(null)
  const [formData, setFormData] = useState({ title: "", content: "" })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadIntercessions()
  }, [])

  const loadIntercessions = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Intercession[]>("/api/catolico/intercessions")
      setIntercessions(response.data)
    } catch (error) {
      console.error("Erro ao carregar intercessões:", error)
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
      if (editingIntercession) {
        await api.put(`/api/catolico/intercessions/${editingIntercession.id}`, formData)
        toast({ title: "Intercessão atualizada com sucesso" })
      } else {
        await api.post("/api/catolico/intercessions", formData)
        toast({ title: "Intercessão criada com sucesso" })
      }
      setIsDialogOpen(false)
      resetForm()
      loadIntercessions()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a intercessão",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta intercessão?")) return

    try {
      await api.delete(`/api/catolico/intercessions/${id}`)
      toast({ title: "Intercessão deletada com sucesso" })
      loadIntercessions()
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

    const oldIndex = intercessions.findIndex((n) => n.id === active.id)
    const newIndex = intercessions.findIndex((n) => n.id === over.id)

    const newOrder = arrayMove(intercessions, oldIndex, newIndex)
    setIntercessions(newOrder)

    try {
      const orders = newOrder.map((intercession, index) => ({
        id: intercession.id,
        display_order: index
      }))
      await api.post("/api/catolico/intercessions/reorder", { orders })
    } catch (error) {
      toast({
        title: "Erro ao reordenar",
        variant: "destructive"
      })
      loadIntercessions()
    }
  }

  const resetForm = () => {
    setFormData({ title: "", content: "" })
    setEditingIntercession(null)
  }

  const openEditDialog = (intercession: Intercession) => {
    setEditingIntercession(intercession)
    setFormData({ title: intercession.title, content: intercession.content })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Intercessões</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Intercessão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingIntercession ? "Editar Intercessão" : "Nova Intercessão"}</DialogTitle>
              <DialogDescription>
                {editingIntercession ? "Edite sua intercessão" : "Adicione uma nova intercessão"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Pela Família, Pelos Doentes, Pelos Necessitados..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Oração de Intercessão</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite sua oração de intercessão..."
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
              <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
                {editingIntercession ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {intercessions.length === 0 ? (
        <Card className="border-2 border-dashed border-indigo-300">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma intercessão cadastrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Nova Intercessão" para começar
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
            items={intercessions.map(n => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {intercessions.map((intercession) => (
                <SortableIntercession
                  key={intercession.id}
                  intercession={intercession}
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

export default IntercessionsSection
