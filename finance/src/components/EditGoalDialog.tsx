import { useState, useEffect } from "react"
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
  prazo_tipo?: 'curto' | 'medio' | 'longo'
  progress: number
}

interface LifeArea {
  id: number
  name: string
  color: string
}

interface EditGoalDialogProps {
  goal: Goal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  lifeAreas: LifeArea[]
  onUpdateGoal: (id: number, updates: {
    title?: string
    life_area_id?: number
    motivo?: string
    current_situation?: string
    desired_outcome?: string
    obstaculo?: string
    recompensa?: string
    prazo_tipo?: 'curto' | 'medio' | 'longo'
  }) => Promise<void>
}

export const EditGoalDialog = ({
  goal,
  open,
  onOpenChange,
  lifeAreas,
  onUpdateGoal,
}: EditGoalDialogProps) => {
  const [title, setTitle] = useState("")
  const [lifeAreaId, setLifeAreaId] = useState<string>("")
  const [prazoTipo, setPrazoTipo] = useState<string>("")
  const [motivo, setMotivo] = useState("")
  const [currentSituation, setCurrentSituation] = useState("")
  const [desiredOutcome, setDesiredOutcome] = useState("")
  const [obstaculo, setObstaculo] = useState("")
  const [recompensa, setRecompensa] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (goal && open) {
      setTitle(goal.title)
      setLifeAreaId(goal.life_area_id ? goal.life_area_id.toString() : "")
      setPrazoTipo(goal.prazo_tipo || "")
      setMotivo(goal.motivo || "")
      setCurrentSituation(goal.current_situation || "")
      setDesiredOutcome(goal.desired_outcome || "")
      setObstaculo(goal.obstaculo || "")
      setRecompensa(goal.recompensa || "")
    }
  }, [goal, open])

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Por favor, insira um título para a meta")
      return
    }

    if (!goal) return

    try {
      setSaving(true)

      await onUpdateGoal(goal.id, {
        title,
        life_area_id: lifeAreaId && lifeAreaId !== "none" ? parseInt(lifeAreaId) : undefined,
        prazo_tipo: (prazoTipo && prazoTipo !== "none" ? prazoTipo : undefined) as 'curto' | 'medio' | 'longo' | undefined,
        motivo: motivo || undefined,
        current_situation: currentSituation || undefined,
        desired_outcome: desiredOutcome || undefined,
        obstaculo: obstaculo || undefined,
        recompensa: recompensa || undefined,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao atualizar meta:", error)
      alert("Erro ao atualizar meta. Tente novamente.")
    } finally {
      setSaving(false)
    }
  }

  if (!goal) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Meta</DialogTitle>
          <DialogDescription>
            Atualize as informações da sua meta
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
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
