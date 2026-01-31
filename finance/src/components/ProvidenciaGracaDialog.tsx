import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ApiProvidenciaGraca, ApiProvidenciaGracaCategory } from '@/services/api';

interface ProvidenciaGracaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ApiProvidenciaGraca | null;
  categories: ApiProvidenciaGracaCategory[];
  onSave: (data: Omit<ApiProvidenciaGraca, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onUpdate?: (id: number, data: Partial<ApiProvidenciaGraca>) => Promise<void>;
}

export function ProvidenciaGracaDialog({
  open,
  onOpenChange,
  item: existingItem,
  categories,
  onSave,
  onUpdate,
}: ProvidenciaGracaDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateInputValue, setDateInputValue] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [providencia, setProvidencia] = useState('');
  const [graca, setGraca] = useState('');
  const [pedido, setPedido] = useState('');
  const [intercessores, setIntercessores] = useState('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && existingItem) {
      const date = new Date(existingItem.data);
      setSelectedDate(date);
      setDateInputValue(format(date, 'dd/MM/yyyy'));
      setTitulo(existingItem.titulo);
      setDescricao(existingItem.descricao || '');
      setProvidencia(existingItem.providencia || '');
      setGraca(existingItem.graca || '');
      setPedido(existingItem.pedido || '');
      setIntercessores(existingItem.intercessores || '');
      setSelectedTags(existingItem.tags?.map((t) => t.id) || []);
    } else if (open && !existingItem) {
      const today = new Date();
      setSelectedDate(today);
      setDateInputValue(format(today, 'dd/MM/yyyy'));
      setTitulo('');
      setDescricao('');
      setProvidencia('');
      setGraca('');
      setPedido('');
      setIntercessores('');
      setSelectedTags([]);
    }
  }, [open, existingItem]);

  const handleToggleTag = (categoryId: number) => {
    if (selectedTags.includes(categoryId)) {
      setSelectedTags(selectedTags.filter((id) => id !== categoryId));
    } else {
      setSelectedTags([...selectedTags, categoryId]);
    }
  };

  const handleSave = async () => {
    if (!titulo.trim()) {
      alert('Por favor, insira um título');
      return;
    }

    try {
      setSaving(true);
      const dateString = format(selectedDate, 'yyyy-MM-dd');

      const data = {
        data: dateString,
        titulo,
        descricao: descricao || undefined,
        providencia: providencia || undefined,
        graca: graca || undefined,
        pedido: pedido || undefined,
        intercessores: intercessores || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };

      if (existingItem && onUpdate) {
        await onUpdate(existingItem.id, data);
      } else {
        await onSave(data as any);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingItem ? 'Editar Registro' : 'Adicionar Providência ou Graça Recebida'}
          </DialogTitle>
          <DialogDescription>
            Registre as ações de Deus na sua vida: providências concretas e graças espirituais recebidas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Data */}
          <div className="space-y-2">
            <Label>Data *</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={dateInputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setDateInputValue(value);

                  const parts = value.split('/');
                  if (parts.length === 3 && parts[0].length >= 1 && parts[1].length >= 1 && parts[2].length === 4) {
                    const day = parseInt(parts[0]);
                    const month = parseInt(parts[1]) - 1;
                    const year = parseInt(parts[2]);

                    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                      const newDate = new Date(year, month, day);
                      if (!isNaN(newDate.getTime()) && day >= 1 && day <= 31 && month >= 0 && month <= 11) {
                        setSelectedDate(newDate);
                      }
                    }
                  }
                }}
                placeholder="dd/mm/aaaa"
                className="flex-1"
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <CalendarIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setDateInputValue(format(date, 'dd/MM/yyyy'));
                      }
                    }}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Cura inesperada, Oportunidade de emprego..."
            />
          </div>

          {/* Áreas da Vida (Categorias) */}
          <div className="space-y-2">
            <Label>Áreas da Vida (pode selecionar múltiplas)</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const isSelected = selectedTags.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleToggleTag(category.id)}
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
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva resumidamente o que aconteceu..."
              rows={3}
            />
          </div>

          {/* Pedido relacionado */}
          <div className="space-y-2">
            <Label htmlFor="pedido">Pedido Relacionado</Label>
            <Input
              id="pedido"
              value={pedido}
              onChange={(e) => setPedido(e.target.value)}
              placeholder="Oração ou pedido que motivou esta graça..."
            />
          </div>

          {/* Intercessores */}
          <div className="space-y-2">
            <Label htmlFor="intercessores">Intercessores</Label>
            <Input
              id="intercessores"
              value={intercessores}
              onChange={(e) => setIntercessores(e.target.value)}
              placeholder="Santos, anjos ou pessoas que intercederam..."
            />
          </div>

          {/* Providência */}
          <div className="space-y-2">
            <Label htmlFor="providencia">Providência</Label>
            <Textarea
              id="providencia"
              value={providencia}
              onChange={(e) => setProvidencia(e.target.value)}
              placeholder="Ação de Deus na realidade concreta (pessoas, situações, timing, 'coincidências')..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Providência: Deus agindo através da realidade concreta
            </p>
          </div>

          {/* Graça */}
          <div className="space-y-2">
            <Label htmlFor="graca">Graça Recebida</Label>
            <Textarea
              id="graca"
              value={graca}
              onChange={(e) => setGraca(e.target.value)}
              placeholder="Fruto espiritual recebido (proteção, sustento, paz, libertação, verdade revelada)..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Graça: Fruto espiritual recebido de Deus
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : existingItem ? 'Salvar Alterações' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
