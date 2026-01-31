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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Info } from 'lucide-react';
import { format, differenceInDays, differenceInBusinessDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ApiCronograma } from '@/services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CronogramaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cronograma?: ApiCronograma | null;
  onSave: (data: Omit<ApiCronograma, 'id' | 'created_at' | 'updated_at' | 'total_etapas' | 'etapas_concluidas' | 'etapas'>) => Promise<void>;
  onUpdate?: (id: number, data: Partial<ApiCronograma>) => Promise<void>;
}

export function CronogramaDialog({
  open,
  onOpenChange,
  cronograma: existingCronograma,
  onSave,
  onUpdate,
}: CronogramaDialogProps) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [dataTermino, setDataTermino] = useState<Date>(new Date());
  const [status, setStatus] = useState<'ativo' | 'futuro' | 'concluido'>('ativo');
  const [saving, setSaving] = useState(false);

  // Preencher campos quando editar
  useEffect(() => {
    if (open && existingCronograma) {
      setTitulo(existingCronograma.titulo);
      setDescricao(existingCronograma.descricao || '');
      setDataInicio(new Date(existingCronograma.data_inicio));
      setDataTermino(new Date(existingCronograma.data_termino));
      setStatus(existingCronograma.status);
    } else if (open && !existingCronograma) {
      // Reset ao criar novo
      setTitulo('');
      setDescricao('');
      setDataInicio(new Date());
      setDataTermino(new Date());
      setStatus('ativo');
    }
  }, [open, existingCronograma]);

  // Cálculos automáticos
  const totalDiasCorridos = differenceInDays(dataTermino, dataInicio);
  const totalDiasUteis = differenceInBusinessDays(dataTermino, dataInicio);
  const totalSemanas = Math.floor(totalDiasCorridos / 7);
  const totalMeses = Math.floor(totalDiasCorridos / 30);

  const handleSave = async () => {
    if (!titulo.trim()) {
      alert('Por favor, insira um título para o cronograma');
      return;
    }

    if (dataTermino <= dataInicio) {
      alert('A data de término deve ser posterior à data de início');
      return;
    }

    try {
      setSaving(true);

      const data = {
        titulo,
        descricao: descricao || undefined,
        data_inicio: format(dataInicio, 'yyyy-MM-dd'),
        data_termino: format(dataTermino, 'yyyy-MM-dd'),
        status,
      };

      if (existingCronograma && onUpdate) {
        await onUpdate(existingCronograma.id, data);
      } else {
        await onSave(data as any);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar cronograma:', error);
      alert('Erro ao salvar cronograma. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingCronograma ? 'Editar Cronograma' : 'Novo Cronograma'}
          </DialogTitle>
          <DialogDescription>
            Planeje seu projeto definindo título, período e status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Projeto *</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Lançamento do Produto, Reforma da Casa..."
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva brevemente o projeto..."
              rows={3}
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Data de Início */}
            <div className="space-y-2">
              <Label>Data de Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dataInicio, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={(date) => date && setDataInicio(date)}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Data de Término */}
            <div className="space-y-2">
              <Label>Data de Término *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dataTermino, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataTermino}
                    onSelect={(date) => date && setDataTermino(date)}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Cálculos Automáticos */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <Info className="h-4 w-4" />
              <span>Cálculos Automáticos</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Total de dias corridos:</span>
                <span className="ml-2 font-medium">{totalDiasCorridos} dias</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total de dias úteis:</span>
                <span className="ml-2 font-medium">{totalDiasUteis} dias</span>
              </div>
              {totalSemanas > 0 && (
                <div>
                  <span className="text-muted-foreground">Semanas:</span>
                  <span className="ml-2 font-medium">~{totalSemanas} semanas</span>
                </div>
              )}
              {totalMeses > 0 && (
                <div>
                  <span className="text-muted-foreground">Meses:</span>
                  <span className="ml-2 font-medium">~{totalMeses} meses</span>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="futuro">Futuro</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : existingCronograma ? 'Salvar Alterações' : 'Criar Cronograma'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
