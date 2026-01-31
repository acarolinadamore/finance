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
import { CalendarIcon } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ApiCronogramaEtapa } from '@/services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EtapaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cronogramaId: number;
  cronogramaTitulo: string;
  etapa?: ApiCronogramaEtapa | null;
  onSave: (cronogramaId: number, data: Omit<ApiCronogramaEtapa, 'id' | 'cronograma_id' | 'created_at' | 'updated_at' | 'cronograma_titulo' | 'cronograma_status'>) => Promise<void>;
  onUpdate?: (id: number, data: Partial<ApiCronogramaEtapa>) => Promise<void>;
}

const CORES_DISPONIVEIS = [
  { nome: 'Azul', valor: '#3b82f6' },
  { nome: 'Verde', valor: '#10b981' },
  { nome: 'Vermelho', valor: '#ef4444' },
  { nome: 'Amarelo', valor: '#f59e0b' },
  { nome: 'Roxo', valor: '#8b5cf6' },
  { nome: 'Rosa', valor: '#ec4899' },
  { nome: 'Laranja', valor: '#f97316' },
  { nome: 'Cinza', valor: '#6b7280' },
];

export function EtapaDialog({
  open,
  onOpenChange,
  cronogramaId,
  cronogramaTitulo,
  etapa: existingEtapa,
  onSave,
  onUpdate,
}: EtapaDialogProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState<'alta' | 'media' | 'baixa'>('media');
  const [dataInicio, setDataInicio] = useState<Date>(new Date());
  const [dataTermino, setDataTermino] = useState<Date>(new Date());
  const [cor, setCor] = useState('#3b82f6');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  // Preencher campos quando editar
  useEffect(() => {
    if (open && existingEtapa) {
      setNome(existingEtapa.nome);
      setDescricao(existingEtapa.descricao || '');
      setPrioridade(existingEtapa.prioridade);
      setDataInicio(new Date(existingEtapa.data_inicio));
      setDataTermino(new Date(existingEtapa.data_termino));
      setCor(existingEtapa.cor);
      setObservacoes(existingEtapa.observacoes || '');
    } else if (open && !existingEtapa) {
      // Reset ao criar novo
      setNome('');
      setDescricao('');
      setPrioridade('media');
      setDataInicio(new Date());
      setDataTermino(new Date());
      setCor('#3b82f6');
      setObservacoes('');
    }
  }, [open, existingEtapa]);

  const totalDias = differenceInDays(dataTermino, dataInicio) + 1;

  const handleSave = async () => {
    if (!nome.trim()) {
      alert('Por favor, insira um nome para a etapa');
      return;
    }

    if (dataTermino < dataInicio) {
      alert('A data de término deve ser posterior ou igual à data de início');
      return;
    }

    try {
      setSaving(true);

      const data = {
        nome,
        descricao: descricao || undefined,
        prioridade,
        data_inicio: format(dataInicio, 'yyyy-MM-dd'),
        data_termino: format(dataTermino, 'yyyy-MM-dd'),
        cor,
        observacoes: observacoes || undefined,
        ordem: 0,
      };

      if (existingEtapa && onUpdate) {
        await onUpdate(existingEtapa.id, data);
      } else {
        await onSave(cronogramaId, data as any);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar etapa:', error);
      alert('Erro ao salvar etapa. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingEtapa ? 'Editar Etapa' : 'Nova Etapa'}
          </DialogTitle>
          <DialogDescription>
            Adicione uma etapa ao cronograma "{cronogramaTitulo}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Etapa *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Desenvolvimento, Testes, Lançamento..."
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva brevemente esta etapa..."
              rows={2}
            />
          </div>

          {/* Prioridade e Cor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={prioridade} onValueChange={(value: any) => setPrioridade(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Select value={cor} onValueChange={setCor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CORES_DISPONIVEIS.map((c) => (
                    <SelectItem key={c.valor} value={c.valor}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: c.valor }}
                        />
                        {c.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                    {format(dataInicio, "dd 'de' MMMM", { locale: ptBR })}
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
                    {format(dataTermino, "dd 'de' MMMM", { locale: ptBR })}
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

          {/* Info de Duração */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm">
            <span className="text-muted-foreground">Duração:</span>
            <span className="ml-2 font-medium">
              {totalDias} {totalDias === 1 ? 'dia' : 'dias'}
            </span>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Anotações adicionais sobre esta etapa..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : existingEtapa ? 'Salvar Alterações' : 'Criar Etapa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
