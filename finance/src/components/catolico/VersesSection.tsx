import { useState, useEffect } from "react"
import { Plus, GripVertical, Edit, Trash2, BookOpen } from "lucide-react"
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

interface Verse {
  id: number
  livro: string
  capitulo: number
  versiculo: string
  texto: string
  display_order: number
  created_at: string
}

interface SortableVerseProps {
  verse: Verse
  onEdit: (verse: Verse) => void
  onDelete: (id: number) => void
}

const SortableVerse = ({ verse, onEdit, onDelete }: SortableVerseProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: verse.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing mt-1 text-blue-400 hover:text-blue-600"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">
                  {verse.livro} {verse.capitulo}:{verse.versiculo}
                </h3>
              </div>
              <p className="text-blue-700 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: 'Lora, serif' }}>
                {verse.texto}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(verse)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(verse.id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const VersesSection = () => {
  const { toast } = useToast()
  const [verses, setVerses] = useState<Verse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVerse, setEditingVerse] = useState<Verse | null>(null)
  const [formData, setFormData] = useState({
    livro: "",
    capitulo: "",
    versiculo: "",
    texto: ""
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadVerses()
  }, [])

  const loadVerses = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Verse[]>("/api/catolico/verses")
      setVerses(response.data)
    } catch (error) {
      console.error("Erro ao carregar versículos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.livro || !formData.capitulo || !formData.versiculo || !formData.texto) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive"
      })
      return
    }

    try {
      const payload = {
        livro: formData.livro,
        capitulo: parseInt(formData.capitulo),
        versiculo: formData.versiculo,
        texto: formData.texto
      }

      if (editingVerse) {
        await api.put(`/api/catolico/verses/${editingVerse.id}`, payload)
        toast({ title: "Versículo atualizado com sucesso" })
      } else {
        await api.post("/api/catolico/verses", payload)
        toast({ title: "Versículo adicionado com sucesso" })
      }
      setIsDialogOpen(false)
      resetForm()
      loadVerses()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o versículo",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este versículo?")) return

    try {
      await api.delete(`/api/catolico/verses/${id}`)
      toast({ title: "Versículo deletado com sucesso" })
      loadVerses()
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

    const oldIndex = verses.findIndex((v) => v.id === active.id)
    const newIndex = verses.findIndex((v) => v.id === over.id)

    const newOrder = arrayMove(verses, oldIndex, newIndex)
    setVerses(newOrder)

    try {
      const orders = newOrder.map((verse, index) => ({
        id: verse.id,
        display_order: index
      }))
      await api.post("/api/catolico/verses/reorder", { orders })
    } catch (error) {
      toast({
        title: "Erro ao reordenar",
        variant: "destructive"
      })
      loadVerses()
    }
  }

  const resetForm = () => {
    setFormData({ livro: "", capitulo: "", versiculo: "", texto: "" })
    setEditingVerse(null)
  }

  const openEditDialog = (verse: Verse) => {
    setEditingVerse(verse)
    setFormData({
      livro: verse.livro,
      capitulo: verse.capitulo.toString(),
      versiculo: verse.versiculo,
      texto: verse.texto
    })
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Versículos Favoritos</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Versículo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingVerse ? "Editar Versículo" : "Novo Versículo"}</DialogTitle>
              <DialogDescription>
                {editingVerse ? "Edite o versículo" : "Adicione um novo versículo favorito"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="livro">Livro</Label>
                  <Input
                    id="livro"
                    value={formData.livro}
                    onChange={(e) => setFormData({ ...formData, livro: e.target.value })}
                    placeholder="Ex: João, Isaías, Salmos"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capitulo">Capítulo</Label>
                  <Input
                    id="capitulo"
                    type="number"
                    value={formData.capitulo}
                    onChange={(e) => setFormData({ ...formData, capitulo: e.target.value })}
                    placeholder="Ex: 3"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="versiculo">Versículo(s)</Label>
                <Input
                  id="versiculo"
                  value={formData.versiculo}
                  onChange={(e) => setFormData({ ...formData, versiculo: e.target.value })}
                  placeholder="Ex: 16 ou 1-4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="texto">Texto</Label>
                <Textarea
                  id="texto"
                  value={formData.texto}
                  onChange={(e) => setFormData({ ...formData, texto: e.target.value })}
                  placeholder="Digite o texto do versículo..."
                  rows={8}
                  className="resize-none text-lg"
                  style={{ fontFamily: 'Lora, serif' }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                {editingVerse ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {verses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-blue-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Nenhum versículo cadastrado
            </h2>
            <p className="text-muted-foreground">
              Clique em "Novo Versículo" para começar a adicionar seus versículos favoritos
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
            items={verses.map(v => v.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {verses.map((verse) => (
                <SortableVerse
                  key={verse.id}
                  verse={verse}
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

export default VersesSection
