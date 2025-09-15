import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor',
      });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Verificar que el usuario existe y está activo
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Token inválido o usuario inactivo',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(403).json({
      success: false,
      message: 'Token inválido',
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
      });
      return;
    }

    next();
  };
};