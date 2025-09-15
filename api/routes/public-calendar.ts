import { Router, type Request, type Response } from 'express';
import { Task, User, Subject, Group } from '../models/index.js';
import { Op } from 'sequelize';

const router = Router();

/**
 * Obtener todos los grupos disponibles (público)
 */
router.get('/groups', async (req: Request, res: Response) => {
  try {
    const groups = await Group.findAll({
      attributes: ['id', 'name', 'grade', 'section'],
      order: [['grade', 'ASC'], ['section', 'ASC']]
    });

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Obtener todos los grados disponibles (público) - Mantenido para compatibilidad
 */
router.get('/grades', async (req: Request, res: Response) => {
  try {
    const grades = await Group.findAll({
      attributes: ['grade'],
      group: ['grade'],
      order: [['grade', 'ASC']]
    });

    const uniqueGrades = grades.map(group => {
      // Extraer el número del grado si viene con formato "1°", "10°", etc.
      const gradeStr = String(group.grade);
      const gradeNumber = parseInt(gradeStr.replace('°', ''));
      return gradeNumber;
    }).filter((grade, index, self) => self.indexOf(grade) === index && !isNaN(grade));

    res.json({
      success: true,
      data: uniqueGrades
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Obtener grupos por grado (público)
 */
router.get('/grades/:grade/groups', async (req: Request, res: Response) => {
  try {
    const { grade } = req.params;
    const gradeNumber = parseInt(grade);
    
    // Buscar tanto por número como por string con formato "X°"
    const groups = await Group.findAll({
      where: {
        [Op.or]: [
          { grade: gradeNumber },
          { grade: `${gradeNumber}°` }
        ]
      },
      attributes: ['id', 'name', 'grade', 'section'],
      order: [['section', 'ASC']]
    });

    res.json({
      success: true,
      data: groups
    });
  } catch (error) {
    console.error('Error fetching groups by grade:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Obtener tareas de un grupo específico en un mes determinado (público)
 */
router.get('/calendar/group/:groupId/:year/:month', async (req: Request, res: Response) => {
  try {
    const { groupId, year, month } = req.params;

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
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'grade', 'section']
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error('Error fetching public calendar tasks by group:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Obtener tareas de un grado específico en un mes determinado (público) - Mantenido para compatibilidad
 */
router.get('/calendar/:grade/:year/:month', async (req: Request, res: Response) => {
  try {
    const { grade, year, month } = req.params;

    // Calcular el rango de fechas del mes
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    // Obtener todos los grupos del grado especificado
    const gradeNumber = parseInt(grade);
    const groups = await Group.findAll({
      where: {
        [Op.or]: [
          { grade: gradeNumber },
          { grade: `${gradeNumber}°` }
        ]
      },
      attributes: ['id']
    });

    const groupIds = groups.map(group => group.id);

    if (groupIds.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const tasks = await Task.findAll({
      where: {
        groupId: {
          [Op.in]: groupIds
        },
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
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'grade', 'section']
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error('Error fetching public calendar tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Obtener detalles de una tarea específica (público)
 */
router.get('/task/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;

    const task = await Task.findByPk(parseInt(taskId), {
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

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }

    res.json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('Error fetching task details:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;