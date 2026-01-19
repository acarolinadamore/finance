import { useState } from "react"
import { MonthPicker } from "@/components/MonthPicker"
import { YearPicker } from "@/components/YearPicker"
import { SummaryCards } from "@/components/SummaryCards"
import { TransactionsTableApi } from "@/components/TransactionsTableApi"
import { CreditCardSummaryCards } from "@/components/CreditCardSummaryCards"
import { CreditCardChart } from "@/components/CreditCardChart"
import { CreditCardMonthlyTable } from "@/components/CreditCardMonthlyTable"
import { CategoryPieChart } from "@/components/CategoryPieChart"
import { CreditCardCategoryPieChart } from "@/components/CreditCardCategoryPieChart"
import { DeleteMonthTransactions } from "@/components/DeleteMonthTransactions"
import { SubscriptionDialog } from "@/components/SubscriptionDialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, CreditCard, PieChart, ChevronLeft, Receipt, RefreshCw, Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { useSubscriptions, Subscription } from "@/hooks/useSubscriptions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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

const Index = () => {
  const {
    subscriptions,
    summary,
    loading: subscriptionsLoading,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleActive,
  } = useSubscriptions()

  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false)
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<Subscription | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<number | null>(null)

  const handleAddSubscription = () => {
    setSubscriptionToEdit(null)
    setIsSubscriptionDialogOpen(true)
  }

  const handleEditSubscription = (subscription: Subscription) => {
    setSubscriptionToEdit(subscription)
    setIsSubscriptionDialogOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setSubscriptionToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (subscriptionToDelete) {
      try {
        await deleteSubscription(subscriptionToDelete)
        setDeleteDialogOpen(false)
        setSubscriptionToDelete(null)
      } catch (error) {
        console.error("Erro ao excluir assinatura:", error)
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getPeriodLabel = (period: string) => {
    const labels: Record<string, string> = {
      mensal: "Mensal",
      trimestral: "Trimestral",
      anual: "Anual",
    }
    return labels[period] || period
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-semibold">
                Financeiro
              </h1>
            </div>
            <YearPicker />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="transactions" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span>Transações</span>
            </TabsTrigger>
            <TabsTrigger value="credit-card" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Cartão de Crédito</span>
            </TabsTrigger>
            <TabsTrigger value="parcelas" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span>Parcelas</span>
            </TabsTrigger>
            <TabsTrigger value="assinaturas" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>Assinaturas</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-2">
              <PieChart className="h-4 w-4" />
              <span>Análise</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex justify-end items-center gap-2">
              <DeleteMonthTransactions />
              <MonthPicker />
            </div>
            <SummaryCards />
            <TransactionsTableApi />
          </TabsContent>

          <TabsContent value="credit-card" className="space-y-6">
            <CreditCardSummaryCards />
            <CreditCardChart />
            <CreditCardMonthlyTable />
          </TabsContent>

          <TabsContent value="parcelas" className="space-y-6">
            <div className="bg-card rounded-lg border p-8 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Controle de Parcelas</h3>
              <p className="text-muted-foreground mb-4">
                Módulo em desenvolvimento
              </p>
              <p className="text-sm text-muted-foreground">
                Em breve você poderá controlar suas compras parceladas aqui
              </p>
            </div>
          </TabsContent>

          <TabsContent value="assinaturas" className="space-y-6">
            {/* Resumo de Assinaturas - Cards Principais */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Gasto Mensal Fixo</CardDescription>
                  <CardTitle className="text-3xl">
                    {formatCurrency(summary.monthly_fixed || 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Apenas assinaturas mensais ({summary.monthly_count})
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardDescription className="text-blue-700">
                    Gasto Médio Mensal
                  </CardDescription>
                  <CardTitle className="text-3xl text-blue-900">
                    {formatCurrency(summary.monthly_average || 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-blue-600">
                    Todas convertidas proporcionalmente
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Gasto Anual Total</CardDescription>
                  <CardTitle className="text-3xl">
                    {formatCurrency(summary.yearly_total || 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Total anual real
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Assinaturas Ativas</CardDescription>
                  <CardTitle className="text-3xl">
                    {summary.active_subscriptions}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    De {summary.total_subscriptions} cadastradas
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Breakdown por Periodicidade */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Detalhamento por Periodicidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Mensais ({summary.monthly_count})
                      </span>
                      <Badge variant="outline">Mensal</Badge>
                    </div>
                    <p className="text-lg font-semibold">
                      {formatCurrency(summary.monthly_total || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      = {formatCurrency(summary.monthly_total || 0)}/mês
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Trimestrais ({summary.trimestral_count})
                      </span>
                      <Badge variant="outline">Trimestral</Badge>
                    </div>
                    <p className="text-lg font-semibold">
                      {formatCurrency(summary.trimestral_total || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ≈ {formatCurrency((summary.trimestral_total || 0) / 3)}/mês
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Anuais ({summary.anual_count})
                      </span>
                      <Badge variant="outline">Anual</Badge>
                    </div>
                    <p className="text-lg font-semibold">
                      {formatCurrency(summary.anual_total || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ≈ {formatCurrency((summary.anual_total || 0) / 12)}/mês
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botão Adicionar */}
            <div className="flex justify-end">
              <Button onClick={handleAddSubscription}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Assinatura
              </Button>
            </div>

            {/* Lista de Assinaturas */}
            <Card>
              <CardHeader>
                <CardTitle>Minhas Assinaturas</CardTitle>
                <CardDescription>
                  {subscriptions.length === 0
                    ? "Nenhuma assinatura cadastrada"
                    : `${subscriptions.length} assinatura(s) cadastrada(s)`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Carregando...</p>
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-muted-foreground mb-2">
                      Nenhuma assinatura cadastrada
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Adicione sua primeira assinatura clicando no botão acima
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className={`border rounded-lg p-4 transition-all ${
                          subscription.active
                            ? "bg-white hover:shadow-md"
                            : "bg-gray-50 opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            {/* Título e Status */}
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold text-lg">
                                {subscription.title}
                              </h3>
                              {subscription.active ? (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Ativa
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inativa
                                </Badge>
                              )}
                              <Badge variant="outline">{subscription.category}</Badge>
                            </div>

                            {/* Informações */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground text-xs">Valor</p>
                                <p className="font-semibold">
                                  {formatCurrency(subscription.amount)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Periodicidade
                                </p>
                                <p className="font-semibold">
                                  {getPeriodLabel(subscription.period)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Data Contratação
                                </p>
                                <p className="font-semibold">
                                  {format(
                                    new Date(subscription.contract_date),
                                    "dd/MM/yyyy"
                                  )}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground text-xs">
                                  Próxima Cobrança
                                </p>
                                <p className="font-semibold">
                                  {subscription.next_charge_date
                                    ? format(
                                        new Date(subscription.next_charge_date),
                                        "dd/MM/yyyy"
                                      )
                                    : "Cancelada"}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditSubscription(subscription)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(subscription.id)}
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
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="flex justify-end">
              <MonthPicker />
            </div>
            <CategoryPieChart />
            <CreditCardCategoryPieChart />
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialog de Criar/Editar Assinatura */}
      <SubscriptionDialog
        open={isSubscriptionDialogOpen}
        onOpenChange={setIsSubscriptionDialogOpen}
        subscription={subscriptionToEdit}
        onSave={createSubscription}
        onUpdate={updateSubscription}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir assinatura?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A assinatura será permanentemente
              excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Index
