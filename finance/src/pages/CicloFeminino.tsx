import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Settings, Plus, AlertCircle } from 'lucide-react';
import { CycleStats } from '@/components/CycleStats';
import { CycleReports } from '@/components/CycleReports';
import { CycleRecordDialog } from '@/components/CycleRecordDialog';
import { CycleSettingsDialog } from '@/components/CycleSettingsDialog';
import { CycleRecordsList } from '@/components/CycleRecordsList';
import { useCycleSettings, useCycleRecordByDate } from '@/hooks/useCycle';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CicloFeminino = () => {
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const { data: settings, isLoading, error } = useCycleSettings();
  const { data: existingRecord } = useCycleRecordByDate(selectedDate);

  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const todayISO = format(new Date(), 'yyyy-MM-dd');

  const handleRegisterToday = () => {
    setSelectedDate('');
    setRecordDialogOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-xl font-semibold">Erro de Conexão</h2>
              <p className="text-muted-foreground">
                Não foi possível conectar ao servidor. Certifique-se de que o backend está rodando em{' '}
                <code className="bg-muted px-2 py-1 rounded">http://localhost:3032</code>
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Link to="/">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
              </div>
            </div>
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
              <h1 className="text-3xl font-bold">Ciclo Feminino</h1>
              <p className="text-muted-foreground capitalize">{today}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSettingsDialogOpen(true)}
              title="Configurações"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <Button onClick={handleRegisterToday}>
              <Plus className="h-5 w-5 mr-2" />
              Registrar Dia de Fluxo
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : !settings ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Configure seu ciclo</h3>
                  <p className="text-muted-foreground">
                    Para começar, informe a data do primeiro dia da sua última menstruação
                  </p>
                </div>
                <Button onClick={() => setSettingsDialogOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Abrir Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="resumo" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
            </TabsList>

            <TabsContent value="resumo" className="space-y-6">
              <CycleStats />

              <CycleRecordsList onRegisterClick={handleRegisterToday} />
            </TabsContent>

            <TabsContent value="relatorios" className="space-y-6">
              <CycleReports />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <CycleRecordDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        date={selectedDate}
        existingRecord={existingRecord}
      />

      <CycleSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />
    </div>
  );
};

export default CicloFeminino;
