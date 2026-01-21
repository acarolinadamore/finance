import { Link } from "react-router-dom"
import { ArrowLeft, Sparkles, Plus, GripVertical, Edit2, Calendar, Image as ImageIcon, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Pencil, Trash2, Sunrise, Moon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { useState, useEffect } from "react"
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

interface SkincareProduct {
  id: number
  day_of_week: string
  period: 'morning' | 'night'
  product_name: string
  application_order: number
  notes?: string
  created_at: string
  updated_at: string
}

interface ProductCompletion {
  id: number
  product_id: number
  completion_date: string
  completed: boolean
}

interface SkincareTreatment {
  id: number
  user_id: number
  treatment_description?: string
  goal?: string
  start_date?: string
  end_date?: string
  photo_url?: string
  photo_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface SortableProductProps {
  product: SkincareProduct
  isCompleted: boolean
  onToggle: () => void
  onEdit: (product: SkincareProduct) => void
  onDelete: (id: number) => void
}

const SortableProduct = ({ product, isCompleted, onToggle, onEdit, onDelete }: SortableProductProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 pt-1"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onToggle}
          className="mt-0.5 h-5 w-5 rounded-full data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
        />

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
            {product.product_name}
          </p>
          {product.notes && (
            <p className="text-xs text-muted-foreground mt-1">
              {product.notes}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(product.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

const Skincare = () => {
  const { toast } = useToast()
  const [products, setProducts] = useState<SkincareProduct[]>([])
  const [completions, setCompletions] = useState<ProductCompletion[]>([])
  const [treatment, setTreatment] = useState<SkincareTreatment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isTreatmentDialogOpen, setIsTreatmentDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<SkincareProduct | null>(null)
  const [formData, setFormData] = useState({
    product_name: "",
    notes: "",
  })
  const [treatmentFormData, setTreatmentFormData] = useState({
    treatment_description: "",
    goal: "",
    start_date: "",
    end_date: "",
    photo_url: "",
    photo_date: "",
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [currentDay, setCurrentDay] = useState("")
  const [currentPeriod, setCurrentPeriod] = useState<'morning' | 'night'>('morning')

  // Detectar dia da semana atual
  const getCurrentDay = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[new Date().getDay()]
  }

  const [activeDay, setActiveDay] = useState(getCurrentDay())

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadProducts()
    loadCompletions()
    loadTreatment()
  }, [activeDay])

  useEffect(() => {
    if (isTreatmentDialogOpen && treatment) {
      setTreatmentFormData({
        treatment_description: treatment.treatment_description || "",
        goal: treatment.goal || "",
        start_date: treatment.start_date || "",
        end_date: treatment.end_date || "",
        photo_url: treatment.photo_url || "",
        photo_date: treatment.photo_date || "",
      })
      if (treatment.photo_url) {
        setPhotoPreview(treatment.photo_url)
      }
    } else if (!isTreatmentDialogOpen) {
      setTreatmentFormData({
        treatment_description: "",
        goal: "",
        start_date: "",
        end_date: "",
        photo_url: "",
        photo_date: "",
      })
      setPhotoPreview("")
      setPhotoFile(null)
    }
  }, [isTreatmentDialogOpen, treatment])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<SkincareProduct[]>("/api/skincare")
      setProducts(response.data)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCompletions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await api.get<ProductCompletion[]>(`/api/skincare/completions?date=${today}`)
      setCompletions(response.data)
    } catch (error) {
      console.error("Erro ao carregar completions:", error)
    }
  }

  const loadTreatment = async () => {
    try {
      const response = await api.get<SkincareTreatment>("/api/skincare/treatment")
      setTreatment(response.data)
      if (response.data) {
        setTreatmentFormData({
          treatment_description: response.data.treatment_description || "",
          start_date: response.data.start_date || "",
          end_date: response.data.end_date || "",
          photo_url: response.data.photo_url || "",
          photo_date: response.data.photo_date || "",
        })
        setPhotoPreview(response.data.photo_url || "")
      }
    } catch (error) {
      console.error("Erro ao carregar tratamento:", error)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadPhoto = async () => {
    if (!photoFile) return

    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('photo', photoFile)

      const response = await fetch('http://localhost:3032/api/skincare/treatment/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Erro no upload')
      }

      const data = await response.json()
      setTreatmentFormData({ ...treatmentFormData, photo_url: data.photo_url })
      toast({ title: "Foto enviada com sucesso!" })
      setPhotoFile(null)
    } catch (error) {
      toast({
        title: "Erro ao fazer upload",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveTreatment = async () => {
    try {
      // Se há uma foto para fazer upload, fazer upload primeiro
      if (photoFile) {
        await handleUploadPhoto()
      }

      await api.post("/api/skincare/treatment", treatmentFormData)
      toast({ title: "Tratamento salvo com sucesso" })
      setIsTreatmentDialogOpen(false)
      setPhotoFile(null)
      setPhotoPreview("")
      loadTreatment()
    } catch (error) {
      toast({
        title: "Erro ao salvar tratamento",
        variant: "destructive"
      })
    }
  }

  const calculateDaysInTreatment = () => {
    if (!treatment?.start_date) return null
    const start = new Date(treatment.start_date)
    const end = treatment.end_date ? new Date(treatment.end_date) : new Date()
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const isProductCompleted = (productId: number) => {
    const today = new Date().toISOString().split('T')[0]
    const completion = completions.find(c => {
      const completionDate = c.completion_date?.split('T')[0]
      return c.product_id === productId && completionDate === today
    })
    return completion?.completed || false
  }

  const handleToggleCompletion = async (productId: number) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const isCompleted = isProductCompleted(productId)

      await api.post(`/api/skincare/${productId}/toggle`, {
        date: today,
        completed: !isCompleted
      })

      loadCompletions()
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async () => {
    if (!formData.product_name) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha o nome do produto",
        variant: "destructive"
      })
      return
    }

    try {
      // Calcular o próximo application_order para o final da lista
      const periodProducts = products.filter(p => p.day_of_week === currentDay && p.period === currentPeriod)
      const maxOrder = periodProducts.length > 0
        ? Math.max(...periodProducts.map(p => p.application_order))
        : -1

      const data = {
        day_of_week: currentDay,
        period: currentPeriod,
        product_name: formData.product_name,
        notes: formData.notes,
        application_order: editingProduct ? editingProduct.application_order : maxOrder + 1
      }

      if (editingProduct) {
        await api.put(`/api/skincare/${editingProduct.id}`, data)
        toast({ title: "Produto atualizado com sucesso" })
      } else {
        await api.post("/api/skincare", data)
        toast({ title: "Produto adicionado com sucesso" })
      }
      setIsDialogOpen(false)
      resetForm()
      loadProducts()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o produto",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return

    try {
      await api.delete(`/api/skincare/${id}`)
      toast({ title: "Produto deletado com sucesso" })
      loadProducts()
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        variant: "destructive"
      })
    }
  }

  const handleDragEnd = async (event: DragEndEvent, period: 'morning' | 'night') => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    // Filtrar e ordenar produtos do período atual
    const periodProducts = products
      .filter(p => p.day_of_week === activeDay && p.period === period)
      .sort((a, b) => a.application_order - b.application_order)

    // Converter IDs para number para garantir comparação correta
    const activeId = Number(active.id)
    const overId = Number(over.id)

    const oldIndex = periodProducts.findIndex((p) => p.id === activeId)
    const newIndex = periodProducts.findIndex((p) => p.id === overId)

    if (oldIndex === -1 || newIndex === -1) return

    // Mover item e atualizar application_order
    const reorderedProducts = arrayMove(periodProducts, oldIndex, newIndex).map((product, index) => ({
      ...product,
      application_order: index
    }))

    // Criar mapa de produtos reordenados para busca rápida
    const reorderedMap = new Map(reorderedProducts.map(p => [p.id, p]))

    // Atualizar array de produtos completo mantendo produtos de outros dias/períodos intactos
    const allProducts = products.map(p => {
      if (p.day_of_week === activeDay && p.period === period) {
        return reorderedMap.get(p.id) || p
      }
      return p
    })

    setProducts(allProducts)

    // Enviar para o backend
    try {
      const orders = reorderedProducts.map((product) => ({
        id: product.id,
        application_order: product.application_order
      }))
      await api.put("/api/skincare/reorder", { orders })
      await loadProducts() // Recarregar para garantir consistência
    } catch (error) {
      toast({
        title: "Erro ao reordenar",
        variant: "destructive"
      })
      loadProducts()
    }
  }

  const resetForm = () => {
    setFormData({ product_name: "", notes: "" })
    setEditingProduct(null)
  }

  const openEditDialog = (product: SkincareProduct) => {
    setEditingProduct(product)
    setFormData({ product_name: product.product_name, notes: product.notes || "" })
    setCurrentDay(product.day_of_week)
    setCurrentPeriod(product.period)
    setIsDialogOpen(true)
  }

  const openAddDialog = (day: string, period: 'morning' | 'night') => {
    resetForm()
    setCurrentDay(day)
    setCurrentPeriod(period)
    setIsDialogOpen(true)
  }

  const getProductsByDayAndPeriod = (day: string, period: 'morning' | 'night') => {
    return products
      .filter(p => p.day_of_week === day && p.period === period)
      .sort((a, b) => a.application_order - b.application_order)
  }

  const dayNames = {
    'monday': 'Segunda',
    'tuesday': 'Terça',
    'wednesday': 'Quarta',
    'thursday': 'Quinta',
    'friday': 'Sexta',
    'saturday': 'Sábado',
    'sunday': 'Domingo'
  }

  const periodConfig = {
    morning: {
      label: 'Manhã',
      emoji: '☀️',
      color: '#f59e0b',
      icon: Sunrise
    },
    night: {
      label: 'Noite',
      emoji: '🌙',
      color: '#8b5cf6',
      icon: Moon
    }
  }

  const renderPeriodColumn = (period: 'morning' | 'night') => {
    const periodProducts = getProductsByDayAndPeriod(activeDay, period)
    const { label, emoji, color } = periodConfig[period]

    return (
      <Card
        className="flex-1"
        style={{ backgroundColor: `${color}10`, borderColor: color }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              <span>{label}</span>
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAddDialog(activeDay, period)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {periodProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>Nenhum produto cadastrado</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => openAddDialog(activeDay, period)}
                className="mt-2"
              >
                Adicionar primeiro produto
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event, period)}
            >
              <SortableContext
                items={periodProducts.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {periodProducts.map((product) => (
                    <SortableProduct
                      key={product.id}
                      product={product}
                      isCompleted={isProductCompleted(product.id)}
                      onToggle={() => handleToggleCompletion(product.id)}
                      onEdit={openEditDialog}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">Carregando...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Skincare</h1>
              <p className="text-muted-foreground mt-1">
                Sua rotina de cuidados com a pele
              </p>
            </div>
          </div>
        </div>

        {/* Card de Tratamento Atual */}
        <Card className="mb-6 border-2 border-pink-300 bg-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-pink-600" />
                <span>Tratamento Atual</span>
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsTreatmentDialogOpen(true)}
                className="text-pink-600 border-pink-300 hover:bg-pink-50"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                {treatment ? 'Editar' : 'Adicionar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {treatment ? (
              <div className="space-y-4">
                {treatment.treatment_description && (
                  <div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{treatment.treatment_description}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {treatment.goal && (
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-pink-600" />
                      <div>
                        <p className="font-medium text-gray-700">Objetivo</p>
                        <p className="text-gray-600">{treatment.goal}</p>
                      </div>
                    </div>
                  )}
                  {treatment.start_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-pink-600" />
                      <div>
                        <p className="font-medium text-gray-700">Data Início</p>
                        <p className="text-gray-600">{new Date(treatment.start_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  )}
                  {treatment.end_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-pink-600" />
                      <div>
                        <p className="font-medium text-gray-700">Data Fim</p>
                        <p className="text-gray-600">{new Date(treatment.end_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  )}
                  {treatment.start_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-pink-600" />
                      <div>
                        <p className="font-medium text-gray-700">Tempo em Tratamento</p>
                        <p className="text-gray-600">{calculateDaysInTreatment()} dias</p>
                      </div>
                    </div>
                  )}
                </div>
                {treatment.photo_url && (
                  <div className="flex items-start gap-2 text-sm">
                    <ImageIcon className="h-4 w-4 text-pink-600 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-700 mb-1">Foto</p>
                      <img
                        src={treatment.photo_url}
                        alt="Foto do tratamento"
                        className="rounded-lg max-w-xs border-2 border-pink-200"
                      />
                      {treatment.photo_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Tirada em: {new Date(treatment.photo_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">Nenhum tratamento registrado</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setIsTreatmentDialogOpen(true)}
                  className="text-pink-600 mt-2"
                >
                  Adicionar tratamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs por dia da semana */}
        <Tabs value={activeDay} onValueChange={setActiveDay}>
          <TabsList className="grid w-full grid-cols-7 mb-6">
            {Object.entries(dayNames).map(([key, label]) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(dayNames).map((day) => (
            <TabsContent key={day} value={day}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {renderPeriodColumn('morning')}
                {renderPeriodColumn('night')}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Dialog para adicionar/editar */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
              <DialogDescription>
                {currentPeriod === 'morning' ? 'Manhã' : 'Noite'} - {dayNames[currentDay as keyof typeof dayNames]}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="product_name">Nome do Produto</Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="Ex: Limpeza Facial, Sérum, Hidratante..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Aplicar com a pele úmida..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700">
                {editingProduct ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para Tratamento */}
        <Dialog open={isTreatmentDialogOpen} onOpenChange={setIsTreatmentDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {treatment ? "Editar Tratamento" : "Novo Tratamento"}
              </DialogTitle>
              <DialogDescription>
                Registre informações sobre seu tratamento de skincare atual
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="treatment_description">Descrição do Tratamento</Label>
                <Textarea
                  id="treatment_description"
                  value={treatmentFormData.treatment_description}
                  onChange={(e) => setTreatmentFormData({ ...treatmentFormData, treatment_description: e.target.value })}
                  placeholder="Descreva seu tratamento atual..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Objetivo (opcional)</Label>
                <Input
                  id="goal"
                  type="text"
                  value={treatmentFormData.goal}
                  onChange={(e) => setTreatmentFormData({ ...treatmentFormData, goal: e.target.value })}
                  placeholder="Ex: Reduzir acne, hidratar a pele..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Data de Início (opcional)</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={treatmentFormData.start_date}
                    onChange={(e) => setTreatmentFormData({ ...treatmentFormData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">Data de Fim (opcional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={treatmentFormData.end_date}
                    onChange={(e) => setTreatmentFormData({ ...treatmentFormData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">Foto do Tratamento (opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="flex-1"
                  />
                  {photoFile && !treatmentFormData.photo_url && (
                    <Button
                      type="button"
                      onClick={handleUploadPhoto}
                      disabled={isUploading}
                      className="bg-pink-600 hover:bg-pink-700"
                    >
                      {isUploading ? (
                        <span className="flex items-center gap-2">
                          Enviando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Upload
                        </span>
                      )}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Clique para selecionar uma foto do seu computador (JPG, PNG, GIF - máx 5MB)
                </p>
              </div>

              {photoPreview && (
                <div className="space-y-2">
                  <Label>Preview da Foto</Label>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="rounded-lg max-w-full border-2 border-pink-200"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="photo_date">Data da Foto (opcional)</Label>
                <Input
                  id="photo_date"
                  type="date"
                  value={treatmentFormData.photo_date}
                  onChange={(e) => setTreatmentFormData({ ...treatmentFormData, photo_date: e.target.value })}
                />
              </div>

              {treatmentFormData.start_date && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                  <p className="text-sm text-pink-900">
                    <strong>Tempo em tratamento:</strong>{' '}
                    {(() => {
                      const start = new Date(treatmentFormData.start_date)
                      const end = treatmentFormData.end_date ? new Date(treatmentFormData.end_date) : new Date()
                      const diffTime = Math.abs(end.getTime() - start.getTime())
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                      return `${diffDays} dias`
                    })()}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTreatmentDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveTreatment} className="bg-pink-600 hover:bg-pink-700">
                Salvar Tratamento
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Skincare
