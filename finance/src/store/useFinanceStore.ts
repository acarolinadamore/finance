import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import type {
  Account,
  Category,
  Card,
  Statement,
  Transaction,
  RecurringTemplate,
  Estimate,
} from '@/types/finance';

export interface CardSubcategoryExpense {
  category: string;
  amount: number;
}

interface FinanceStore {
  accounts: Account[];
  categories: Category[];
  cards: Card[];
  statements: Statement[];
  transactions: Transaction[];
  recurringTemplates: RecurringTemplate[];
  estimates: Estimate[];
  selectedMonth: string;
  selectedYear: number;
  cardMonthlyExpenses: Record<string, Record<string, number>>; // cardId -> "year-month" -> amount
  cardSubcategoryExpenses: Record<string, Record<string, CardSubcategoryExpense[]>>; // cardId -> "year-month" -> [{category, amount}]

  // Actions
  setSelectedMonth: (month: string) => void;
  setSelectedYear: (year: number) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addCard: (card: Omit<Card, 'id'>) => void;
  updateCard: (id: string, card: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addEstimate: (estimate: Omit<Estimate, 'id'>) => void;
  updateEstimate: (id: string, estimate: Partial<Estimate>) => void;
  deleteEstimate: (id: string) => void;
  toggleEstimate: (id: string) => void;
  updateCardMonthlyExpense: (cardId: string, year: number, month: number, amount: number) => void;
  setCardSubcategoryExpenses: (cardId: string, yearMonth: string, expenses: CardSubcategoryExpense[]) => void;
}

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Sample initial data
const initialCategories: Category[] = [
  { id: '1', name: 'Moradia', is_income: false },
  { id: '1-1', name: 'Energia', parent_id: '1', is_income: false },
  { id: '1-2', name: 'Internet', parent_id: '1', is_income: false },
  { id: '1-3', name: 'Aluguel/Condomínio', parent_id: '1', is_income: false },
  { id: '2', name: 'Pessoais', is_income: false },
  { id: '2-1', name: 'Mercado', parent_id: '2', is_income: false },
  { id: '2-2', name: 'Farmácia', parent_id: '2', is_income: false },
  { id: '3', name: 'Transporte', is_income: false },
  { id: '3-1', name: 'Combustível', parent_id: '3', is_income: false },
  { id: '3-2', name: 'App de Transporte', parent_id: '3', is_income: false },
  { id: '4', name: 'Entradas', is_income: true },
  { id: '4-1', name: 'Pensão Alimentícia', parent_id: '4', is_income: true },
  { id: '4-2', name: 'Ajuda de Custo', parent_id: '4', is_income: true },
  { id: '4-3', name: 'Salário', parent_id: '4', is_income: true },
  { id: '4-4', name: 'Reembolsos', parent_id: '4', is_income: true },
];

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set) => ({
      accounts: [],
      categories: initialCategories,
      cards: [],
      statements: [],
      transactions: [],
      recurringTemplates: [],
      estimates: [],
      selectedMonth: dayjs().format('YYYY-MM'),
      selectedYear: new Date().getFullYear(),
      cardMonthlyExpenses: {},
      cardSubcategoryExpenses: {},

      setSelectedMonth: (month) => set({ selectedMonth: month }),
      setSelectedYear: (year) => set({ selectedYear: year }),

      setCardSubcategoryExpenses: (cardId, yearMonth, expenses) =>
        set((state) => ({
          cardSubcategoryExpenses: {
            ...state.cardSubcategoryExpenses,
            [cardId]: {
              ...(state.cardSubcategoryExpenses[cardId] || {}),
              [yearMonth]: expenses,
            },
          },
        })),

      addAccount: (account) =>
        set((state) => ({
          accounts: [...state.accounts, { ...account, id: generateId() }],
        })),

      updateAccount: (id, account) =>
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...account } : a)),
        })),

      deleteAccount: (id) =>
        set((state) => ({
          accounts: state.accounts.filter((a) => a.id !== id),
        })),

      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, { ...category, id: generateId() }],
        })),

      updateCategory: (id, category) =>
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...category } : c)),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      addCard: (card) =>
        set((state) => ({
          cards: [...state.cards, { ...card, id: generateId() }],
        })),

      updateCard: (id, card) =>
        set((state) => ({
          cards: state.cards.map((c) => (c.id === id ? { ...c, ...card } : c)),
        })),

      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
        })),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [...state.transactions, { ...transaction, id: generateId() }],
        })),

      updateTransaction: (id, transaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...transaction } : t)),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      addEstimate: (estimate) =>
        set((state) => ({
          estimates: [...state.estimates, { ...estimate, id: generateId() }],
        })),

      updateEstimate: (id, estimate) =>
        set((state) => ({
          estimates: state.estimates.map((e) => (e.id === id ? { ...e, ...estimate } : e)),
        })),

      deleteEstimate: (id) =>
        set((state) => ({
          estimates: state.estimates.filter((e) => e.id !== id),
        })),

      toggleEstimate: (id) =>
        set((state) => ({
          estimates: state.estimates.map((e) =>
            e.id === id ? { ...e, enabled: !e.enabled } : e
          ),
        })),

      updateCardMonthlyExpense: (cardId, year, month, amount) =>
        set((state) => ({
          cardMonthlyExpenses: {
            ...state.cardMonthlyExpenses,
            [cardId]: {
              ...(state.cardMonthlyExpenses[cardId] || {}),
              [`${year}-${month}`]: amount,
            },
          },
        })),
    }),
    {
      name: 'finance-storage',
    }
  )
);
