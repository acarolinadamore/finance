import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Smile, AlertCircle } from 'lucide-react';
import { useRoutines, useCreateRoutine, useUpdateRoutine, useDeleteRoutine } from '@/hooks/useApiRoutines';
import { useHabits, useCreateHabit, useUpdateHabit, useDeleteHabit, useArchiveHabit } from '@/hooks/useApiHabits';
import { useMoods, useUpsertMood, useDeleteMood } from '@/hooks/useApiMoods';
import { RoutineCard } from '@/components/RoutineCard';
import { RoutineFormDialog } from '@/components/RoutineFormDialog';
import { MoodSelector } from '@/components/MoodSelector';
import { DayRatingSlider } from '@/components/DayRatingSlider';
import { MoodDetailsDialog } from '@/components/MoodDetailsDialog';
import { HabitGrid } from '@/components/HabitGrid';
import { HabitFormDialog } from '@/components/HabitFormDialog';
import { HabitMetrics } from '@/components/HabitMetrics';
import { Period, PERIOD_LABELS, EMOTIONS } from '@/types/routine';
import { format, addMonths, subMonths, getDaysInMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Rotina = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  const { data: routines = [], isLoading: routinesLoading, error: routinesError } = useRoutines();
  const { data: habits = [], isLoading: habitsLoading } = useHabits();
  const { data: moods = [] } = useMoods();

  const createRoutineMutation = useCreateRoutine();
  const updateRoutineMutation = useUpdateRoutine();
  const deleteRoutineMutation = useDeleteRoutine();

  const createHabitMutation = useCreateHabit();
  const updateHabitMutation = useUpdateHabit();
  const deleteHabitMutation = useDeleteHabit();
  const archiveHabitMutation = useArchiveHabit();

  const upsertMoodMutation = useUpsertMood();
  const deleteMoodMutation = useDeleteMood();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | undefined>();

  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [dayRating, setDayRating] = useState<number>(3);
  const [moodNotes, setMoodNotes] = useState<string>('');

  const [moodDialogOpen, setMoodDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [habitMonth, setHabitMonth] = useState(new Date());
  const [showArchivedHabits, setShowArchivedHabits] = useState(false);

  const [activeTab, setActiveTab] = useState('tarefas');

  const todayMood = moods.find(m => m.mood_date === today);

  useEffect(() => {
    if (todayMood) {
      setSelectedEmotions(todayMood.emotion_ids || []);
      setDayRating(todayMood.day_rating ?? 3);
      setMoodNotes(todayMood.notes || '');
    }
  }, [todayMood]);

  const handleAddRoutine = async (routineData: any) => {
    if (editingRoutine) {
      await updateRoutineMutation.mutateAsync({
        id: editingRoutine.id,
        data: {
          name: routineData.name,
          period: routineData.period,
          frequency: routineData.frequency,
          specific_days: routineData.specificDays,
          times_per_week: routineData.timesPerWeek,
          icon: routineData.icon,
          color: routineData.color,
          add_to_habit_tracking: routineData.addToHabitTracking,
        }
      });
      setEditingRoutine(null);
    } else {
      await createRoutineMutation.mutateAsync({
        name: routineData.name,
        period: routineData.period,
        frequency: routineData.frequency || 'daily',
        specific_days: routineData.specificDays,
        times_per_week: routineData.timesPerWeek,
        icon: routineData.icon,
        color: routineData.color || '#8b5cf6',
        add_to_habit_tracking: routineData.addToHabitTracking || false,
      });
    }
    setIsFormOpen(false);
  };

  const handleEdit = (routine: any) => {
    setEditingRoutine(routine);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir esta rotina?')) {
      await deleteRoutineMutation.mutateAsync(id);
    }
  };

  const handleOpenForm = (period?: Period) => {
    setSelectedPeriod(period);
    setEditingRoutine(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingRoutine(null);
    setSelectedPeriod(undefined);
  };

  const handleToggleEmotion = (emotionId: string) => {
    setSelectedEmotions((prev) => {
      if (prev.includes(emotionId)) {
        return prev.filter((id) => id !== emotionId);
      }
      return [...prev, emotionId];
    });
  };

  const handleSaveMood = async () => {
    await upsertMoodMutation.mutateAsync({
      mood_date: today,
      emotion_ids: selectedEmotions,
      day_rating: dayRating,
      notes: moodNotes || undefined,
    });
  };

  const handleDeleteMood = async (date: string) => {
    await deleteMoodMutation.mutateAsync(date);
  };

  const handleAddHabit = async (habitData: any) => {
    if (editingHabit) {
      await updateHabitMutation.mutateAsync({
        id: editingHabit.id,
        data: {
          name: habitData.name,
          period: habitData.period,
          frequency: habitData.frequency,
          specific_days: habitData.specificDays,
          times_per_week: habitData.timesPerWeek,
          start_date: habitData.startDate,
          end_date: habitData.endDate,
          icon: habitData.icon,
          color: habitData.color,
        }
      });
      setEditingHabit(null);
    } else {
      await createHabitMutation.mutateAsync({
        name: habitData.name,
        period: habitData.period,
        frequency: habitData.frequency,
        specific_days: habitData.specificDays,
        times_per_week: habitData.timesPerWeek,
        start_date: habitData.startDate,
        end_date: habitData.endDate,
        icon: habitData.icon,
        color: habitData.color || '#8b5cf6',
      });
    }
    setHabitFormOpen(false);
  };

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit);
    setHabitFormOpen(true);
  };

  const handleArchiveHabit = async (habitId: string) => {
    await archiveHabitMutation.mutateAsync(habitId);
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (confirm('Deseja realmente excluir este hábito? O histórico será perdido.')) {
      await deleteHabitMutation.mutateAsync(habitId);
    }
  };

  const filteredHabits = showArchivedHabits ? habits : habits.filter((h) => h.is_active);

  const habitMetrics = useMemo(() => {
    const metrics: Record<string, { progress: number; currentStreak: number; bestStreak: number }> = {};
    filteredHabits.forEach((habit) => {
      metrics[habit.id!] = {
        progress: 0,
        currentStreak: 0,
        bestStreak: 0,
      };
    });
    return metrics;
  }, [filteredHabits]);

  const getRoutinesByPeriod = (period: Period) => {
    return routines.filter(r => r.period === period && r.is_active !== false);
  };

  const renderPeriodColumn = (period: Period) => {
    const periodRoutines = getRoutinesByPeriod(period);
    const { label, emoji, color } = PERIOD_LABELS[period];

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
            <div className="space-y-2">
              {periodRoutines.map((routine) => (
                <RoutineCard
                  key={routine.id}
                  routine={routine as any}
                  isCompleted={false}
                  onToggle={() => {}}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

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
              Não foi possível conectar ao servidor. Certifique-se de que o backend está rodando em:
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
            <Link to="/migration">
              <Button className="w-full mt-4">
                Ir para Ferramenta de Migração
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
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
              <h1 className="text-3xl font-bold">Rotina & Hábitos</h1>
              <p className="text-muted-foreground text-sm capitalize">
                {formattedDate}
              </p>
            </div>
          </div>
          <Link to="/migration">
            <Button variant="outline" size="sm">
              Ferramenta de Migração
            </Button>
          </Link>
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
              <span className="text-2xl font-bold text-primary">0%</span>
            </div>
            <Progress value={0} className="h-3" />
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="tarefas">Tarefas do Dia</TabsTrigger>
            <TabsTrigger value="habitos">Hábitos</TabsTrigger>
            <TabsTrigger value="humor">Humor</TabsTrigger>
          </TabsList>

          <TabsContent value="tarefas">
            {routinesLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando rotinas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {renderPeriodColumn('morning')}
                {renderPeriodColumn('afternoon')}
                {renderPeriodColumn('night')}
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
                      {showArchivedHabits ? 'Ocultar Arquivados' : 'Mostrar Arquivados'}
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
                      habits={filteredHabits as any}
                      currentMonth={habitMonth}
                      isCompleted={() => false}
                      isExpectedDay={() => true}
                      onToggle={() => {}}
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

                <DayRatingSlider value={dayRating} onValueChange={setDayRating} />

                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Observações <span className="text-muted-foreground">(opcional)</span>
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
                      Última atualização:{' '}
                      {todayMood.updated_at && format(new Date(todayMood.updated_at), "HH:mm", { locale: ptBR })}
                    </p>
                    {todayMood.emotion_ids && todayMood.emotion_ids.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {todayMood.emotion_ids.map((emotionId) => {
                          const emotion = EMOTIONS.find((e) => e.id === emotionId);
                          if (!emotion) return null;
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
                          );
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
        mood={todayMood as any}
        onSave={async (date, emotionIds, dayRating, notes) => {
          await upsertMoodMutation.mutateAsync({
            mood_date: date,
            emotion_ids: emotionIds,
            day_rating: dayRating,
            notes,
          });
        }}
        onDelete={handleDeleteMood}
      />

      <HabitFormDialog
        open={habitFormOpen}
        onOpenChange={(open) => {
          setHabitFormOpen(open);
          if (!open) setEditingHabit(null);
        }}
        onSubmit={handleAddHabit}
        editingHabit={editingHabit}
      />
    </div>
  );
};

export default Rotina;
