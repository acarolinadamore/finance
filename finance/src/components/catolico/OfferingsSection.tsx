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

interface Offering {
  id: number
  title: string
  content: string
  display_order: number
  created_at: string
}

interface SortableOfferingProps {
  offering: Offering
  onEdit: (offering: Offering) => void
  onDelete: (id: number) => void
}

const SortableOffering = ({ offering, onEdit, onDelete }: SortableOfferingProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: offering.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 hover:shadow-md transition-shadow overflow-hidden">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-3 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3 flex-1">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-teal-400 hover:text-teal-600"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-teal-800">{offering.title}</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(offering)}
              className="text-teal-600 hover:text-teal-800 hover:bg-teal-100"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(offering.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="bg-white p-4 rounded-b-lg">
          <p className="text-gray-700 whitespace-pre-wrap text-base leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
            {offering.content}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

const OfferingsSection = () => {
  const { toast } = useToast()
  const [offerings, setOfferings] = useState<Offering[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null)
  const [formData, setFormData] = useState({ title: "", content: "" })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadOfferings()
  }, [])

  const loadOfferings = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Offering[]>("/api/catolico/offerings")
      setOfferings(response.data)
    } catch (error) {
      console.error("Erro ao carregar offerings:", error)
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
      if (editingOffering) {
        await api.put(`/api/catolico/offerings/${editingOffering.id}`, formData)
        toast({ title: "Oferecimento atualizado com sucesso" })
      } else {
        await api.post("/api/catolico/offerings", formData)
        toast({ title: "Oferecimento criado com sucesso" })
      }
      setIsDialogOpen(false)
      resetForm()
      loadOfferings()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a offering",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta offering?")) return

    try {
      await api.delete(`/api/catolico/offerings/${id}`)
      toast({ title: "Oferecimento deletado com sucesso" })
      loadOfferings()
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

    const oldIndex = offerings.findIndex((n) => n.id === active.id)
    const newIndex = offerings.findIndex((n) => n.id === over.id)

    const newOrder = arrayMove(offerings, oldIndex, newIndex)
    setOfferings(newOrder)

    try {
      const orders = newOrder.map((offering, index) => ({
        id: offering.id,
        display_order: index
      }))
      await api.post("/api/catolico/offerings/reorder", { orders })
    } catch (error) {
      toast({
        title: "Erro ao reordenar",
        variant: "destructive"
      })
      loadOfferings()
    }
  }

  const resetForm = () => {
    setFormData({ title: "", content: "" })
    setEditingOffering(null)
  }

  const openEditDialog = (offering: Offering) => {
    setEditingOffering(offering)
    setFormData({ title: offering.title, content: offering.content })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Oferecimentos</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Oferecimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingOffering ? "Editar Oferecimento" : "Novo Oferecimento"}</DialogTitle>
              <DialogDescription>
                {editingOffering ? "Edite sua offering" : "Adicione uma nova offering"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Oferecimento do Dia"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite o oferecimento..."
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
              <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
                {editingOffering ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {offerings.length === 0 ? (
        <Card className="border-2 border-dashed border-teal-300">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Nenhum oferecimento cadastrado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Novo Oferecimento" para começar
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
            items={offerings.map(n => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {offerings.map((offering) => (
                <SortableOffering
                  key={offering.id}
                  offering={offering}
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

export default OfferingsSection
