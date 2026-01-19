import { useState, useEffect } from "react"

const API_URL = "http://localhost:3032/api"

export interface Subscription {
  id: number
  user_id?: number
  title: string
  contract_date: string
  amount: number
  period: "mensal" | "trimestral" | "anual"
  next_charge_date: string | null
  category: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface SubscriptionSummary {
  monthly_fixed: number // Apenas mensais
  monthly_average: number // Média mensal de todas
  yearly_total: number // Total anual
  monthly_total: number // Soma das mensais
  trimestral_total: number // Soma das trimestrais
  anual_total: number // Soma das anuais
  monthly_count: number
  trimestral_count: number
  anual_count: number
  total_subscriptions: number
  active_subscriptions: number
}

export const useSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [summary, setSummary] = useState<SubscriptionSummary>({
    monthly_fixed: 0,
    monthly_average: 0,
    yearly_total: 0,
    monthly_total: 0,
    trimestral_total: 0,
    anual_total: 0,
    monthly_count: 0,
    trimestral_count: 0,
    anual_count: 0,
    total_subscriptions: 0,
    active_subscriptions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/subscriptions`)
      if (!response.ok) throw new Error("Erro ao carregar assinaturas")
      const data = await response.json()
      setSubscriptions(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_URL}/subscriptions/summary/total`)
      if (!response.ok) throw new Error("Erro ao carregar resumo")
      const data = await response.json()
      setSummary({
        monthly_fixed: parseFloat(data.monthly_fixed) || 0,
        monthly_average: parseFloat(data.monthly_average) || 0,
        yearly_total: parseFloat(data.yearly_total) || 0,
        monthly_total: parseFloat(data.monthly_total) || 0,
        trimestral_total: parseFloat(data.trimestral_total) || 0,
        anual_total: parseFloat(data.anual_total) || 0,
        monthly_count: parseInt(data.monthly_count) || 0,
        trimestral_count: parseInt(data.trimestral_count) || 0,
        anual_count: parseInt(data.anual_count) || 0,
        total_subscriptions: parseInt(data.total_subscriptions) || 0,
        active_subscriptions: parseInt(data.active_subscriptions) || 0,
      })
    } catch (err) {
      console.error("Erro ao carregar resumo:", err)
    }
  }

  useEffect(() => {
    fetchSubscriptions()
    fetchSummary()
  }, [])

  const createSubscription = async (subscription: Omit<Subscription, "id" | "active" | "created_at" | "updated_at" | "user_id">) => {
    try {
      const response = await fetch(`${API_URL}/subscriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      })
      if (!response.ok) throw new Error("Erro ao criar assinatura")
      await fetchSubscriptions()
      await fetchSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateSubscription = async (
    id: number,
    updates: Partial<Omit<Subscription, "id" | "created_at" | "updated_at" | "user_id">>
  ) => {
    try {
      const response = await fetch(`${API_URL}/subscriptions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Erro ao atualizar assinatura")
      await fetchSubscriptions()
      await fetchSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const deleteSubscription = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/subscriptions/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir assinatura")
      setSubscriptions(subscriptions.filter((s) => s.id !== id))
      await fetchSummary()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const toggleActive = async (id: number, active: boolean) => {
    try {
      const subscription = subscriptions.find((s) => s.id === id)
      if (!subscription) return

      await updateSubscription(id, { ...subscription, active })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  return {
    subscriptions,
    summary,
    loading,
    error,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    toggleActive,
    refresh: () => {
      fetchSubscriptions()
      fetchSummary()
    },
  }
}
