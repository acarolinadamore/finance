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

interface Ejaculation {
  id: number
  title: string
  content: string
  display_order: number
  created_at: string
}

interface SortableEjaculationProps {
  ejaculation: Ejaculation
  onEdit: (ejaculation: Ejaculation) => void
  onDelete: (id: number) => void
}

const SortableEjaculation = ({ ejaculation, onEdit, onDelete }: SortableEjaculationProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ejaculation.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-pink-50 hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-pink-50 to-pink-50 px-4 py-3 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-pink-400 hover:text-pink-600"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-pink-800">{ejaculation.title}</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(ejaculation)}
              className="text-pink-600 hover:text-pink-800 hover:bg-pink-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(ejaculation.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="bg-white p-4 rounded-b-lg">
          <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
            {ejaculation.content}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

const EjaculationsSection = () => {
  const { toast } = useToast()
  const [ejaculations, setEjaculations] = useState<Ejaculation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEjaculation, setEditingEjaculation] = useState<Ejaculation | null>(null)
  const [formData, setFormData] = useState({ title: "", content: "" })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadEjaculations()
  }, [])

  const loadEjaculations = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Ejaculation[]>("/api/catolico/ejaculations")
      setEjaculations(response.data)
    } catch (error) {
      console.error("Erro ao carregar ejaculations:", error)
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
      if (editingEjaculation) {
        await api.put(`/api/catolico/ejaculations/${editingEjaculation.id}`, formData)
        toast({ title: "Jaculatória atualizada com sucesso" })
      } else {
        await api.post("/api/catolico/ejaculations", formData)
        toast({ title: "Jaculatória criada com sucesso" })
      }
      setIsDialogOpen(false)
      resetForm()
      loadEjaculations()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a ejaculation",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta ejaculation?")) return

    try {
      await api.delete(`/api/catolico/ejaculations/${id}`)
      toast({ title: "Jaculatória deletada com sucesso" })
      loadEjaculations()
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

    const oldIndex = ejaculations.findIndex((n) => n.id === active.id)
    const newIndex = ejaculations.findIndex((n) => n.id === over.id)

    const newOrder = arrayMove(ejaculations, oldIndex, newIndex)
    setEjaculations(newOrder)

    try {
      const orders = newOrder.map((ejaculation, index) => ({
        id: ejaculation.id,
        display_order: index
      }))
      await api.post("/api/catolico/ejaculations/reorder", { orders })
    } catch (error) {
      toast({
        title: "Erro ao reordenar",
        variant: "destructive"
      })
      loadEjaculations()
    }
  }

  const resetForm = () => {
    setFormData({ title: "", content: "" })
    setEditingEjaculation(null)
  }

  const openEditDialog = (ejaculation: Ejaculation) => {
    setEditingEjaculation(ejaculation)
    setFormData({ title: ejaculation.title, content: ejaculation.content })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Jaculatórias</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-pink-600 hover:bg-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Jaculatória
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEjaculation ? "Editar Jaculatória" : "Nova Jaculatória"}</DialogTitle>
              <DialogDescription>
                {editingEjaculation ? "Edite sua ejaculation" : "Adicione uma nova ejaculation"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Meu Jesus, misericórdia! Coração de Jesus"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite a jaculatória..."
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
              <Button onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700">
                {editingEjaculation ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {ejaculations.length === 0 ? (
        <Card className="border-2 border-dashed border-pink-300">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma jaculatória cadastrada</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Nova Jaculatória" para começar
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
            items={ejaculations.map(n => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {ejaculations.map((ejaculation) => (
                <SortableEjaculation
                  key={ejaculation.id}
                  ejaculation={ejaculation}
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

export default EjaculationsSection
