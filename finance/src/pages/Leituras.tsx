import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const Leituras = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Leituras</h1>
            <p className="text-muted-foreground text-sm">
              Acompanhe seus livros e progresso de leitura
            </p>
          </div>
        </div>

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
