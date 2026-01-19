import { useState, useEffect } from "react"
import { Plus, Heart, Edit, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"

interface Prayer {
  id: number
  title: string
  content: string
  category?: string
  is_favorite: boolean
  created_at: string
  updated_at: string
}

const PRAYER_CATEGORIES = [
  "Manhã",
  "Tarde",
  "Noite",
  "Terço",
  "Novena",
  "Meditação",
  "Ação de Graças",
  "Súplica",
  "Outros"
]

const PrayersTab = () => {
  const { toast } = useToast()
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: ""
  })

  useEffect(() => {
    fetchPrayers()
  }, [])

  const fetchPrayers = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/catolico/prayers")
      setPrayers(response.data)
    } catch (error) {
      console.error("Erro ao carregar orações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as orações",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e o conteúdo",
        variant: "destructive"
      })
      return
    }

    try {
      if (editingPrayer) {
        await api.put(`/api/catolico/prayers/${editingPrayer.id}`, {
          ...formData,
          is_favorite: editingPrayer.is_favorite
        })
        toast({
          title: "Oração atualizada",
          description: "Oração atualizada com sucesso"
        })
      } else {
        await api.post("/api/catolico/prayers", formData)
        toast({
          title: "Oração criada",
          description: "Oração criada com sucesso"
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchPrayers()
    } catch (error) {
      console.error("Erro ao salvar oração:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a oração",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta oração?")) return

    try {
      await api.delete(`/api/catolico/prayers/${id}`)
      toast({
        title: "Oração deletada",
        description: "Oração deletada com sucesso"
      })
      fetchPrayers()
    } catch (error) {
      console.error("Erro ao deletar oração:", error)
      toast({
        title: "Erro",
        description: "Não foi possível deletar a oração",
        variant: "destructive"
      })
    }
  }

  const toggleFavorite = async (prayer: Prayer) => {
    try {
      await api.put(`/api/catolico/prayers/${prayer.id}`, {
        ...prayer,
        is_favorite: !prayer.is_favorite
      })
      fetchPrayers()
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
      content: "",
      category: ""
    })
    setEditingPrayer(null)
  }

  const openEditDialog = (prayer: Prayer) => {
    setEditingPrayer(prayer)
    setFormData({
      title: prayer.title,
      content: prayer.content,
      category: prayer.category || ""
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Minhas Orações</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Oração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPrayer ? "Editar Oração" : "Nova Oração"}</DialogTitle>
              <DialogDescription>
                {editingPrayer ? "Edite sua oração" : "Adicione uma nova oração à sua coleção"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Pai Nosso, Ave Maria, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRAYER_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite a oração completa..."
                  rows={10}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingPrayer ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : prayers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma oração cadastrada ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Nova Oração" para começar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prayers.map((prayer) => (
            <Card key={prayer.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{prayer.title}</CardTitle>
                    {prayer.category && (
                      <CardDescription>{prayer.category}</CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(prayer)}
                    className={prayer.is_favorite ? "text-yellow-500" : "text-gray-400"}
                  >
                    <Star className={`h-4 w-4 ${prayer.is_favorite ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {prayer.content}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(prayer)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(prayer.id)}
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

export default PrayersTab
