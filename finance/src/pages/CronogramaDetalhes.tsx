import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, List, Calendar as CalendarIcon, GanttChart as GanttChartIcon } from 'lucide-react';
import { useCronograma } from '@/hooks/useCronogramas';

const CronogramaDetalhes = () => {
  const { id } = useParams<{ id: string }>();
  const cronogramaId = parseInt(id || '0');
  const { data: cronograma, isLoading } = useCronograma(cronogramaId);

  const [activeTab, setActiveTab] = useState('lista');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!cronograma) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cronograma não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/cronograma">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{cronograma.titulo}</h1>
            {cronograma.descricao && (
              <p className="text-muted-foreground text-sm">{cronograma.descricao}</p>
            )}
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Etapa
          </Button>
        </div>

        {/* Tabs de Visualização */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="lista" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="gantt" className="flex items-center gap-2">
              <GanttChartIcon className="h-4 w-4" />
              Gantt
            </TabsTrigger>
          </TabsList>

          {/* Visualização em Lista */}
          <TabsContent value="lista">
            <Card>
              <CardHeader>
                <CardTitle>Etapas do Projeto</CardTitle>
                <CardDescription>
                  {cronograma.etapas?.length || 0} {cronograma.etapas?.length === 1 ? 'etapa' : 'etapas'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!cronograma.etapas || cronograma.etapas.length === 0 ? (
                  <div className="text-center py-12">
                    <List className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-muted-foreground mb-2">Nenhuma etapa criada</p>
                    <p className="text-sm text-muted-foreground">
                      Adicione a primeira etapa clicando no botão acima
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cronograma.etapas.map((etapa) => (
                      <div
                        key={etapa.id}
                        className="border rounded-lg p-4"
                        style={{ borderLeftWidth: '4px', borderLeftColor: etapa.cor }}
                      >
                        <h4 className="font-semibold">{etapa.nome}</h4>
                        {etapa.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">{etapa.descricao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visualização em Calendário */}
          <TabsContent value="calendario">
            <Card>
              <CardHeader>
                <CardTitle>Visualização em Calendário</CardTitle>
                <CardDescription>
                  Veja as etapas distribuídas ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-muted-foreground mb-2">Visualização em Calendário</p>
                  <p className="text-sm text-muted-foreground">
                    Esta funcionalidade será implementada em breve
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Visualização Gantt */}
          <TabsContent value="gantt">
            <Card>
              <CardHeader>
                <CardTitle>Visualização Gantt</CardTitle>
                <CardDescription>
                  Linha do tempo com barras horizontais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <GanttChartIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-muted-foreground mb-2">Visualização Gantt</p>
                  <p className="text-sm text-muted-foreground">
                    Esta funcionalidade será implementada em breve
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CronogramaDetalhes;
