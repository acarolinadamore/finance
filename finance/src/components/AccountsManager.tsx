import { useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Wallet, CreditCard, PiggyBank, TrendingUp, Building } from "lucide-react";
import type { AccountType } from "@/types/finance";
import { toast } from "sonner";

const accountIcons = {
  conta_corrente: Wallet,
  poupanca: PiggyBank,
  carteira: Wallet,
  investimento: TrendingUp,
  cartao_credito: CreditCard,
  cartao_loja: Building,
};

export const AccountsManager = () => {
  const { accounts, addAccount } = useFinanceStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    institution: '',
    type: 'conta_corrente' as AccountType,
    opening_balance: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount({
      ...formData,
      archived: false,
    });
    toast.success('Conta adicionada com sucesso!');
    setOpen(false);
    setFormData({
      name: '',
      institution: '',
      type: 'conta_corrente',
      opening_balance: 0,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Contas</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Conta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Conta Nubank"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="institution">Instituição</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="Ex: Nubank"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: AccountType) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conta_corrente">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca">Poupança</SelectItem>
                    <SelectItem value="carteira">Carteira</SelectItem>
                    <SelectItem value="investimento">Investimento</SelectItem>
                    <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                    <SelectItem value="cartao_loja">Cartão de Loja</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opening_balance">Saldo Inicial</Label>
                <Input
                  id="opening_balance"
                  type="number"
                  step="0.01"
                  value={formData.opening_balance}
                  onChange={(e) =>
                    setFormData({ ...formData, opening_balance: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <Button type="submit" className="w-full">Adicionar Conta</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => {
          const Icon = accountIcons[account.type];
          return (
            <Card key={account.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{account.name}</h3>
                    {account.institution && (
                      <p className="text-sm text-muted-foreground">{account.institution}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">
                  R$ {account.opening_balance.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {account.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma conta cadastrada. Clique em "Nova Conta" para começar.
          </p>
        </Card>
      )}
    </div>
  );
};
