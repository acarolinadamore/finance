import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Plus,
  Download,
  Edit,
  TrendingUp,
  Sparkles,
  Trash2,
  Pencil,
  GripVertical,
  Link as LinkIcon,
} from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGoals } from "@/hooks/useGoals"
import { useDreams } from "@/hooks/useDreams"
import { CreateGoalDialog } from "@/components/CreateGoalDialog"
import { CreateDreamDialog } from "@/components/CreateDreamDialog"
import { EditDreamDialog } from "@/components/EditDreamDialog"
import { EditGoalDialog } from "@/components/EditGoalDialog"
import { GoalDetailsDialog } from "@/components/GoalDetailsDialog"
import { LinkGoalsDialog } from "@/components/LinkGoalsDialog"
import { TagsFilter } from "@/components/TagsFilter"

interface LifeArea {
  id: number
  name: string
  description: string
  color: string
  satisfaction_level: number
  display_order: number
  created_at: string
  updated_at: string
}

interface Goal {
  id: number
  title: string
  life_area_id?: number
  life_area_name?: string
  life_area_color?: string
  current_situation?: string
  desired_outcome?: string
  progress: number
  tasks: any[]
  created_at: string
  updated_at: string
}

interface Dream {
  id: number
  title: string
  description?: string
  image?: string
  deadline?: string
  life_area_name?: string
  life_area_color?: string
  prazo_tipo?: 'curto' | 'medio' | 'longo'
  created_at: string
}

interface SortableDreamCardProps {
  dream: Dream
  onEdit: (dream: any) => void
  onDelete: (id: number) => void
  onLinkGoals: (dream: any) => void
  calculateDays: (deadline?: string, createdAt?: string) => { daysRemaining: number; daysPassed: number } | null
}

const SortableDreamCard = ({ dream, onEdit, onDelete, onLinkGoals, calculateDays }: SortableDreamCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dream.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.3 : 1,
  }

  const days = calculateDays(dream.deadline, dream.created_at)

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className={`bg-card rounded-lg border hover:shadow-lg transition-all group relative ${isDragging ? 'shadow-xl ring-2 ring-primary' : ''}`}>
        {/* Layout horizontal: imagem à esquerda, informações à direita */}
        <div className="flex gap-4 p-4">
          {/* Coluna esquerda - Imagem */}
          <div className="flex-shrink-0">
            {dream.image ? (
              <div className="w-48 h-48 bg-white rounded-lg overflow-hidden flex items-center justify-center border">
                <img
                  src={dream.image}
                  alt={dream.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border">
                <p className="text-gray-400 text-sm">Sem imagem</p>
              </div>
            )}
          </div>

          {/* Coluna direita - Informações */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-2">
              <div
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="font-semibold text-lg flex-1">
                {dream.title}
              </h3>
              {dream.life_area_name && (
                <div
                  className="px-3 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: dream.life_area_color }}
                >
                  {dream.life_area_name}
                </div>
              )}
              {(dream as any).prazo_tipo && (
                <div
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    (dream as any).prazo_tipo === "curto"
                      ? "bg-green-100 text-green-700"
                      : (dream as any).prazo_tipo === "medio"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {(dream as any).prazo_tipo === "curto"
                    ? "Curto Prazo"
                    : (dream as any).prazo_tipo === "medio"
                    ? "Médio Prazo"
                    : "Longo Prazo"}
                </div>
              )}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onLinkGoals(dream)
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                  title="Vincular metas"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(dream)
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(dream.id)
                  }}
                  className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {dream.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {dream.description}
              </p>
            )}

            {dream.deadline && (
              <div className="mb-3 space-y-1">
                <p className="text-xs text-muted-foreground">
                  Prazo estipulado:{" "}
                  {new Date(dream.deadline).toLocaleDateString("pt-BR")}
                </p>
                {days && (
                  <>
                    <p className="text-sm font-medium text-primary">
                      Faltam {days.daysRemaining} dias
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Já se passaram {days.daysPassed} dias
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Seção de Metas Vinculadas - será implementada */}
            {(dream as any).linked_goals && (dream as any).linked_goals.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-medium text-gray-700 mb-2">Metas vinculadas:</p>
                <div className="flex flex-wrap gap-2">
                  {(dream as any).linked_goals.map((goal: any) => (
                    <div
                      key={goal.id}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: goal.life_area_color || '#8b5cf6' }}
                      />
                      <span>{goal.title}</span>
                      <span className="text-violet-500">• {goal.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SortableGoalCardProps {
  goal: Goal
  onClick: (goal: Goal) => void
  toggleTaskCompleted: (taskId: number, completed: boolean) => Promise<void>
}

const SortableGoalCard = ({ goal, onClick, toggleTaskCompleted }: SortableGoalCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.3 : 1,
  }

  // Calcular progresso real: se não há tarefas, progresso deve ser 0
  const actualProgress = goal.tasks.length > 0 ? goal.progress : 0

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className={`bg-card rounded-lg border p-4 hover:shadow-md transition-all cursor-pointer relative group ${isDragging ? 'shadow-xl ring-2 ring-primary' : ''}`}
        onClick={(e) => {
          // Só abrir o dialog se não clicar em um botão ou checkbox
          if (!(e.target as HTMLElement).closest('button') && !(e.target as HTMLElement).closest('[role="checkbox"]')) {
            onClick(goal)
          }
        }}
      >
        {/* Layout horizontal: informações à esquerda, tarefas à direita */}
        <div className="flex gap-6">
          {/* Coluna esquerda - Informações principais */}
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <div
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="font-medium text-lg flex-1">
                {goal.title}
              </h3>
              {goal.life_area_name && (
                <div
                  className="px-3 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: goal.life_area_color }}
                >
                  {goal.life_area_name}
                </div>
              )}
              {(goal as any).prazo_tipo && (
                <div
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    (goal as any).prazo_tipo === "curto"
                      ? "bg-green-100 text-green-700"
                      : (goal as any).prazo_tipo === "medio"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {(goal as any).prazo_tipo === "curto"
                    ? "Curto Prazo"
                    : (goal as any).prazo_tipo === "medio"
                    ? "Médio Prazo"
                    : "Longo Prazo"}
                </div>
              )}
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span className="font-semibold">{actualProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${actualProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {goal.tasks.length} tarefa(s) •{" "}
                {goal.tasks.filter((t) => t.completed).length} concluída(s)
              </p>
            </div>

            {(goal as any).motivo && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700">Motivo:</p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {(goal as any).motivo}
                </p>
              </div>
            )}
          </div>

          {/* Coluna direita - Tarefas */}
          {goal.tasks.length > 0 && (
            <div className="w-80 border-l pl-6">
              <p className="text-xs font-medium text-gray-700 mb-3">Tarefas:</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {goal.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    onClick={async (e) => {
                      e.stopPropagation()
                      try {
                        await toggleTaskCompleted(task.id, !task.completed)
                      } catch (error) {
                        console.error("Erro ao atualizar tarefa:", error)
                      }
                    }}
                  >
                    <div
                      className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 mt-0.5 ${
                        task.completed
                          ? "bg-primary border-primary"
                          : "border-gray-300"
                      }`}
                    >
                      {task.completed && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs ${
                          task.completed
                            ? "line-through text-muted-foreground"
                            : "text-gray-700"
                        }`}
                      >
                        {task.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Goals = () => {
  const {
    lifeAreas,
    goals,
    loading,
    updateLifeArea,
    createGoal,
    updateGoal,
    deleteGoal,
    addTask,
    updateTask,
    toggleTaskCompleted,
    deleteTask,
    reorderGoals,
  } = useGoals()

  const {
    dreams,
    loading: dreamsLoading,
    createDream,
    updateDream,
    deleteDream,
    reorderDreams,
    linkGoal,
    unlinkGoal,
  } = useDreams()

  const [isCreateGoalDialogOpen, setIsCreateGoalDialogOpen] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null)
  const [isCreateDreamDialogOpen, setIsCreateDreamDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isLinkGoalsDialogOpen, setIsLinkGoalsDialogOpen] = useState(false)
  const [dreamForLinking, setDreamForLinking] = useState<any>(null)
  const [isGoalDetailsDialogOpen, setIsGoalDetailsDialogOpen] = useState(false)
  const [selectedDream, setSelectedDream] = useState<any>(null)
  const [isEditDreamDialogOpen, setIsEditDreamDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [isEditGoalDialogOpen, setIsEditGoalDialogOpen] = useState(false)
  const [activeDreamId, setActiveDreamId] = useState<number | null>(null)
  const [activeGoalId, setActiveGoalId] = useState<number | null>(null)
  const dreamsAndGoalsRef = useRef<HTMLDivElement>(null)

  // Sensores para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Precisa mover 8px antes de começar o drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Configuração de animação do drop
  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

  // Atualizar selectedGoal quando a lista de goals mudar
  useEffect(() => {
    if (selectedGoal && isGoalDetailsDialogOpen) {
      const updatedGoal = goals.find((g) => g.id === selectedGoal.id)
      if (updatedGoal) {
        setSelectedGoal(updatedGoal)
      }
    }
  }, [goals])

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsGoalDetailsDialogOpen(true)
  }

  const handleGoalDragStart = (event: DragStartEvent) => {
    setActiveGoalId(Number(event.active.id))
  }

  const handleGoalDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveGoalId(null)

    if (over && active.id !== over.id) {
      const oldIndex = goals.findIndex((g) => g.id === Number(active.id))
      const newIndex = goals.findIndex((g) => g.id === Number(over.id))

      const newOrder = arrayMove(goals, oldIndex, newIndex)

      // Atualizar ordem no servidor
      const orders = newOrder.map((goal, index) => ({
        id: goal.id,
        display_order: index,
      }))

      try {
        await reorderGoals(orders)
      } catch (error) {
        console.error("Erro ao reordenar metas:", error)
      }
    }
  }

  const handleDreamDragStart = (event: DragStartEvent) => {
    setActiveDreamId(Number(event.active.id))
  }

  const handleDreamDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDreamId(null)

    if (over && active.id !== over.id) {
      const oldIndex = dreams.findIndex((d) => d.id === Number(active.id))
      const newIndex = dreams.findIndex((d) => d.id === Number(over.id))

      const newOrder = arrayMove(dreams, oldIndex, newIndex)

      // Atualizar ordem no servidor
      const orders = newOrder.map((dream, index) => ({
        id: dream.id,
        display_order: index,
      }))

      try {
        await reorderDreams(orders)
      } catch (error) {
        console.error("Erro ao reordenar sonhos:", error)
      }
    }
  }

  const calculateDays = (deadline?: string, createdAt?: string) => {
    if (!deadline) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const deadlineDate = new Date(deadline)
    deadlineDate.setHours(0, 0, 0, 0)

    const diffTime = deadlineDate.getTime() - today.getTime()
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let daysPassed = 0
    if (createdAt) {
      const createdDate = new Date(createdAt)
      createdDate.setHours(0, 0, 0, 0)
      const passedTime = today.getTime() - createdDate.getTime()
      daysPassed = Math.floor(passedTime / (1000 * 60 * 60 * 24))
    }

    return { daysRemaining, daysPassed }
  }

  const handleDeleteDream = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este sonho?")) {
      try {
        await deleteDream(id)
      } catch (error) {
        console.error("Erro ao excluir sonho:", error)
        alert("Erro ao excluir sonho")
      }
    }
  }

  const handleEditDream = (dream: any) => {
    setSelectedDream(dream)
    setIsEditDreamDialogOpen(true)
  }

  const handleLinkGoals = (dream: any) => {
    setDreamForLinking(dream)
    setIsLinkGoalsDialogOpen(true)
  }

  // Filtrar metas e sonhos por área selecionada
  const filteredGoals = selectedAreaId !== null
    ? goals.filter((goal) => goal.life_area_id === selectedAreaId)
    : goals

  const filteredDreams = selectedAreaId !== null
    ? dreams.filter((dream) => (dream as any).life_area_id === selectedAreaId)
    : dreams

  // Pegar apenas as áreas que têm metas ou sonhos vinculados
  const usedLifeAreaIds = new Set([
    ...goals.filter(g => g.life_area_id).map(g => g.life_area_id),
    ...dreams.filter(d => (d as any).life_area_id).map(d => (d as any).life_area_id)
  ])
  const usedLifeAreas = lifeAreas.filter(area => usedLifeAreaIds.has(area.id))

  // Calcular contadores por área
  const areaCounts: { [key: number]: number } = {}
  usedLifeAreas.forEach(area => {
    const goalsCount = goals.filter(g => g.life_area_id === area.id).length
    const dreamsCount = dreams.filter(d => (d as any).life_area_id === area.id).length
    areaCounts[area.id] = goalsCount + dreamsCount
  })

  const totalCount = goals.length + dreams.length

  const handleDownloadDreamsAndGoals = async () => {
    if (!dreamsAndGoalsRef.current) return

    try {
      const canvas = await html2canvas(dreamsAndGoalsRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      })

      const imgData = canvas.toDataURL("image/png")

      // Criar PDF em formato A4
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Dimensões A4 em mm
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Calcular dimensões da imagem mantendo proporção
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = imgWidth / imgHeight

      let finalWidth = pdfWidth - 20 // margem de 10mm de cada lado
      let finalHeight = finalWidth / ratio

      // Se a altura ultrapassar a página, ajustar pela altura
      if (finalHeight > pdfHeight - 20) {
        finalHeight = pdfHeight - 20
        finalWidth = finalHeight * ratio
      }

      // Centralizar
      const x = (pdfWidth - finalWidth) / 2
      const y = 10 // margem superior

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight)

      const date = new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")
      pdf.save(`metas-e-sonhos-${date}.pdf`)
    } catch (error) {
      console.error("Erro ao baixar PDF:", error)
      alert("Erro ao baixar Metas & Sonhos")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold">Metas & Sonhos</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadDreamsAndGoals}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Metas & Sonhos
              </Button>
              <Button onClick={() => setIsCreateGoalDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Meta
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateDreamDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Sonho
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <>
            <CreateGoalDialog
              open={isCreateGoalDialogOpen}
              onOpenChange={setIsCreateGoalDialogOpen}
              lifeAreas={lifeAreas}
              onCreateGoal={createGoal}
              onAddTask={addTask}
            />

            <CreateDreamDialog
              open={isCreateDreamDialogOpen}
              onOpenChange={setIsCreateDreamDialogOpen}
              lifeAreas={lifeAreas}
              onCreateDream={createDream}
            />

            <EditDreamDialog
              dream={selectedDream}
              open={isEditDreamDialogOpen}
              onOpenChange={setIsEditDreamDialogOpen}
              lifeAreas={lifeAreas}
              onUpdateDream={updateDream}
            />

            <EditGoalDialog
              goal={editingGoal}
              open={isEditGoalDialogOpen}
              onOpenChange={setIsEditGoalDialogOpen}
              lifeAreas={lifeAreas}
              onUpdateGoal={updateGoal}
            />

            <LinkGoalsDialog
              dream={dreamForLinking}
              open={isLinkGoalsDialogOpen}
              onOpenChange={setIsLinkGoalsDialogOpen}
              goals={goals}
              onLinkGoal={linkGoal}
              onUnlinkGoal={unlinkGoal}
            />

            <GoalDetailsDialog
              goal={selectedGoal}
              open={isGoalDetailsDialogOpen}
              onOpenChange={setIsGoalDetailsDialogOpen}
              onToggleTask={toggleTaskCompleted}
              onDeleteTask={deleteTask}
              onDeleteGoal={deleteGoal}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onEditGoal={() => {
                if (selectedGoal) {
                  setEditingGoal(selectedGoal)
                  setIsEditGoalDialogOpen(true)
                }
              }}
            />

            {/* Container oculto para download - Metas e Sonhos */}
            <div
              ref={dreamsAndGoalsRef}
              className="fixed top-[-9999px] left-[-9999px] bg-white p-8"
              style={{ width: "1200px" }}
            >
              {/* Seção de Metas */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Minhas Metas</h2>
                {goals.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goals.map((goal) => (
                      <div
                        key={goal.id}
                        className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer relative"
                        onClick={() => handleGoalClick(goal)}
                      >
                        {(goal as any).prazo_tipo && (
                          <div
                            className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium ${
                              (goal as any).prazo_tipo === "curto"
                                ? "bg-green-100 text-green-700"
                                : (goal as any).prazo_tipo === "medio"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {(goal as any).prazo_tipo === "curto"
                              ? "Curto Prazo"
                              : (goal as any).prazo_tipo === "medio"
                              ? "Médio Prazo"
                              : "Longo Prazo"}
                          </div>
                        )}

                        <div className="flex items-start gap-2 mb-2 pr-24">
                          <h3 className="font-medium text-lg flex-1">
                            {goal.title}
                          </h3>
                          {goal.life_area_name && (
                            <div
                              className="px-3 py-1 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: goal.life_area_color }}
                            >
                              {goal.life_area_name}
                            </div>
                          )}
                        </div>

                        <div className="mb-3 pb-3 border-b">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progresso</span>
                            <span className="font-semibold">
                              {goal.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {goal.tasks.length} tarefa(s) •{" "}
                            {goal.tasks.filter((t) => t.completed).length}{" "}
                            concluída(s)
                          </p>
                        </div>

                        {(goal as any).motivo && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700">
                              Motivo:
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {(goal as any).motivo}
                            </p>
                          </div>
                        )}

                        {(goal as any).current_situation && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700">
                              Como estou agora:
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {(goal as any).current_situation}
                            </p>
                          </div>
                        )}

                        {(goal as any).desired_outcome && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700">
                              Onde quero chegar:
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {(goal as any).desired_outcome}
                            </p>
                          </div>
                        )}

                        {(goal as any).obstaculo && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700">
                              Obstáculos:
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {(goal as any).obstaculo}
                            </p>
                          </div>
                        )}

                        {(goal as any).recompensa && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-700">
                              Recompensa:
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {(goal as any).recompensa}
                            </p>
                          </div>
                        )}

                        {/* Lista de Tarefas */}
                        {goal.tasks.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium text-gray-700 mb-2">
                              Tarefas:
                            </p>
                            <div className="space-y-2">
                              {goal.tasks.map((task) => (
                                <div
                                  key={task.id}
                                  className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                                  onClick={async (e) => {
                                    e.stopPropagation()
                                    try {
                                      await toggleTaskCompleted(task.id, !task.completed)
                                    } catch (error) {
                                      console.error("Erro ao atualizar tarefa:", error)
                                    }
                                  }}
                                >
                                  <div
                                    className={`w-4 h-4 rounded-sm border-2 flex-shrink-0 mt-0.5 ${
                                      task.completed
                                        ? "bg-primary border-primary"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {task.completed && (
                                      <svg
                                        className="w-3 h-3 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={3}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-xs ${
                                        task.completed
                                          ? "line-through text-muted-foreground"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {task.title}
                                    </p>
                                    {task.deadline && (
                                      <p className="text-xs text-muted-foreground">
                                        Prazo:{" "}
                                        {new Date(
                                          task.deadline
                                        ).toLocaleDateString("pt-BR")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seção de Sonhos */}
              {dreams.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Meus Sonhos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dreams.map((dream) => {
                    const days = calculateDays(dream.deadline, dream.created_at)
                    return (
                      <div
                        key={dream.id}
                        className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow group relative"
                      >
                        {(dream as any).prazo_tipo && (
                          <div
                            className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-medium z-10 ${
                              (dream as any).prazo_tipo === "curto"
                                ? "bg-green-100 text-green-700"
                                : (dream as any).prazo_tipo === "medio"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {(dream as any).prazo_tipo === "curto"
                              ? "Curto Prazo"
                              : (dream as any).prazo_tipo === "medio"
                              ? "Médio Prazo"
                              : "Longo Prazo"}
                          </div>
                        )}
                        {dream.image && (
                          <div className="w-full h-48 bg-white flex items-center justify-center">
                            <img
                              src={dream.image}
                              alt={dream.title}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg flex-1 pr-2">
                              {dream.title}
                            </h3>
                            {dream.life_area_name && (
                              <div
                                className="px-3 py-1 rounded text-xs font-medium text-white"
                                style={{ backgroundColor: dream.life_area_color }}
                              >
                                {dream.life_area_name}
                              </div>
                            )}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditDream(dream)}
                                className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteDream(dream.id)}
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {dream.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {dream.description}
                            </p>
                          )}
                          {dream.deadline && (
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground">
                                Prazo estipulado:{" "}
                                {new Date(dream.deadline).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </p>
                              {days && (
                                <>
                                  <p className="text-sm font-medium text-primary">
                                    Faltam {days.daysRemaining} dias
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Já se passaram {days.daysPassed} dias
                                  </p>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            </div>

            <Tabs defaultValue="metas" className="space-y-6">
              <TabsList className="grid w-full max-w-xl grid-cols-2">
                <TabsTrigger value="metas" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Minhas Metas</span>
                </TabsTrigger>
                <TabsTrigger value="sonhos" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Meus Sonhos</span>
                </TabsTrigger>
              </TabsList>

              {/* Filtro de Áreas */}
              <TagsFilter
                lifeAreas={usedLifeAreas}
                selectedAreaId={selectedAreaId}
                onAreaChange={setSelectedAreaId}
                totalCount={totalCount}
                areaCounts={areaCounts}
              />

              <TabsContent value="metas" className="space-y-6">
                {/* Seção de Metas */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Minhas Metas</h2>
                  {filteredGoals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border">
                      <p className="text-muted-foreground mb-4">
                        {selectedAreaId !== null
                          ? "Nenhuma meta encontrada para esta área"
                          : "Você ainda não tem nenhuma meta cadastrada"}
                      </p>
                      {selectedAreaId === null && (
                        <Button onClick={() => setIsCreateGoalDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Primeira Meta
                        </Button>
                      )}
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleGoalDragStart}
                      onDragEnd={handleGoalDragEnd}
                    >
                      <SortableContext
                        items={filteredGoals.map((g) => g.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="space-y-4">
                          {filteredGoals.map((goal) => (
                            <SortableGoalCard
                              key={goal.id}
                              goal={goal}
                              onClick={handleGoalClick}
                              toggleTaskCompleted={toggleTaskCompleted}
                            />
                          ))}
                        </div>
                      </SortableContext>
                      <DragOverlay dropAnimation={dropAnimation}>
                        {activeGoalId ? (
                          <div className="bg-card rounded-lg border p-4 shadow-2xl opacity-90 rotate-2 scale-105">
                            {(() => {
                              const goal = goals.find((g) => g.id === activeGoalId)
                              if (!goal) return null
                              return (
                                <>
                                  <div className="flex items-start gap-2 mb-2">
                                    <h3 className="font-medium text-lg flex-1">
                                      {goal.title}
                                    </h3>
                                    {goal.life_area_name && (
                                      <div
                                        className="px-3 py-1 rounded text-xs font-medium text-white"
                                        style={{ backgroundColor: goal.life_area_color }}
                                      >
                                        {goal.life_area_name}
                                      </div>
                                    )}
                                  </div>
                                  <div className="mb-3">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Progresso</span>
                                      <span className="font-semibold">{goal.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-primary h-2 rounded-full transition-all"
                                        style={{ width: `${goal.progress}%` }}
                                      />
                                    </div>
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sonhos" className="space-y-6">
                {/* Seção de Sonhos com Drag-and-Drop */}
                {filteredDreams.length > 0 ? (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Meus Sonhos</h2>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDreamDragStart}
                      onDragEnd={handleDreamDragEnd}
                    >
                      <SortableContext
                        items={filteredDreams.map((d) => d.id)}
                        strategy={rectSortingStrategy}
                      >
                        <div className="space-y-4">
                          {filteredDreams.map((dream) => (
                            <SortableDreamCard
                              key={dream.id}
                              dream={dream}
                              onEdit={handleEditDream}
                              onDelete={handleDeleteDream}
                              onLinkGoals={handleLinkGoals}
                              calculateDays={calculateDays}
                            />
                          ))}
                        </div>
                      </SortableContext>
                      <DragOverlay dropAnimation={dropAnimation}>
                        {activeDreamId ? (
                          <div className="bg-card rounded-lg border overflow-hidden shadow-2xl opacity-90 rotate-3 scale-105">
                            {(() => {
                              const dream = dreams.find((d) => d.id === activeDreamId)
                              if (!dream) return null
                              const days = calculateDays(dream.deadline, dream.created_at)
                              return (
                                <>
                                  {dream.image && (
                                    <div className="w-full h-48 bg-white flex items-center justify-center">
                                      <img
                                        src={dream.image}
                                        alt={dream.title}
                                        className="max-w-full max-h-full object-contain"
                                      />
                                    </div>
                                  )}
                                  <div className="p-4">
                                    <div className="flex items-start gap-2 mb-2">
                                      <h3 className="font-semibold text-lg flex-1">
                                        {dream.title}
                                      </h3>
                                      {dream.life_area_name && (
                                        <div
                                          className="px-3 py-1 rounded text-xs font-medium text-white"
                                          style={{ backgroundColor: dream.life_area_color }}
                                        >
                                          {dream.life_area_name}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                        ) : null}
                      </DragOverlay>
                    </DndContext>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border">
                    <p className="text-muted-foreground mb-4">
                      {selectedAreaId !== null
                        ? "Nenhum sonho encontrado para esta área"
                        : "Você ainda não tem nenhum sonho cadastrado"}
                    </p>
                    {selectedAreaId === null && (
                      <Button onClick={() => setIsCreateDreamDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Sonho
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}

export default Goals
