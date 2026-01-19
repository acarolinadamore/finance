import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface Goal {
  id: number
  title: string
  progress: number
  life_area_name?: string
  life_area_color?: string
}

interface LinkedGoal {
  id: number
  title: string
  progress: number
  life_area_color?: string
}

interface Dream {
  id: number
  title: string
  linked_goals?: LinkedGoal[]
}

interface LinkGoalsDialogProps {
  dream: Dream | null
  open: boolean
  onOpenChange: (open: boolean) => void
  goals: Goal[]
  onLinkGoal: (dreamId: number, goalId: number) => Promise<void>
  onUnlinkGoal: (dreamId: number, goalId: number) => Promise<void>
}

export function LinkGoalsDialog({
  dream,
  open,
  onOpenChange,
  goals,
  onLinkGoal,
  onUnlinkGoal,
}: LinkGoalsDialogProps) {
  const [loading, setLoading] = useState<number | null>(null)

  if (!dream) return null

  const linkedGoalIds = new Set((dream.linked_goals || []).map((g) => g.id))

  const handleToggleGoal = async (goalId: number, isLinked: boolean) => {
    try {
      setLoading(goalId)
      if (isLinked) {
        await onUnlinkGoal(dream.id, goalId)
      } else {
        await onLinkGoal(dream.id, goalId)
      }
    } catch (error) {
      console.error("Erro ao vincular/desvincular meta:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vincular Metas ao Sonho</DialogTitle>
          <DialogDescription>
            Selecione as metas que estão relacionadas ao sonho: <strong>{dream.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma meta disponível. Crie metas primeiro para vinculá-las aos sonhos.
            </p>
          ) : (
            goals.map((goal) => {
              const isLinked = linkedGoalIds.has(goal.id)
              const isLoading = loading === goal.id

              return (
                <div
                  key={goal.id}
                  className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    id={`goal-${goal.id}`}
                    checked={isLinked}
                    disabled={isLoading}
                    onCheckedChange={() => handleToggleGoal(goal.id, isLinked)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={`goal-${goal.id}`}
                      className="text-sm font-medium cursor-pointer flex items-start gap-2"
                    >
                      <span className="flex-1">{goal.title}</span>
                      {isLinked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleGoal(goal.id, true)
                          }}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </Label>
                    <div className="flex items-center gap-3 mt-1">
                      {goal.life_area_name && (
                        <div className="flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: goal.life_area_color }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {goal.life_area_name}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        Progresso: {goal.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                      <div
                        className="bg-primary h-1 rounded-full transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
