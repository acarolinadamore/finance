import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, GanttChart, Calendar as CalendarIcon, Pencil, Trash2, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCronogramas, useCreateCronograma, useUpdateCronograma, useDeleteCronograma, useCronogramaEtapas, useCreateCronogramaEtapa, useUpdateCronogramaEtapa } from '@/hooks/useCronogramas';
import { CronogramaDialog } from '@/components/CronogramaDialog';
import { EtapaDialog } from '@/components/EtapaDialog';
import { PageHeader } from '@/components/PageHeader';
import type { ApiCronograma } from '@/services/api';
import {
  format,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Cronograma = () => {
  const { data: cronogramas = [], isLoading } = useCronogramas();
  const { data: etapas = [] } = useCronogramaEtapas();
  const createMutation = useCreateCronograma();
  const updateMutation = useUpdateCronograma();
  const deleteMutation = useDeleteCronograma();
  const createEtapaMutation = useCreateCronogramaEtapa();
  const updateEtapaMutation = useUpdateCronogramaEtapa();

  const [activeTab, setActiveTab] = useState('calendario');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cronogramaToEdit, setCronogramaToEdit] = useState<ApiCronograma | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cronogramaToDelete, setCronogramaToDelete] = useState<number | null>(null);
  const [etapaDialogOpen, setEtapaDialogOpen] = useState(false);
  const [selectedCronogramaForEtapa, setSelectedCronogramaForEtapa] = useState<ApiCronograma | null>(null);

  const handleAddClick = () => {
    setCronogramaToEdit(null);
    setDialogOpen(true);
  };

  const handleEditClick = (cronograma: ApiCronograma) => {
    setCronogramaToEdit(cronograma);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setCronogramaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCreate = async (data: Omit<ApiCronograma, 'id' | 'created_at' | 'updated_at' | 'total_etapas' | 'etapas_concluidas' | 'etapas'>) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (id: number, data: Partial<ApiCronograma>) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const handleDeleteConfirm = async () => {
    if (cronogramaToDelete) {
      try {
        await deleteMutation.mutateAsync(cronogramaToDelete);
        setDeleteDialogOpen(false);
        setCronogramaToDelete(null);
      } catch (error) {
        console.error('Erro ao excluir cronograma:', error);
      }
    }
  };

  const handleAddEtapaClick = (cronograma: ApiCronograma) => {
    setSelectedCronogramaForEtapa(cronograma);
    setEtapaDialogOpen(true);
  };

  const handleCreateEtapa = async (cronogramaId: number, data: any) => {
    await createEtapaMutation.mutateAsync({ cronogramaId, data });
  };

  const handleUpdateEtapa = async (id: number, data: any) => {
    await updateEtapaMutation.mutateAsync({ id, data });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { label: 'Ativo', variant: 'default' as const },
      futuro: { label: 'Futuro', variant: 'secondary' as const },
      concluido: { label: 'Concluído', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const calculateProgress = (etapas_concluidas: number, total_etapas: number) => {
    if (total_etapas === 0) return 0;
    return (etapas_concluidas / total_etapas) * 100;
  };

  // Funções do calendário
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  // Calcular dias do calendário
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Cronograma"
        actions={
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cronograma
          </Button>
        }
      />
      <main className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Tabs de Visualização */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="calendario" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="gantt" className="flex items-center gap-2">
              <GanttChart className="h-4 w-4" />
              Gantt
            </TabsTrigger>
            <TabsTrigger value="lista" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          {/* Tab Lista */}
          <TabsContent value="lista">
            <Card>
              <CardHeader>
                <CardTitle>Seus Cronogramas</CardTitle>
                <CardDescription>
                  {cronogramas.length} {cronogramas.length === 1 ? 'cronograma' : 'cronogramas'}
                </CardDescription>
              </CardHeader>
              <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : cronogramas.length === 0 ? (
              <div className="text-center py-12">
                <GanttChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-muted-foreground mb-2">Nenhum cronograma criado</p>
                <p className="text-sm text-muted-foreground">
                  Crie seu primeiro cronograma clicando no botão acima
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cronogramas.map((cronograma) => {
                  const totalDias = differenceInDays(
                    new Date(cronograma.data_termino),
                    new Date(cronograma.data_inicio)
                  );
                  const progress = calculateProgress(
                    cronograma.etapas_concluidas || 0,
                    cronograma.total_etapas || 0
                  );

                  return (
                    <div
                      key={cronograma.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Título e Status */}
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-lg">{cronograma.titulo}</h3>
                            {getStatusBadge(cronograma.status)}
                          </div>

                          {/* Descrição */}
                          {cronograma.descricao && (
                            <p className="text-sm text-muted-foreground">{cronograma.descricao}</p>
                          )}

                          {/* Período */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">Período:</span>
                            <span className="text-muted-foreground">
                              {format(new Date(cronograma.data_inicio), "dd 'de' MMMM", {
                                locale: ptBR,
                              })}{' '}
                              →{' '}
                              {format(new Date(cronograma.data_termino), "dd 'de' MMMM 'de' yyyy", {
                                locale: ptBR,
                              })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({totalDias} dias)
                            </span>
                          </div>

                          {/* Progresso das Etapas */}
                          {cronograma.total_etapas && cronograma.total_etapas > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Etapas: {cronograma.etapas_concluidas || 0} /{' '}
                                  {cronograma.total_etapas}
                                </span>
                                <span className="text-muted-foreground">{Math.round(progress)}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>
                          )}

                          {/* Botão Adicionar Etapa */}
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddEtapaClick(cronograma)}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Etapa
                            </Button>
                          </div>
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(cronograma)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(cronograma.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Calendário */}
          <TabsContent value="calendario">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-2xl font-bold capitalize min-w-[200px] text-center">
                      {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                    </h2>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  <Button variant="outline" onClick={goToToday}>
                    Hoje
                  </Button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    const isCurrentMonthDay = isSameMonth(day, currentMonth);

                    // Encontrar todas as etapas que passam por este dia
                    const etapasNesteDia = etapas.filter((etapa) => {
                      const etapaStart = new Date(etapa.data_inicio);
                      const etapaEnd = new Date(etapa.data_termino);
                      return isWithinInterval(day, { start: etapaStart, end: etapaEnd });
                    });

                    return (
                      <div
                        key={format(day, 'yyyy-MM-dd')}
                        className={`
                          border rounded p-2 aspect-square flex flex-col
                          ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-background'}
                          ${!isCurrentMonthDay ? 'opacity-40' : ''}
                        `}
                      >
                        <div className={`text-sm mb-auto ${isToday ? 'font-bold text-blue-600' : ''}`}>
                          {format(day, 'd')}
                        </div>

                        {/* Linhas horizontais para cada etapa neste dia */}
                        <div className="flex flex-col gap-1 mt-auto">
                          {etapasNesteDia.map((etapa) => (
                            <div
                              key={etapa.id}
                              className="h-1 rounded-full w-full"
                              style={{ backgroundColor: etapa.cor }}
                              title={`${etapa.nome} (${etapa.cronograma_titulo})`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legenda */}
                <div className="mt-6 space-y-2">
                  <h3 className="font-semibold text-sm">Projetos visíveis neste mês:</h3>
                  <div className="flex flex-wrap gap-3">
                    {etapas
                      .filter((etapa) => {
                        const etapaStart = new Date(etapa.data_inicio);
                        const etapaEnd = new Date(etapa.data_termino);
                        return isWithinInterval(etapaStart, { start: calendarStart, end: calendarEnd }) ||
                               isWithinInterval(etapaEnd, { start: calendarStart, end: calendarEnd }) ||
                               (etapaStart < calendarStart && etapaEnd > calendarEnd);
                      })
                      .map((etapa) => (
                        <div key={etapa.id} className="flex items-center gap-2 text-sm">
                          <div
                            className="w-4 h-1 rounded-full"
                            style={{ backgroundColor: etapa.cor }}
                          />
                          <span className="font-medium">{etapa.nome}</span>
                          <span className="text-muted-foreground">({etapa.cronograma_titulo})</span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Gantt */}
          <TabsContent value="gantt">
            <Card>
              <CardHeader>
                <CardTitle>Visualização Gantt</CardTitle>
                <CardDescription>
                  {etapas.length} {etapas.length === 1 ? 'etapa' : 'etapas'} de {cronogramas.length} {cronogramas.length === 1 ? 'projeto' : 'projetos'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {etapas.length === 0 ? (
                  <div className="text-center py-12">
                    <GanttChart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-muted-foreground mb-2">Nenhuma etapa para exibir</p>
                    <p className="text-sm text-muted-foreground">
                      Crie cronogramas e adicione etapas para visualizá-las no Gantt
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Agrupado por projeto */}
                    {cronogramas.map((cronograma) => {
                      const etapasDoCronograma = etapas.filter(
                        (e) => e.cronograma_id === cronograma.id
                      );

                      if (etapasDoCronograma.length === 0) return null;

                      // Encontrar data mínima e máxima
                      const datasInicio = etapasDoCronograma.map((e) => new Date(e.data_inicio).getTime());
                      const datasTermino = etapasDoCronograma.map((e) => new Date(e.data_termino).getTime());
                      const dataMinima = Math.min(...datasInicio, new Date(cronograma.data_inicio).getTime());
                      const dataMaxima = Math.max(...datasTermino, new Date(cronograma.data_termino).getTime());
                      const duracaoTotal = differenceInDays(new Date(dataMaxima), new Date(dataMinima)) || 1;

                      return (
                        <div key={cronograma.id} className="border rounded-lg p-4">
                          <h3 className="font-semibold mb-4 flex items-center gap-2">
                            {cronograma.titulo}
                            {getStatusBadge(cronograma.status)}
                          </h3>
                          <div className="space-y-3">
                            {etapasDoCronograma
                              .sort((a, b) => new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime())
                              .map((etapa) => {
                                const inicio = new Date(etapa.data_inicio).getTime();
                                const termino = new Date(etapa.data_termino).getTime();
                                const offset = differenceInDays(new Date(inicio), new Date(dataMinima));
                                const duracao = differenceInDays(new Date(termino), new Date(inicio)) + 1;

                                // Calcular posição e largura em porcentagem
                                const offsetPercent = (offset / duracaoTotal) * 100;
                                const larguraPercent = (duracao / duracaoTotal) * 100;

                                return (
                                  <div key={etapa.id} className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="w-40 truncate" title={etapa.nome}>
                                        {etapa.nome}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {format(new Date(etapa.data_inicio), 'dd/MM')} - {format(new Date(etapa.data_termino), 'dd/MM')}
                                      </span>
                                    </div>
                                    <div className="relative h-8 bg-muted rounded">
                                      <div
                                        className="absolute h-full rounded flex items-center px-2 text-xs text-white font-medium"
                                        style={{
                                          left: `${offsetPercent}%`,
                                          width: `${larguraPercent}%`,
                                          backgroundColor: etapa.cor,
                                          minWidth: '40px',
                                        }}
                                        title={`${etapa.nome}: ${duracao} ${duracao === 1 ? 'dia' : 'dias'}`}
                                      >
                                        <span className="truncate">{duracao}d</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{format(new Date(dataMinima), "dd 'de' MMM", { locale: ptBR })}</span>
                            <span>{format(new Date(dataMaxima), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog de Adicionar/Editar */}
      <CronogramaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cronograma={cronogramaToEdit}
        onSave={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cronograma?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O cronograma e todas as suas etapas serão
              permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Adicionar Etapa */}
      {selectedCronogramaForEtapa && (
        <EtapaDialog
          open={etapaDialogOpen}
          onOpenChange={setEtapaDialogOpen}
          cronogramaId={selectedCronogramaForEtapa.id}
          cronogramaTitulo={selectedCronogramaForEtapa.titulo}
          onSave={handleCreateEtapa}
          onUpdate={handleUpdateEtapa}
        />
      )}
    </div>
  );
};

export default Cronograma;
