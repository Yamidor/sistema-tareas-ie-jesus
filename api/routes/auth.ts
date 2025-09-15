/**
 * This is a user authentication API route.
 * Handle user login, token management, etc.
 */
import { Router, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';

const router = Router();

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos',
      });
      return;
    }

    const user = await User.findOne({
      where: { email, isActive: true }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor',
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

/**
 * Get current user
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
});

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  // En JWT, el logout se maneja en el frontend eliminando el token
  res.json({
    success: true,
    message: 'Logout exitoso',
  });
});

export default router;
