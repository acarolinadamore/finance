import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Edit,
  Trash2,
  ExternalLink,
  Filter,
  X,
} from 'lucide-react';
import { useImportantDates } from '@/hooks/useImportantDates';
import { ImportantDateDialog } from '@/components/ImportantDateDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const DatasImportantes = () => {
  const {
    categories,
    dates,
    years,
    loading,
    error,
    fetchDates,
    createDate,
    updateDate,
    deleteDate,
  } = useImportantDates();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dateToEdit, setDateToEdit] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dateToDelete, setDateToDelete] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  // Combinar anos do banco com 2025 e 2026
  const allYears = [...new Set([2025, 2026, ...years])].sort((a, b) => b - a);

  useEffect(() => {
    fetchDates(selectedYear, selectedCategory, searchTerm);
  }, [selectedYear, selectedCategory, searchTerm]);

  const handleAddClick = () => {
    setDateToEdit(null);
    setDialogOpen(true);
  };

  const handleEditClick = (date: any) => {
    setDateToEdit(date);
    setDialogOpen(true);
  };

  const handleDeleteClick = (dateId: number) => {
    setDateToDelete(dateId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (dateToDelete) {
      try {
        await deleteDate(dateToDelete);
        setDeleteDialogOpen(false);
        setDateToDelete(null);
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy '('EEEE')'", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Datas Importantes</h1>
            <p className="text-muted-foreground text-sm">
              Registre momentos memoráveis e acontecimentos importantes
            </p>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Data
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Ano */}
            <Select
              value={selectedYear?.toString() || "all"}
              onValueChange={(value) => setSelectedYear(value === "all" ? undefined : parseInt(value))}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Todos os anos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                {allYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                      variant={isSelected ? "default" : "outline"}
                      style={{
                        backgroundColor: isSelected ? category.color : undefined,
                        borderColor: category.color,
                        color: isSelected ? "white" : category.color,
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

        {/* Lista de Datas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Histórico
            </CardTitle>
            <CardDescription>
              {dates.length} {dates.length === 1 ? 'data registrada' : 'datas registradas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : dates.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-muted-foreground mb-2">Nenhuma data registrada</p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || selectedYear || selectedCategory
                    ? 'Tente ajustar os filtros de busca'
                    : 'Adicione sua primeira data importante clicando no botão acima'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dates.map((date) => (
                  <div
                    key={date.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Cabeçalho */}
                        <div className="flex items-start gap-3">
                          <CalendarIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{date.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(date.date)}
                            </p>
                          </div>
                        </div>

                        {/* Tags */}
                        {date.tags && date.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pl-8">
                            {date.tags.map((tag: any) => (
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
                        {date.description && (
                          <p className="text-sm text-muted-foreground pl-8">
                            {date.description}
                          </p>
                        )}

                        {/* Link */}
                        {date.link && (
                          <div className="pl-8">
                            <a
                              href={date.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ver link relacionado
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(date)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(date.id)}
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
      <ImportantDateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        date={dateToEdit}
        categories={categories}
        onSave={createDate}
        onUpdate={updateDate}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir data importante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A data será permanentemente excluída.
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

export default DatasImportantes;
