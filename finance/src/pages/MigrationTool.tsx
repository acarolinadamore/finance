import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Download, Upload, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { migrateLocalStorageToPostgreSQL, backupLocalStorage, clearLocalStorageData } from '@/utils/migrateData';
import { toast } from 'sonner';

const MigrationTool = () => {
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [backupData, setBackupData] = useState<string>('');

  const handleBackup = async () => {
    try {
      const backup = await backupLocalStorage();
      setBackupData(backup);

      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-finance-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Backup criado e baixado!');
    } catch (error) {
      toast.error('Erro ao criar backup');
      console.error(error);
    }
  };

  const handleMigrate = async () => {
    if (!confirm('Tem certeza que deseja migrar os dados do localStorage para PostgreSQL?')) {
      return;
    }

    setMigrating(true);
    try {
      const result = await migrateLocalStorageToPostgreSQL();
      setMigrationResult(result);

      if (result.errors.length === 0) {
        toast.success('Migração concluída com sucesso!');
      } else {
        toast.warning(`Migração concluída com ${result.errors.length} erros`);
      }
    } catch (error) {
      toast.error('Erro durante a migração');
      console.error(error);
    } finally {
      setMigrating(false);
    }
  };

  const handleClearLocalStorage = () => {
    if (!confirm('⚠️ ATENÇÃO! Isso vai apagar TODOS os dados do localStorage. Tem certeza?\n\nRecomendamos fazer backup primeiro!')) {
      return;
    }

    if (!confirm('ÚLTIMA CONFIRMAÇÃO: Os dados serão perdidos permanentemente se você não fez backup!')) {
      return;
    }

    clearLocalStorageData();
  };

  const checkLocalStorageData = () => {
    const routines = localStorage.getItem('routines-data');
    const habits = localStorage.getItem('habits-data-v1');
    const moods = localStorage.getItem('daily-mood-data-v2');

    return {
      routines: routines ? JSON.parse(routines).length : 0,
      habits: habits ? JSON.parse(habits).length : 0,
      moods: moods ? JSON.parse(moods).length : 0,
    };
  };

  const localData = checkLocalStorageData();
  const hasData = localData.routines > 0 || localData.habits > 0 || localData.moods > 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Ferramenta de Migração</h1>
            <p className="text-muted-foreground">localStorage → PostgreSQL</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Status do localStorage</CardTitle>
            <CardDescription>Dados atualmente armazenados localmente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Rotinas:</span>
                <span className="font-bold">{localData.routines}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Hábitos:</span>
                <span className="font-bold">{localData.habits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Registros de Humor:</span>
                <span className="font-bold">{localData.moods}</span>
              </div>
            </div>

            {!hasData && (
              <div className="mt-4 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  ✅ Nenhum dado no localStorage. Migração já realizada ou sem dados para migrar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                1. Backup (Recomendado)
              </CardTitle>
              <CardDescription>
                Crie um backup dos seus dados antes de migrar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleBackup} disabled={!hasData} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Fazer Backup (Download JSON)
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                2. Migrar para PostgreSQL
              </CardTitle>
              <CardDescription>
                Transferir dados do localStorage para o banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleMigrate}
                disabled={!hasData || migrating}
                className="w-full"
                variant="default"
              >
                {migrating ? 'Migrando...' : 'Iniciar Migração'}
              </Button>

              {migrationResult && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Resultado da Migração
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>✅ Rotinas: {migrationResult.routines}</p>
                    <p>✅ Hábitos: {migrationResult.habits}</p>
                    <p>✅ Completions: {migrationResult.habitCompletions}</p>
                    <p>✅ Humor: {migrationResult.moods}</p>

                    {migrationResult.errors.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="flex items-center gap-2 text-orange-600 font-medium">
                          <AlertCircle className="h-4 w-4" />
                          {migrationResult.errors.length} erros
                        </p>
                        <div className="mt-1 max-h-40 overflow-y-auto">
                          {migrationResult.errors.map((error: string, i: number) => (
                            <p key={i} className="text-xs text-muted-foreground">• {error}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                3. Limpar localStorage (Opcional)
              </CardTitle>
              <CardDescription>
                Após migrar com sucesso, você pode limpar os dados antigos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleClearLocalStorage}
                disabled={!hasData}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar localStorage
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1.</strong> Certifique-se de que o backend está rodando em http://localhost:3032</p>
            <p><strong>2.</strong> Faça um backup dos seus dados (recomendado)</p>
            <p><strong>3.</strong> Clique em "Iniciar Migração" para transferir os dados</p>
            <p><strong>4.</strong> Após confirmar que tudo funcionou, limpe o localStorage</p>
            <p><strong>5.</strong> Recarregue a página para começar a usar o PostgreSQL</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MigrationTool;
