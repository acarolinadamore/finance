import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { api } from '../../services/api';
import { CalendarEvent } from '../../types';

const { width } = Dimensions.get('window');
const DAY_WIDTH = (width - 48) / 7;

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function CalendarioScreen() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const data = await api.get<CalendarEvent[]>(
        `/events?start_date=${startDate}&end_date=${endDate}`
      );
      setEvents(data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    // Dias vazios antes do primeiro dia
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.startDate.startsWith(dateStr));
  };

  const selectedDayEvents = getEventsForDay(selectedDate.getDate());

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calendário</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      {/* Navegação do mês */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
          <ChevronLeft color="#1f2937" size={24} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
          <ChevronRight color="#1f2937" size={24} />
        </TouchableOpacity>
      </View>

      {/* Dias da semana */}
      <View style={styles.weekDays}>
        {WEEKDAYS.map(day => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      {/* Grid de dias */}
      <View style={styles.daysGrid}>
        {getDaysInMonth().map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              isToday(day!) && styles.todayCell,
              isSelected(day!) && styles.selectedCell,
            ]}
            onPress={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
            disabled={!day}
          >
            {day && (
              <>
                <Text style={[
                  styles.dayText,
                  isToday(day) && styles.todayText,
                  isSelected(day) && styles.selectedText,
                ]}>
                  {day}
                </Text>
                {getEventsForDay(day).length > 0 && (
                  <View style={styles.eventDot} />
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Eventos do dia selecionado */}
      <ScrollView style={styles.eventsContainer}>
        <Text style={styles.eventsTitle}>
          Eventos - {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]}
        </Text>

        {selectedDayEvents.map(event => (
          <View key={event.id} style={styles.eventCard}>
            <View style={[styles.eventColor, { backgroundColor: event.color || '#3b82f6' }]} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              {event.description && (
                <Text style={styles.eventDescription}>{event.description}</Text>
              )}
            </View>
          </View>
        ))}

        {selectedDayEvents.length === 0 && (
          <Text style={styles.noEvents}>Nenhum evento para este dia</Text>
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
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  weekDays: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  weekDay: {
    width: DAY_WIDTH,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dayCell: {
    width: DAY_WIDTH,
    height: DAY_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    backgroundColor: '#dbeafe',
    borderRadius: DAY_WIDTH / 2,
  },
  selectedCell: {
    backgroundColor: '#3b82f6',
    borderRadius: DAY_WIDTH / 2,
  },
  dayText: {
    fontSize: 16,
    color: '#1f2937',
  },
  todayText: {
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginTop: 2,
  },
  eventsContainer: {
    flex: 1,
    padding: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventColor: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  noEvents: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 20,
  },
});
