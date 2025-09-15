import React, { useState } from 'react';
import PublicCalendar from '../components/PublicCalendar';
import TaskDetailModal from '../components/TaskDetailModal';
import iconLogo from '../assets/icon.png';

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

const PublicCalendarPage: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header con colores vivos */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-8 shadow-lg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <img src={iconLogo} alt="Logo I.E de Jesús" className="w-10 h-10" />
              <h2 className="text-2xl font-semibold opacity-95">I.E de Jesús</h2>
            </div>
            <div className="w-24 h-0.5 bg-white/60 mx-auto"></div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Calendario de Actividades Estudiantiles</h1>
          <p className="text-xl opacity-90">
            Consulta las actividades y tareas de tu grado de forma fácil y rápida
          </p>
        </div>
      </div>

      {/* Información de colores */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Guía de Colores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded border-2 border-red-600"></div>
              <span className="text-gray-700">
                <strong>Rojo:</strong> Entrega hoy o mañana
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-yellow-400 rounded border-2 border-yellow-500"></div>
              <span className="text-gray-700">
                <strong>Amarillo:</strong> Entrega en 2-3 días
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded border-2 border-green-600"></div>
              <span className="text-gray-700">
                <strong>Verde:</strong> Entrega en 4+ días
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario principal */}
      <div className="pb-8">
        <PublicCalendar onTaskClick={handleTaskClick} />
      </div>

      {/* Modal de detalles */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-lg">
            Sistema de Gestión de Tareas Escolares
          </p>
          <p className="text-gray-400 mt-2">
            Consulta pública - No requiere inicio de sesión
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicCalendarPage;