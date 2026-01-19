import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Smile, AlertCircle } from "lucide-react"
import {
  useRoutines,
  useCreateRoutine,
  useUpdateRoutine,
  useDeleteRoutine,
  useReorderRoutines,
  useToggleRoutineCompletion,
  useRoutineCompletions,
} from "@/hooks/useApiRoutines"
import {
  useHabits,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useArchiveHabit,
  useToggleHabitCompletion,
  useHabitCompletions,
} from "@/hooks/useApiHabits"
import { useMoods, useUpsertMood, useDeleteMood } from "@/hooks/useApiMoods"
import { RoutineCard } from "@/components/RoutineCard"
import { RoutineFormDialog } from "@/components/RoutineFormDialog"
import { MoodSelector } from "@/components/MoodSelector"
import { DayRatingSlider } from "@/components/DayRatingSlider"
import { MoodDetailsDialog } from "@/components/MoodDetailsDialog"
import { HabitGrid } from "@/components/HabitGrid"
import { HabitFormDialog } from "@/components/HabitFormDialog"
import { HabitMetrics } from "@/components/HabitMetrics"
import {
  Period,
  Frequency,
  PERIOD_LABELS,
  EMOTIONS,
  Routine,
  Habit,
  DailyMood,
} from "@/types/routine"
import {
  format,
  addMonths,
  subMonths,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
} from "date-fns"
import { ptBR } from "date-fns/locale"
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

interface RoutineFormData {
  name: string
  period: Period
  frequency: Frequency
  specificDays?: number[]
  timesPerWeek?: number
  icon?: string
  color?: string
  addToHabitTracking?: boolean
}

interface HabitFormData {
  name: string
  period?: Period
  frequency: Frequency
  specificDays?: number[]
  timesPerWeek?: number
  startDate: string
  endDate?: string
  icon?: string
  color?: string
}

interface SortableRoutineCardProps {
  routine: Routine
  isCompleted: boolean
  onToggle: () => void
  onEdit: (routine: Routine) => void
  onDelete: (id: string) => void
}

const SortableRoutineCard = (props: SortableRoutineCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.routine.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <RoutineCard
        {...props}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

const Rotina = () => {
  const today = format(new Date(), "yyyy-MM-dd")
  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM", {
    locale: ptBR,
  })

  const [habitMonth, setHabitMonth] = useState(new Date())
  const [showArchivedHabits, setShowArchivedHabits] = useState(false)

  const {
    data: routines = [],
    isLoading: routinesLoading,
    error: routinesError,
  } = useRoutines()
  const { data: habits = [], isLoading: habitsLoading } = useHabits()
  const { data: moods = [] } = useMoods()
  const { data: completions = [] } = useRoutineCompletions({
    start_date: today,
    end_date: today,
  })

  // Buscar habit completions para o mês atual
  const habitMonthStart = format(startOfMonth(habitMonth), "yyyy-MM-dd")
  const habitMonthEnd = format(endOfMonth(habitMonth), "yyyy-MM-dd")
  const { data: habitCompletions = [] } = useHabitCompletions({
    start_date: habitMonthStart,
    end_date: habitMonthEnd,
  })

  // Convert API types to domain types (snake_case → camelCase)
  const domainRoutines = routines as unknown as Routine[]

  const domainHabits: Habit[] = habits.map((h: any) => ({
    id: h.id,
    routineId: h.routine_id,
    name: h.name,
    period: h.period,
    frequency: h.frequency,
    specificDays: h.specific_days,
    timesPerWeek: h.times_per_week,
    startDate: h.start_date,
    endDate: h.end_date,
    icon: h.icon,
    color: h.color,
    isActive: h.is_active !== undefined ? h.is_active : true, // Conversão is_active → isActive
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  }))

  const domainMoods = moods as unknown as DailyMood[]

  const createRoutineMutation = useCreateRoutine()
  const updateRoutineMutation = useUpdateRoutine()
  const deleteRoutineMutation = useDeleteRoutine()
  const reorderRoutinesMutation = useReorderRoutines()
  const toggleRoutineCompletionMutation = useToggleRoutineCompletion()

  const createHabitMutation = useCreateHabit()
  const updateHabitMutation = useUpdateHabit()
  const deleteHabitMutation = useDeleteHabit()
  const archiveHabitMutation = useArchiveHabit()
  const toggleHabitCompletionMutation = useToggleHabitCompletion()

  const upsertMoodMutation = useUpsertMood()
  const deleteMoodMutation = useDeleteMood()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<Period | undefined>()

  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [dayRating, setDayRating] = useState<number>(3)
  const [moodNotes, setMoodNotes] = useState<string>("")

  const [moodDialogOpen, setMoodDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(today)

  const [habitFormOpen, setHabitFormOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)

  const [activeTab, setActiveTab] = useState("tarefas")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const todayMood = domainMoods.find((m) => m.moodDate === today)

  useEffect(() => {
    if (todayMood) {
      setSelectedEmotions(todayMood.emotionIds || [])
      setDayRating(todayMood.dayRating ?? 3)
      setMoodNotes(todayMood.notes || "")
    }
  }, [todayMood])

  const handleAddRoutine = async (routineData: RoutineFormData) => {
    if (editingRoutine) {
      await updateRoutineMutation.mutateAsync({
        id: editingRoutine.id,
        data: {
          name: routineData.name,
          period: routineData.period,
          frequency: routineData.frequency as "daily" | "weekly" | "custom",
          specific_days: routineData.specificDays,
          times_per_week: routineData.timesPerWeek,
          icon: routineData.icon,
          color: routineData.color,
          add_to_habit_tracking: routineData.addToHabitTracking,
        },
      })
      setEditingRoutine(null)
    } else {
      await createRoutineMutation.mutateAsync({
        name: routineData.name,
        period: routineData.period,
        frequency: (routineData.frequency || "daily") as
          | "daily"
          | "weekly"
          | "custom",
        specific_days: routineData.specificDays,
        times_per_week: routineData.timesPerWeek,
        icon: routineData.icon,
        color: routineData.color || "#8b5cf6",
        add_to_habit_tracking: routineData.addToHabitTracking || false,
      })
    }
    setIsFormOpen(false)
  }

  const handleEdit = (routine: Routine) => {
    setEditingRoutine(routine)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente excluir esta rotina?")) {
      await deleteRoutineMutation.mutateAsync(id)
    }
  }

  const handleToggleRoutine = async (routineId: string, completed: boolean) => {
    try {
      await toggleRoutineCompletionMutation.mutateAsync({
        routine_id: routineId,
        completion_date: today,
        completed,
      })
    } catch (error) {
      console.error("❌ [Toggle] Erro:", error)
    }
  }

  const handleOpenForm = (period?: Period) => {
    setSelectedPeriod(period)
    setEditingRoutine(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingRoutine(null)
    setSelectedPeriod(undefined)
  }

  const handleToggleEmotion = (emotionId: string) => {
    setSelectedEmotions((prev) => {
      if (prev.includes(emotionId)) {
        return prev.filter((id) => id !== emotionId)
      }
      return [...prev, emotionId]
    })
  }

  const handleSaveMood = async () => {
    await upsertMoodMutation.mutateAsync({
      mood_date: today,
      emotion_ids: selectedEmotions,
      day_rating: dayRating,
      notes: moodNotes || undefined,
    })
  }

  const handleDeleteMood = async (date: string) => {
    await deleteMoodMutation.mutateAsync(date)
  }

  const handleAddHabit = async (habitData: HabitFormData) => {
    if (editingHabit) {
      await updateHabitMutation.mutateAsync({
        id: editingHabit.id,
        data: {
          name: habitData.name,
          period: habitData.period,
          frequency: habitData.frequency as "daily" | "weekly" | "custom",
          specific_days: habitData.specificDays,
          times_per_week: habitData.timesPerWeek,
          start_date: habitData.startDate,
          end_date: habitData.endDate,
          icon: habitData.icon,
          color: habitData.color,
        },
      })
      setEditingHabit(null)
    } else {
      await createHabitMutation.mutateAsync({
        name: habitData.name,
        period: habitData.period,
        frequency: habitData.frequency as "daily" | "weekly" | "custom",
        specific_days: habitData.specificDays,
        times_per_week: habitData.timesPerWeek,
        start_date: habitData.startDate,
        end_date: habitData.endDate,
        icon: habitData.icon,
        color: habitData.color || "#8b5cf6",
      })
    }
    setHabitFormOpen(false)
  }

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit)
    setHabitFormOpen(true)
  }

  const handleArchiveHabit = async (habitId: string) => {
    await archiveHabitMutation.mutateAsync(habitId)
  }

  const handleDeleteHabit = async (habitId: string) => {
    if (
      confirm("Deseja realmente excluir este hábito? O histórico será perdido.")
    ) {
      await deleteHabitMutation.mutateAsync(habitId)
    }
  }

  const isHabitCompleted = (habitId: string, date: string): boolean => {
    const matchingCompletion = habitCompletions.find((c: any) => {
      const completionDate = c.completion_date?.split("T")[0] // Normalizar data
      return c.habit_id === habitId && completionDate === date
    })
    return matchingCompletion?.completed || false
  }

  const handleToggleHabit = async (habitId: string, date: string) => {
    await toggleHabitCompletionMutation.mutateAsync({
      habit_id: habitId,
      completion_date: date,
    })
  }

  const filteredHabits = showArchivedHabits
    ? domainHabits
    : domainHabits.filter((h) => h.isActive)

  const habitMetrics = useMemo(() => {
    const metrics: Record<
      string,
      { progress: number; currentStreak: number; bestStreak: number }
    > = {}
    filteredHabits.forEach((habit) => {
      metrics[habit.id!] = {
        progress: 0,
        currentStreak: 0,
        bestStreak: 0,
      }
    })
    return metrics
  }, [filteredHabits])

  const handleDragEnd = async (event: DragEndEvent, period: Period) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const periodRoutines = getRoutinesByPeriod(period)
      const oldIndex = periodRoutines.findIndex((r) => r.id === active.id)
      const newIndex = periodRoutines.findIndex((r) => r.id === over.id)

      const newOrder = arrayMove(periodRoutines, oldIndex, newIndex)

      // Criar array de orders com display_order
      const orders = newOrder.map((routine, index) => ({
        id: routine.id,
        display_order: index,
      }))

      // Chamar API para salvar a ordem
      try {
        await reorderRoutinesMutation.mutateAsync(orders)
      } catch (error) {
        console.error("❌ [Drag] Erro ao reordenar:", error)
      }
    }
  }

  const getRoutinesByPeriod = (period: Period) => {
    return domainRoutines.filter(
      (r) => r.period === period && r.isActive !== false
    )
  }

  const isRoutineCompleted = (routineId: string): boolean => {
    const matchingCompletion = completions.find((c: any) => {
      // Normalizar a data para comparação (pegar só YYYY-MM-DD)
      const completionDate = c.completion_date?.split("T")[0]
      return c.routine_id === routineId && completionDate === today
    })

    return matchingCompletion?.completed || false
  }

  // Calcular progresso do dia
  console.log("🔍 [Progresso] domainRoutines:", domainRoutines)
  console.log("🔍 [Progresso] completions:", completions)

  // Contar todas as rotinas (não filtrar por isActive pois rotinas não têm esse campo)
  const totalRoutines = domainRoutines.length
  const completedRoutines = domainRoutines.filter((r) =>
    isRoutineCompleted(r.id)
  ).length
  const progressPercentage =
    totalRoutines > 0
      ? Math.round((completedRoutines / totalRoutines) * 100)
      : 0

  console.log(
    "✅ [Progresso] Total:",
    totalRoutines,
    "Completadas:",
    completedRoutines,
    "Porcentagem:",
    progressPercentage
  )

  const renderPeriodColumn = (period: Period) => {
    const periodRoutines = getRoutinesByPeriod(period)
    const { label, emoji, color } = PERIOD_LABELS[period]

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
              onClick={() => handleOpenForm(period)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {periodRoutines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <p>Nenhuma rotina cadastrada</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => handleOpenForm(period)}
                className="mt-2"
              >
                Cadastrar primeira rotina
              </Button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(event) => handleDragEnd(event, period)}
            >
              <SortableContext
                items={periodRoutines.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {periodRoutines.map((routine) => (
                    <SortableRoutineCard
                      key={routine.id}
                      routine={routine}
                      isCompleted={isRoutineCompleted(routine.id)}
                      onToggle={() =>
                        handleToggleRoutine(
                          routine.id,
                          !isRoutineCompleted(routine.id)
                        )
                      }
                      onEdit={handleEdit}
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

  if (routinesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Erro de Conexão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Não foi possível conectar ao servidor. Certifique-se de que o
              backend está rodando em:
            </p>
            <code className="block p-2 bg-muted rounded text-sm">
              http://localhost:3032
            </code>
            <p className="text-sm text-muted-foreground">
              Para iniciar o servidor, execute:
            </p>
            <code className="block p-2 bg-muted rounded text-sm">
              cd C:\Users\anaca\dev\finance && npm start
            </code>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Rotina</h1>
              <p className="text-muted-foreground text-sm capitalize">
                {formattedDate}
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">Progresso do Dia</span>
                {todayMood && (
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <Smile className="h-4 w-4" />
                    <span>Humor registrado</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">
                  {progressPercentage}%
                </span>
                <p className="text-xs text-muted-foreground">
                  {completedRoutines} de {totalRoutines} tarefas
                </p>
              </div>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="tarefas">Tarefas do Dia</TabsTrigger>
            <TabsTrigger value="habitos">Controle de Hábitos</TabsTrigger>
            <TabsTrigger value="humor">Humor do Dia</TabsTrigger>
          </TabsList>

          <TabsContent value="tarefas">
            {routinesLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando rotinas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {renderPeriodColumn("morning")}
                {renderPeriodColumn("afternoon")}
                {renderPeriodColumn("night")}
              </div>
            )}
          </TabsContent>

          <TabsContent value="habitos">
            {habitsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando hábitos...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setHabitMonth(subMonths(habitMonth, 1))}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold capitalize">
                      {format(habitMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                    </h2>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setHabitMonth(addMonths(habitMonth, 1))}
                    >
                      <Plus className="h-4 w-4 rotate-90" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowArchivedHabits(!showArchivedHabits)}
                    >
                      {showArchivedHabits
                        ? "Ocultar Arquivados"
                        : "Mostrar Arquivados"}
                    </Button>
                    <Button onClick={() => setHabitFormOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Hábito
                    </Button>
                  </div>
                </div>

                <HabitMetrics
                  monthlyAverage={0}
                  bestDays={0}
                  totalDaysInMonth={getDaysInMonth(habitMonth)}
                />

                <Card>
                  <CardContent className="p-0">
                    <HabitGrid
                      habits={filteredHabits}
                      currentMonth={habitMonth}
                      isCompleted={isHabitCompleted}
                      isExpectedDay={() => true}
                      onToggle={handleToggleHabit}
                      onEdit={handleEditHabit}
                      onArchive={handleArchiveHabit}
                      onDelete={handleDeleteHabit}
                      habitMetrics={habitMetrics}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="humor">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="h-5 w-5" />
                  Registro de Humor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <MoodSelector
                  emotions={EMOTIONS}
                  selectedEmotionIds={selectedEmotions}
                  onToggleEmotion={handleToggleEmotion}
                />

                <DayRatingSlider
                  value={dayRating}
                  onValueChange={setDayRating}
                />

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Observações{" "}
                    <span className="text-muted-foreground">(opcional)</span>
                  </p>
                  <Textarea
                    placeholder="Escreva sobre seu dia, o que aconteceu, como se sente..."
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveMood} size="lg">
                    Salvar Humor do Dia
                  </Button>
                </div>

                {todayMood && (
                  <div className="mt-6 p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">
                      Última atualização:{" "}
                      {todayMood.updatedAt &&
                        format(new Date(todayMood.updatedAt), "HH:mm", {
                          locale: ptBR,
                        })}
                    </p>
                    {todayMood.emotionIds &&
                      todayMood.emotionIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {todayMood.emotionIds.map((emotionId) => {
                            const emotion = EMOTIONS.find(
                              (e) => e.id === emotionId
                            )
                            if (!emotion) return null
                            return (
                              <span
                                key={emotionId}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                  backgroundColor: `${emotion.color}20`,
                                  color: emotion.color,
                                }}
                              >
                                {emotion.emoji} {emotion.name}
                              </span>
                            )
                          })}
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <RoutineFormDialog
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        onSubmit={handleAddRoutine}
        editingRoutine={editingRoutine}
        defaultPeriod={selectedPeriod}
      />

      <MoodDetailsDialog
        open={moodDialogOpen}
        onOpenChange={setMoodDialogOpen}
        date={selectedDate}
        mood={todayMood}
        onSave={async (date, emotionIds, dayRating, notes) => {
          await upsertMoodMutation.mutateAsync({
            mood_date: date,
            emotion_ids: emotionIds,
            day_rating: dayRating,
            notes,
          })
        }}
        onDelete={handleDeleteMood}
      />

      <HabitFormDialog
        open={habitFormOpen}
        onOpenChange={(open) => {
          setHabitFormOpen(open)
          if (!open) setEditingHabit(null)
        }}
        onSubmit={handleAddHabit}
        editingHabit={editingHabit}
      />
    </div>
  )
}

export default Rotina
