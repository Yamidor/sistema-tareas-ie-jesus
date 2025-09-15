import { Sequelize } from 'sequelize';
import sequelize from './api/config/database.js';
import { testConnection } from './api/config/database.js';
import './api/models/index.js';
import { User, Subject, Group, SubjectAssignment, Task } from './api/models/index.js';

const addMissingData = async (): Promise<void> => {
  try {
    console.log('🔧 Agregando datos faltantes...');
    
    // Test connection
    await testConnection();
    
    // Agregar profesores faltantes
    console.log('👨‍🏫 Agregando profesores faltantes...');
    
    const teachers = [
      { email: 'fisica@colegio.edu', firstName: 'Pedro', lastName: 'Sánchez' },
      { email: 'quimica@colegio.edu', firstName: 'Laura', lastName: 'Torres' }
    ];
    
    for (const teacherData of teachers) {
      const [teacher, created] = await User.findOrCreate({
        where: { email: teacherData.email },
        defaults: {
          email: teacherData.email,
          password: '123456',
          firstName: teacherData.firstName,
          lastName: teacherData.lastName,
          role: 'teacher',
          isActive: true,
        }
      });
      
      if (created) {
        console.log(`✅ Profesor creado: ${teacher.firstName} ${teacher.lastName} - ${teacher.email}`);
      } else {
        console.log(`ℹ️  Profesor ya existe: ${teacher.firstName} ${teacher.lastName} - ${teacher.email}`);
      }
    }
    
    // Agregar materias faltantes
    console.log('\n📚 Agregando materias faltantes...');
    
    const subjects = [
      { name: 'Inglés', code: 'ING001', description: 'Idioma inglés - gramática, vocabulario y conversación' },
      { name: 'Historia', code: 'HIS001', description: 'Historia universal y nacional' },
      { name: 'Educación Física', code: 'EDF001', description: 'Actividades físicas y deportivas' },
      { name: 'Arte', code: 'ART001', description: 'Expresión artística y creatividad' },
      { name: 'Biología', code: 'BIO001', description: 'Estudio de los seres vivos' },
      { name: 'Física', code: 'FIS001', description: 'Principios físicos y mecánica' },
      { name: 'Química', code: 'QUI001', description: 'Elementos químicos y reacciones' }
    ];
    
    for (const subjectData of subjects) {
      const [subject, created] = await Subject.findOrCreate({
        where: { code: subjectData.code },
        defaults: {
          name: subjectData.name,
          code: subjectData.code,
          description: subjectData.description,
          isActive: true,
        }
      });
      
      if (created) {
        console.log(`✅ Materia creada: ${subject.name} (${subject.code})`);
      } else {
        console.log(`ℹ️  Materia ya existe: ${subject.name} (${subject.code})`);
      }
    }
    
    // Agregar grupos faltantes
    console.log('\n👥 Agregando grupos faltantes...');
    
    const groups = [
      { name: '10° A', grade: '10°', section: 'A', studentCount: 32 },
      { name: '10° B', grade: '10°', section: 'B', studentCount: 29 },
      { name: '11° A', grade: '11°', section: 'A', studentCount: 27 }
    ];
    
    for (const groupData of groups) {
      const [group, created] = await Group.findOrCreate({
        where: { name: groupData.name },
        defaults: {
          name: groupData.name,
          grade: groupData.grade,
          section: groupData.section,
          academicYear: '2024',
          studentCount: groupData.studentCount,
          isActive: true,
        }
      });
      
      if (created) {
        console.log(`✅ Grupo creado: ${group.name} (${group.studentCount} estudiantes)`);
      } else {
        console.log(`ℹ️  Grupo ya existe: ${group.name} (${group.studentCount} estudiantes)`);
      }
    }
    
    // Crear asignaciones adicionales
    console.log('\n🔗 Creando asignaciones adicionales...');
    
    // Obtener profesores y materias
    const englishTeacher = await User.findOne({ where: { email: 'ingles@colegio.edu' } });
    const historyTeacher = await User.findOne({ where: { email: 'historia@colegio.edu' } });
    const peTeacher = await User.findOne({ where: { email: 'educacionfisica@colegio.edu' } });
    const artTeacher = await User.findOne({ where: { email: 'arte@colegio.edu' } });
    const biologyTeacher = await User.findOne({ where: { email: 'biologia@colegio.edu' } });
    const physicsTeacher = await User.findOne({ where: { email: 'fisica@colegio.edu' } });
    const chemistryTeacher = await User.findOne({ where: { email: 'quimica@colegio.edu' } });
    
    const english = await Subject.findOne({ where: { code: 'ING001' } });
    const history = await Subject.findOne({ where: { code: 'HIS001' } });
    const pe = await Subject.findOne({ where: { code: 'EDF001' } });
    const art = await Subject.findOne({ where: { code: 'ART001' } });
    const biology = await Subject.findOne({ where: { code: 'BIO001' } });
    const physics = await Subject.findOne({ where: { code: 'FIS001' } });
    const chemistry = await Subject.findOne({ where: { code: 'QUI001' } });
    
    const group10A = await Group.findOne({ where: { name: '10° A' } });
    const group10B = await Group.findOne({ where: { name: '10° B' } });
    const group11A = await Group.findOne({ where: { name: '11° A' } });
    
    // Crear asignaciones
    const assignments = [
      { teacher: englishTeacher, subject: english, group: group10A },
      { teacher: englishTeacher, subject: english, group: group10B },
      { teacher: historyTeacher, subject: history, group: group11A },
      { teacher: peTeacher, subject: pe, group: group10A },
      { teacher: artTeacher, subject: art, group: group10B },
      { teacher: biologyTeacher, subject: biology, group: group11A },
      { teacher: physicsTeacher, subject: physics, group: group10A },
      { teacher: chemistryTeacher, subject: chemistry, group: group10B }
    ];
    
    for (const assignmentData of assignments) {
      if (assignmentData.teacher && assignmentData.subject && assignmentData.group) {
        const [assignment, created] = await SubjectAssignment.findOrCreate({
          where: {
            userId: assignmentData.teacher.id,
            subjectId: assignmentData.subject.id,
            groupId: assignmentData.group.id
          },
          defaults: {
            userId: assignmentData.teacher.id,
            subjectId: assignmentData.subject.id,
            groupId: assignmentData.group.id,
            academicYear: '2024',
            isActive: true,
          }
        });
        
        if (created) {
          console.log(`✅ Asignación creada: ${assignmentData.teacher.firstName} ${assignmentData.teacher.lastName} - ${assignmentData.subject.name} - ${assignmentData.group.name}`);
        }
      }
    }
    
    // Crear tareas de septiembre 2025
    console.log('\n📝 Creando tareas de septiembre 2025...');
    
    const september2025Tasks = [
      {
        title: 'English Vocabulary Quiz',
        description: 'Estudiar vocabulario de la unidad 3 para el quiz del viernes',
        dueDate: new Date('2025-09-12'),
        teacher: englishTeacher,
        subject: english,
        group: group10A
      },
      {
        title: 'Grammar Exercises',
        description: 'Completar ejercicios de presente perfecto páginas 45-47',
        dueDate: new Date('2025-09-18'),
        teacher: englishTeacher,
        subject: english,
        group: group10B
      },
      {
        title: 'Ensayo sobre la Revolución Industrial',
        description: 'Escribir un ensayo de 500 palabras sobre el impacto de la Revolución Industrial',
        dueDate: new Date('2025-09-25'),
        teacher: historyTeacher,
        subject: history,
        group: group11A
      },
      {
        title: 'Rutina de Ejercicios',
        description: 'Practicar rutina de calentamiento y estiramiento diariamente',
        dueDate: new Date('2025-09-20'),
        teacher: peTeacher,
        subject: pe,
        group: group10A
      },
      {
        title: 'Proyecto de Pintura',
        description: 'Crear una pintura usando técnicas de acuarela sobre tema libre',
        dueDate: new Date('2025-09-28'),
        teacher: artTeacher,
        subject: art,
        group: group10B
      },
      {
        title: 'Laboratorio de Células',
        description: 'Observar células vegetales al microscopio y dibujar lo observado',
        dueDate: new Date('2025-09-22'),
        teacher: biologyTeacher,
        subject: biology,
        group: group11A
      },
      {
        title: 'Problemas de Cinemática',
        description: 'Resolver ejercicios de movimiento rectilíneo uniforme del capítulo 2',
        dueDate: new Date('2025-09-16'),
        teacher: physicsTeacher,
        subject: physics,
        group: group10A
      },
      {
        title: 'Tabla Periódica',
        description: 'Memorizar los primeros 20 elementos de la tabla periódica',
        dueDate: new Date('2025-09-24'),
        teacher: chemistryTeacher,
        subject: chemistry,
        group: group10B
      }
    ];
    
    for (const taskData of september2025Tasks) {
      if (taskData.teacher && taskData.subject && taskData.group) {
        const [task, created] = await Task.findOrCreate({
          where: {
            title: taskData.title,
            userId: taskData.teacher.id,
            subjectId: taskData.subject.id,
            groupId: taskData.group.id
          },
          defaults: {
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            status: 'pending',
            priority: 'medium',
            userId: taskData.teacher.id,
            subjectId: taskData.subject.id,
            groupId: taskData.group.id,
          }
        });
        
        if (created) {
          console.log(`✅ Tarea creada: ${task.title} - ${taskData.subject.name} - ${taskData.group.name}`);
        }
      }
    }
    
    console.log('\n🎉 ¡Datos faltantes agregados exitosamente!');
    
  } catch (error) {
    console.error('❌ Error agregando datos:', error);
    throw error;
  }
};

// Ejecutar
addMissingData()
  .then(() => {
    console.log('\nProceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });