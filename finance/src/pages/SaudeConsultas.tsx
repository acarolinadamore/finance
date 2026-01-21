import { Link } from "react-router-dom"
import { ArrowLeft, Calendar, Plus, Edit2, Trash2, Clock, User, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/services/api"
import { useState, useEffect } from "react"
import type { User } from "@/types/user"

interface Appointment {
  id: number
  user_id: number
  patient_type: 'paciente' | 'dependente'
  dependent_id?: number
  appointment_date: string
  appointment_time: string
  doctor_name: string
  specialty: string
  appointment_type: 'medico' | 'dentista'
  notes?: string
  created_at: string
  updated_at: string
}

interface Dependent {
  id: number
  user_id: number
  name: string
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
]

const DENTAL_SPECIALTIES = [
  "Odontologia Geral",
  "Odontopediatria",
  "Ortodontia",
  "Endodontia",
  "Periodontia",
  "Implantodontia",
  "Prótese Dentária",
  "Cirurgia Oral",
]

const SaudeConsultas = () => {
  const { toast } = useToast()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [dependents, setDependents] = useState<Dependent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [currentTab, setCurrentTab] = useState<'paciente' | number>('paciente')
  const [isAddDependentOpen, setIsAddDependentOpen] = useState(false)
  const [newDependentName, setNewDependentName] = useState('')
  const [isDeleteDependentOpen, setIsDeleteDependentOpen] = useState(false)
  const [dependentToDelete, setDependentToDelete] = useState<Dependent | null>(null)

  // Obter primeiro nome do usuário
  const getUserFirstName = () => {
    const userDataString = localStorage.getItem('user')
    if (userDataString) {
      try {
        const userData: User = JSON.parse(userDataString)
        const firstName = userData.name.split(' ')[0]
        return firstName
      } catch (error) {
        console.error('Erro ao obter nome do usuário:', error)
        return 'Paciente'
      }
    }
    return 'Paciente'
  }

  // Form state
  const [formData, setFormData] = useState({
    patient_type: 'paciente' as 'paciente' | 'dependente',
    dependent_id: undefined as number | undefined,
    appointment_date: '',
    appointment_time: '',
    doctor_name: '',
    specialty: '',
    appointment_type: 'medico' as 'medico' | 'dentista',
    notes: '',
  })

  useEffect(() => {
    loadAppointments()
    loadDependents()
  }, [])

  const loadAppointments = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Appointment[]>('/api/appointments')
      setAppointments(response.data)
    } catch (error) {
      console.error('Erro ao carregar consultas:', error)
      toast({
        title: "Erro ao carregar consultas",
        description: "Não foi possível carregar as consultas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadDependents = async () => {
    try {
      const response = await api.get<Dependent[]>('/api/dependents')
      setDependents(response.data)
    } catch (error) {
      console.error('Erro ao carregar dependentes:', error)
      toast({
        title: "Erro ao carregar dependentes",
        description: "Não foi possível carregar os dependentes",
        variant: "destructive",
      })
    }
  }

  const handleAddDependent = async () => {
    if (!newDependentName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite o nome do dependente",
        variant: "destructive",
      })
      return
    }

    try {
      await api.post('/api/dependents', { name: newDependentName.trim() })
      toast({ title: "Dependente adicionado com sucesso!" })
      setNewDependentName('')
      setIsAddDependentOpen(false)
      loadDependents()
    } catch (error) {
      console.error('Erro ao adicionar dependente:', error)
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar o dependente",
        variant: "destructive",
      })
    }
  }

  const handleOpenDeleteDependent = (dependent: Dependent) => {
    setDependentToDelete(dependent)
    setIsDeleteDependentOpen(true)
  }

  const handleConfirmDeleteDependent = async () => {
    if (!dependentToDelete) return

    try {
      await api.delete(`/api/dependents/${dependentToDelete.id}`)
      toast({ title: "Dependente excluído com sucesso!" })
      loadDependents()
      // Se estava na tab do dependente excluído, voltar para paciente
      if (currentTab === dependentToDelete.id) {
        setCurrentTab('paciente')
      }
      setIsDeleteDependentOpen(false)
      setDependentToDelete(null)
    } catch (error: any) {
      console.error('Erro ao excluir dependente:', error)
      toast({
        title: "Erro ao excluir",
        description: error.response?.data?.error || "Não foi possível excluir o dependente",
        variant: "destructive",
      })
    }
  }

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment)
      setFormData({
        patient_type: appointment.patient_type,
        dependent_id: appointment.dependent_id,
        appointment_date: formatDateForInput(appointment.appointment_date),
        appointment_time: appointment.appointment_time,
        doctor_name: appointment.doctor_name,
        specialty: appointment.specialty,
        appointment_type: appointment.appointment_type,
        notes: appointment.notes || '',
      })
    } else {
      setEditingAppointment(null)
      setFormData({
        patient_type: currentTab === 'paciente' ? 'paciente' : 'dependente',
        dependent_id: currentTab === 'paciente' ? undefined : currentTab,
        appointment_date: '',
        appointment_time: '',
        doctor_name: '',
        specialty: '',
        appointment_type: 'medico',
        notes: '',
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingAppointment(null)
    setFormData({
      patient_type: 'paciente',
      dependent_id: undefined,
      appointment_date: '',
      appointment_time: '',
      doctor_name: '',
      specialty: '',
      appointment_type: 'medico',
      notes: '',
    })
  }

  const handleSave = async () => {
    if (!formData.appointment_date || !formData.appointment_time || !formData.doctor_name || !formData.specialty) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha data, hora, médico e especialidade",
        variant: "destructive",
      })
      return
    }

    if (formData.patient_type === 'dependente' && !formData.dependent_id) {
      toast({
        title: "Dependente não selecionado",
        description: "Selecione um dependente",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingAppointment) {
        await api.put(`/api/appointments/${editingAppointment.id}`, formData)
        toast({ title: "Consulta atualizada com sucesso!" })
      } else {
        await api.post('/api/appointments', formData)
        toast({ title: "Consulta criada com sucesso!" })
      }
      handleCloseDialog()
      loadAppointments()
    } catch (error) {
      console.error('Erro ao salvar consulta:', error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a consulta",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta consulta?')) return

    try {
      await api.delete(`/api/appointments/${id}`)
      toast({ title: "Consulta excluída com sucesso!" })
      loadAppointments()
    } catch (error) {
      console.error('Erro ao excluir consulta:', error)
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a consulta",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    // PostgreSQL retorna YYYY-MM-DD, converter para DD/MM/YYYY
    const [year, month, day] = dateString.split('T')[0].split('-')
    return `${day}/${month}/${year}`
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
    return timeString.substring(0, 5) // HH:MM
  }

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    // Garantir formato YYYY-MM-DD para input type="date"
    return dateString.split('T')[0]
  }

  // Filtrar por paciente ou dependente
  const getAppointmentsByTab = (tab: 'paciente' | number) => {
    if (tab === 'paciente') {
      return appointments.filter(apt => apt.patient_type === 'paciente')
    } else {
      return appointments.filter(apt => apt.patient_type === 'dependente' && apt.dependent_id === tab)
    }
  }

  const getDependentName = (dependentId: number) => {
    const dependent = dependents.find(d => d.id === dependentId)
    return dependent?.name || 'Dependente'
  }

  const renderAppointmentsGrid = (appointmentsList: Appointment[]) => {
    if (appointmentsList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Nenhuma consulta cadastrada
        </div>
      )
    }

    // Ordenar por data/hora mais recente primeiro
    const sortedAppointments = [...appointmentsList].sort((a, b) => {
      const dateA = new Date(`${a.appointment_date}T${a.appointment_time}`)
      const dateB = new Date(`${b.appointment_date}T${b.appointment_time}`)
      return dateB.getTime() - dateA.getTime()
    })

    return sortedAppointments.map((appointment) => (
      <Card key={appointment.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                appointment.appointment_type === 'medico'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-teal-100 text-teal-600'
              }`}>
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  {appointment.doctor_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDialog(appointment)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(appointment.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(appointment.appointment_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(appointment.appointment_time)}</span>
            </div>
            {appointment.notes && (
              <div className="mt-3 p-2 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {appointment.notes}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    ))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    )
  }

  const specialtyOptions = formData.appointment_type === 'medico'
    ? MEDICAL_SPECIALTIES
    : DENTAL_SPECIALTIES

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
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
                <Calendar className="h-10 w-10 text-blue-600" />
                Consultas
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie suas consultas médicas e odontológicas
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        </div>

        {/* Content */}
        <Tabs value={String(currentTab)} onValueChange={(value) => setCurrentTab(value === 'paciente' ? 'paciente' : parseInt(value))}>
          <div className="flex items-center gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="paciente">{getUserFirstName()}</TabsTrigger>
              {dependents.map(dependent => (
                <TabsTrigger key={dependent.id} value={String(dependent.id)}>
                  {dependent.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="ml-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddDependentOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Dependente
              </Button>
              {currentTab !== 'paciente' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const dependent = dependents.find(d => d.id === currentTab)
                    if (dependent) handleOpenDeleteDependent(dependent)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Dependente
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="paciente">
            <div className="space-y-3">
              {renderAppointmentsGrid(getAppointmentsByTab('paciente'))}
            </div>
          </TabsContent>

          {dependents.map(dependent => (
            <TabsContent key={dependent.id} value={String(dependent.id)}>
              <div className="space-y-3">
                {renderAppointmentsGrid(getAppointmentsByTab(dependent.id))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? 'Editar Consulta' : 'Nova Consulta'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações da consulta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tipo de Paciente */}
            <div>
              <Label>Para quem é a consulta?</Label>
              <Select
                value={formData.patient_type}
                onValueChange={(value: 'paciente' | 'dependente') => {
                  setFormData({
                    ...formData,
                    patient_type: value,
                    dependent_id: value === 'paciente' ? undefined : formData.dependent_id
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paciente">Paciente (Titular)</SelectItem>
                  <SelectItem value="dependente">Dependente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selecionar Dependente */}
            {formData.patient_type === 'dependente' && (
              <div>
                <Label>Selecione o Dependente</Label>
                <Select
                  value={formData.dependent_id ? String(formData.dependent_id) : undefined}
                  onValueChange={(value) => setFormData({ ...formData, dependent_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dependente" />
                  </SelectTrigger>
                  <SelectContent>
                    {dependents.map(dependent => (
                      <SelectItem key={dependent.id} value={String(dependent.id)}>
                        {dependent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Tipo de Consulta */}
            <div>
              <Label>Tipo de Consulta</Label>
              <Select
                value={formData.appointment_type}
                onValueChange={(value: 'medico' | 'dentista') => {
                  setFormData({ ...formData, appointment_type: value, specialty: '' })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="medico">Médico</SelectItem>
                  <SelectItem value="dentista">Dentista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Hora</Label>
                <Input
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                />
              </div>
            </div>

            {/* Médico/Dentista */}
            <div>
              <Label>{formData.appointment_type === 'medico' ? 'Médico' : 'Dentista'}</Label>
              <Input
                placeholder={`Nome do ${formData.appointment_type === 'medico' ? 'médico' : 'dentista'}`}
                value={formData.doctor_name}
                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
              />
            </div>

            {/* Especialidade */}
            <div>
              <Label>Especialidade</Label>
              <Select
                value={formData.specialty}
                onValueChange={(value) => setFormData({ ...formData, specialty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {specialtyOptions.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div>
              <Label>Observações</Label>
              <Textarea
                placeholder="Adicione observações sobre a consulta..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              {editingAppointment ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar dependente */}
      <Dialog open={isAddDependentOpen} onOpenChange={setIsAddDependentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Dependente</DialogTitle>
            <DialogDescription>
              Digite o nome do dependente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nome do Dependente</Label>
              <Input
                placeholder="Ex: João Silva"
                value={newDependentName}
                onChange={(e) => setNewDependentName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddDependent()
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDependentOpen(false)
              setNewDependentName('')
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddDependent} className="bg-blue-600 hover:bg-blue-700">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão de dependente */}
      <Dialog open={isDeleteDependentOpen} onOpenChange={setIsDeleteDependentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir Dependente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o dependente "{dependentToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta ação não poderá ser desfeita. O dependente só poderá ser excluído se não houver consultas vinculadas a ele.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDeleteDependentOpen(false)
              setDependentToDelete(null)
            }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteDependent}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SaudeConsultas
