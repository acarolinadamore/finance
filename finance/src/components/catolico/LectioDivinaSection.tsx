import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, BookMarked, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"

interface LectioDivina {
  id: number
  data: string
  livro: string | null
  capitulo: number | null
  versiculo: string | null
  lectio: string | null
  meditatio: string | null
  oratio: string | null
  contemplatio: string | null
  created_at: string
}

const ORACAO_INICIAL = `Vinde Espírito Santo
Vinde Espírito Santo, enchei os corações dos vossos fiéis e acendei neles o fogo do Vosso Amor. Enviai o Vosso Espírito e tudo será criado e renovareis a face da terra.
Oremos: Ó Deus que instruíste os corações dos vossos fiéis, com a luz do Espírito Santo, fazei que apreciemos retamente todas as coisas segundo o mesmo Espírito e gozemos da sua consolação. Por Cristo Senhor Nosso. Amém`

const LectioDivinaSection = () => {
  const { toast } = useToast()
  const [lectios, setLectios] = useState<LectioDivina[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLectio, setEditingLectio] = useState<LectioDivina | null>(null)
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    livro: "",
    capitulo: "",
    versiculo: "",
    lectio: "",
    meditatio: "",
    oratio: "",
    contemplatio: ""
  })

  useEffect(() => {
    loadLectios()
  }, [])

  const loadLectios = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<LectioDivina[]>("/api/catolico/lectio-divina")
      setLectios(response.data)
    } catch (error) {
      console.error("Erro ao carregar lectio divina:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.data) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha a data",
        variant: "destructive"
      })
      return
    }

    try {
      const payload = {
        data: formData.data,
        livro: formData.livro || null,
        capitulo: formData.capitulo ? parseInt(formData.capitulo) : null,
        versiculo: formData.versiculo || null,
        lectio: formData.lectio || null,
        meditatio: formData.meditatio || null,
        oratio: formData.oratio || null,
        contemplatio: formData.contemplatio || null
      }

      if (editingLectio) {
        await api.put(`/api/catolico/lectio-divina/${editingLectio.id}`, payload)
        toast({ title: "Lectio Divina atualizada com sucesso" })
      } else {
        await api.post("/api/catolico/lectio-divina", payload)
        toast({ title: "Lectio Divina criada com sucesso" })
      }
      setIsDialogOpen(false)
      resetForm()
      loadLectios()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta Lectio Divina?")) return

    try {
      await api.delete(`/api/catolico/lectio-divina/${id}`)
      toast({ title: "Lectio Divina deletada com sucesso" })
      loadLectios()
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      data: new Date().toISOString().split('T')[0],
      livro: "",
      capitulo: "",
      versiculo: "",
      lectio: "",
      meditatio: "",
      oratio: "",
      contemplatio: ""
    })
    setEditingLectio(null)
  }

  const openEditDialog = (lectio: LectioDivina) => {
    setEditingLectio(lectio)
    setFormData({
      data: lectio.data,
      livro: lectio.livro || "",
      capitulo: lectio.capitulo?.toString() || "",
      versiculo: lectio.versiculo || "",
      lectio: lectio.lectio || "",
      meditatio: lectio.meditatio || "",
      oratio: lectio.oratio || "",
      contemplatio: lectio.contemplatio || ""
    })
    setIsDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Lectio Divina</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Lectio Divina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLectio ? "Editar Lectio Divina" : "Nova Lectio Divina"}</DialogTitle>
              <DialogDescription>
                Meditação orante da Palavra de Deus
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Oração Inicial */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-800 mb-2">Oração Inicial:</p>
                <p className="text-sm text-purple-900 whitespace-pre-wrap" style={{ fontFamily: 'Lora, serif' }}>
                  {ORACAO_INICIAL}
                </p>
              </div>

              {/* Data e Referência Bíblica */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="livro">Livro</Label>
                  <Input
                    id="livro"
                    value={formData.livro}
                    onChange={(e) => setFormData({ ...formData, livro: e.target.value })}
                    placeholder="Ex: João"
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
                <div className="space-y-2">
                  <Label htmlFor="versiculo">Versículo(s)</Label>
                  <Input
                    id="versiculo"
                    value={formData.versiculo}
                    onChange={(e) => setFormData({ ...formData, versiculo: e.target.value })}
                    placeholder="Ex: 16"
                  />
                </div>
              </div>

              {/* 4 Etapas */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lectio" className="text-base font-semibold text-purple-800">
                    1 - LECTIO — O que o texto diz?
                  </Label>
                  <Textarea
                    id="lectio"
                    value={formData.lectio}
                    onChange={(e) => setFormData({ ...formData, lectio: e.target.value })}
                    rows={4}
                    className="resize-none text-base"
                    style={{ fontFamily: 'Lora, serif' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meditatio" className="text-base font-semibold text-purple-800">
                    2 - MEDITATIO — Que verdade da fé a Igreja ensina aqui?
                  </Label>
                  <Textarea
                    id="meditatio"
                    value={formData.meditatio}
                    onChange={(e) => setFormData({ ...formData, meditatio: e.target.value })}
                    rows={4}
                    className="resize-none text-base"
                    style={{ fontFamily: 'Lora, serif' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="oratio" className="text-base font-semibold text-purple-800">
                    3 - ORATIO — O que devo pedir a Deus? Senhor, dai-me a graça de...
                  </Label>
                  <Textarea
                    id="oratio"
                    value={formData.oratio}
                    onChange={(e) => setFormData({ ...formData, oratio: e.target.value })}
                    rows={4}
                    className="resize-none text-base"
                    style={{ fontFamily: 'Lora, serif' }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contemplatio" className="text-base font-semibold text-purple-800">
                    4 - CONTEMPLATIO — Silêncio
                  </Label>
                  <Textarea
                    id="contemplatio"
                    value={formData.contemplatio}
                    onChange={(e) => setFormData({ ...formData, contemplatio: e.target.value })}
                    rows={3}
                    className="resize-none text-base"
                    style={{ fontFamily: 'Lora, serif' }}
                    placeholder="Alguns segundos apenas, contemplando a verdade. Se nada vier → não faltou nada"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
                {editingLectio ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {lectios.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookMarked className="h-16 w-16 mx-auto text-purple-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Nenhuma meditação registrada
            </h2>
            <p className="text-muted-foreground">
              Clique em "Nova Lectio Divina" para começar sua jornada de meditação orante
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lectios.map((lectio) => (
            <Card key={lectio.id} className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-purple-900">
                      <Calendar className="h-5 w-5" />
                      {formatDate(lectio.data)}
                    </CardTitle>
                    {(lectio.livro || lectio.capitulo || lectio.versiculo) && (
                      <p className="text-sm text-purple-700 mt-1">
                        {lectio.livro && lectio.livro}
                        {lectio.capitulo && ` ${lectio.capitulo}`}
                        {lectio.versiculo && `:${lectio.versiculo}`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(lectio)}
                      className="text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(lectio.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Oração Inicial */}
                <div className="bg-white/50 rounded-lg p-3 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 mb-1">Oração Inicial:</p>
                  <p className="text-xs text-purple-800 whitespace-pre-wrap" style={{ fontFamily: 'Lora, serif' }}>
                    {ORACAO_INICIAL}
                  </p>
                </div>

                {/* 4 Etapas */}
                {lectio.lectio && (
                  <div>
                    <p className="text-sm font-semibold text-purple-800 mb-1">1 - LECTIO — O que o texto diz?</p>
                    <p className="text-purple-900 whitespace-pre-wrap" style={{ fontFamily: 'Lora, serif' }}>
                      {lectio.lectio}
                    </p>
                  </div>
                )}

                {lectio.meditatio && (
                  <div>
                    <p className="text-sm font-semibold text-purple-800 mb-1">2 - MEDITATIO — Que verdade da fé a Igreja ensina aqui?</p>
                    <p className="text-purple-900 whitespace-pre-wrap" style={{ fontFamily: 'Lora, serif' }}>
                      {lectio.meditatio}
                    </p>
                  </div>
                )}

                {lectio.oratio && (
                  <div>
                    <p className="text-sm font-semibold text-purple-800 mb-1">3 - ORATIO — O que devo pedir a Deus?</p>
                    <p className="text-purple-900 whitespace-pre-wrap" style={{ fontFamily: 'Lora, serif' }}>
                      {lectio.oratio}
                    </p>
                  </div>
                )}

                {lectio.contemplatio && (
                  <div>
                    <p className="text-sm font-semibold text-purple-800 mb-1">4 - CONTEMPLATIO — Silêncio</p>
                    <p className="text-purple-900 whitespace-pre-wrap" style={{ fontFamily: 'Lora, serif' }}>
                      {lectio.contemplatio}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default LectioDivinaSection
