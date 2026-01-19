import { useState, useEffect } from "react"

const API_URL = "http://localhost:3032/api"

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

interface TodoListItem {
  id: number
  list_id: number
  name: string
  checked: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface TodoList {
  id: number
  name: string
  items: TodoListItem[]
  created_at: string
  updated_at: string
}

export const useTodoLists = () => {
  const [lists, setLists] = useState<TodoList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLists = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/todo-lists`)
      if (!response.ok) throw new Error("Erro ao carregar listas")
      const data = await response.json()
      setLists(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLists()
  }, [])

  const createList = async (name: string) => {
    try {
      const response = await fetch(`${API_URL}/todo-lists`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error("Erro ao criar lista")
      const newList = await response.json()
      setLists([newList, ...lists])
      return newList
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateList = async (id: number, name: string) => {
    try {
      const response = await fetch(`${API_URL}/todo-lists/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      })
      if (!response.ok) throw new Error("Erro ao atualizar lista")
      const updated = await response.json()
      setLists(
        lists.map((list) =>
          list.id === id ? { ...list, name: updated.name } : list
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const deleteList = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/todo-lists/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Erro ao excluir lista")
      setLists(lists.filter((list) => list.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const addItem = async (listId: number, item: { name: string }) => {
    try {
      const response = await fetch(`${API_URL}/todo-lists/${listId}/items`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(item),
      })
      if (!response.ok) throw new Error("Erro ao adicionar item")
      const newItem = await response.json()
      setLists(
        lists.map((list) =>
          list.id === listId ? { ...list, items: [...list.items, newItem] } : list
        )
      )
      return newItem
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const updateItem = async (
    itemId: number,
    updates: { name?: string; checked?: boolean }
  ) => {
    try {
      const response = await fetch(`${API_URL}/todo-list-items/${itemId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('Erro ao atualizar item:', response.status, errorData);
        console.error('ItemId:', itemId, 'Updates:', updates);
        throw new Error(errorData.error || "Erro ao atualizar item");
      }
      const updatedItem = await response.json()
      setLists(
        lists.map((list) => ({
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? updatedItem : item
          ),
        }))
      )
      return updatedItem
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const toggleItemCheck = async (itemId: number, checked: boolean) => {
    return updateItem(itemId, { checked })
  }

  const deleteItem = async (itemId: number) => {
    try {
      const response = await fetch(`${API_URL}/todo-list-items/${itemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })
      if (!response.ok) throw new Error("Erro ao excluir item")
      setLists(
        lists.map((list) => ({
          ...list,
          items: list.items.filter((item) => item.id !== itemId),
        }))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      throw err
    }
  }

  const reorderLists = async (newOrder: TodoList[]) => {
    const orders = newOrder.map((list, index) => ({
      id: list.id,
      display_order: index,
    }))

    // Atualiza otimisticamente
    setLists(newOrder)

    try {
      const response = await fetch(`${API_URL}/todo-lists/reorder`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ orders }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('Erro ao reordenar listas:', response.status, errorData);
        throw new Error(errorData.error || "Erro ao reordenar");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      // Reverte em caso de erro
      fetchLists()
      throw err
    }
  }

  const reorderItems = async (listId: number, newOrder: TodoListItem[]) => {
    const orders = newOrder.map((item, index) => ({
      id: item.id,
      display_order: index,
    }))

    // Atualiza otimisticamente
    setLists(
      lists.map((list) =>
        list.id === listId ? { ...list, items: newOrder } : list
      )
    )

    try {
      const response = await fetch(`${API_URL}/todo-list-items/reorder`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ orders }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('Erro ao reordenar itens:', response.status, errorData);
        console.error('URL:', `${API_URL}/todo-list-items/reorder`);
        console.error('Orders:', orders);
        throw new Error(errorData.error || "Erro ao reordenar itens");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      // Reverte em caso de erro
      fetchLists()
      throw err
    }
  }

  return {
    lists,
    loading,
    error,
    createList,
    updateList,
    deleteList,
    addItem,
    updateItem,
    toggleItemCheck,
    deleteItem,
    reorderLists,
    reorderItems,
    refresh: fetchLists,
  }
}
