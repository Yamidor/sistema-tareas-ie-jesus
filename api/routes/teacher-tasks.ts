import { Router, type Response } from 'express';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js';
import { Task, SubjectAssignment, User, Subject, Group } from '../models/index.js';
import { Op } from 'sequelize';

const router = Router();

// Get subjects for a specific group
router.get('/groups/:groupId/subjects', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    // Get subjects assigned to this teacher for this specific group
    const assignments = await SubjectAssignment.findAll({
      where: {
        userId: userId,
        groupId: parseInt(groupId)
      },
      include: [{
        model: Subject,
        as: 'subject',
        attributes: ['id', 'name', 'code']
      }],
      attributes: []
    });

    const subjects = assignments.map(assignment => assignment.subject);

    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching group subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Obtener grupos asignados al profesor autenticado
 */
router.get('/groups', 
  authenticateToken, 
  requireRole(['teacher']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const teacherId = req.user?.id;

      const assignments = await SubjectAssignment.findAll({
        where: {
          userId: teacherId,
          isActive: true
        },
        include: [
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name', 'grade', 'section']
          },
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'name', 'code']
          }
        ],
        attributes: ['id', 'groupId', 'subjectId']
      });

      const groups = assignments.map(assignment => ({
        id: assignment.group.id,
        name: assignment.group.name,
        grade: assignment.group.grade,
        section: assignment.group.section,
        subject: {
          id: assignment.subject.id,
          name: assignment.subject.name,
          code: assignment.subject.code
        }
      }));

      res.json({
        success: true,
        data: groups
      });

    } catch (error) {
      console.error('Error fetching teacher groups:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Obtener tareas de un grupo específico en un mes determinado
 */
router.get('/calendar/:groupId/:year/:month', 
  authenticateToken, 
  requireRole(['teacher']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { groupId, year, month } = req.params;
      const teacherId = req.user?.id;

      // Verificar que el profesor tenga asignado este grupo
      const assignment = await SubjectAssignment.findOne({
        where: {
          userId: teacherId,
          groupId: parseInt(groupId),
          isActive: true
        }
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver las tareas de este grupo'
        });
      }

      // Calcular el rango de fechas del mes
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      const tasks = await Task.findAll({
        where: {
          groupId: parseInt(groupId),
          dueDate: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'name', 'code']
          }
        ],
        order: [['dueDate', 'ASC']]
      });

      res.json({
        success: true,
        data: tasks
      });

    } catch (error) {
      console.error('Error fetching calendar tasks:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Crear nueva tarea
 */
router.post('/', 
  authenticateToken, 
  requireRole(['teacher']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, description, dueDate, priority, groupId, subjectId } = req.body;
      const teacherId = req.user?.id;

      // Validar campos requeridos
      if (!title || !description || !dueDate || !groupId || !subjectId) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      // Verificar que el profesor tenga asignado este grupo y materia
      const assignment = await SubjectAssignment.findOne({
        where: {
          userId: teacherId,
          groupId: parseInt(groupId),
          subjectId: parseInt(subjectId),
          isActive: true
        }
      });

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear tareas en este grupo/materia'
        });
      }

      // Permitir múltiples tareas en la misma fecha
      // Se removió la restricción de máximo 2 tareas por día

      // Crear fecha sin conversión de zona horaria
      // Si dueDate viene como 'YYYY-MM-DD', lo convertimos a fecha local
      const parsedDate = new Date(dueDate + 'T00:00:00.000Z');
      parsedDate.setUTCHours(0, 0, 0, 0);
      
      const task = await Task.create({
        title,
        description,
        dueDate: parsedDate,
        priority: priority || 'medium',
        userId: teacherId,
        groupId: parseInt(groupId),
        subjectId: parseInt(subjectId)
      });

      // Obtener la tarea completa con relaciones
      const completeTask = await Task.findByPk(task.id, {
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'name', 'code']
          },
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name', 'grade', 'section']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Tarea creada exitosamente',
        data: completeTask
      });

    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Actualizar tarea (solo del profesor actual)
 */
router.put('/:taskId', 
  authenticateToken, 
  requireRole(['teacher']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const { title, description, dueDate, priority, status } = req.body;
      const teacherId = req.user?.id;

      // Buscar la tarea y verificar que pertenezca al profesor
      const task = await Task.findOne({
        where: {
          id: parseInt(taskId),
          userId: teacherId
        }
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada o no tienes permisos para editarla'
        });
      }

      // Permitir múltiples tareas en la misma fecha al editar
      // Se removió la restricción de máximo 2 tareas por día

      // Preparar datos de actualización
      const updateData: any = {
        ...(title && { title }),
        ...(description && { description }),
        ...(priority && { priority }),
        ...(status && { status })
      };
      
      // Manejar fecha sin conversión de zona horaria
      if (dueDate) {
        const parsedDate = new Date(dueDate + 'T00:00:00.000Z');
        parsedDate.setUTCHours(0, 0, 0, 0);
        updateData.dueDate = parsedDate;
      }
      
      // Actualizar la tarea
      await task.update(updateData);

      // Obtener la tarea actualizada con relaciones
      const updatedTask = await Task.findByPk(task.id, {
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'name', 'code']
          },
          {
            model: Group,
            as: 'group',
            attributes: ['id', 'name', 'grade', 'section']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Tarea actualizada exitosamente',
        data: updatedTask
      });

    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Eliminar tarea (solo del profesor actual)
 */
router.delete('/:taskId', 
  authenticateToken, 
  requireRole(['teacher']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { taskId } = req.params;
      const teacherId = req.user?.id;

      // Buscar la tarea y verificar que pertenezca al profesor
      const task = await Task.findOne({
        where: {
          id: parseInt(taskId),
          userId: teacherId
        }
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tarea no encontrada o no tienes permisos para eliminarla'
        });
      }

      await task.destroy();

      res.json({
        success: true,
        message: 'Tarea eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

export default router;