import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [tokenSent, setTokenSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3032/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setTokenSent(true);
        setResetToken(data.token || '');

        toast({
          title: 'Token gerado!',
          description: 'Use o token abaixo para redefinir sua senha',
        });
      } else {
        toast({
          title: 'Erro',
          description: data.error || 'Tente novamente',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar reset:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao conectar com o servidor',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(resetToken);
    toast({
      title: 'Token copiado!',
      description: 'Cole na próxima tela',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mt-4 mb-2">
            <h1
              className="text-6xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Ordena
            </h1>
          </div>
          <CardTitle className="text-2xl text-center">Esqueceu sua senha?</CardTitle>
          <CardDescription className="text-center">
            {tokenSent
              ? 'Token gerado com sucesso!'
              : 'Digite seu email para receber um token de recuperação'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!tokenSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600"
                disabled={isLoading}
              >
                {isLoading ? 'Gerando token...' : 'Gerar token de recuperação'}
              </Button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-sky-600 hover:text-sky-700 hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Token gerado com sucesso! Copie o token abaixo e use na próxima tela.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Seu token de recuperação</Label>
                <div className="flex gap-2">
                  <Input
                    value={resetToken}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={copyToken}
                  >
                    Copiar
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Token válido por 1 hora
                </p>
              </div>

              <Link to="/reset-password">
                <Button className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600">
                  Ir para redefinir senha
                </Button>
              </Link>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-sky-600 hover:text-sky-700 hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para login
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
