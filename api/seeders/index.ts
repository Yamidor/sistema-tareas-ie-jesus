import { Sequelize } from 'sequelize';
import sequelize from '../config/database.js';
import { testConnection } from '../config/database.js';
import '../models/index.js'; // Import models to register associations
import { User, Subject, Group, SubjectAssignment, Task } from '../models/index.js';
import bcrypt from 'bcrypt';

// Create database if it doesn't exist
const createDatabase = async () => {
  const tempSequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '12345',
    logging: false,
  });

  try {
    await tempSequelize.query('CREATE DATABASE IF NOT EXISTS sistema_tareas');
    console.log('✅ Base de datos creada o ya existe.');
    await tempSequelize.close();
  } catch (error) {
    console.error('❌ Error al crear la base de datos:', error);
    await tempSequelize.close();
    throw error;
  }
};

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Iniciando seeders...');
    
    // Create database first
    await createDatabase();
    
    // Test connection
    await testConnection();

    // Sincronizar base de datos (crear tablas)
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas correctamente');

    // Crear usuarios
    const coordinator = await User.create({
      email: 'coordinador@colegio.edu',
      password: '123456',
      firstName: 'María',
      lastName: 'González',
      role: 'coordinator',
      isActive: true,
    });

    const teacher = await User.create({
      email: 'profesor@colegio.edu',
      password: '123456',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      role: 'teacher',
      isActive: true,
    });

    // Crear profesores adicionales
    const englishTeacher = await User.create({
      email: 'ingles@colegio.edu',
      password: '123456',
      firstName: 'María',
      lastName: 'García',
      role: 'teacher',
      isActive: true,
    });

    const historyTeacher = await User.create({
      email: 'historia@colegio.edu',
      password: '123456',
      firstName: 'José',
      lastName: 'Martínez',
      role: 'teacher',
      isActive: true,
    });

    const peTeacher = await User.create({
      email: 'educacionfisica@colegio.edu',
      password: '123456',
      firstName: 'Ana',
      lastName: 'López',
      role: 'teacher',
      isActive: true,
    });

    const artTeacher = await User.create({
      email: 'arte@colegio.edu',
      password: '123456',
      firstName: 'Luis',
      lastName: 'Fernández',
      role: 'teacher',
      isActive: true,
    });

    const biologyTeacher = await User.create({
      email: 'biologia@colegio.edu',
      password: '123456',
      firstName: 'Carmen',
      lastName: 'Ruiz',
      role: 'teacher',
      isActive: true,
    });

    console.log('✅ Usuarios creados');

    // Crear materias
    const mathematics = await Subject.create({
      name: 'Matemáticas',
      code: 'MAT001',
      description: 'Matemáticas básicas y avanzadas',
      isActive: true,
    });

    const spanish = await Subject.create({
      name: 'Lengua Española',
      code: 'ESP001',
      description: 'Gramática, literatura y redacción',
      isActive: true,
    });

    const science = await Subject.create({
      name: 'Ciencias Naturales',
      code: 'CIE001',
      description: 'Biología, química y física básica',
      isActive: true,
    });

    // Crear materias adicionales
    const english = await Subject.create({
      name: 'Inglés',
      code: 'ING001',
      description: 'Idioma inglés - gramática, vocabulario y conversación',
      isActive: true,
    });

    const history = await Subject.create({
      name: 'Historia',
      code: 'HIS001',
      description: 'Historia universal y nacional',
      isActive: true,
    });

    const physicalEducation = await Subject.create({
      name: 'Educación Física',
      code: 'EDF001',
      description: 'Actividades físicas y deportivas',
      isActive: true,
    });

    const art = await Subject.create({
      name: 'Arte',
      code: 'ART001',
      description: 'Expresión artística y creatividad',
      isActive: true,
    });

    const biology = await Subject.create({
      name: 'Biología',
      code: 'BIO001',
      description: 'Estudio de los seres vivos',
      isActive: true,
    });

    const physics = await Subject.create({
      name: 'Física',
      code: 'FIS001',
      description: 'Principios físicos y mecánica',
      isActive: true,
    });

    const chemistry = await Subject.create({
      name: 'Química',
      code: 'QUI001',
      description: 'Elementos químicos y reacciones',
      isActive: true,
    });

    console.log('✅ Materias creadas');

    // Crear grupos
    const group1A = await Group.create({
      name: '1° A',
      grade: '1°',
      section: 'A',
      academicYear: '2024',
      studentCount: 25,
      isActive: true,
    });

    const group1B = await Group.create({
      name: '1° B',
      grade: '1°',
      section: 'B',
      academicYear: '2024',
      studentCount: 28,
      isActive: true,
    });

    const group2A = await Group.create({
      name: '2° A',
      grade: '2°',
      section: 'A',
      academicYear: '2024',
      studentCount: 30,
      isActive: true,
    });

    // Crear grupos adicionales
    const group10A = await Group.create({
      name: '10° A',
      grade: '10°',
      section: 'A',
      academicYear: '2024',
      studentCount: 32,
      isActive: true,
    });

    const group10B = await Group.create({
      name: '10° B',
      grade: '10°',
      section: 'B',
      academicYear: '2024',
      studentCount: 29,
      isActive: true,
    });

    const group11A = await Group.create({
      name: '11° A',
      grade: '11°',
      section: 'A',
      academicYear: '2024',
      studentCount: 27,
      isActive: true,
    });

    console.log('✅ Grupos creados');

    // Crear asignaciones de materias
    await SubjectAssignment.create({
      userId: teacher.id,
      subjectId: mathematics.id,
      groupId: group1A.id,
      academicYear: '2024',
      isActive: true,
    });

    await SubjectAssignment.create({
      userId: teacher.id,
      subjectId: mathematics.id,
      groupId: group1B.id,
      academicYear: '2024',
      isActive: true,
    });

    await SubjectAssignment.create({
      userId: teacher.id,
      subjectId: spanish.id,
      groupId: group2A.id,
      academicYear: '2024',
      isActive: true,
    });

    // Asignaciones de profesores adicionales
    // Profesora de Inglés
    await SubjectAssignment.create({
      userId: englishTeacher.id,
      subjectId: english.id,
      groupId: group10A.id,
      academicYear: '2024',
      isActive: true,
    });

    await SubjectAssignment.create({
      userId: englishTeacher.id,
      subjectId: english.id,
      groupId: group10B.id,
      academicYear: '2024',
      isActive: true,
    });

    // Profesor de Historia
    await SubjectAssignment.create({
      userId: historyTeacher.id,
      subjectId: history.id,
      groupId: group11A.id,
      academicYear: '2024',
      isActive: true,
    });

    // Profesora de Educación Física
    await SubjectAssignment.create({
      userId: peTeacher.id,
      subjectId: physicalEducation.id,
      groupId: group10A.id,
      academicYear: '2024',
      isActive: true,
    });

    // Profesor de Arte
    await SubjectAssignment.create({
      userId: artTeacher.id,
      subjectId: art.id,
      groupId: group10B.id,
      academicYear: '2024',
      isActive: true,
    });

    // Profesora de Biología
    await SubjectAssignment.create({
      userId: biologyTeacher.id,
      subjectId: biology.id,
      groupId: group11A.id,
      academicYear: '2024',
      isActive: true,
    });

    // Asignaciones adicionales de Carlos (profesor original)
    await SubjectAssignment.create({
      userId: teacher.id,
      subjectId: physics.id,
      groupId: group10A.id,
      academicYear: '2024',
      isActive: true,
    });

    await SubjectAssignment.create({
      userId: teacher.id,
      subjectId: chemistry.id,
      groupId: group10B.id,
      academicYear: '2024',
      isActive: true,
    });

    console.log('✅ Asignaciones creadas');

    // Crear tareas de ejemplo
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    await Task.create({
      title: 'Ejercicios de suma y resta',
      description: 'Completar los ejercicios de la página 15 del libro de matemáticas',
      dueDate: tomorrow,
      status: 'pending',
      priority: 'high',
      userId: teacher.id,
      subjectId: mathematics.id,
      groupId: group1A.id,
    });

    await Task.create({
      title: 'Lectura comprensiva',
      description: 'Leer el cuento "El principito" y responder las preguntas del final',
      dueDate: nextWeek,
      status: 'pending',
      priority: 'medium',
      userId: teacher.id,
      subjectId: spanish.id,
      groupId: group2A.id,
    });

    await Task.create({
      title: 'Tabla de multiplicar',
      description: 'Memorizar y practicar las tablas del 2 al 5',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
      status: 'in_progress',
      priority: 'medium',
      userId: teacher.id,
      subjectId: mathematics.id,
      groupId: group1B.id,
    });

    // Tareas de septiembre 2025
    const september2025 = new Date('2025-09-15');
    const september2025End = new Date('2025-09-30');

    // Tareas de Inglés
    await Task.create({
      title: 'English Vocabulary Quiz',
      description: 'Estudiar vocabulario de la unidad 3 para el quiz del viernes',
      dueDate: new Date('2025-09-12'),
      status: 'pending',
      priority: 'high',
      userId: englishTeacher.id,
      subjectId: english.id,
      groupId: group10A.id,
    });

    await Task.create({
      title: 'Grammar Exercises',
      description: 'Completar ejercicios de presente perfecto páginas 45-47',
      dueDate: new Date('2025-09-18'),
      status: 'pending',
      priority: 'medium',
      userId: englishTeacher.id,
      subjectId: english.id,
      groupId: group10B.id,
    });

    // Tareas de Historia
    await Task.create({
      title: 'Ensayo sobre la Revolución Industrial',
      description: 'Escribir un ensayo de 500 palabras sobre el impacto de la Revolución Industrial',
      dueDate: new Date('2025-09-25'),
      status: 'pending',
      priority: 'high',
      userId: historyTeacher.id,
      subjectId: history.id,
      groupId: group11A.id,
    });

    // Tareas de Educación Física
    await Task.create({
      title: 'Rutina de Ejercicios',
      description: 'Practicar rutina de calentamiento y estiramiento diariamente',
      dueDate: new Date('2025-09-20'),
      status: 'pending',
      priority: 'medium',
      userId: peTeacher.id,
      subjectId: physicalEducation.id,
      groupId: group10A.id,
    });

    // Tareas de Arte
    await Task.create({
      title: 'Proyecto de Pintura',
      description: 'Crear una pintura usando técnicas de acuarela sobre tema libre',
      dueDate: new Date('2025-09-28'),
      status: 'pending',
      priority: 'medium',
      userId: artTeacher.id,
      subjectId: art.id,
      groupId: group10B.id,
    });

    // Tareas de Biología
    await Task.create({
      title: 'Laboratorio de Células',
      description: 'Observar células vegetales al microscopio y dibujar lo observado',
      dueDate: new Date('2025-09-22'),
      status: 'pending',
      priority: 'high',
      userId: biologyTeacher.id,
      subjectId: biology.id,
      groupId: group11A.id,
    });

    // Tareas adicionales de Física y Química
    await Task.create({
      title: 'Problemas de Cinemática',
      description: 'Resolver ejercicios de movimiento rectilíneo uniforme del capítulo 2',
      dueDate: new Date('2025-09-16'),
      status: 'pending',
      priority: 'high',
      userId: teacher.id,
      subjectId: physics.id,
      groupId: group10A.id,
    });

    await Task.create({
      title: 'Tabla Periódica',
      description: 'Memorizar los primeros 20 elementos de la tabla periódica',
      dueDate: new Date('2025-09-24'),
      status: 'pending',
      priority: 'medium',
      userId: teacher.id,
      subjectId: chemistry.id,
      groupId: group10B.id,
    });

    console.log('✅ Tareas creadas');
    console.log('🎉 Seeders completados exitosamente');
    console.log('');
    console.log('Credenciales de acceso:');
    console.log('Coordinador: coordinador@colegio.edu / 123456');
    console.log('Profesores:');
    console.log('  - Carlos Rodríguez (Matemáticas, Física, Química): profesor@colegio.edu / 123456');
    console.log('  - María García (Inglés): ingles@colegio.edu / 123456');
    console.log('  - José Martínez (Historia): historia@colegio.edu / 123456');
    console.log('  - Ana López (Educación Física): educacionfisica@colegio.edu / 123456');
    console.log('  - Luis Fernández (Arte): arte@colegio.edu / 123456');
    console.log('  - Carmen Ruiz (Biología): biologia@colegio.edu / 123456');
    console.log('');
    console.log('Grupos creados: 1°A, 1°B, 2°A, 10°A, 10°B, 11°A');
    console.log('Tareas de septiembre 2025 creadas para todas las materias');

  } catch (error) {
    console.error('❌ Error en seeders:', error);
    throw error;
  }
};

// Ejecutar seeders directamente
seedDatabase()
  .then(() => {
    console.log('Seeders ejecutados correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error ejecutando seeders:', error);
    process.exit(1);
  });