import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  Plus,
  Download,
  Edit,
  TrendingUp,
  LifeBuoy,
  Trash2,
  Pencil,
} from "lucide-react"
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
import { LifeWheel } from "@/components/LifeWheel"
import { EditLifeAreaDialog } from "@/components/EditLifeAreaDialog"
import { CreateGoalDialog } from "@/components/CreateGoalDialog"
import { CreateDreamDialog } from "@/components/CreateDreamDialog"
import { EditDreamDialog } from "@/components/EditDreamDialog"
import { GoalDetailsDialog } from "@/components/GoalDetailsDialog"

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

const Goals = () => {
  const {
    lifeAreas,
    goals,
    loading,
    updateLifeArea,
    createGoal,
    deleteGoal,
    addTask,
    updateTask,
    toggleTaskCompleted,
    deleteTask,
  } = useGoals()

  const {
    dreams,
    loading: dreamsLoading,
    createDream,
    updateDream,
    deleteDream,
  } = useDreams()

  const [isCreateGoalDialogOpen, setIsCreateGoalDialogOpen] = useState(false)
  const [isCreateDreamDialogOpen, setIsCreateDreamDialogOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState<LifeArea | null>(null)
  const [isEditAreaDialogOpen, setIsEditAreaDialogOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [isGoalDetailsDialogOpen, setIsGoalDetailsDialogOpen] = useState(false)
  const [selectedDream, setSelectedDream] = useState<any>(null)
  const [isEditDreamDialogOpen, setIsEditDreamDialogOpen] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)
  const dreamsAndGoalsRef = useRef<HTMLDivElement>(null)

  // Atualizar selectedGoal quando a lista de goals mudar
  useEffect(() => {
    if (selectedGoal && isGoalDetailsDialogOpen) {
      const updatedGoal = goals.find((g) => g.id === selectedGoal.id)
      if (updatedGoal) {
        setSelectedGoal(updatedGoal)
      }
    }
  }, [goals])

  const handleAreaClick = (area: LifeArea) => {
    setSelectedArea(area)
    setIsEditAreaDialogOpen(true)
  }

  const handleSaveArea = async (id: number, level: number) => {
    await updateLifeArea(id, level)
  }

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal)
    setIsGoalDetailsDialogOpen(true)
  }

  const handleDownloadWheel = async () => {
    if (!wheelRef.current) return

    try {
      const canvas = await html2canvas(wheelRef.current, {
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
      pdf.save(`roda-da-vida-${date}.pdf`)
    } catch (error) {
      console.error("Erro ao baixar PDF:", error)
      alert("Erro ao baixar a Roda da Vida")
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
      pdf.save(`sonhos-e-metas-${date}.pdf`)
    } catch (error) {
      console.error("Erro ao baixar PDF:", error)
      alert("Erro ao baixar Sonhos & Metas")
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
              <h1 className="text-2xl font-semibold">Sonhos & Metas</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadDreamsAndGoals}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Sonhos & Metas
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadWheel}
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar Roda da Vida
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsCreateDreamDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Sonho
              </Button>
              <Button onClick={() => setIsCreateGoalDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Meta
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
            <EditLifeAreaDialog
              area={selectedArea}
              open={isEditAreaDialogOpen}
              onOpenChange={setIsEditAreaDialogOpen}
              onSave={handleSaveArea}
            />

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
                alert("Função de editar meta ainda não implementada. Por enquanto, você pode excluir e criar uma nova meta.")
              }}
            />

            {/* Container oculto para download - Sonhos e Metas */}
            <div
              ref={dreamsAndGoalsRef}
              className="fixed top-[-9999px] left-[-9999px] bg-white p-8"
              style={{ width: "1200px" }}
            >
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
                            <h3 className="font-semibold text-lg flex-1 pr-20">
                              {dream.title}
                            </h3>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                          {dream.life_area_name && (
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: dream.life_area_color,
                                }}
                              />
                              <p className="text-sm text-muted-foreground">
                                {dream.life_area_name}
                              </p>
                            </div>
                          )}
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

                        <h3 className="font-medium text-lg mb-2 pr-24">
                          {goal.title}
                        </h3>
                        {goal.life_area_name && (
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: goal.life_area_color }}
                            />
                            <p className="text-sm text-muted-foreground">
                              {goal.life_area_name}
                            </p>
                          </div>
                        )}

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
            </div>

            <Tabs defaultValue="metas" className="space-y-6">
              <TabsList className="grid w-full max-w-xl grid-cols-2">
                <TabsTrigger value="metas" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Minhas Metas</span>
                </TabsTrigger>
                <TabsTrigger value="roda-da-vida" className="gap-2">
                  <LifeBuoy className="h-4 w-4" />
                  <span>Roda da Vida</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="metas" className="space-y-6">
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
                                <h3 className="font-semibold text-lg flex-1 pr-20">
                                  {dream.title}
                                </h3>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                              {dream.life_area_name && (
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor: dream.life_area_color,
                                    }}
                                  />
                                  <p className="text-sm text-muted-foreground">
                                    {dream.life_area_name}
                                  </p>
                                </div>
                              )}
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

                {/* Seção de Metas */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Minhas Metas</h2>
                  {goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-card rounded-lg border">
                      <p className="text-muted-foreground mb-4">
                        Você ainda não tem nenhuma meta cadastrada
                      </p>
                      <Button onClick={() => setIsCreateGoalDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeira Meta
                      </Button>
                    </div>
                  ) : (
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

                          <h3 className="font-medium text-lg mb-2 pr-24">
                            {goal.title}
                          </h3>
                          {goal.life_area_name && (
                            <div className="flex items-center gap-2 mb-3">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: goal.life_area_color }}
                              />
                              <p className="text-sm text-muted-foreground">
                                {goal.life_area_name}
                              </p>
                            </div>
                          )}

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
              </TabsContent>

              <TabsContent value="roda-da-vida">
                {/* Layout: Roda à esquerda (2/3), Áreas à direita (1/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Seção da Roda da Vida - 2 colunas */}
                  <div className="lg:col-span-2">
                    <div
                      ref={wheelRef}
                      className="bg-card rounded-lg border p-6"
                    >
                      <h2 className="text-xl font-semibold mb-4">
                        Roda da Vida
                      </h2>
                      <LifeWheel
                        lifeAreas={lifeAreas}
                        onAreaClick={handleAreaClick}
                      />
                    </div>
                  </div>

                  {/* Seção de Áreas da Vida - 1 coluna */}
                  <div className="lg:col-span-1">
                    <div className="bg-card rounded-lg border p-6">
                      <h2 className="text-xl font-semibold mb-4">
                        Áreas da Vida
                      </h2>
                      <div className="space-y-3">
                        {lifeAreas.map((area) => (
                          <div
                            key={area.id}
                            className="bg-gray-50 rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer group"
                            onClick={() => handleAreaClick(area)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: area.color }}
                                />
                                <h3 className="font-medium">{area.name}</h3>
                              </div>
                              <Edit className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {area.description}
                            </p>
                            <p className="text-sm font-semibold">
                              {area.satisfaction_level}/10
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  )
}

export default Goals
