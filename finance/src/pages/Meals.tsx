import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Search, BarChart3 } from 'lucide-react';
import { useMeals } from '@/hooks/useMeals';
import { MealCard } from '@/components/MealCard';
import { MealFormDialog } from '@/components/MealFormDialog';
import { Meal, MEAL_TYPE_LABELS } from '@/types/meals';
import { toast } from 'sonner';

const Meals = () => {
  const { meals, addMeal, updateMeal, deleteMeal } = useMeals();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMealType, setFilterMealType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  const handleAddMeal = (mealData: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => {
    addMeal(mealData);
    toast.success('Refeição registrada com sucesso!');
  };

  const handleUpdateMeal = (mealData: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMeal) {
      updateMeal(editingMeal.id, mealData);
      toast.success('Refeição atualizada com sucesso!');
      setEditingMeal(null);
    }
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir esta refeição?')) {
      deleteMeal(id);
      toast.success('Refeição excluída com sucesso!');
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMeal(null);
  };

  // Filtrar refeições
  const filteredMeals = meals.filter((meal) => {
    const matchesSearch =
      searchTerm === '' ||
      meal.foodItems.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      meal.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterMealType === 'all' || meal.mealType === filterMealType;

    return matchesSearch && matchesType;
  });

  // Agrupar por data
  const groupMealsByDate = (meals: Meal[]) => {
    const groups: Record<string, Meal[]> = {};
    meals.forEach((meal) => {
      if (!groups[meal.date]) {
        groups[meal.date] = [];
      }
      groups[meal.date].push(meal);
    });
    // Ordenar por data (mais recente primeiro)
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  };

  const groupedMeals = groupMealsByDate(filteredMeals);

  // Estatísticas rápidas
  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter((m) => m.date === today);
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisWeekMeals = meals.filter(
    (m) => new Date(m.date) >= thisWeekStart
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Registro de Refeições</h1>
              <p className="text-muted-foreground text-sm">
                Acompanhe o que você come e como se sente
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/meals/reports">
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
            </Link>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Refeição
            </Button>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90">Hoje</p>
            <p className="text-3xl font-bold">{todayMeals.length}</p>
            <p className="text-sm opacity-90">
              {todayMeals.length === 1 ? 'refeição' : 'refeições'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90">Esta Semana</p>
            <p className="text-3xl font-bold">{thisWeekMeals.length}</p>
            <p className="text-sm opacity-90">
              {thisWeekMeals.length === 1 ? 'refeição' : 'refeições'}
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90">Total</p>
            <p className="text-3xl font-bold">{meals.length}</p>
            <p className="text-sm opacity-90">
              {meals.length === 1 ? 'refeição' : 'refeições'}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-lg border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por alimento ou nota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterMealType} onValueChange={setFilterMealType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tipo de refeição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as refeições</SelectItem>
                {Object.entries(MEAL_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs para visualizações */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="week">Esta Semana</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {groupedMeals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhuma refeição encontrada
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Primeira Refeição
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedMeals.map(([date, dateMeals]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-2">
                      {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dateMeals
                        .sort((a, b) => b.time.localeCompare(a.time))
                        .map((meal) => (
                          <MealCard
                            key={meal.id}
                            meal={meal}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="today">
            {todayMeals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhuma refeição registrada hoje
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Refeição
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayMeals
                  .sort((a, b) => b.time.localeCompare(a.time))
                  .map((meal) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="week">
            {thisWeekMeals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhuma refeição registrada esta semana
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Refeição
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {groupMealsByDate(thisWeekMeals).map(([date, dateMeals]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold mb-3">
                      {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dateMeals
                        .sort((a, b) => b.time.localeCompare(a.time))
                        .map((meal) => (
                          <MealCard
                            key={meal.id}
                            meal={meal}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Form Dialog */}
      <MealFormDialog
        open={isFormOpen}
        onOpenChange={handleCloseForm}
        onSubmit={editingMeal ? handleUpdateMeal : handleAddMeal}
        editingMeal={editingMeal}
      />
    </div>
  );
};

export default Meals;
