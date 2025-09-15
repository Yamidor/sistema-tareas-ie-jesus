/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import usersRoutes from './routes/users.js'
import subjectsRoutes from './routes/subjects.js'
import groupsRoutes from './routes/groups.js'
import assignmentsRoutes from './routes/assignments.js'
import teacherTasksRoutes from './routes/teacher-tasks.js'
import publicCalendarRoutes from './routes/public-calendar.js'
import sequelize, { testConnection } from './config/database.js'
import './models/index.js' // Initialize models and associations

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Test database connection
testConnection();

// Sync database (create tables if they don't exist)
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Base de datos sincronizada correctamente.');
  })
  .catch((error) => {
    console.error('❌ Error al sincronizar la base de datos:', error);
  });

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/subjects', subjectsRoutes)
app.use('/api/groups', groupsRoutes)
app.use('/api/assignments', assignmentsRoutes)
app.use('/api/teacher-tasks', teacherTasksRoutes)
app.use('/api/public', publicCalendarRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
