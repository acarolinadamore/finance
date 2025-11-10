import { useState, useEffect } from 'react';
import { Meal } from '@/types/meals';

const STORAGE_KEY = 'meals-data';

export const useMeals = () => {
  const [meals, setMeals] = useState<Meal[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('LocalStorage cheio! Considere usar menos fotos ou fotos menores.');
        alert('Espaço de armazenamento cheio! Por favor, exclua algumas refeições antigas ou evite adicionar muitas fotos.');
      }
    }
  }, [meals]);

  const addMeal = (meal: Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newMeal: Meal = {
      ...meal,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setMeals((prev) => [newMeal, ...prev]);
    return newMeal;
  };

  const updateMeal = (id: string, updates: Partial<Omit<Meal, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === id
          ? { ...meal, ...updates, updatedAt: new Date().toISOString() }
          : meal
      )
    );
  };

  const deleteMeal = (id: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
  };

  const getMealById = (id: string) => {
    return meals.find((meal) => meal.id === id);
  };

  const getMealsByDateRange = (startDate: string, endDate: string) => {
    return meals.filter((meal) => {
      const mealDate = new Date(meal.date).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      return mealDate >= start && mealDate <= end;
    });
  };

  const getMealsByType = (mealType: string) => {
    return meals.filter((meal) => meal.mealType === mealType);
  };

  return {
    meals,
    addMeal,
    updateMeal,
    deleteMeal,
    getMealById,
    getMealsByDateRange,
    getMealsByType,
  };
};
