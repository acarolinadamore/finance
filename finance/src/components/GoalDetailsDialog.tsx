import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Trash2, Plus, Edit } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface GoalTask {
  id: number
  goal_id: number
  title: string
  description?: string
  deadline?: string
  completed: boolean
}

interface Goal {
  id: number
  title: string
  life_area_id?: number
  life_area_name?: string
  life_area_color?: string
  motivo?: string
  current_situation?: string
  desired_outcome?: string
  obstaculo?: string
  recompensa?: string
  progress: number
  tasks: GoalTask[]
}

interface GoalDetailsDialogProps {
  goal: Goal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onToggleTask: (taskId: number, completed: boolean) => Promise<void>
  onDeleteTask: (taskId: number) => Promise<void>
  onDeleteGoal: (goalId: number) => Promise<void>
  onAddTask: (
    goalId: number,
    task: { title: string; description?: string; deadline?: string }
  ) => Promise<void>
  onUpdateTask: (
    taskId: number,
    updates: { title?: string; description?: string; deadline?: string }
  ) => Promise<void>
  onEditGoal: () => void
}

export const GoalDetailsDialog = ({
  goal,
  open,
  onOpenChange,
  onToggleTask,
  onDeleteTask,
  onDeleteGoal,
  onAddTask,
  onUpdateTask,
  onEditGoal,
}: GoalDetailsDialogProps) => {
  const [showAddTask, setShowAddTask] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
  })
  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    deadline: "",
  })

  useEffect(() => {
    if (!open) {
      setShowAddTask(false)
      setEditingTaskId(null)
      setNewTask({ title: "", description: "", deadline: "" })
      setEditTask({ title: "", description: "", deadline: "" })
    }
  }, [open])

  if (!goal) return null

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return

    try {
      await onAddTask(goal.id, newTask)
      setNewTask({ title: "", description: "", deadline: "" })
      setShowAddTask(false)
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error)
      alert("Erro ao adicionar tarefa")
    }
  }

  const handleDeleteGoal = async () => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      try {
        await onDeleteGoal(goal.id)
        onOpenChange(false)
      } catch (error) {
        console.error("Erro ao excluir meta:", error)
        alert("Erro ao excluir meta")
      }
    }
  }

  const handleEditTask = (task: GoalTask) => {
    setEditingTaskId(task.id)
    setEditTask({
      title: task.title,
      description: task.description || "",
      deadline: task.deadline || "",
    })
  }

  const handleUpdateTask = async () => {
    if (!editTask.title.trim() || !editingTaskId) return

    try {
      await onUpdateTask(editingTaskId, editTask)
      setEditingTaskId(null)
      setEditTask({ title: "", description: "", deadline: "" })
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
      alert("Erro ao atualizar tarefa")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{goal.title}</DialogTitle>
              {goal.life_area_name && (
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: goal.life_area_color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {goal.life_area_name}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEditGoal}
                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteGoal}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progresso</span>
              <span className="font-semibold">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {goal.tasks.filter((t) => t.completed).length} de {goal.tasks.length}{" "}
              tarefas concluídas
            </p>
          </div>

          {/* Motivo */}
          {goal.motivo && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Motivo</h3>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                {goal.motivo}
              </p>
            </div>
          )}

          {/* Como estou agora */}
          {goal.current_situation && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Como estou agora</h3>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                {goal.current_situation}
              </p>
            </div>
          )}

          {/* Onde quero chegar */}
          {goal.desired_outcome && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Onde quero chegar</h3>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                {goal.desired_outcome}
              </p>
            </div>
          )}

          {/* Obstáculos */}
          {goal.obstaculo && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Obstáculos e Como Enfrentá-los</h3>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                {goal.obstaculo}
              </p>
            </div>
          )}

          {/* Recompensa */}
          {goal.recompensa && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Recompensa</h3>
              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                {goal.recompensa}
              </p>
            </div>
          )}

          {/* Tarefas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Tarefas</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddTask(!showAddTask)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tarefa
              </Button>
            </div>

            {/* Adicionar nova tarefa */}
            {showAddTask && (
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <Input
                  placeholder="Título da tarefa"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Descrição (opcional)"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  rows={2}
                />
                <Input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) =>
                    setNewTask({ ...newTask, deadline: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddTask(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddTask} size="sm" className="flex-1">
                    Adicionar
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de tarefas */}
            {goal.tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma tarefa adicionada ainda
              </p>
            ) : (
              <div className="space-y-2">
                {goal.tasks.map((task) => (
                  <div key={task.id}>
                    {editingTaskId === task.id ? (
                      // Formulário de edição
                      <div className="space-y-3 p-4 border rounded-lg bg-blue-50">
                        <Input
                          placeholder="Título da tarefa"
                          value={editTask.title}
                          onChange={(e) =>
                            setEditTask({ ...editTask, title: e.target.value })
                          }
                        />
                        <Textarea
                          placeholder="Descrição (opcional)"
                          value={editTask.description}
                          onChange={(e) =>
                            setEditTask({
                              ...editTask,
                              description: e.target.value,
                            })
                          }
                          rows={2}
                        />
                        <Input
                          type="date"
                          value={editTask.deadline}
                          onChange={(e) =>
                            setEditTask({ ...editTask, deadline: e.target.value })
                          }
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingTaskId(null)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleUpdateTask}
                            size="sm"
                            className="flex-1"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Exibição normal da tarefa
                      <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={(checked) =>
                            onToggleTask(task.id, checked as boolean)
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              task.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          {task.deadline && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Prazo:{" "}
                              {new Date(task.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditTask(task)}
                            className="h-8 w-8 text-blue-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteTask(task.id)}
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
