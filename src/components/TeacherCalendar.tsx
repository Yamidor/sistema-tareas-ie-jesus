import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Group {
  id: number;
  name: string;
  grade: string;
  section: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  subject: {
    id: number;
    name: string;
    code: string;
  };
  userId: number;
}

interface CalendarDay {
  date: Date;
  tasks: Task[];
  isCurrentMonth: boolean;
}

interface TeacherCalendarProps {
  userId: number;
}

const TeacherCalendar: React.FC<TeacherCalendarProps> = ({ userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    subjectId: ''
  });

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupSubjects();
      fetchCalendarTasks();
    }
  }, [selectedGroup, currentDate]);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/teacher-tasks/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGroups(data.data);
          if (data.data.length > 0) {
            setSelectedGroup(data.data[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Error al cargar los grupos');
    }
  };

  const fetchGroupSubjects = async () => {
    if (!selectedGroup) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teacher-tasks/groups/${selectedGroup}/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSubjects(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching group subjects:', error);
      toast.error('Error al cargar las materias del grupo');
    }
  };

  const fetchCalendarTasks = async () => {
    if (!selectedGroup) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const response = await fetch(`/api/teacher-tasks/calendar/${selectedGroup}/${year}/${month}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          generateCalendarDays(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching calendar tasks:', error);
      toast.error('Error al cargar las tareas del calendario');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCalendarDays = (tasks: Task[]) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const currentDateIterator = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayTasks = tasks.filter(task => {
        // Extraer solo la fecha sin conversiones de zona horaria
        const taskDateStr = task.dueDate.split('T')[0]; // Obtener solo YYYY-MM-DD
        const [year, month, day] = taskDateStr.split('-').map(Number);
        const taskDate = new Date(year, month - 1, day); // Crear fecha local
        return taskDate.toDateString() === currentDateIterator.toDateString();
      });
      
      days.push({
        date: new Date(currentDateIterator),
        tasks: dayTasks,
        isCurrentMonth: currentDateIterator.getMonth() === month
      });
      
      currentDateIterator.setDate(currentDateIterator.getDate() + 1);
    }
    
    setCalendarDays(days);
  };

  const getDayColor = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return 'bg-gray-100 text-gray-400';
    
    const taskCount = day.tasks.length;
    if (taskCount === 0) return 'bg-green-100 text-green-800 hover:bg-green-200';
    if (taskCount === 1) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    if (taskCount >= 2) return 'bg-red-100 text-red-800 hover:bg-red-200';
    return 'bg-green-100 text-green-800 hover:bg-green-200';
  };

  const canAddTask = (day: CalendarDay) => {
    return day.isCurrentMonth && day.tasks.length < 2;
  };

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return;
    
    if (day.tasks.length >= 2) {
      toast.error('No se pueden registrar más de 2 actividades para entregar por día');
      return;
    }
    
    setSelectedDate(day.date);
    setEditingTask(null);
    setTaskForm({ title: '', description: '', subjectId: '' });
    setShowTaskModal(true);
  };

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.userId === userId) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description,
        subjectId: task.subject.id.toString()
      });
      // Extraer fecha sin conversiones de zona horaria
      const taskDateStr = task.dueDate.split('T')[0];
      const [year, month, day] = taskDateStr.split('-').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
      setShowTaskModal(true);
    }
  };

  const handleSaveTask = async () => {
    if (!selectedDate || !selectedGroup || !taskForm.title || !taskForm.subjectId) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingTask ? `/api/teacher-tasks/${editingTask.id}` : '/api/teacher-tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description,
          dueDate: `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`,
          subjectId: parseInt(taskForm.subjectId),
          groupId: selectedGroup
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(editingTask ? 'Tarea actualizada exitosamente' : 'Tarea creada exitosamente');
          setShowTaskModal(false);
          fetchCalendarTasks();
        } else {
          toast.error(data.message || 'Error al guardar la tarea');
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Error al guardar la tarea');
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teacher-tasks/${editingTask.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Tarea eliminada exitosamente');
          setShowTaskModal(false);
          fetchCalendarTasks();
        } else {
          toast.error(data.message || 'Error al eliminar la tarea');
        }
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error al eliminar la tarea');
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">Calendario de Tareas</h3>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Group selector */}
          <select
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar grupo</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.grade}{group.section})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h4 className="text-xl font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[100px] p-2 border border-gray-200 cursor-pointer transition-colors ${
                getDayColor(day)
              } ${!canAddTask(day) && day.isCurrentMonth ? 'cursor-not-allowed' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <div className="text-sm font-medium mb-1">
                {day.date.getDate()}
              </div>
              
              <div className="space-y-1">
                {day.tasks.map(task => (
                  <div
                    key={task.id}
                    className={`text-xs p-1 rounded bg-white bg-opacity-80 truncate ${
                      task.userId === userId ? 'hover:bg-opacity-100 cursor-pointer' : 'cursor-default'
                    }`}
                    onClick={(e) => handleTaskClick(task, e)}
                    title={`${task.subject.name}: ${task.title}`}
                  >
                    <div className="font-medium">{task.subject.code}</div>
                    <div className="truncate">{task.title}</div>
                  </div>
                ))}
              </div>
              
              {canAddTask(day) && (
                <div className="mt-1 flex justify-center">
                  <Plus className="h-4 w-4 text-gray-500" />
                </div>
              )}
              {day.isCurrentMonth && day.tasks.length >= 2 && (
                <div className="mt-1 flex justify-center">
                  <span className="text-xs text-red-600 font-medium">Máximo 2</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título de la tarea"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción de la tarea"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Materia *
                </label>
                <select
                  value={taskForm.subjectId}
                  onChange={(e) => setTaskForm({ ...taskForm, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar materia</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : ''}
                  onChange={(e) => {
                    const [year, month, day] = e.target.value.split('-').map(Number);
                    setSelectedDate(new Date(year, month - 1, day));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <div>
                {editingTask && (
                  <button
                    onClick={handleDeleteTask}
                    className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTask}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {editingTask ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {editingTask ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherCalendar;