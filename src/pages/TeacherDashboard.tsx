import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, Calendar, CheckCircle, Clock, AlertTriangle, LogOut, GraduationCap, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import TeacherCalendar from '@/components/TeacherCalendar';
import iconLogo from '../assets/icon.png';

interface Assignment {
  id: number;
  subject: {
    id: number;
    name: string;
    code: string;
  };
  group: {
    id: number;
    name: string;
    grade: string;
    section: string;
    studentCount: number;
  };
  academicYear: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  priority: string;
  subject: {
    name: string;
    code: string;
  };
  group: {
    name: string;
    grade: string;
    section: string;
  };
}

interface TeacherDashboardData {
  assignments: Assignment[];
  tasks: Task[];
  stats: {
    totalSubjects: number;
    totalGroups: number;
    totalTasks: number;
    pendingTasks: number;
    completedTasks: number;
    overdueTasks: number;
  };
}

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar'>('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/teacher', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDashboardData(data.data);
        } else {
          toast.error('Error al cargar los datos del dashboard');
        }
      } else {
        toast.error('Error de conexión al servidor');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src={iconLogo} alt="Logo I.E de Jesús" className="h-8 w-8 mr-3" />
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-lg font-semibold text-blue-600">I.E de Jesús</span>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard Profesor</h1>
                </div>
                <p className="text-sm text-gray-600">Sistema de Gestión de Tareas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'calendar'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Calendario
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Materias</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.totalSubjects || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Grupos</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.totalGroups || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.pendingTasks || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardData?.stats?.completedTasks || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments and Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assignments */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mis Asignaciones</h3>
              <BookOpen className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {dashboardData?.assignments && dashboardData.assignments.length > 0 ? (
                dashboardData.assignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {assignment.subject.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          Código: {assignment.subject.code}
                        </p>
                      </div>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {assignment.academicYear}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        <span>
                          {assignment.group.name} ({assignment.group.grade}{assignment.group.section})
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {assignment.group.studentCount} estudiantes
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay asignaciones</p>
              )}
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tareas Recientes</h3>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {dashboardData?.tasks && dashboardData.tasks.length > 0 ? (
                dashboardData.tasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {task.subject.name} - {task.group.name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Vence: {formatDate(task.dueDate)}
                      </span>
                      {task.status === 'overdue' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay tareas recientes</p>
              )}
            </div>
          </div>
        </div>

        {/* Task Summary */}
        {dashboardData?.stats?.overdueTasks && dashboardData.stats?.overdueTasks > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Atención: Tienes {dashboardData.stats?.overdueTasks} tarea(s) vencida(s)
                </h4>
                <p className="text-xs text-red-600 mt-1">
                  Revisa tus tareas pendientes para ponerte al día.
                </p>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {activeTab === 'calendar' && (
          <TeacherCalendar userId={user?.id || 0} />
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard;