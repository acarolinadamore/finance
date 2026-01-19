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

interface Penance {
  id: number
  title: string
  content: string
  display_order: number
  created_at: string
}

interface SortablePenanceProps {
  penance: Penance
  onEdit: (penance: Penance) => void
  onDelete: (id: number) => void
}

const SortablePenance = ({ penance, onEdit, onDelete }: SortablePenanceProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: penance.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-4 py-3 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-red-400 hover:text-red-600"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-red-800">{penance.title}</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(penance)}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(penance.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="bg-white p-4 rounded-b-lg">
          <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
            {penance.content}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

const PenancesSection = () => {
  const { toast } = useToast()
  const [penances, setPenances] = useState<Penance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPenance, setEditingPenance] = useState<Penance | null>(null)
  const [formData, setFormData] = useState({ title: "", content: "" })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadPenances()
  }, [])

  const loadPenances = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Penance[]>("/api/catolico/penances")
      setPenances(response.data)
    } catch (error) {
      console.error("Erro ao carregar penances:", error)
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
      if (editingPenance) {
        await api.put(`/api/catolico/penances/${editingPenance.id}`, formData)
        toast({ title: "Penitência atualizada com sucesso" })
      } else {
        await api.post("/api/catolico/penances", formData)
        toast({ title: "Penitência criada com sucesso" })
      }
      setIsDialogOpen(false)
      resetForm()
      loadPenances()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a penance",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta penance?")) return

    try {
      await api.delete(`/api/catolico/penances/${id}`)
      toast({ title: "Penitência deletada com sucesso" })
      loadPenances()
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

    const oldIndex = penances.findIndex((n) => n.id === active.id)
    const newIndex = penances.findIndex((n) => n.id === over.id)

    const newOrder = arrayMove(penances, oldIndex, newIndex)
    setPenances(newOrder)

    try {
      const orders = newOrder.map((penance, index) => ({
        id: penance.id,
        display_order: index
      }))
      await api.post("/api/catolico/penances/reorder", { orders })
    } catch (error) {
      toast({
        title: "Erro ao reordenar",
        variant: "destructive"
      })
      loadPenances()
    }
  }

  const resetForm = () => {
    setFormData({ title: "", content: "" })
    setEditingPenance(null)
  }

  const openEditDialog = (penance: Penance) => {
    setEditingPenance(penance)
    setFormData({ title: penance.title, content: penance.content })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Penitências</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Penitência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPenance ? "Editar Penitência" : "Nova Penitência"}</DialogTitle>
              <DialogDescription>
                {editingPenance ? "Edite sua penance" : "Adicione uma nova penance"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Ato de Contrição"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite a oração de penitência..."
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
              <Button onClick={handleSubmit} className="bg-red-600 hover:bg-red-700">
                {editingPenance ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {penances.length === 0 ? (
        <Card className="border-2 border-dashed border-red-300">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma penitência cadastrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Nova Penitência" para começar
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
            items={penances.map(n => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {penances.map((penance) => (
                <SortablePenance
                  key={penance.id}
                  penance={penance}
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

export default PenancesSection
