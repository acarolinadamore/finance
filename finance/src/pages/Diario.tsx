import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const Diario = () => {
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
            <h1 className="text-3xl font-bold">Diário</h1>
            <p className="text-muted-foreground text-sm">
              Registre seus pensamentos e sentimentos
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Diário Pessoal</CardTitle>
            <CardDescription>
              Escreva sobre seu dia e reflita sobre suas experiências
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Módulo em desenvolvimento
            </p>
            <p className="text-sm text-muted-foreground">
              Em breve você poderá escrever suas reflexões diárias aqui
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Diario;
