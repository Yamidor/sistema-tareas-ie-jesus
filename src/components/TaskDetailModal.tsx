import React from 'react';
import { X, Calendar, User, BookOpen, AlertCircle } from 'lucide-react';

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

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose }) => {
  if (!isOpen || !task) return null;

  const formatDate = (dateString: string) => {
    // Extraer fecha sin conversiones de zona horaria
    const datePart = dateString.split('T')[0]; // Obtener solo YYYY-MM-DD
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Crear fecha usando los componentes directamente para evitar problemas de zona horaria
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  // Calcular días restantes
  const getDaysRemaining = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Extraer fecha sin conversiones de zona horaria
    const datePart = task.dueDate.split('T')[0]; // Obtener solo YYYY-MM-DD
    const [year, month, day] = datePart.split('-').map(Number);
    
    // Crear fecha usando los componentes directamente para evitar problemas de zona horaria
    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  const getUrgencyMessage = () => {
    if (daysRemaining < 0) {
      return {
        message: '¡Actividad vencida!',
        color: 'text-red-600 font-bold'
      };
    } else if (daysRemaining === 0) {
      return {
        message: '¡Hoy es la fecha de entrega!',
        color: 'text-red-600 font-bold'
      };
    } else if (daysRemaining === 1) {
      return {
        message: '¡Entrega mañana!',
        color: 'text-red-600 font-bold'
      };
    } else if (daysRemaining <= 3) {
      return {
        message: `Quedan ${daysRemaining} días`,
        color: 'text-yellow-600 font-semibold'
      };
    } else {
      return {
        message: `Quedan ${daysRemaining} días`,
        color: 'text-green-600 font-medium'
      };
    }
  };

  const urgencyInfo = getUrgencyMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-xl">
          <h2 className="text-2xl font-bold">Detalles de la Actividad</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Título y urgencia */}
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-gray-900">{task.title}</h3>
            <div className={`text-lg ${urgencyInfo.color}`}>
              {urgencyInfo.message}
            </div>
          </div>

          {/* Información principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha de entrega */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Fecha de Entrega</span>
              </div>
              <p className="text-blue-800 font-medium">{formatDate(task.dueDate)}</p>
            </div>

            {/* Materia */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3 mb-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-900">Materia</span>
              </div>
              <p className="text-green-800 font-medium">{task.subject.name}</p>
              <p className="text-green-600 text-sm">Código: {task.subject.code}</p>
            </div>

            {/* Profesor */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3 mb-2">
                <User className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-900">Profesor</span>
              </div>
              <p className="text-purple-800 font-medium">
                {task.teacher.firstName} {task.teacher.lastName}
              </p>
            </div>
          </div>

          {/* Grupo */}
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-semibold text-orange-900">Grupo</span>
            </div>
            <p className="text-orange-800 font-medium">
              {task.group.name} - {task.group.grade}° Grado, Sección {task.group.section}
            </p>
          </div>

          {/* Descripción */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Descripción de la Actividad</h4>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {task.description || 'No hay descripción disponible para esta actividad.'}
            </div>
          </div>

          {/* Mensaje especial para entregas del día */}
          {daysRemaining === 0 && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
                <div>
                  <p className="text-red-800 font-bold text-lg">
                    ¡Hoy tienes que entregar esta actividad!
                  </p>
                  <p className="text-red-700">
                    Asegúrate de completar y entregar tu trabajo antes de que termine el día.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;