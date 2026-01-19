import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface TodoListItem {
  id: number;
  list_id: number;
  name: string;
  checked: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TodoList {
  id: number;
  name: string;
  items: TodoListItem[];
  display_order?: number;
  created_at: string;
  updated_at: string;
}

export const useTodoLists = () => {
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<TodoList[]>('/todo-lists');
      setLists(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = async (name: string) => {
    try {
      const newList = await api.post<TodoList>('/todo-lists', { name });
      setLists([newList, ...lists]);
      return newList;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    }
  };

  const updateList = async (id: number, name: string) => {
    try {
      const updated = await api.put<TodoList>(`/todo-lists/${id}`, { name });
      setLists(lists.map((list) => (list.id === id ? { ...list, name: updated.name } : list)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    }
  };

  const deleteList = async (id: number) => {
    try {
      await api.delete(`/todo-lists/${id}`);
      setLists(lists.filter((list) => list.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    }
  };

  const addItem = async (listId: number, item: { name: string }) => {
    try {
      const newItem = await api.post<TodoListItem>(`/todo-lists/${listId}/items`, item);
      setLists(
        lists.map((list) =>
          list.id === listId ? { ...list, items: [...list.items, newItem] } : list
        )
      );
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    }
  };

  const updateItem = async (itemId: number, updates: { name?: string; checked?: boolean }) => {
    try {
      const updatedItem = await api.put<TodoListItem>(`/todo-list-items/${itemId}`, updates);
      setLists(
        lists.map((list) => ({
          ...list,
          items: list.items.map((item) => (item.id === itemId ? updatedItem : item)),
        }))
      );
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    }
  };

  const toggleItemCheck = async (itemId: number, checked: boolean) => {
    return updateItem(itemId, { checked });
  };

  const deleteItem = async (itemId: number) => {
    try {
      await api.delete(`/todo-list-items/${itemId}`);
      setLists(
        lists.map((list) => ({
          ...list,
          items: list.items.filter((item) => item.id !== itemId),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      throw err;
    }
  };

  const reorderLists = async (newOrder: TodoList[]) => {
    const orders = newOrder.map((list, index) => ({
      id: list.id,
      display_order: index,
    }));

    setLists(newOrder);

    try {
      await api.put('/todo-lists/reorder', { orders });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      fetchLists();
      throw err;
    }
  };

  const reorderItems = async (listId: number, newOrder: TodoListItem[]) => {
    const orders = newOrder.map((item, index) => ({
      id: item.id,
      display_order: index,
    }));

    setLists(lists.map((list) => (list.id === listId ? { ...list, items: newOrder } : list)));

    try {
      await api.put('/todo-list-items/reorder', { orders });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      fetchLists();
      throw err;
    }
  };

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
  };
};
