import { useState, useEffect } from "react"

const API_URL = "http://localhost:3032/api"

interface LifeArea {
  id: number
  name: string
  description: string
  color: string
  satisfaction_level: number
  display_order: number
  created_at: string
  updated_at: string
}

interface GoalTask {
  id: number
  goal_id: number
  title: string
  description?: string
  deadline?: string
  completed: boolean
  display_order?: number
  created_at: string
  updated_at: string
}

interface Goal {
  id: number
  title: string
  life_area_id?: number
  life_area_name?: string
  life_area_color?: string
  motivo?: string
  current_situation?: string
  desired_outcome?: string
  obstaculo?: string
  recompensa?: string
  prazo_tipo?: 'curto' | 'medio' | 'longo'
  estimated_deadline?: string
  progress: number
  tasks: GoalTask[]
  created_at: string
  updated_at: string
}

export const useGoals = () => {
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLifeAreas = async () => {
    try {
      const response = await fetch(`${API_URL}/life-areas`)
      if (!response.ok) throw new Error("Erro ao carregar áreas da vida")
      const data = await response.json()
      setLifeAreas(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    }
  }

  const fetchGoals = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/goals`)
      if (!response.ok) throw new Error("Erro ao carregar metas")
      const data = await response.json()
      setGoals(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLifeAreas()
    fetchGoals()
  }, [])

  const updateLifeArea = async (id: number, satisfaction_level: number) => {
    try {
      const response = await fetch(`${API_URL}/life-areas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ satisfaction_level }),
      })
      if (!response.ok) throw new Error("Erro ao atualizar área")
      const updated = await response.json()
      setLifeAreas(
        lifeAreas.map((area) => (area.id === id ? updated : area))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const createGoal = async (goal: {
    title: string
    life_area_id?: number
    motivo?: string
    current_situation?: string
    desired_outcome?: string
    obstaculo?: string
    recompensa?: string
    prazo_tipo?: 'curto' | 'medio' | 'longo'
  }) => {
    try {
      const response = await fetch(`${API_URL}/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      })
      if (!response.ok) throw new Error("Erro ao criar meta")
      const newGoal = await response.json()
      setGoals([newGoal, ...goals])
      return newGoal
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateGoal = async (
    id: number,
    updates: {
      title?: string
      life_area_id?: number
      motivo?: string
      current_situation?: string
      desired_outcome?: string
      obstaculo?: string
      recompensa?: string
      prazo_tipo?: 'curto' | 'medio' | 'longo'
      progress?: number
    }
  ) => {
    try {
      const response = await fetch(`${API_URL}/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Erro ao atualizar meta")
      const updated = await response.json()
      setGoals(
        goals.map((g) =>
          g.id === id ? { ...g, ...updated } : g
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const deleteGoal = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/goals/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir meta")
      setGoals(goals.filter((g) => g.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const addTask = async (
    goalId: number,
    task: { title: string; description?: string; deadline?: string }
  ) => {
    try {
      const response = await fetch(`${API_URL}/goals/${goalId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      })
      if (!response.ok) throw new Error("Erro ao adicionar tarefa")
      const newTask = await response.json()
      setGoals(
        goals.map((g) =>
          g.id === goalId ? { ...g, tasks: [...g.tasks, newTask] } : g
        )
      )
      // Atualizar progresso
      await fetchGoals()
      return newTask
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateTask = async (
    taskId: number,
    updates: {
      title?: string
      description?: string
      deadline?: string
      completed?: boolean
    }
  ) => {
    try {
      const response = await fetch(`${API_URL}/goal-tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!response.ok) throw new Error("Erro ao atualizar tarefa")
      const updatedTask = await response.json()
      setGoals(
        goals.map((g) => ({
          ...g,
          tasks: g.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        }))
      )
      // Atualizar progresso
      await fetchGoals()
      return updatedTask
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const toggleTaskCompleted = async (taskId: number, completed: boolean) => {
    return updateTask(taskId, { completed })
  }

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`${API_URL}/goal-tasks/${taskId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Erro ao excluir tarefa")
      setGoals(
        goals.map((g) => ({
          ...g,
          tasks: g.tasks.filter((t) => t.id !== taskId),
        }))
      )
      // Atualizar progresso
      await fetchGoals()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const reorderGoals = async (orders: { id: number; display_order: number }[]) => {
    try {
      const response = await fetch(`${API_URL}/goals/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      })
      if (!response.ok) throw new Error("Erro ao reordenar metas")
      // Atualizar lista local
      await fetchGoals()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  return {
    lifeAreas,
    goals,
    loading,
    error,
    updateLifeArea,
    createGoal,
    updateGoal,
    deleteGoal,
    addTask,
    updateTask,
    toggleTaskCompleted,
    deleteTask,
    reorderGoals,
    refresh: () => {
      fetchLifeAreas()
      fetchGoals()
    },
  }
}
