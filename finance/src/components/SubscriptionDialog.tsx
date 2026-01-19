import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Subscription } from "@/hooks/useSubscriptions"

interface SubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription?: Subscription | null
  onSave: (subscription: any) => Promise<void>
  onUpdate?: (id: number, updates: any) => Promise<void>
}

const categories = [
  "TV",
  "Relacionamento",
  "Profissional",
  "Saúde",
  "Educação",
  "Software",
  "Streaming",
  "Outro",
]

const periods = [
  { value: "mensal", label: "Mensal" },
  { value: "trimestral", label: "Trimestral" },
  { value: "anual", label: "Anual" },
]

export function SubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  onSave,
  onUpdate,
}: SubscriptionDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    contract_date: "",
    amount: "",
    period: "mensal" as "mensal" | "trimestral" | "anual",
    next_charge_date: "",
    category: "Outro",
    active: true,
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (subscription) {
      // Converter datas de ISO para yyyy-MM-dd
      const formatDate = (dateString: string | null) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        return date.toISOString().split("T")[0]
      }

      setFormData({
        title: subscription.title,
        contract_date: formatDate(subscription.contract_date),
        amount: subscription.amount.toString(),
        period: subscription.period,
        next_charge_date: formatDate(subscription.next_charge_date),
        category: subscription.category,
        active: subscription.active,
      })
    } else {
      setFormData({
        title: "",
        contract_date: "",
        amount: "",
        period: "mensal",
        next_charge_date: "",
        category: "Outro",
        active: true,
      })
    }
  }, [subscription, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const dataToSave = {
        ...formData,
        amount: parseFloat(formData.amount),
        // Se inativa ou campo vazio, enviar null
        next_charge_date:
          formData.active && formData.next_charge_date
            ? formData.next_charge_date
            : null,
      }

      if (subscription && onUpdate) {
        await onUpdate(subscription.id, dataToSave)
      } else {
        await onSave(dataToSave)
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {subscription ? "Editar Assinatura" : "Nova Assinatura"}
          </DialogTitle>
          <DialogDescription>
            {subscription
              ? "Atualize as informações da assinatura"
              : "Adicione uma nova assinatura recorrente"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Ex: Netflix, Spotify, Gympass..."
              required
            />
          </div>

          {/* Status Ativo/Inativo */}
          {subscription && (
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="active">Status da Assinatura</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.active
                    ? "Assinatura ativa e renovando"
                    : "Assinatura cancelada/inativa"}
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contract_date">Data de Contratação *</Label>
              <Input
                id="contract_date"
                type="date"
                value={formData.contract_date}
                onChange={(e) =>
                  setFormData({ ...formData, contract_date: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_charge_date">
                Próxima Cobrança {formData.active ? "*" : "(Opcional)"}
              </Label>
              <Input
                id="next_charge_date"
                type="date"
                value={formData.next_charge_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    next_charge_date: e.target.value,
                  })
                }
                required={formData.active}
                disabled={!formData.active}
                placeholder={!formData.active ? "Cancelada" : ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Periodicidade *</Label>
              <Select
                value={formData.period}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, period: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : subscription ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
