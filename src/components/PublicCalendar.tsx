import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  teacher: {
    id: number;
    firstName: string;
    lastName: string;
  };
  subject: {
    id: number;
    name: string;
    code: string;
  };
  group: {
    id: number;
    name: string;
    grade: number;
    section: string;
  };
}

interface Group {
  id: number;
  name: string;
  grade: number;
  section: string;
}

interface PublicCalendarProps {
  onTaskClick: (task: Task) => void;
}

const PublicCalendar: React.FC<PublicCalendarProps> = ({ onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Cargar grupos disponibles
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/public/groups');
        const data = await response.json();
        if (data.success) {
          setGroups(data.data);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Error al cargar los grupos');
      }
    };

    fetchGroups();
  }, []);

  // Cargar tareas cuando cambia el grupo o el mes
  useEffect(() => {
    if (selectedGroup) {
      fetchTasks();
    }
  }, [selectedGroup, currentDate]);

  const fetchTasks = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await fetch(`/api/public/calendar/group/${selectedGroup}/${year}/${month}`);
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.data);
      } else {
        toast.error('Error al cargar las tareas');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  // Obtener tareas de un día específico
  const getTasksForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      const taskDateStr = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
      return taskDateStr === dateStr;
    });
  };

  // Calcular color según días restantes
  const getColorForDay = (day: number) => {
    const dayTasks = getTasksForDay(day);
    if (dayTasks.length === 0) return '';

    const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    currentDay.setHours(0, 0, 0, 0);
    
    const diffTime = currentDay.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Colores vivos y brillantes
    if (diffDays <= 0) {
      // Mismo día o pasado - rojo brillante
      return 'bg-red-500 text-white border-red-600';
    } else if (diffDays === 1) {
      // 1 día antes - rojo brillante
      return 'bg-red-500 text-white border-red-600';
    } else if (diffDays === 2 || diffDays === 3) {
      // 2-3 días - amarillo brillante
      return 'bg-yellow-400 text-black border-yellow-500';
    } else {
      // 4+ días - verde brillante
      return 'bg-green-500 text-white border-green-600';
    }
  };

  // Obtener mensaje para el día actual
  const getTodayMessage = (day: number) => {
    const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    currentDay.setHours(0, 0, 0, 0);
    
    if (currentDay.getTime() === today.getTime()) {
      const dayTasks = getTasksForDay(day);
      if (dayTasks.length > 0) {
        return '¡Hoy tienes que entregar!';
      }
    }
    return null;
  };

  // Navegación del calendario
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      {/* Header con filtros */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Calendario de Actividades</h1>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">Seleccionar Grupo:</label>
            <select
              value={selectedGroup || ''}
              onChange={(e) => setSelectedGroup(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
            >
              <option value="">Selecciona un grupo</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} - {group.grade}° Grado, Sección {group.section}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedGroup ? (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Selecciona un grupo para ver las actividades</p>
        </div>
      ) : (
        <>
          {/* Navegación del calendario */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Anterior
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={goToNextMonth}
              className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Siguiente
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>

          {/* Calendario */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Encabezados de días */}
            <div className="grid grid-cols-7 bg-gray-50">
              {dayNames.map(day => (
                <div key={day} className="p-4 text-center font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7">
              {generateCalendarDays().map((day, index) => {
                if (day === null) {
                  return <div key={index} className="h-32 border-r border-b border-gray-200 last:border-r-0"></div>;
                }

                const dayTasks = getTasksForDay(day);
                const colorClass = getColorForDay(day);
                const todayMessage = getTodayMessage(day);

                return (
                  <div
                    key={day}
                    className={`h-32 border-r border-b border-gray-200 last:border-r-0 p-2 relative ${
                      colorClass || 'hover:bg-gray-50'
                    } transition-colors cursor-pointer`}
                  >
                    <div className="font-semibold text-lg mb-1">{day}</div>
                    
                    {todayMessage && (
                      <div className="text-xs font-bold mb-2 text-center">
                        {todayMessage}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity bg-white bg-opacity-90 border border-gray-300"
                        >
                          <div className="font-medium truncate">{task.title}</div>
                          <div className="text-gray-600 truncate">{task.subject.name}</div>
                        </div>
                      ))}
                      
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-center font-medium">
                          +{dayTasks.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando actividades...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PublicCalendar;