import { Router, type Response } from 'express';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js';
import { SubjectAssignment, User, Subject, Group } from '../models/index.js';
import { Op } from 'sequelize';

const router = Router();

/**
 * Crear nueva asignación profesor-materia-grupo
 * Solo coordinadores pueden crear asignaciones
 */
router.post('/', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { userId, subjectId, groupId, academicYear } = req.body;

      // Validar que todos los campos requeridos estén presentes
      if (!userId || !subjectId || !groupId || !academicYear) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos: userId, subjectId, groupId, academicYear'
        });
      }

      // Verificar que el usuario sea un profesor activo
      const teacher = await User.findOne({
        where: { 
          id: userId, 
          role: 'teacher',
          isActive: true 
        }
      });

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: 'Profesor no encontrado o inactivo'
        });
      }

      // Verificar que la materia exista y esté activa
      const subject = await Subject.findOne({
        where: { 
          id: subjectId, 
          isActive: true 
        }
      });

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Materia no encontrada o inactiva'
        });
      }

      // Verificar que el grupo exista y esté activo
      const group = await Group.findOne({
        where: { 
          id: groupId, 
          isActive: true 
        }
      });

      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Grupo no encontrado o inactivo'
        });
      }

      // VALIDACIÓN CRÍTICA: Verificar que el grupo no tenga ya un profesor asignado para esta materia específica
      const existingAssignment = await SubjectAssignment.findOne({
        where: {
          groupId,
          subjectId,
          isActive: true
        }
      });

      if (existingAssignment) {
        return res.status(409).json({
          success: false,
          message: 'Este grupo ya tiene un profesor asignado para esta materia. Un grupo solo puede tener un profesor por materia.'
        });
      }

      // Crear la asignación
      const assignment = await SubjectAssignment.create({
        userId,
        subjectId,
        groupId,
        academicYear,
        isActive: true
      });

      // Obtener la asignación completa con las relaciones
      const completeAssignment = await SubjectAssignment.findByPk(assignment.id, {
        include: [
          { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] },
          { model: Group, as: 'group', attributes: ['id', 'name', 'grade', 'section'] }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Asignación creada exitosamente',
        data: completeAssignment
      });

    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Obtener todas las asignaciones con filtros
 */
router.get('/', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { 
        page = '1', 
        limit = '10', 
        teacherId, 
        subjectId, 
        groupId, 
        academicYear,
        search = '' 
      } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      // Construir condiciones de búsqueda
      const whereConditions: any = {
        isActive: true
      };

      if (teacherId) whereConditions.userId = teacherId;
      if (subjectId) whereConditions.subjectId = subjectId;
      if (groupId) whereConditions.groupId = groupId;
      if (academicYear) whereConditions.academicYear = academicYear;

      // Condiciones de búsqueda por texto
      const includeConditions = [];
      if (search) {
        includeConditions.push(
          {
            model: User,
            as: 'teacher',
            where: {
              [Op.or]: [
                { firstName: { [Op.iLike]: `%${search}%` } },
                { lastName: { [Op.iLike]: `%${search}%` } }
              ]
            },
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: Subject,
            as: 'subject',
            where: {
              name: { [Op.iLike]: `%${search}%` }
            },
            attributes: ['id', 'name', 'code']
          },
          {
            model: Group,
            as: 'group',
            where: {
              [Op.or]: [
                { name: { [Op.iLike]: `%${search}%` } },
                { grade: { [Op.iLike]: `%${search}%` } },
                { section: { [Op.iLike]: `%${search}%` } }
              ]
            },
            attributes: ['id', 'name', 'grade', 'section']
          }
        );
      } else {
        includeConditions.push(
          { model: User, as: 'teacher', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] },
          { model: Group, as: 'group', attributes: ['id', 'name', 'grade', 'section'] }
        );
      }

      const { count, rows: assignments } = await SubjectAssignment.findAndCountAll({
        where: whereConditions,
        include: includeConditions,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          assignments,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(count / Number(limit)),
            totalItems: count,
            itemsPerPage: Number(limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Obtener asignaciones de un profesor específico
 */
router.get('/by-teacher/:teacherId', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { teacherId } = req.params;
      const { academicYear } = req.query;

      const whereConditions: any = {
        userId: teacherId,
        isActive: true
      };

      if (academicYear) {
        whereConditions.academicYear = academicYear;
      }

      const assignments = await SubjectAssignment.findAll({
        where: whereConditions,
        include: [
          { model: Subject, as: 'subject', attributes: ['id', 'name', 'code'] },
          { model: Group, as: 'group', attributes: ['id', 'name', 'grade', 'section'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: assignments
      });

    } catch (error) {
      console.error('Error fetching teacher assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Obtener grupos disponibles para asignación de una materia específica
 * Solo grupos que NO tienen asignación activa para la materia especificada
 */
router.get('/groups/available', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { academicYear, subjectId } = req.query;

      if (!subjectId) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro subjectId es requerido'
        });
      }

      // Obtener IDs de grupos que ya tienen asignación activa para esta materia específica
      const assignedGroupIds = await SubjectAssignment.findAll({
        where: {
          isActive: true,
          subjectId,
          ...(academicYear && { academicYear })
        },
        attributes: ['groupId'],
        raw: true
      }).then(assignments => assignments.map(a => a.groupId));

      // Obtener grupos disponibles (que no están asignados a esta materia)
      const whereConditions: any = {
        isActive: true
      };

      if (assignedGroupIds.length > 0) {
        whereConditions.id = {
          [Op.notIn]: assignedGroupIds
        };
      }

      const availableGroups = await Group.findAll({
        where: whereConditions,
        attributes: ['id', 'name', 'grade', 'section', 'academicYear', 'studentCount'],
        order: [['grade', 'ASC'], ['section', 'ASC']]
      });

      res.json({
        success: true,
        data: availableGroups
      });

    } catch (error) {
      console.error('Error fetching available groups:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Eliminar asignación (soft delete)
 */
router.delete('/:id', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const assignment = await SubjectAssignment.findByPk(id);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: 'Asignación no encontrada'
        });
      }

      // Soft delete - marcar como inactiva
      await assignment.update({ isActive: false });

      res.json({
        success: true,
        message: 'Asignación eliminada exitosamente'
      });

    } catch (error) {
      console.error('Error deleting assignment:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

export default router;