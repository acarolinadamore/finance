import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Search,
  Sparkles,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  Filter,
  X,
} from 'lucide-react';
import {
  useProvidenciasGracas,
  useProvidenciaGracaCategories,
  useCreateProvidenciaGraca,
  useUpdateProvidenciaGraca,
  useDeleteProvidenciaGraca,
} from '@/hooks/useProvidenciasGracas';
import { ProvidenciaGracaDialog } from '@/components/ProvidenciaGracaDialog';
import type { ApiProvidenciaGraca } from '@/services/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CatolicoProvidencias = () => {
  const { data: items = [], isLoading } = useProvidenciasGracas();
  const { data: categories = [] } = useProvidenciaGracaCategories();
  const createMutation = useCreateProvidenciaGraca();
  const updateMutation = useUpdateProvidenciaGraca();
  const deleteMutation = useDeleteProvidenciaGraca();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ApiProvidenciaGraca | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  // Filtrar itens pela busca e categoria
  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filtrar por categoria
    if (selectedCategory) {
      filtered = filtered.filter((item) =>
        item.tags?.some((tag) => tag.id === selectedCategory)
      );
    }

    // Filtrar por busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.titulo.toLowerCase().includes(search) ||
          item.descricao?.toLowerCase().includes(search) ||
          item.providencia?.toLowerCase().includes(search) ||
          item.graca?.toLowerCase().includes(search) ||
          item.pedido?.toLowerCase().includes(search) ||
          item.intercessores?.toLowerCase().includes(search) ||
          item.tags?.some((tag) => tag.name.toLowerCase().includes(search))
        );
      });
    }

    return filtered;
  }, [items, searchTerm, selectedCategory]);

  const handleAddClick = () => {
    setItemToEdit(null);
    setDialogOpen(true);
  };

  const handleEditClick = (item: ApiProvidenciaGraca) => {
    setItemToEdit(item);
    setDialogOpen(true);
  };

  const handleDeleteClick = (itemId: number) => {
    setItemToDelete(itemId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await deleteMutation.mutateAsync(itemToDelete);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  const handleCreate = async (data: Omit<ApiProvidenciaGraca, 'id' | 'created_at' | 'updated_at'>) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (id: number, data: Partial<ApiProvidenciaGraca>) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy '('EEEE')'", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/catolico">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-amber-600" />
              Providência e Graças Recebidas
            </h1>
            <p className="text-muted-foreground text-sm">
              Registre as bênçãos e ações de Deus na sua vida
            </p>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {/* Filtros */}
        <div className="mb-6 space-y-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por título, descrição, área da vida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por Categoria */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Áreas da Vida</span>
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(undefined)}
                  className="h-6"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(isSelected ? undefined : category.id)}
                    className="transition-all"
                  >
                    <Badge
                      variant={isSelected ? 'default' : 'outline'}
                      style={{
                        backgroundColor: isSelected ? category.color : undefined,
                        borderColor: category.color,
                        color: isSelected ? 'white' : category.color,
                      }}
                      className="cursor-pointer hover:opacity-80"
                    >
                      {category.name}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lista */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Histórico
            </CardTitle>
            <CardDescription>
              {filteredItems.length} {filteredItems.length === 1 ? 'registro' : 'registros'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-muted-foreground mb-2">
                  {searchTerm || selectedCategory
                    ? 'Nenhum registro encontrado'
                    : 'Nenhuma providência ou graça registrada'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || selectedCategory
                    ? 'Tente ajustar os filtros de busca'
                    : 'Adicione seu primeiro registro clicando no botão acima'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          {/* Cabeçalho */}
                          <div className="flex items-start gap-3">
                            <CalendarIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{item.titulo}</h3>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(item.data)}
                              </p>
                            </div>
                          </div>

                          {/* Tags (Categorias) */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pl-8">
                              {item.tags.map((tag) => (
                                <Badge
                                  key={tag.id}
                                  variant="outline"
                                  style={{
                                    borderColor: tag.color,
                                    color: tag.color,
                                  }}
                                  className="text-xs"
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Descrição */}
                          {item.descricao && (
                            <p className="text-sm text-muted-foreground pl-8">{item.descricao}</p>
                          )}

                          {/* Providência */}
                          {item.providencia && (
                            <div className="pl-8">
                              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded border-l-4 border-amber-500">
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                                  🙏 Providência
                                </p>
                                <p className="text-sm text-foreground">{item.providencia}</p>
                              </div>
                            </div>
                          )}

                          {/* Graça */}
                          {item.graca && (
                            <div className="pl-8">
                              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded border-l-4 border-purple-500">
                                <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
                                  ✨ Graça Recebida
                                </p>
                                <p className="text-sm text-foreground">{item.graca}</p>
                              </div>
                            </div>
                          )}

                          {/* Pedido relacionado */}
                          {item.pedido && (
                            <div className="pl-8 text-sm">
                              <span className="font-medium text-muted-foreground">Pedido relacionado:</span>{' '}
                              <span className="italic">{item.pedido}</span>
                            </div>
                          )}

                          {/* Intercessores */}
                          {item.intercessores && (
                            <div className="pl-8 text-sm">
                              <span className="font-medium text-muted-foreground">Intercessores:</span>{' '}
                              <span>{item.intercessores}</span>
                            </div>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(item)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(item.id)}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog de Adicionar/Editar */}
      <ProvidenciaGracaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={itemToEdit}
        categories={categories}
        onSave={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O registro será permanentemente excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CatolicoProvidencias;
