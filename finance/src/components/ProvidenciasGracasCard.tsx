import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useProvidenciasGracas,
  useCreateProvidenciaGraca,
  useUpdateProvidenciaGraca,
  useDeleteProvidenciaGraca,
} from '@/hooks/useProvidenciasGracas';
import { ProvidenciaGracaDialog } from './ProvidenciaGracaDialog';
import type { ApiProvidenciaGraca } from '@/services/api';

export function ProvidenciasGracasCard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiProvidenciaGraca | null>(null);

  const { data: items = [], isLoading } = useProvidenciasGracas();
  const createMutation = useCreateProvidenciaGraca();
  const updateMutation = useUpdateProvidenciaGraca();
  const deleteMutation = useDeleteProvidenciaGraca();

  const handleCreate = async (data: Omit<ApiProvidenciaGraca, 'id' | 'created_at' | 'updated_at'>) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (id: number, data: Partial<ApiProvidenciaGraca>) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir este registro?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleEdit = (item: ApiProvidenciaGraca) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleOpenDialog = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-950 dark:to-yellow-950">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Providência e Graças Recebidas
              </CardTitle>
              <CardDescription className="mt-1">
                Registre as bênçãos e ações de Deus na sua vida
              </CardDescription>
            </div>
            <Button onClick={handleOpenDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                Ainda não há registros de providências ou graças recebidas
              </p>
              <Button onClick={handleOpenDialog} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeira Providência/Graça
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3">
                          <h3 className="font-semibold text-lg">{item.titulo}</h3>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(item.data), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>

                        {item.area_vida && (
                          <div className="mt-1">
                            <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                              {item.area_vida}
                            </span>
                          </div>
                        )}

                        {item.descricao && (
                          <p className="text-sm text-muted-foreground mt-2">{item.descricao}</p>
                        )}

                        {item.providencia && (
                          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded border-l-4 border-amber-500">
                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                              🙏 Providência
                            </p>
                            <p className="text-sm text-foreground">{item.providencia}</p>
                          </div>
                        )}

                        {item.graca && (
                          <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded border-l-4 border-purple-500">
                            <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
                              ✨ Graça Recebida
                            </p>
                            <p className="text-sm text-foreground">{item.graca}</p>
                          </div>
                        )}

                        {item.pedido && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-muted-foreground">Pedido relacionado:</span>{' '}
                            <span className="italic">{item.pedido}</span>
                          </div>
                        )}

                        {item.intercessores && (
                          <div className="mt-1 text-sm">
                            <span className="font-medium text-muted-foreground">Intercessores:</span>{' '}
                            <span>{item.intercessores}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(item)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(item.id)}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ProvidenciaGracaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        onSave={handleCreate}
        onUpdate={handleUpdate}
      />
    </>
  );
}
