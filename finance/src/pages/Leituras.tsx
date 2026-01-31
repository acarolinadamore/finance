import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/PageHeader';

const Leituras = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Leituras" />
      <main className="container mx-auto px-4 py-6 max-w-6xl">

        <Card>
          <CardHeader>
            <CardTitle>Biblioteca de Leituras</CardTitle>
            <CardDescription>
              Gerencie sua lista de livros e acompanhe seu progresso de leitura
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Módulo em desenvolvimento
            </p>
            <p className="text-sm text-muted-foreground">
              Em breve você poderá acompanhar suas leituras aqui
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leituras;
