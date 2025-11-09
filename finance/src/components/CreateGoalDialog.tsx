import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, X } from "lucide-react"

interface LifeArea {
  id: number
  name: string
  description: string
  color: string
  satisfaction_level: number
}

interface Task {
  title: string
  description: string
  deadline: string
}

interface CreateGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lifeAreas: LifeArea[]
  onCreateGoal: (goal: {
    title: string
    life_area_id?: number
    motivo?: string
    current_situation?: string
    desired_outcome?: string
    obstaculo?: string
    recompensa?: string
  }) => Promise<any>
  onAddTask: (goalId: number, task: Task) => Promise<void>
}

export const CreateGoalDialog = ({
  open,
  onOpenChange,
  lifeAreas,
  onCreateGoal,
  onAddTask,
}: CreateGoalDialogProps) => {
  const [title, setTitle] = useState("")
  const [lifeAreaId, setLifeAreaId] = useState<string>("")
  const [prazoTipo, setPrazoTipo] = useState<string>("")
  const [motivo, setMotivo] = useState("")
  const [currentSituation, setCurrentSituation] = useState("")
  const [desiredOutcome, setDesiredOutcome] = useState("")
  const [obstaculo, setObstaculo] = useState("")
  const [recompensa, setRecompensa] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState({ title: "", description: "", deadline: "" })
  const [saving, setSaving] = useState(false)

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      setTasks([...tasks, { ...newTask }])
      setNewTask({ title: "", description: "", deadline: "" })
    }
  }

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Por favor, insira um título para a meta")
      return
    }

    try {
      setSaving(true)

      // Criar a meta
      const newGoal = await onCreateGoal({
        title,
        life_area_id: lifeAreaId ? parseInt(lifeAreaId) : undefined,
        prazo_tipo: prazoTipo as 'curto' | 'medio' | 'longo' | undefined,
        motivo,
        current_situation: currentSituation,
        desired_outcome: desiredOutcome,
        obstaculo,
        recompensa,
      })

      // Adicionar tarefas
      for (const task of tasks) {
        await onAddTask(newGoal.id, task)
      }

      // Limpar formulário
      setTitle("")
      setLifeAreaId("")
      setPrazoTipo("")
      setMotivo("")
      setCurrentSituation("")
      setDesiredOutcome("")
      setObstaculo("")
      setRecompensa("")
      setTasks([])
      setNewTask({ title: "", description: "", deadline: "" })

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao criar meta:", error)
      alert("Erro ao criar meta. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Nova Meta</DialogTitle>
          <DialogDescription>
            Defina sua meta e adicione tarefas para alcançá-la
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título da Meta */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Título da Meta <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ex: Fazer meu TCC"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Área da Vida */}
          <div className="space-y-2">
            <Label htmlFor="lifeArea">Área da Vida (opcional)</Label>
            <Select value={lifeAreaId} onValueChange={setLifeAreaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem área específica</SelectItem>
                {lifeAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: area.color }}
                      />
                      {area.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Prazo */}
          <div className="space-y-2">
            <Label htmlFor="prazoTipo">Tipo de Prazo (opcional)</Label>
            <Select value={prazoTipo} onValueChange={setPrazoTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o prazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem prazo definido</SelectItem>
                <SelectItem value="curto">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    Curto Prazo
                  </div>
                </SelectItem>
                <SelectItem value="medio">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    Médio Prazo
                  </div>
                </SelectItem>
                <SelectItem value="longo">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    Longo Prazo
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo</Label>
            <Textarea
              id="motivo"
              placeholder="Por que esta meta é importante para você?"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={2}
            />
          </div>

          {/* Como estou agora */}
          <div className="space-y-2">
            <Label htmlFor="currentSituation">Como estou agora?</Label>
            <Textarea
              id="currentSituation"
              placeholder="Descreva sua situação atual..."
              value={currentSituation}
              onChange={(e) => setCurrentSituation(e.target.value)}
              rows={3}
            />
          </div>

          {/* Onde quero chegar */}
          <div className="space-y-2">
            <Label htmlFor="desiredOutcome">Onde quero chegar?</Label>
            <Textarea
              id="desiredOutcome"
              placeholder="Descreva seu objetivo final..."
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
              rows={3}
            />
          </div>

          {/* Obstáculos */}
          <div className="space-y-2">
            <Label htmlFor="obstaculo">À medida que prossigo, quais obstáculos podem surgir e como planejo enfrentá-los?</Label>
            <Textarea
              id="obstaculo"
              placeholder="Descreva possíveis obstáculos e como superá-los..."
              value={obstaculo}
              onChange={(e) => setObstaculo(e.target.value)}
              rows={3}
            />
          </div>

          {/* Recompensa */}
          <div className="space-y-2">
            <Label htmlFor="recompensa">Recompensa</Label>
            <Textarea
              id="recompensa"
              placeholder="Como você irá se recompensar ao atingir essa meta?"
              value={recompensa}
              onChange={(e) => setRecompensa(e.target.value)}
              rows={2}
            />
          </div>

          {/* Tarefas */}
          <div className="space-y-4">
            <Label>Tarefas da Meta</Label>

            {/* Lista de tarefas */}
            {tasks.length > 0 && (
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      {task.deadline && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Prazo: {new Date(task.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTask(index)}
                      className="h-6 w-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Adicionar nova tarefa */}
            <div className="space-y-3 p-4 border rounded-lg">
              <Input
                placeholder="Título da tarefa"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
              <Input
                placeholder="Descrição (opcional)"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />
              <Input
                type="date"
                value={newTask.deadline}
                onChange={(e) =>
                  setNewTask({ ...newTask, deadline: e.target.value })
                }
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddTask}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Tarefa
              </Button>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={saving}>
              {saving ? "Criando..." : "Criar Meta"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
