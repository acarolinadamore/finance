import { useState, useEffect } from "react"
import { Plus, FileText, Edit, Trash2, Calendar, MapPin, User, CheckCircle2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

interface Confession {
  id: number
  confession_date: string
  notes?: string
  penance?: string
  confessor_name?: string
  location?: string
  is_completed: boolean
  created_at: string
  updated_at: string
}

const ConfessionsTab = () => {
  const { toast } = useToast()
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConfession, setEditingConfession] = useState<Confession | null>(null)

  const [formData, setFormData] = useState({
    confession_date: "",
    notes: "",
    penance: "",
    confessor_name: "",
    location: "",
    is_completed: true
  })

  useEffect(() => {
    fetchConfessions()
  }, [])

  const fetchConfessions = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/api/catolico/confessions")
      setConfessions(response.data)
    } catch (error) {
      console.error("Erro ao carregar confissões:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as confissões",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.confession_date) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha a data da confissão",
        variant: "destructive"
      })
      return
    }

    try {
      if (editingConfession) {
        await api.put(`/api/catolico/confessions/${editingConfession.id}`, formData)
        toast({
          title: "Confissão atualizada",
          description: "Confissão atualizada com sucesso"
        })
      } else {
        await api.post("/api/catolico/confessions", formData)
        toast({
          title: "Confissão registrada",
          description: "Confissão registrada com sucesso"
        })
      }

      setIsDialogOpen(false)
      resetForm()
      fetchConfessions()
    } catch (error) {
      console.error("Erro ao salvar confissão:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a confissão",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este registro?")) return

    try {
      await api.delete(`/api/catolico/confessions/${id}`)
      toast({
        title: "Confissão deletada",
        description: "Confissão deletada com sucesso"
      })
      fetchConfessions()
    } catch (error) {
      console.error("Erro ao deletar confissão:", error)
      toast({
        title: "Erro",
        description: "Não foi possível deletar a confissão",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      confession_date: "",
      notes: "",
      penance: "",
      confessor_name: "",
      location: "",
      is_completed: true
    })
    setEditingConfession(null)
  }

  const openEditDialog = (confession: Confession) => {
    setEditingConfession(confession)
    setFormData({
      confession_date: confession.confession_date,
      notes: confession.notes || "",
      penance: confession.penance || "",
      confessor_name: confession.confessor_name || "",
      location: confession.location || "",
      is_completed: confession.is_completed
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Registro de Confissões</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Confissão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingConfession ? "Editar Registro" : "Novo Registro de Confissão"}</DialogTitle>
              <DialogDescription>
                {editingConfession ? "Edite seu registro" : "Registre sua confissão e reflexões"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="confession_date">Data da Confissão *</Label>
                  <Input
                    id="confession_date"
                    type="date"
                    value={formData.confession_date}
                    onChange={(e) => setFormData({ ...formData, confession_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_completed"
                      checked={formData.is_completed}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_completed: checked as boolean })
                      }
                    />
                    <Label
                      htmlFor="is_completed"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Confissão realizada
                    </Label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="confessor_name">Nome do Confessor</Label>
                  <Input
                    id="confessor_name"
                    value={formData.confessor_name}
                    onChange={(e) => setFormData({ ...formData, confessor_name: e.target.value })}
                    placeholder="Ex: Padre João"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ex: Paróquia São José"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Exame de Consciência / Preparação</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Reflexões e preparação para a confissão..."
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Este campo é privado e pessoal. Use-o para preparar-se antes da confissão.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="penance">Penitência Recebida</Label>
                <Textarea
                  id="penance"
                  value={formData.penance}
                  onChange={(e) => setFormData({ ...formData, penance: e.target.value })}
                  placeholder="Qual foi a penitência recebida?"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit}>
                {editingConfession ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : confessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma confissão registrada ainda</p>
            <p className="text-sm text-muted-foreground mt-2">
              Clique em "Nova Confissão" para começar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {confessions.map((confession) => (
            <Card key={confession.id} className={`relative ${!confession.is_completed ? 'border-yellow-300 bg-yellow-50' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(confession.confession_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </CardTitle>
                    <CardDescription>
                      {confession.is_completed ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Realizada
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Clock className="h-3 w-3" />
                          Planejada
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {confession.confessor_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{confession.confessor_name}</span>
                  </div>
                )}
                {confession.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{confession.location}</span>
                  </div>
                )}
                {confession.penance && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-semibold text-purple-900 mb-1">Penitência:</p>
                    <p className="text-sm text-purple-700 line-clamp-2">{confession.penance}</p>
                  </div>
                )}
                {confession.notes && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Notas:</p>
                    <p className="text-sm text-blue-700 line-clamp-2">{confession.notes}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(confession)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(confession.id)}
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

export default ConfessionsTab
