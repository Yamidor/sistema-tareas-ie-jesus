import { Router, type Response } from 'express';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js';
import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

const router = Router();

/**
 * Crear nuevo usuario
 * POST /api/users
 * Solo coordinadores pueden crear usuarios
 */
router.post('/', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      // Validaciones básicas
      if (!firstName || !lastName || !email || !password || !role) {
        res.status(400).json({
          success: false,
          message: 'Todos los campos son obligatorios'
        });
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
        return;
      }

      // Validar rol
      if (!['coordinator', 'teacher'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Rol inválido. Debe ser coordinator o teacher'
        });
        return;
      }

      // Verificar si el email ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Ya existe un usuario con este email'
        });
        return;
      }

      // Crear usuario (el hook beforeCreate se encarga del hash de la contraseña)
      const newUser = await User.create({
        firstName,
        lastName,
        email,
        password,
        role,
        isActive: true
      });

      // Remover password de la respuesta
      const userResponse = {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt
      };

      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: userResponse
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Obtener lista de usuarios
 * GET /api/users
 * Solo coordinadores pueden ver la lista de usuarios
 */
router.get('/', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { role, search, page = 1, limit = 10 } = req.query;
      
      const offset = (Number(page) - 1) * Number(limit);
      
      // Construir condiciones de búsqueda
      const whereConditions: any = {
        isActive: true // Solo mostrar usuarios activos
      };
      
      if (role && ['coordinator', 'teacher'].includes(role as string)) {
        whereConditions.role = role;
      }
      
      if (search) {
        whereConditions[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: users } = await User.findAndCountAll({
        where: whereConditions,
        attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset
      });

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Obtener usuario por ID
 * GET /api/users/:id
 * Solo coordinadores pueden ver detalles de usuarios
 */
router.get('/:id', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt', 'updatedAt']
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Actualizar usuario
 * PUT /api/users/:id
 * Solo coordinadores pueden actualizar usuarios
 */
router.put('/:id', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, role, isActive, password } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // Validar email si se está actualizando
      if (email && email !== user.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({
            success: false,
            message: 'Formato de email inválido'
          });
          return;
        }

        const existingUser = await User.findOne({ 
          where: { 
            email,
            id: { [Op.ne]: id }
          } 
        });
        if (existingUser) {
          res.status(409).json({
            success: false,
            message: 'Ya existe un usuario con este email'
          });
          return;
        }
      }

      // Validar rol si se está actualizando
      if (role && !['coordinator', 'teacher'].includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Rol inválido. Debe ser coordinator o teacher'
        });
        return;
      }

      // Preparar datos para actualizar
      const updateData: any = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (typeof isActive === 'boolean') updateData.isActive = isActive;
      
      // Actualizar contraseña si se proporciona
      if (password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      await user.update(updateData);

      // Obtener usuario actualizado sin password
      const updatedUser = await User.findByPk(id, {
        attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive', 'createdAt', 'updatedAt']
      });

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

/**
 * Eliminar usuario (soft delete)
 * DELETE /api/users/:id
 * Solo coordinadores pueden eliminar usuarios
 */
router.delete('/:id', 
  authenticateToken, 
  requireRole(['coordinator']), 
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      // No permitir que un coordinador se elimine a sí mismo
      if (user.id === req.user.id) {
        res.status(400).json({
          success: false,
          message: 'No puedes eliminar tu propia cuenta'
        });
        return;
      }

      // Soft delete - marcar como inactivo
      await user.update({ isActive: false });

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
);

export default router;