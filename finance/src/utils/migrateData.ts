import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:3032/api';

interface MigrationResult {
  routines: number;
  routineCompletions: number;
  habits: number;
  habitCompletions: number;
  moods: number;
  errors: string[];
}

export async function migrateLocalStorageToPostgreSQL(): Promise<MigrationResult> {
  const result: MigrationResult = {
    routines: 0,
    routineCompletions: 0,
    habits: 0,
    habitCompletions: 0,
    moods: 0,
    errors: [],
  };

  console.log('🚀 Iniciando migração de dados...');

  try {
    const routinesData = localStorage.getItem('routines-data');
    if (routinesData) {
      const routines = JSON.parse(routinesData);
      console.log(`📋 Encontradas ${routines.length} rotinas`);

      for (const routine of routines) {
        try {
          const response = await fetch(`${API_BASE_URL}/routines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: routine.name || routine.title,
              period: routine.period,
              frequency: routine.frequency || 'daily',
              specific_days: routine.specificDays || routine.specific_days,
              times_per_week: routine.timesPerWeek || routine.times_per_week,
              icon: routine.icon,
              color: routine.color || '#8b5cf6',
              add_to_habit_tracking: routine.addToHabitTracking || false,
              is_active: routine.isActive !== false,
            }),
          });

          if (response.ok) {
            result.routines++;
            console.log(`✅ Rotina migrada: ${routine.name || routine.title}`);
          } else {
            const error = await response.text();
            result.errors.push(`Rotina ${routine.name}: ${error}`);
          }
        } catch (error) {
          result.errors.push(`Rotina ${routine.name}: ${error}`);
        }
      }
    }

    const habitsData = localStorage.getItem('habits-data-v1');
    if (habitsData) {
      const habits = JSON.parse(habitsData);
      console.log(`💪 Encontrados ${habits.length} hábitos`);

      for (const habit of habits) {
        try {
          const response = await fetch(`${API_BASE_URL}/habits`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              routine_id: habit.routineId || habit.routine_id,
              name: habit.name,
              period: habit.period,
              frequency: habit.frequency,
              specific_days: habit.specificDays || habit.specific_days,
              times_per_week: habit.timesPerWeek || habit.times_per_week,
              start_date: habit.startDate || habit.start_date,
              end_date: habit.endDate || habit.end_date,
              icon: habit.icon,
              color: habit.color || '#8b5cf6',
              is_active: habit.isActive !== false,
            }),
          });

          if (response.ok) {
            const createdHabit = await response.json();
            result.habits++;
            console.log(`✅ Hábito migrado: ${habit.name}`);

            const completionsData = localStorage.getItem('habit-completions-v1');
            if (completionsData) {
              const completions = JSON.parse(completionsData);
              const habitCompletions = completions.filter(
                (c: any) => c.habitId === habit.id
              );

              for (const completion of habitCompletions) {
                try {
                  await fetch(`${API_BASE_URL}/habit-completions/toggle`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      habit_id: createdHabit.id,
                      completion_date: completion.completionDate || completion.completion_date,
                    }),
                  });
                  result.habitCompletions++;
                } catch (error) {
                  console.warn(`Erro ao migrar completion: ${error}`);
                }
              }
            }
          } else {
            const error = await response.text();
            result.errors.push(`Hábito ${habit.name}: ${error}`);
          }
        } catch (error) {
          result.errors.push(`Hábito ${habit.name}: ${error}`);
        }
      }
    }

    const moodsData = localStorage.getItem('daily-mood-data-v2');
    if (moodsData) {
      const moods = JSON.parse(moodsData);
      console.log(`😊 Encontrados ${moods.length} registros de humor`);

      for (const mood of moods) {
        try {
          const response = await fetch(`${API_BASE_URL}/moods`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mood_date: mood.moodDate || mood.mood_date,
              emotion_ids: mood.emotionIds || mood.emotion_ids || [],
              day_rating: mood.dayRating || mood.day_rating,
              notes: mood.notes,
            }),
          });

          if (response.ok) {
            result.moods++;
            console.log(`✅ Humor migrado: ${mood.moodDate || mood.mood_date}`);
          } else {
            const error = await response.text();
            result.errors.push(`Humor ${mood.moodDate}: ${error}`);
          }
        } catch (error) {
          result.errors.push(`Humor ${mood.moodDate}: ${error}`);
        }
      }
    }

    console.log('✅ Migração concluída!');
    console.log(`📊 Resumo:
      - Rotinas: ${result.routines}
      - Hábitos: ${result.habits}
      - Completions de Hábitos: ${result.habitCompletions}
      - Registros de Humor: ${result.moods}
      - Erros: ${result.errors.length}
    `);

    if (result.errors.length > 0) {
      console.error('⚠️ Erros durante a migração:', result.errors);
    }

    return result;
  } catch (error) {
    console.error('❌ Erro fatal na migração:', error);
    result.errors.push(`Erro fatal: ${error}`);
    return result;
  }
}

export async function backupLocalStorage(): Promise<string> {
  const backup: Record<string, string> = {};

  const keys = [
    'routines-data',
    'routine-completions-data',
    'habits-data-v1',
    'habit-completions-v1',
    'daily-mood-data-v2',
  ];

  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      backup[key] = data;
    }
  });

  const backupJson = JSON.stringify(backup, null, 2);
  console.log('💾 Backup criado:', backupJson);

  return backupJson;
}

export function clearLocalStorageData() {
  const keys = [
    'routines-data',
    'routine-completions-data',
    'habits-data-v1',
    'habit-completions-v1',
    'daily-mood-data-v2',
  ];

  keys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removido: ${key}`);
  });

  console.log('✅ localStorage limpo!');
  toast.success('Dados do localStorage removidos');
}
