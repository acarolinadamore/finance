import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';

const Peso = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Peso" />
      <main className="container mx-auto px-4 py-6 max-w-6xl">

        <Card>
          <CardHeader>
            <CardTitle>Registro de Peso</CardTitle>
            <CardDescription>
              Acompanhe seu peso e veja gráficos de evolução
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Módulo em desenvolvimento
            </p>
            <p className="text-sm text-muted-foreground">
              Em breve você poderá registrar e acompanhar seu peso aqui
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Peso;
