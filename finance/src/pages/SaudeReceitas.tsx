import { Link } from "react-router-dom"
import { ArrowLeft, Pill, Plus, Edit2, Trash2, Upload, Eye, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { useState, useEffect } from "react"

interface PrescriptionItem {
  id?: number
  medicine_name: string
  dosage?: string
  quantity?: string
  instructions?: string
}

interface PrescriptionPhoto {
  id: number
  prescription_id: number
  photo_url: string
  created_at: string
}

interface Prescription {
  id: number
  user_id: number
  prescription_date: string
  doctor_name?: string
  doctor_crm?: string
  doctor_specialty?: string
  notes?: string
  rating?: number
  items: PrescriptionItem[]
  photos: PrescriptionPhoto[]
  created_at: string
  updated_at: string
}

const MEDICAL_SPECIALTIES = [
  "Clínico Geral",
  "Cardiologia",
  "Dermatologia",
  "Pediatria",
  "Ginecologia",
  "Oftalmologia",
  "Ortopedia",
  "Psiquiatria",
  "Neurologia",
  "Endocrinologia",
  "Gastroenterologia",
  "Urologia",
  "Otorrinolaringologia",
  "Pneumologia",
  "Reumatologia",
  "Hematologia",
  "Oncologia",
  "Nefrologia",
  "Infectologia",
  "Geriatria",
  "Anestesiologia",
  "Cirurgia Geral",
]

const SaudeReceitas = () => {
  const { toast } = useToast()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewPhotosOpen, setIsViewPhotosOpen] = useState(false)
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)
  const [viewingPhotos, setViewingPhotos] = useState<PrescriptionPhoto[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  // Filters
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all")
  const [filterDoctorName, setFilterDoctorName] = useState<string>("")
  const [filterKeyword, setFilterKeyword] = useState<string>("")

  // Form data
  const [formData, setFormData] = useState({
    prescription_date: "",
    doctor_name: "",
    doctor_crm: "",
    doctor_specialty: "",
    notes: "",
    rating: "",
  })

  const [items, setItems] = useState<PrescriptionItem[]>([
    { medicine_name: "", dosage: "", quantity: "", instructions: "" }
  ])

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    loadPrescriptions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [prescriptions, filterSpecialty, filterDoctorName, filterKeyword])

  useEffect(() => {
    if (isDialogOpen && editingPrescription) {
      setFormData({
        prescription_date: editingPrescription.prescription_date || "",
        doctor_name: editingPrescription.doctor_name || "",
        doctor_crm: editingPrescription.doctor_crm || "",
        doctor_specialty: editingPrescription.doctor_specialty || "",
        notes: editingPrescription.notes || "",
        rating: editingPrescription.rating?.toString() || "",
      })
      setItems(editingPrescription.items.length > 0 ? editingPrescription.items : [
        { medicine_name: "", dosage: "", quantity: "", instructions: "" }
      ])
      setUploadedPhotos(editingPrescription.photos.map(p => p.photo_url))
    } else if (!isDialogOpen) {
      resetForm()
    }
  }, [isDialogOpen, editingPrescription])

  const applyFilters = () => {
    let filtered = [...prescriptions]

    if (filterSpecialty !== "all") {
      filtered = filtered.filter(p => p.doctor_specialty === filterSpecialty)
    }

    if (filterDoctorName.trim() !== "") {
      const searchTerm = filterDoctorName.toLowerCase()
      filtered = filtered.filter(p =>
        p.doctor_name?.toLowerCase().includes(searchTerm)
      )
    }

    if (filterKeyword.trim() !== "") {
      const keyword = filterKeyword.toLowerCase()
      filtered = filtered.filter(p => {
        if (p.notes?.toLowerCase().includes(keyword)) return true
        return p.items.some(item =>
          item.medicine_name?.toLowerCase().includes(keyword) ||
          item.dosage?.toLowerCase().includes(keyword) ||
          item.quantity?.toLowerCase().includes(keyword) ||
          item.instructions?.toLowerCase().includes(keyword)
        )
      })
    }

    setFilteredPrescriptions(filtered)
  }

  const loadPrescriptions = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Prescription[]>("/api/prescriptions")
      setPrescriptions(response.data)
    } catch (error) {
      console.error("Erro ao carregar receitas:", error)
      toast({
        title: "Erro ao carregar receitas",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
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
      const uploadFormData = new FormData()
      uploadFormData.append('photo', photoFile)
      const response = await fetch('http://localhost:3032/api/prescriptions/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: uploadFormData
      })
      if (!response.ok) throw new Error('Erro no upload')
      const data = await response.json()
      setUploadedPhotos([...uploadedPhotos, data.photo_url])
      toast({ title: "Foto enviada com sucesso!" })
      setPhotoFile(null)
      setPhotoPreview("")
      // Reset file input
      const fileInput = document.getElementById('photo') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      toast({ title: "Erro ao fazer upload", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveUploadedPhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index))
  }

  const handleAddItem = () => {
    setItems([...items, { medicine_name: "", dosage: "", quantity: "", instructions: "" }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: keyof PrescriptionItem, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = async () => {
    if (!formData.prescription_date) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha a data da receita",
        variant: "destructive"
      })
      return
    }

    const validItems = items.filter(item => item.medicine_name.trim() !== "")
    if (validItems.length === 0) {
      toast({
        title: "Adicione pelo menos um remédio",
        variant: "destructive"
      })
      return
    }

    try {
      const payload = {
        ...formData,
        rating: formData.rating && formData.rating !== "none" ? parseInt(formData.rating) : null,
        items: validItems,
        photo_urls: uploadedPhotos
      }

      if (editingPrescription) {
        await api.put(`/api/prescriptions/${editingPrescription.id}`, payload)
        toast({ title: "Receita atualizada com sucesso" })
      } else {
        await api.post("/api/prescriptions", payload)
        toast({ title: "Receita adicionada com sucesso" })
      }
      setIsDialogOpen(false)
      resetForm()
      loadPrescriptions()
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a receita",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja realmente excluir esta receita?")) return

    try {
      await api.delete(`/api/prescriptions/${id}`)
      toast({ title: "Receita excluída com sucesso" })
      loadPrescriptions()
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        variant: "destructive"
      })
    }
  }

  const handleDeletePhoto = async (prescriptionId: number, photoId: number) => {
    if (!confirm("Deseja realmente excluir esta foto?")) return

    try {
      await api.delete(`/api/prescriptions/${prescriptionId}/photos/${photoId}`)
      toast({ title: "Foto excluída com sucesso" })
      loadPrescriptions()

      // Update viewing photos if currently viewing
      if (isViewPhotosOpen) {
        setViewingPhotos(viewingPhotos.filter(p => p.id !== photoId))
        if (viewingPhotos.length <= 1) {
          setIsViewPhotosOpen(false)
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao excluir foto",
        variant: "destructive"
      })
    }
  }

  const openEditDialog = (prescription: Prescription) => {
    setEditingPrescription(prescription)
    setIsDialogOpen(true)
  }

  const openViewPhotos = (photos: PrescriptionPhoto[]) => {
    setViewingPhotos(photos)
    setCurrentPhotoIndex(0)
    setIsViewPhotosOpen(true)
  }

  const resetForm = () => {
    setFormData({
      prescription_date: "",
      doctor_name: "",
      doctor_crm: "",
      doctor_specialty: "",
      notes: "",
      rating: "",
    })
    setItems([{ medicine_name: "", dosage: "", quantity: "", instructions: "" }])
    setUploadedPhotos([])
    setEditingPrescription(null)
    setPhotoFile(null)
    setPhotoPreview("")
  }

  const clearFilters = () => {
    setFilterSpecialty("all")
    setFilterDoctorName("")
    setFilterKeyword("")
  }

  const uniqueSpecialties = Array.from(new Set(
    prescriptions
      .map(p => p.doctor_specialty)
      .filter((s): s is string => s !== undefined && s !== null && s.trim() !== "")
  )).sort()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/saude">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Pill className="h-10 w-10 text-green-600" />
                Receitas
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie suas receitas médicas
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Filtrar por Especialidade</Label>
                <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as especialidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as especialidades</SelectItem>
                    {uniqueSpecialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Filtrar por Nome do Médico</Label>
                <Input
                  placeholder="Digite o nome do médico..."
                  value={filterDoctorName}
                  onChange={(e) => setFilterDoctorName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Buscar Palavra-Chave</Label>
                <Input
                  placeholder="Buscar remédio, dosagem, etc..."
                  value={filterKeyword}
                  onChange={(e) => setFilterKeyword(e.target.value)}
                />
              </div>
              <div className="space-y-2 flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {prescriptions.length === 0
                  ? "Nenhuma receita cadastrada"
                  : "Nenhuma receita encontrada com os filtros aplicados"}
              </p>
              {prescriptions.length === 0 && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar primeira receita
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="border-2 border-green-200 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div>
                          <p className="text-xs text-muted-foreground">Data da Receita</p>
                          <p className="font-semibold text-lg">
                            {new Date(prescription.prescription_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        {prescription.doctor_name && (
                          <div>
                            <p className="text-xs text-muted-foreground">Médico</p>
                            <p className="font-medium">{prescription.doctor_name}</p>
                          </div>
                        )}
                        {prescription.doctor_specialty && (
                          <div>
                            <p className="text-xs text-muted-foreground">Especialidade</p>
                            <p className="font-medium">{prescription.doctor_specialty}</p>
                          </div>
                        )}
                        {prescription.doctor_crm && (
                          <div>
                            <p className="text-xs text-muted-foreground">CRM</p>
                            <p className="font-medium">{prescription.doctor_crm}</p>
                          </div>
                        )}
                        {prescription.rating !== null && prescription.rating !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Avaliação</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <p className="font-semibold text-lg">{prescription.rating}/10</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {prescription.photos.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewPhotos(prescription.photos)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {prescription.photos.length} {prescription.photos.length === 1 ? 'Foto' : 'Fotos'}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(prescription)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(prescription.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Medicamentos:</p>
                      <div className="space-y-2">
                        {prescription.items.map((item, idx) => (
                          <div key={idx} className="bg-green-50 p-3 rounded-lg border border-green-100">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                              <div>
                                <p className="text-xs text-muted-foreground">Nome</p>
                                <p className="font-medium">{item.medicine_name}</p>
                              </div>
                              {item.dosage && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Dosagem</p>
                                  <p className="font-medium">{item.dosage}</p>
                                </div>
                              )}
                              {item.quantity && (
                                <div>
                                  <p className="text-xs text-muted-foreground">Quantidade</p>
                                  <p className="font-medium">{item.quantity}</p>
                                </div>
                              )}
                              {item.instructions && (
                                <div className="md:col-span-4">
                                  <p className="text-xs text-muted-foreground">Instruções</p>
                                  <p className="text-sm">{item.instructions}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {prescription.notes && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-muted-foreground mb-1">Observações</p>
                        <p className="text-sm">{prescription.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog para adicionar/editar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPrescription ? "Editar Receita" : "Nova Receita"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da receita médica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Data e Informações do Médico */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Informações da Receita</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="prescription_date">Data da Receita *</Label>
                    <Input
                      id="prescription_date"
                      type="date"
                      value={formData.prescription_date}
                      onChange={(e) => setFormData({ ...formData, prescription_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Avaliação de Melhora (0-10)</Label>
                    <Select
                      value={formData.rating}
                      onValueChange={(value) => setFormData({ ...formData, rating: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma nota" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem avaliação</SelectItem>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}/10
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor_name">Nome do Médico</Label>
                    <Input
                      id="doctor_name"
                      value={formData.doctor_name}
                      onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                      placeholder="Ex: Dr. João Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctor_crm">CRM do Médico</Label>
                    <Input
                      id="doctor_crm"
                      value={formData.doctor_crm}
                      onChange={(e) => setFormData({ ...formData, doctor_crm: e.target.value })}
                      placeholder="Ex: 12345/SP"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="doctor_specialty">Especialidade</Label>
                    <Select
                      value={formData.doctor_specialty}
                      onValueChange={(value) => setFormData({ ...formData, doctor_specialty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDICAL_SPECIALTIES.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Medicamentos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">Medicamentos *</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Medicamento
                  </Button>
                </div>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Medicamento {index + 1}</p>
                        {items.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`medicine_name_${index}`}>Nome do Medicamento *</Label>
                          <Input
                            id={`medicine_name_${index}`}
                            value={item.medicine_name}
                            onChange={(e) => handleItemChange(index, 'medicine_name', e.target.value)}
                            placeholder="Ex: Dipirona"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`dosage_${index}`}>Dosagem</Label>
                          <Input
                            id={`dosage_${index}`}
                            value={item.dosage || ""}
                            onChange={(e) => handleItemChange(index, 'dosage', e.target.value)}
                            placeholder="Ex: 500mg"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`quantity_${index}`}>Quantidade</Label>
                          <Input
                            id={`quantity_${index}`}
                            value={item.quantity || ""}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            placeholder="Ex: 20 comprimidos"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`instructions_${index}`}>Instruções de Uso</Label>
                        <Textarea
                          id={`instructions_${index}`}
                          value={item.instructions || ""}
                          onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                          placeholder="Ex: Tomar 1 comprimido a cada 8 horas"
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fotos da Receita */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Fotos da Receita</h3>

                {/* Upload Section */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="flex-1"
                    />
                    {photoFile && (
                      <Button
                        type="button"
                        onClick={handleUploadPhoto}
                        disabled={isUploading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isUploading ? "Enviando..." : <><Upload className="h-4 w-4 mr-1" />Upload</>}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Você pode adicionar múltiplas fotos (JPG, PNG, GIF - máx 5MB cada)
                  </p>
                </div>

                {/* Preview do arquivo selecionado */}
                {photoPreview && (
                  <div className="space-y-2">
                    <Label>Preview (clique em Upload para adicionar)</Label>
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="rounded-lg max-w-xs border-2 border-green-200"
                    />
                  </div>
                )}

                {/* Fotos já enviadas */}
                {uploadedPhotos.length > 0 && (
                  <div className="space-y-2">
                    <Label>Fotos Anexadas ({uploadedPhotos.length})</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {uploadedPhotos.map((photoUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={`http://localhost:3032${photoUrl}`}
                            alt={`Foto ${index + 1}`}
                            className="rounded-lg w-full h-32 object-cover border-2 border-green-200"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveUploadedPhoto(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700">Observações</h3>
                <div className="space-y-2">
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observações gerais sobre a receita (opcional)"
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                {editingPrescription ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para visualizar fotos */}
        <Dialog open={isViewPhotosOpen} onOpenChange={setIsViewPhotosOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                Fotos da Receita ({currentPhotoIndex + 1}/{viewingPhotos.length})
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {viewingPhotos.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-center items-center relative">
                    <img
                      src={`http://localhost:3032${viewingPhotos[currentPhotoIndex].photo_url}`}
                      alt={`Receita foto ${currentPhotoIndex + 1}`}
                      className="rounded-lg max-w-full max-h-[60vh] object-contain mx-auto"
                      onError={(e) => {
                        console.error('Erro ao carregar imagem');
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">Erro ao carregar</text></svg>';
                      }}
                    />
                  </div>

                  {viewingPhotos.length > 1 && (
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                        disabled={currentPhotoIndex === 0}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPhotoIndex(Math.min(viewingPhotos.length - 1, currentPhotoIndex + 1))}
                        disabled={currentPhotoIndex === viewingPhotos.length - 1}
                      >
                        Próxima
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const photo = viewingPhotos[currentPhotoIndex]
                        handleDeletePhoto(photo.prescription_id, photo.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir esta foto
                    </Button>
                  </div>

                  {/* Thumbnails */}
                  {viewingPhotos.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {viewingPhotos.map((photo, idx) => (
                        <button
                          key={photo.id}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          className={`relative rounded border-2 overflow-hidden ${
                            idx === currentPhotoIndex ? 'border-green-500' : 'border-gray-300'
                          }`}
                        >
                          <img
                            src={`http://localhost:3032${photo.photo_url}`}
                            alt={`Thumb ${idx + 1}`}
                            className="w-full h-16 object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default SaudeReceitas
