import { Router, type Response } from 'express';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js';
import { Subject } from '../models/index.js';
import { Op } from 'sequelize';

const router = Router();

/**
 * Crear nueva asignatura
 * Solo coordinadores pueden crear asignaturas
 */
router.post('/', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response) => {
    try {
      console.log('POST /api/subjects - Request body:', req.body);
      console.log('POST /api/subjects - User:', req.user);
      
      const { name, code, description } = req.body;

      // Validar datos requeridos
      if (!name) {
        console.log('Validation failed: missing name', { name });
        return res.status(400).json({
          success: false,
          message: 'El nombre de la asignatura es requerido'
        });
      }

      // Verificar si ya existe una asignatura con el mismo código (solo si se proporciona código)
      if (code && code.trim() !== '') {
        console.log('Checking for existing subject with code:', code);
        const existingSubject = await Subject.findOne({ where: { code } });
        if (existingSubject) {
          console.log('Subject with code already exists:', existingSubject.toJSON());
          return res.status(400).json({
            success: false,
            message: 'Ya existe una asignatura con ese código'
          });
        }
      }

      // Crear nueva asignatura
      const subjectData = {
        name,
        code: code && code.trim() !== '' ? code : null,
        description: description && description.trim() !== '' ? description : null,
        isActive: true
      };
      console.log('Creating subject with data:', subjectData);
      const subject = await Subject.create(subjectData);
      console.log('Subject created successfully:', subject.toJSON());

      // Sincronizar la base de datos para asegurar que se guarde
      await subject.reload();

      res.status(201).json({
        success: true,
        message: 'Asignatura creada exitosamente',
        data: {
          subject: {
            id: subject.id,
            name: subject.name,
            code: subject.code,
            description: subject.description,
            isActive: subject.isActive,
            createdAt: subject.createdAt,
            updatedAt: subject.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('Error creating subject:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Obtener todas las asignaturas
 * Solo coordinadores pueden ver todas las asignaturas
 */
router.get('/', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { page = '1', limit = '10', search = '', sortBy = 'name', sortOrder = 'ASC' } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      // Construir condiciones de búsqueda
      const whereConditions: any = {
        isActive: true // Solo mostrar asignaturas activas
      };
      
      if (search) {
        whereConditions[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { code: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const { count, rows: subjects } = await Subject.findAndCountAll({
        where: whereConditions,
        order: [[sortBy as string, sortOrder as string]],
        limit: Number(limit),
        offset: offset,
        attributes: ['id', 'name', 'code', 'description', 'isActive', 'createdAt', 'updatedAt']
      });
      
      res.json({
        success: true,
        data: {
          subjects,
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(count / Number(limit)),
            totalItems: count,
            itemsPerPage: Number(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching subjects:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Obtener asignatura por ID
 * Solo coordinadores pueden ver detalles de asignaturas
 */
router.get('/:id', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const subject = await Subject.findOne({
        where: { id, isActive: true },
        attributes: ['id', 'name', 'code', 'description', 'isActive', 'createdAt', 'updatedAt']
      });
      
      if (!subject) {
        return res.status(404).json({
          success: false,
          error: 'Asignatura no encontrada'
        });
      }
      
      res.json({
        success: true,
        data: { subject }
      });
    } catch (error) {
      console.error('Error fetching subject:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Actualizar asignatura
 * Solo coordinadores pueden actualizar asignaturas
 */
router.put('/:id', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, code, description } = req.body;
      
      // Validaciones
      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'El nombre de la asignatura es requerido'
        });
      }
      
      const subject = await Subject.findOne({ where: { id, isActive: true } });
      
      if (!subject) {
        return res.status(404).json({
          success: false,
          error: 'Asignatura no encontrada'
        });
      }
      
      // Verificar si el código ya existe en otra asignatura (solo si se proporciona código)
      if (code && code.trim() !== '' && code !== subject.code) {
        const existingSubject = await Subject.findOne({ 
          where: { 
            code, 
            isActive: true,
            id: { [Op.ne]: id } // Excluir la asignatura actual
          } 
        });
        
        if (existingSubject) {
          return res.status(400).json({
            success: false,
            error: 'Ya existe otra asignatura con este código'
          });
        }
      }
      
      await subject.update({
        name,
        code: code && code.trim() !== '' ? code : null,
        description: description && description.trim() !== '' ? description : null
      });
      
      await subject.reload();
      
      res.json({
        success: true,
        message: 'Asignatura actualizada exitosamente',
        data: {
          subject: {
            id: subject.id,
            name: subject.name,
            code: subject.code,
            description: subject.description,
            isActive: subject.isActive,
            createdAt: subject.createdAt,
            updatedAt: subject.updatedAt
          }
        }
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Eliminar asignatura (soft delete)
 * Solo coordinadores pueden eliminar asignaturas
 */
router.delete('/:id', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const subject = await Subject.findOne({ where: { id, isActive: true } });
      
      if (!subject) {
        return res.status(404).json({
          success: false,
          error: 'Asignatura no encontrada'
        });
      }
      
      // Soft delete: marcar como inactiva
      await subject.update({ isActive: false });
      
      res.json({
        success: true,
        message: 'Asignatura eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
);

export default router;