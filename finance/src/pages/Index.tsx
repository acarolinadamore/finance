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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, CreditCard, PieChart } from "lucide-react"

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Finance
              </h1>
            </div>
            <YearPicker />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="transactions" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span>Transações</span>
            </TabsTrigger>
            <TabsTrigger value="credit-card" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Cartão de Crédito</span>
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

          <TabsContent value="analysis" className="space-y-6">
            <div className="flex justify-end">
              <MonthPicker />
            </div>
            <CategoryPieChart />
            <CreditCardCategoryPieChart />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default Index
