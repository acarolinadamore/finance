import { useState, useEffect } from "react"
import { Plus, BookOpen, Edit, Trash2, Star, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

interface Reading {
  id: number
  title: string
  author?: string
  book_name?: string
  reference?: string
  content?: string
  notes?: string
  date_read?: string
  is_favorite: boolean
  created_at: string
  updated_at: string
}

const ReadingsTab = () => {
  const { toast } = useToast()
  const [readings, setReadings] = useState<Reading[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReading, setEditingReading] = useState<Reading | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    book_name: "",
    reference: "",
    content: "",
    notes: "",
    date_read: ""
  })

  useEffect(() => {
    fetchReadings()
  }, [])

  const fetchReadings = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/catolico/readings")
      setReadings(response.data)
    } catch (error) {
      console.error("Erro ao carregar leituras:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as leituras",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o título",
        variant: "destructive"
      })
      return
    }

    try {
      if (editingReading) {
        await api.put(`/api/catolico/readings/${editingReading.id}`, {
          ...formData,
          is_favorite: editingReading.is_favorite
        })
        toast({
          title: "Leitura atualizada",
          description: "Leitura atualizada com sucesso"
        })
      } else {
        await api.post("/api/catolico/readings", formData)
        toast({
          title: "Leitura criada",
          description: "Leitura criada com sucesso"
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchReadings()
    } catch (error) {
      console.error("Erro ao salvar leitura:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a leitura",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta leitura?")) return

    try {
      await api.delete(`/api/catolico/readings/${id}`)
      toast({
        title: "Leitura deletada",
        description: "Leitura deletada com sucesso"
      })
      fetchReadings()
    } catch (error) {
      console.error("Erro ao deletar leitura:", error)
      toast({
        title: "Erro",
        description: "Não foi possível deletar a leitura",
        variant: "destructive"
      })
    }
  }

  const toggleFavorite = async (reading: Reading) => {
    try {
      await api.put(`/api/catolico/readings/${reading.id}`, {
        ...reading,
        is_favorite: !reading.is_favorite
      })
      fetchReadings()
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar favorito",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      book_name: "",
      reference: "",
      content: "",
      notes: "",
      date_read: ""
    })
    setEditingReading(null)
  }

  const openEditDialog = (reading: Reading) => {
    setEditingReading(reading)
    setFormData({
      title: reading.title,
      author: reading.author || "",
      book_name: reading.book_name || "",
      reference: reading.reference || "",
      content: reading.content || "",
      notes: reading.notes || "",
      date_read: reading.date_read || ""
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Leituras Espirituais</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Leitura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReading ? "Editar Leitura" : "Nova Leitura"}</DialogTitle>
              <DialogDescription>
                {editingReading ? "Edite sua leitura" : "Registre uma nova leitura espiritual"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Evangelho do dia"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_read">Data da Leitura</Label>
                  <Input
                    id="date_read"
                    type="date"
                    value={formData.date_read}
                    onChange={(e) => setFormData({ ...formData, date_read: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="book_name">Livro</Label>
                  <Input
                    id="book_name"
                    value={formData.book_name}
                    onChange={(e) => setFormData({ ...formData, book_name: e.target.value })}
                    placeholder="Ex: Bíblia, Imitação de Cristo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Autor</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Ex: São João, Santo Agostinho"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Referência</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Ex: João 3:16, Capítulo 5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Cole aqui o texto lido..."
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Reflexões Pessoais</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Suas reflexões sobre a leitura..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingReading ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : readings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma leitura cadastrada ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Nova Leitura" para começar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {readings.map((reading) => (
            <Card key={reading.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{reading.title}</CardTitle>
                    <CardDescription>
                      {reading.book_name && <span>{reading.book_name}</span>}
                      {reading.reference && <span> - {reading.reference}</span>}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(reading)}
                    className={reading.is_favorite ? "text-yellow-500" : "text-gray-400"}
                  >
                    <Star className={`h-4 w-4 ${reading.is_favorite ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {reading.author && (
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Autor:</strong> {reading.author}
                  </p>
                )}
                {reading.date_read && (
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(reading.date_read), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                )}
                {reading.content && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {reading.content}
                  </p>
                )}
                {reading.notes && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Reflexões:</p>
                    <p className="text-sm text-blue-700 line-clamp-2">{reading.notes}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(reading)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(reading.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReadingsTab
