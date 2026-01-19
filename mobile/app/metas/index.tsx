import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Plus, Target } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../services/api';
import { Goal } from '../../types';

export default function MetasScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await api.get<Goal[]>('/goals');
      setGoals(data);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (goal: Goal) => {
    if (!goal.targetValue || goal.targetValue === 0) return 0;
    return Math.min(100, ((goal.currentValue || 0) / goal.targetValue) * 100);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sonhos & Metas</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Lista de metas */}
      <ScrollView style={styles.content}>
        {goals.map(goal => {
          const progress = calculateProgress(goal);
          return (
            <TouchableOpacity key={goal.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={[styles.iconContainer, { backgroundColor: goal.color || '#8b5cf6' }]}>
                  <Target color="#fff" size={24} />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={styles.goalTitle}>{goal.title}</Text>
                  {goal.description && (
                    <Text style={styles.goalDescription} numberOfLines={1}>
                      {goal.description}
                    </Text>
                  )}
                </View>
              </View>

              {goal.targetValue && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={[goal.color || '#8b5cf6', (goal.color || '#8b5cf6') + 'aa']}
                      style={[styles.progressFill, { width: `${progress}%` }]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {goal.currentValue || 0} / {goal.targetValue} {goal.unit || ''}
                    {' '}({progress.toFixed(0)}%)
                  </Text>
                </View>
              )}

              {goal.targetDate && (
                <Text style={styles.targetDate}>
                  Meta: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {goals.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Target color="#9ca3af" size={48} />
            <Text style={styles.emptyText}>Nenhuma meta cadastrada</Text>
            <Text style={styles.emptySubtext}>Toque no + para adicionar sua primeira meta</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf7f2',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#8b5cf6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  goalDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
  },
  targetDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});
