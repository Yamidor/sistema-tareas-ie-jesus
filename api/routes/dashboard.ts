import { Router, type Response } from 'express';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js';
import { User, Subject, Group, SubjectAssignment, Task } from '../models/index.js';
import { Op } from 'sequelize';

const router = Router();

/**
 * Dashboard del Coordinador
 * GET /api/dashboard/coordinator
 */
router.get('/coordinator', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Estadísticas generales
      const totalTeachers = await User.count({
        where: { role: 'teacher', isActive: true }
      });

      const totalSubjects = await Subject.count({
        where: { isActive: true }
      });

      const totalGroups = await Group.count({
        where: { isActive: true }
      });

      const totalTasks = await Task.count();

      // Tareas por estado
      const tasksByStatus = await Task.findAll({
        attributes: [
          'status',
          [Task.sequelize!.fn('COUNT', Task.sequelize!.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Tareas recientes
      const recentTasks = await Task.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['firstName', 'lastName']
          },
          {
            model: Subject,
            as: 'subject',
            attributes: ['name', 'code']
          },
          {
            model: Group,
            as: 'group',
            attributes: ['name', 'grade', 'section']
          }
        ]
      });

      // Profesores más activos (consulta simplificada)
      const activeTeachers = await User.findAll({
        where: { role: 'teacher', isActive: true },
        attributes: ['id', 'firstName', 'lastName', 'email'],
        limit: 5,
        order: [['createdAt', 'DESC']]
      });

      // Obtener conteo de tareas para cada profesor
      const teachersWithTaskCount = await Promise.all(
        activeTeachers.map(async (teacher) => {
          const taskCount = await Task.count({
            where: { userId: teacher.id }
          });
          return {
            ...teacher.toJSON(),
            taskCount
          };
        })
      );

      // Ordenar por cantidad de tareas
      teachersWithTaskCount.sort((a, b) => b.taskCount - a.taskCount);

      res.json({
        success: true,
        data: {
          statistics: {
            totalTeachers,
            totalSubjects,
            totalGroups,
            totalTasks
          },
          tasksByStatus,
          recentTasks,
          activeTeachers: teachersWithTaskCount
        }
      });
    } catch (error) {
      console.error('Error en dashboard coordinador:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Dashboard del Profesor
 * GET /api/dashboard/teacher
 */
router.get('/teacher', 
  authenticateToken, 
  requireRole(['teacher']), 
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;

      // Asignaciones del profesor
      const assignments = await SubjectAssignment.findAll({
        where: { userId, isActive: true },
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'name', 'code']
          },
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name', 'grade', 'section', 'studentCount']
          }
        ]
      });

      // Tareas del profesor
      const tasks = await Task.findAll({
        where: { userId },
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['name', 'code']
          },
          {
            model: Group,
            as: 'group',
            attributes: ['name', 'grade', 'section']
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      // Estadísticas de tareas del profesor
      const taskStats = await Task.findAll({
        where: { userId },
        attributes: [
          'status',
          [Task.sequelize!.fn('COUNT', Task.sequelize!.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Tareas próximas a vencer (próximos 7 días)
      const upcomingTasks = await Task.findAll({
        where: {
          userId,
          dueDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
          },
          status: {
            [Op.in]: ['pending', 'in_progress']
          }
        },
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['name', 'code']
          },
          {
            model: Group,
            as: 'group',
            attributes: ['name', 'grade', 'section']
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      // Calcular estadísticas del profesor
      const totalSubjects = assignments.length;
      const totalGroups = [...new Set(assignments.map(a => a.group.id))].length;
      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const overdueTasks = tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        const now = new Date();
        return dueDate < now && t.status !== 'completed';
      }).length;

      res.json({
        success: true,
        data: {
          assignments,
          tasks,
          stats: {
            totalSubjects,
            totalGroups,
            totalTasks,
            pendingTasks,
            completedTasks,
            overdueTasks
          },
          taskStats,
          upcomingTasks
        }
      });
    } catch (error) {
      console.error('Error en dashboard profesor:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

export default router;