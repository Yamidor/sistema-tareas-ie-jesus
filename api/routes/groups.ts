import { Router, Request, Response } from 'express';
import Group from '../models/Group.js';
import { Op } from 'sequelize';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Aplicar middleware de autenticación y autorización a todas las rutas
router.use(authenticateToken);
router.use(requireRole(['coordinator']));

// POST /api/groups - Crear nuevo grupo
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('POST /api/groups - Datos recibidos:', req.body);
    
    const { name, grade, section, academicYear } = req.body;
    
    // Validaciones
    if (!name || !grade || !section || !academicYear) {
      console.log('Error: Faltan campos requeridos');
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, grado, sección y año académico son requeridos'
      });
    }
    
    // Verificar si ya existe un grupo con el mismo nombre, grado y sección
    const existingGroup = await Group.findOne({
      where: {
        name: name.trim(),
        grade: grade.trim(),
        section: section.trim(),
        academicYear: academicYear.trim(),
        isActive: true
      }
    });
    
    if (existingGroup) {
      console.log('Error: Grupo ya existe');
      return res.status(400).json({
        success: false,
        message: 'Ya existe un grupo con ese nombre, grado y sección para el año académico especificado'
      });
    }
    
    // Crear el grupo
    const groupData = {
      name: name.trim(),
      grade: grade.trim(),
      section: section.trim(),
      academicYear: academicYear.trim(),
      studentCount: 0,
      isActive: true
    };
    
    console.log('Creando grupo con datos:', groupData);
    const newGroup = await Group.create(groupData);
    
    console.log('Grupo creado exitosamente:', newGroup.toJSON());
    res.status(201).json({
      success: true,
      message: 'Grupo creado exitosamente',
      data: newGroup
    });
    
  } catch (error) {
    console.error('Error al crear grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear el grupo'
    });
  }
});

// GET /api/groups - Obtener todos los grupos con paginación y búsqueda
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('GET /api/groups - Parámetros:', req.query);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const offset = (page - 1) * limit;
    
    // Construir condiciones de búsqueda
    const whereConditions: any = {
      isActive: true
    };
    
    if (search.trim()) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { grade: { [Op.iLike]: `%${search.trim()}%` } },
        { section: { [Op.iLike]: `%${search.trim()}%` } },
        { academicYear: { [Op.iLike]: `%${search.trim()}%` } }
      ];
    }
    
    console.log('Condiciones de búsqueda:', whereConditions);
    
    // Obtener grupos con paginación
    const { count, rows } = await Group.findAndCountAll({
      where: whereConditions,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Grupos encontrados: ${count}, página ${page}`);
    
    res.json({
      success: true,
      data: {
        groups: rows,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
    
  } catch (error) {
    console.error('Error al obtener grupos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener los grupos'
    });
  }
});

// GET /api/groups/:id - Obtener grupo por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`GET /api/groups/${id}`);
    
    const group = await Group.findOne({
      where: {
        id: parseInt(id),
        isActive: true
      }
    });
    
    if (!group) {
      console.log('Grupo no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }
    
    console.log('Grupo encontrado:', group.toJSON());
    res.json({
      success: true,
      data: group
    });
    
  } catch (error) {
    console.error('Error al obtener grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener el grupo'
    });
  }
});

// PUT /api/groups/:id - Actualizar grupo
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, grade, section, academicYear, studentCount } = req.body;
    
    console.log(`PUT /api/groups/${id} - Datos:`, req.body);
    
    // Validaciones
    if (!name || !grade || !section || !academicYear) {
      console.log('Error: Faltan campos requeridos');
      return res.status(400).json({
        success: false,
        message: 'Los campos nombre, grado, sección y año académico son requeridos'
      });
    }
    
    // Verificar si el grupo existe
    const group = await Group.findOne({
      where: {
        id: parseInt(id),
        isActive: true
      }
    });
    
    if (!group) {
      console.log('Grupo no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }
    
    // Verificar si ya existe otro grupo con los mismos datos
    const existingGroup = await Group.findOne({
      where: {
        name: name.trim(),
        grade: grade.trim(),
        section: section.trim(),
        academicYear: academicYear.trim(),
        isActive: true,
        id: { [Op.ne]: parseInt(id) }
      }
    });
    
    if (existingGroup) {
      console.log('Error: Ya existe otro grupo con esos datos');
      return res.status(400).json({
        success: false,
        message: 'Ya existe otro grupo con ese nombre, grado y sección para el año académico especificado'
      });
    }
    
    // Actualizar el grupo
    const updateData: any = {
      name: name.trim(),
      grade: grade.trim(),
      section: section.trim(),
      academicYear: academicYear.trim()
    };
    
    if (studentCount !== undefined && studentCount >= 0) {
      updateData.studentCount = parseInt(studentCount);
    }
    
    console.log('Actualizando grupo con datos:', updateData);
    await group.update(updateData);
    
    console.log('Grupo actualizado exitosamente');
    res.json({
      success: true,
      message: 'Grupo actualizado exitosamente',
      data: group
    });
    
  } catch (error) {
    console.error('Error al actualizar grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar el grupo'
    });
  }
});

// DELETE /api/groups/:id - Eliminar grupo (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/groups/${id}`);
    
    // Verificar si el grupo existe
    const group = await Group.findOne({
      where: {
        id: parseInt(id),
        isActive: true
      }
    });
    
    if (!group) {
      console.log('Grupo no encontrado');
      return res.status(404).json({
        success: false,
        message: 'Grupo no encontrado'
      });
    }
    
    // Soft delete
    await group.update({ isActive: false });
    
    console.log('Grupo eliminado exitosamente (soft delete)');
    res.json({
      success: true,
      message: 'Grupo eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al eliminar el grupo'
    });
  }
});

export default router;