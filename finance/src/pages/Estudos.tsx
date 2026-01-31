import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';

const Estudos = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Estudos" />
      <main className="container mx-auto px-4 py-6 max-w-6xl">

        <Card>
          <CardHeader>
            <CardTitle>Gestão de Estudos</CardTitle>
            <CardDescription>
              Acompanhe seus cursos online, certificações e progresso nos estudos
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Módulo em desenvolvimento
            </p>
            <p className="text-sm text-muted-foreground">
              Em breve você poderá organizar seus cursos e estudos aqui
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Estudos;
