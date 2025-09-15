import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Users, BookOpen, Calendar, CheckCircle, AlertCircle, LogOut, BarChart3, UserPlus, Edit, Trash2, Search, UserCheck, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface DashboardStats {
  totalTeachers: number;
  totalSubjects: number;
  totalGroups: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  recentTasks: Array<{
    id: number;
    title: string;
    subject: string;
    group: string;
    teacher: string;
    dueDate: string;
    status: string;
    priority: string;
  }>;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'coordinator' | 'teacher';
  createdAt: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Group {
  id: number;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  studentCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Assignment {
  id: number;
  teacherId: number;
  subjectId: number;
  groupId: number;
  academicYear: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
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
  };
}

const CoordinatorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');

  // Groups state
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState('');
  
  // Assignments state
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [assignmentSearchTerm, setAssignmentSearchTerm] = useState('');
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'subjects' | 'groups' | 'assignments'>('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/coordinator', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Mapear los datos del backend al formato esperado por el frontend
          const mappedStats: DashboardStats = {
            totalTeachers: data.data.statistics.totalTeachers,
            totalSubjects: data.data.statistics.totalSubjects,
            totalGroups: data.data.statistics.totalGroups,
            totalTasks: data.data.statistics.totalTasks,
            pendingTasks: data.data.tasksByStatus?.find((t: any) => t.status === 'pending')?.count || 0,
            completedTasks: data.data.tasksByStatus?.find((t: any) => t.status === 'completed')?.count || 0,
            recentTasks: data.data.recentTasks?.map((task: any) => ({
              id: task.id,
              title: task.title,
              subject: task.subject?.name || 'Sin materia',
              group: `${task.group?.name || 'Sin grupo'} - ${task.group?.grade || ''}° ${task.group?.section || ''}`,
              teacher: `${task.teacher?.firstName || ''} ${task.teacher?.lastName || ''}`.trim(),
              dueDate: task.dueDate,
              status: task.status,
              priority: task.priority
            })) || []
          };
          setStats(mappedStats);
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

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.data.users || []);
        } else {
          toast.error('Error al cargar los usuarios');
        }
      } else {
        toast.error('Error de conexión al servidor');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleRegisterUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Registrar Nuevo Usuario',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input id="firstName" class="swal2-input" placeholder="Nombre" style="margin: 0; width: 100%;">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input id="lastName" class="swal2-input" placeholder="Apellido" style="margin: 0; width: 100%;">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" type="email" class="swal2-input" placeholder="Email" style="margin: 0; width: 100%;">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input id="password" type="password" class="swal2-input" placeholder="Contraseña" style="margin: 0; width: 100%;">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select id="role" class="swal2-select" style="margin: 0; width: 100%;">
              <option value="teacher">Profesor</option>
              <option value="coordinator">Coordinador</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
        const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const password = (document.getElementById('password') as HTMLInputElement).value;
        const role = (document.getElementById('role') as HTMLSelectElement).value;

        if (!firstName || !lastName || !email || !password) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        if (password.length < 6) {
          Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
          return false;
        }

        return { firstName, lastName, email, password, role };
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formValues),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          toast.success('Usuario registrado exitosamente');
          fetchUsers();
        } else {
          toast.error(data.message || 'Error al registrar usuario');
        }
      } catch (error) {
        console.error('Error registering user:', error);
        toast.error('Error al registrar usuario');
      }
    }
  };

  const handleEditUser = async (userToEdit: User) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Usuario',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input id="firstName" class="swal2-input" value="${userToEdit.firstName}" style="margin: 0; width: 100%;">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input id="lastName" class="swal2-input" value="${userToEdit.lastName}" style="margin: 0; width: 100%;">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" type="email" class="swal2-input" value="${userToEdit.email}" style="margin: 0; width: 100%;">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select id="role" class="swal2-select" style="margin: 0; width: 100%;">
              <option value="teacher" ${userToEdit.role === 'teacher' ? 'selected' : ''}>Profesor</option>
              <option value="coordinator" ${userToEdit.role === 'coordinator' ? 'selected' : ''}>Coordinador</option>
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
        const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const role = (document.getElementById('role') as HTMLSelectElement).value;

        if (!firstName || !lastName || !email) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        return { firstName, lastName, email, role };
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${userToEdit.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formValues),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          toast.success('Usuario actualizado exitosamente');
          fetchUsers();
        } else {
          toast.error(data.message || 'Error al actualizar usuario');
        }
      } catch (error) {
        console.error('Error updating user:', error);
        toast.error('Error al actualizar usuario');
      }
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario ${userToDelete.firstName} ${userToDelete.lastName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/users/${userToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (response.ok && data.success) {
          toast.success('Usuario eliminado exitosamente');
          fetchUsers();
        } else {
          toast.error(data.message || 'Error al eliminar usuario');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Error al eliminar usuario');
      }
    }
  };

  // Función para obtener asignaturas
  const fetchSubjects = async () => {
    try {
      setIsLoadingSubjects(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/subjects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSubjects(data.data.subjects || []);
        toast.success(`Cargadas ${data.data.subjects?.length || 0} asignaturas`);
      } else {
        toast.error(data.message || 'Error al cargar asignaturas');
      }
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
      toast.error('Error al cargar asignaturas');
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  // Función para obtener grupos
  const fetchGroups = async () => {
    try {
      setIsLoadingGroups(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/groups', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setGroups(data.data.groups || []);
        toast.success(`Cargados ${data.data.groups?.length || 0} grupos`);
      } else {
        toast.error(data.message || 'Error al cargar grupos');
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error);
      toast.error('Error al cargar grupos');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Función para registrar nueva asignatura
  const handleRegisterSubject = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Registrar Nueva Asignatura',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Asignatura *</label>
            <input id="swal-input-name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Ej: Matemáticas" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Código (Opcional)</label>
            <input id="swal-input-code" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Ej: MAT101">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
            <textarea id="swal-input-description" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" rows="3" placeholder="Descripción de la asignatura"></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a34a',
      preConfirm: () => {
        const name = (document.getElementById('swal-input-name') as HTMLInputElement)?.value;
        const code = (document.getElementById('swal-input-code') as HTMLInputElement)?.value;
        const description = (document.getElementById('swal-input-description') as HTMLTextAreaElement)?.value;
        
        if (!name) {
          Swal.showValidationMessage('El nombre de la asignatura es requerido');
          return false;
        }
        
        return { name, code, description };
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formValues)
        });

        const data = await response.json();
        if (response.ok) {
          toast.success('Asignatura registrada exitosamente');
          fetchSubjects();
        } else {
          toast.error(data.message || 'Error al registrar asignatura');
        }
      } catch (error) {
        console.error('Error registering subject:', error);
        toast.error('Error al registrar asignatura');
      }
    }
  };

  // Función para editar asignatura
  const handleEditSubject = async (subject: Subject) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Asignatura',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Asignatura *</label>
            <input id="swal-input-name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" value="${subject.name}" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Código (Opcional)</label>
            <input id="swal-input-code" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" value="${subject.code || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
            <textarea id="swal-input-description" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" rows="3">${subject.description || ''}</textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#16a34a',
      preConfirm: () => {
        const name = (document.getElementById('swal-input-name') as HTMLInputElement)?.value;
        const code = (document.getElementById('swal-input-code') as HTMLInputElement)?.value;
        const description = (document.getElementById('swal-input-description') as HTMLTextAreaElement)?.value;
        
        if (!name) {
          Swal.showValidationMessage('El nombre de la asignatura es requerido');
          return false;
        }
        
        return { name, code, description };
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/subjects/${subject.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formValues)
        });

        const data = await response.json();
        if (response.ok) {
          toast.success('Asignatura actualizada exitosamente');
          fetchSubjects();
        } else {
          toast.error(data.message || 'Error al actualizar asignatura');
        }
      } catch (error) {
        console.error('Error updating subject:', error);
        toast.error('Error al actualizar asignatura');
      }
    }
  };

  // Función para eliminar asignatura
  const handleDeleteSubject = async (subjectId: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/subjects/${subjectId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          toast.success('Asignatura eliminada exitosamente');
          fetchSubjects();
        } else {
          toast.error(data.message || 'Error al eliminar asignatura');
        }
      } catch (error) {
        console.error('Error deleting subject:', error);
        toast.error('Error al eliminar asignatura');
      }
    }
  };

  // Función para filtrar asignaturas
  const filteredSubjects = subjects.filter(subject => {
    const searchTerm = subjectSearchTerm.toLowerCase();
    return (
      subject.name.toLowerCase().includes(searchTerm) ||
      (subject.code && subject.code.toLowerCase().includes(searchTerm)) ||
      (subject.description && subject.description.toLowerCase().includes(searchTerm))
    );
  });

  // Función para registrar nuevo grupo
  const handleRegisterGroup = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Registrar Nuevo Grupo',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo *</label>
            <input id="swal-input-name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: 10-A" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
            <select id="swal-input-grade" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="">Seleccionar grado</option>
              <option value="6">6°</option>
              <option value="7">7°</option>
              <option value="8">8°</option>
              <option value="9">9°</option>
              <option value="10">10°</option>
              <option value="11">11°</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sección *</label>
            <select id="swal-input-section" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="">Seleccionar sección</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Año Académico *</label>
            <input id="swal-input-year" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value="${new Date().getFullYear()}" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad de Estudiantes *</label>
            <input id="swal-input-students" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: 30" min="1" required>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      preConfirm: () => {
        const name = (document.getElementById('swal-input-name') as HTMLInputElement)?.value;
        const grade = (document.getElementById('swal-input-grade') as HTMLSelectElement)?.value;
        const section = (document.getElementById('swal-input-section') as HTMLSelectElement)?.value;
        const academicYear = (document.getElementById('swal-input-year') as HTMLInputElement)?.value;
        const studentCount = (document.getElementById('swal-input-students') as HTMLInputElement)?.value;
        
        if (!name || !grade || !section || !academicYear || !studentCount) {
          Swal.showValidationMessage('Todos los campos son requeridos');
          return false;
        }
        
        return { name, grade, section, academicYear, studentCount: parseInt(studentCount) };
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/groups', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formValues)
        });

        const data = await response.json();
        if (response.ok) {
          toast.success('Grupo registrado exitosamente');
          fetchGroups();
        } else {
          toast.error(data.message || 'Error al registrar grupo');
        }
      } catch (error) {
        console.error('Error registering group:', error);
        toast.error('Error al registrar grupo');
      }
    }
  };

  // Función para editar grupo
  const handleEditGroup = async (group: Group) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar Grupo',
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo *</label>
            <input id="swal-input-name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value="${group.name}" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Grado *</label>
            <select id="swal-input-grade" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="6" ${group.grade === '6' ? 'selected' : ''}>6°</option>
              <option value="7" ${group.grade === '7' ? 'selected' : ''}>7°</option>
              <option value="8" ${group.grade === '8' ? 'selected' : ''}>8°</option>
              <option value="9" ${group.grade === '9' ? 'selected' : ''}>9°</option>
              <option value="10" ${group.grade === '10' ? 'selected' : ''}>10°</option>
              <option value="11" ${group.grade === '11' ? 'selected' : ''}>11°</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sección *</label>
            <select id="swal-input-section" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
              <option value="A" ${group.section === 'A' ? 'selected' : ''}>A</option>
              <option value="B" ${group.section === 'B' ? 'selected' : ''}>B</option>
              <option value="C" ${group.section === 'C' ? 'selected' : ''}>C</option>
              <option value="D" ${group.section === 'D' ? 'selected' : ''}>D</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Año Académico *</label>
            <input id="swal-input-year" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value="${group.academicYear}" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad de Estudiantes *</label>
            <input id="swal-input-students" type="number" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" value="${group.studentCount}" min="1" required>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      preConfirm: () => {
        const name = (document.getElementById('swal-input-name') as HTMLInputElement)?.value;
        const grade = (document.getElementById('swal-input-grade') as HTMLSelectElement)?.value;
        const section = (document.getElementById('swal-input-section') as HTMLSelectElement)?.value;
        const academicYear = (document.getElementById('swal-input-year') as HTMLInputElement)?.value;
        const studentCount = (document.getElementById('swal-input-students') as HTMLInputElement)?.value;
        
        if (!name || !grade || !section || !academicYear || !studentCount) {
          Swal.showValidationMessage('Todos los campos son requeridos');
          return false;
        }
        
        return { name, grade, section, academicYear, studentCount: parseInt(studentCount) };
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/groups/${group.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formValues)
        });

        const data = await response.json();
        if (response.ok) {
          toast.success('Grupo actualizado exitosamente');
          fetchGroups();
        } else {
          toast.error(data.message || 'Error al actualizar grupo');
        }
      } catch (error) {
        console.error('Error updating group:', error);
        toast.error('Error al actualizar grupo');
      }
    }
  };

  // Función para eliminar grupo
  const handleDeleteGroup = async (groupId: number) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/groups/${groupId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          toast.success('Grupo eliminado exitosamente');
          fetchGroups();
        } else {
          toast.error(data.message || 'Error al eliminar grupo');
        }
      } catch (error) {
        console.error('Error deleting group:', error);
        toast.error('Error al eliminar grupo');
      }
    }
  };

  // Función para filtrar grupos
  const filteredGroups = groups.filter(group => {
    const searchTerm = groupSearchTerm.toLowerCase();
    return (
      group.name.toLowerCase().includes(searchTerm) ||
      group.grade.toLowerCase().includes(searchTerm) ||
      group.section.toLowerCase().includes(searchTerm) ||
      group.academicYear.toLowerCase().includes(searchTerm)
    );
  });

  // Funciones para asignaciones
  const fetchAssignments = async () => {
    setIsLoadingAssignments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAssignments(data.data.assignments || []);
        } else {
          toast.error('Error al cargar las asignaciones');
        }
      } else {
        toast.error('Error de conexión al servidor');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Error al cargar las asignaciones');
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const fetchAvailableGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments/groups/available', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableGroups(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching available groups:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users?role=teacher', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTeachers(data.data.users?.filter((user: User) => user.role === 'teacher') || []);
        }
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleCreateAssignment = async () => {
    // Ensure we have fresh data
    await Promise.all([fetchTeachers(), fetchAvailableGroups()]);
    
    if (availableGroups.length === 0) {
      await Swal.fire({
        title: 'Sin grupos disponibles',
        text: 'No hay grupos disponibles para asignar. Todos los grupos ya tienen un profesor asignado.',
        icon: 'warning'
      });
      return;
    }

    if (teachers.length === 0) {
      await Swal.fire({
        title: 'Sin profesores disponibles',
        text: 'No hay profesores activos disponibles para asignar.',
        icon: 'warning'
      });
      return;
    }

    if (subjects.filter(s => s.isActive).length === 0) {
      await Swal.fire({
        title: 'Sin materias disponibles',
        text: 'No hay materias activas disponibles para asignar.',
        icon: 'warning'
      });
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: 'Nueva Asignación de Grupo',
      html: `
        <div class="space-y-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Profesor *</label>
            <select id="teacherId" class="swal2-select" style="margin: 0; width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
              <option value="">Seleccionar profesor...</option>
              ${teachers.map(teacher => `<option value="${teacher.id}">${teacher.firstName} ${teacher.lastName} - ${teacher.email}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Materia *</label>
            <select id="subjectId" class="swal2-select" style="margin: 0; width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
              <option value="">Seleccionar materia...</option>
              ${subjects.filter(s => s.isActive).map(subject => `<option value="${subject.id}">${subject.name} (${subject.code})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Grupo Disponible *</label>
            <select id="groupId" class="swal2-select" style="margin: 0; width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
              <option value="">Seleccionar grupo...</option>
              ${availableGroups.map(group => `<option value="${group.id}">${group.name} - ${group.grade}° ${group.section} (${group.academicYear})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Año Académico *</label>
            <input id="academicYear" class="swal2-input" value="${new Date().getFullYear()}" style="margin: 0; width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;">
          </div>
          <div class="mt-4 p-3 bg-blue-50 rounded-md">
            <p class="text-sm text-blue-800">
              <strong>Reglas de asignación:</strong><br>
              • Solo se muestran grupos sin profesor asignado<br>
              • Dos profesores pueden enseñar la misma materia en diferentes grupos<br>
              • Un grupo solo puede tener un profesor por materia
            </p>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear Asignación',
      cancelButtonText: 'Cancelar',
      width: '600px',
      customClass: {
        popup: 'text-left'
      },
      preConfirm: () => {
        const teacherId = (document.getElementById('teacherId') as HTMLSelectElement).value;
        const subjectId = (document.getElementById('subjectId') as HTMLSelectElement).value;
        const groupId = (document.getElementById('groupId') as HTMLSelectElement).value;
        const academicYear = (document.getElementById('academicYear') as HTMLInputElement).value;

        if (!teacherId || !subjectId || !groupId || !academicYear) {
          Swal.showValidationMessage('Por favor complete todos los campos obligatorios');
          return false;
        }

        return { userId: parseInt(teacherId), subjectId: parseInt(subjectId), groupId: parseInt(groupId), academicYear };
      }
    });

    if (formValues) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/assignments', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formValues),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          await Swal.fire({
            title: '¡Éxito!',
            text: 'Asignación creada correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          // Refresh all related data
          await Promise.all([
            fetchAssignments(),
            fetchAvailableGroups()
          ]);
        } else {
          await Swal.fire({
            title: 'Error al crear asignación',
            text: data.message || 'No se pudo crear la asignación. Verifique que el grupo esté disponible.',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('Error creating assignment:', error);
        await Swal.fire({
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor. Intente nuevamente.',
          icon: 'error'
        });
      }
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    // Find the assignment to show details in confirmation
    const assignment = assignments.find(a => a.id === assignmentId);

    const result = await Swal.fire({
      title: '¿Confirmar eliminación?',
      html: `
        <div class="text-left">
          <p class="mb-3">Se eliminará la siguiente asignación:</p>
          <div class="bg-gray-50 p-3 rounded-md mb-3">
            <p><strong>Profesor:</strong> ${assignment?.teacher.firstName} ${assignment?.teacher.lastName}</p>
            <p><strong>Materia:</strong> ${assignment?.subject.name}</p>
            <p><strong>Grupo:</strong> ${assignment?.group.name} - ${assignment?.group.grade}° ${assignment?.group.section}</p>
            <p><strong>Año:</strong> ${assignment?.academicYear}</p>
          </div>
          <p class="text-sm text-gray-600">El grupo quedará disponible para nuevas asignaciones.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar asignación',
      cancelButtonText: 'Cancelar',
      width: '500px'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/assignments/${assignmentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          await Swal.fire({
            title: '¡Asignación eliminada!',
            text: 'La asignación ha sido eliminada correctamente. El grupo está ahora disponible.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          // Refresh all related data
          await Promise.all([
            fetchAssignments(),
            fetchAvailableGroups()
          ]);
        } else {
          await Swal.fire({
            title: 'Error al eliminar',
            text: data.message || 'No se pudo eliminar la asignación. Intente nuevamente.',
            icon: 'error'
          });
        }
      } catch (error) {
        console.error('Error deleting assignment:', error);
        await Swal.fire({
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor. Intente nuevamente.',
          icon: 'error'
        });
      }
    }
  };

  // Función para filtrar asignaciones
  const filteredAssignments = assignments.filter(assignment => {
    const searchTerm = assignmentSearchTerm.toLowerCase();
    return (
      assignment.teacher.firstName.toLowerCase().includes(searchTerm) ||
      assignment.teacher.lastName.toLowerCase().includes(searchTerm) ||
      assignment.subject.name.toLowerCase().includes(searchTerm) ||
      assignment.group.name.toLowerCase().includes(searchTerm) ||
      assignment.group.grade.toLowerCase().includes(searchTerm) ||
      assignment.group.section.toLowerCase().includes(searchTerm)
    );
  });

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'subjects') {
      fetchSubjects();
    } else if (activeTab === 'groups') {
      fetchGroups();
    } else if (activeTab === 'assignments') {
      fetchAssignments();
      fetchAvailableGroups();
      fetchTeachers();
      if (subjects.length === 0) fetchSubjects();
    }
  }, [activeTab]);

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
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Coordinador</h1>
                <p className="text-sm text-gray-600">Sistema de Gestión de Tareas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'users'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Gestión de Usuarios
                </button>
                <button
                  onClick={() => setActiveTab('subjects')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'subjects'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Gestión de Asignaturas
                </button>
                <button
                  onClick={() => setActiveTab('groups')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'groups'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Gestión de Grupos
                </button>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'assignments'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Asignación de Grupos
                </button>
              </div>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profesores</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTeachers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Materias</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalSubjects || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Grupos</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalGroups || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tareas Totales</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTasks || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Task Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Estado de Tareas</h3>
              <CheckCircle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completadas</span>
                <span className="text-sm font-medium text-green-600">{stats?.completedTasks || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pendientes</span>
                <span className="text-sm font-medium text-yellow-600">{stats?.pendingTasks || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-medium text-gray-900">{stats?.totalTasks || 0}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tareas Recientes</h3>
              <AlertCircle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {stats?.recentTasks && stats.recentTasks.length > 0 ? (
                stats.recentTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-600">
                        {task.subject} - {task.group} - {task.teacher}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No hay tareas recientes</p>
              )}
            </div>
          </div>
        </div>
          </>
        ) : activeTab === 'users' ? (
          <>
            {/* User Management Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
                <button
                  onClick={handleRegisterUser}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Registrar Usuario
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lista de Usuarios</h3>
              </div>
              
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Cargando usuarios...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Registro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.length > 0 ? (
                        users.map((userItem) => (
                          <tr key={userItem.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {userItem.firstName} {userItem.lastName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{userItem.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                userItem.role === 'coordinator'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {userItem.role === 'coordinator' ? 'Coordinador' : 'Profesor'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(userItem.createdAt).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditUser(userItem)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="Editar usuario"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(userItem)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No hay usuarios registrados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}            </div>
          </>
        ) : activeTab === 'subjects' ? (
          <>
            {/* Subjects Management Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Asignaturas</h2>
                <button
                  onClick={handleRegisterSubject}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Registrar Asignatura
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar asignaturas por nombre, código o descripción..."
                  value={subjectSearchTerm}
                  onChange={(e) => setSubjectSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Subjects Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lista de Asignaturas</h3>
              </div>
              
              {isLoadingSubjects ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600">Cargando asignaturas...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asignatura
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Creación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSubjects.length > 0 ? (
                        filteredSubjects.map((subject) => (
                          <tr key={subject.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-green-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {subject.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{subject.code || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {subject.description || 'Sin descripción'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(subject.createdAt).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditSubject(subject)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="Editar asignatura"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubject(subject.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Eliminar asignatura"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            {subjectSearchTerm ? 'No se encontraron asignaturas que coincidan con la búsqueda' : 'No hay asignaturas registradas'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'groups' ? (
          <>
            {/* Groups Management Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Gestión de Grupos</h2>
                <button
                  onClick={handleRegisterGroup}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Registrar Grupo
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar grupos por nombre, grado o sección..."
                  value={groupSearchTerm}
                  onChange={(e) => setGroupSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            {/* Groups Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lista de Grupos</h3>
              </div>
              
              {isLoadingGroups ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-2 text-gray-600">Cargando grupos...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grupo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sección
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Año Académico
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estudiantes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Creación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredGroups.length > 0 ? (
                        filteredGroups.map((group) => (
                          <tr key={group.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-purple-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {group.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{group.grade}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{group.section}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{group.academicYear}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {group.studentCount} estudiantes
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(group.createdAt).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditGroup(group)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                  title="Editar grupo"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGroup(group.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                  title="Eliminar grupo"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            {groupSearchTerm ? 'No se encontraron grupos que coincidan con la búsqueda' : 'No hay grupos registrados'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'assignments' ? (
          <>
            {/* Assignments Management Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Asignación de Grupos</h2>
                <button
                  onClick={handleCreateAssignment}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Nueva Asignación
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar asignaciones por profesor, materia o grupo..."
                  value={assignmentSearchTerm}
                  onChange={(e) => setAssignmentSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Assignments Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Lista de Asignaciones</h3>
              </div>
              
              {isLoadingAssignments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <span className="ml-2 text-gray-600">Cargando asignaciones...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profesor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Materia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grupo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Año Académico
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Asignación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAssignments.length > 0 ? (
                        filteredAssignments.map((assignment) => (
                          <tr key={assignment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <UserCheck className="h-5 w-5 text-indigo-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {assignment.teacher.firstName} {assignment.teacher.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {assignment.teacher.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 text-green-600 mr-2" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {assignment.subject.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {assignment.subject.code}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 text-purple-600 mr-2" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {assignment.group.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {assignment.group.grade}{assignment.group.section}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {assignment.academicYear}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(assignment.createdAt).toLocaleDateString('es-ES')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Eliminar asignación"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            {assignmentSearchTerm ? 'No se encontraron asignaciones que coincidan con la búsqueda' : 'No hay asignaciones registradas'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default CoordinatorDashboard;