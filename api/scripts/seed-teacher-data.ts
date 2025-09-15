import { User, Subject, Group, SubjectAssignment, Task } from '../models/index.ts';

async function seedTeacherData() {
  try {
    console.log('🌱 Iniciando seed de datos para profesores...');

    // 1. Crear/buscar profesores
    console.log('👨‍🏫 Creando profesores...');
    const teachers = await Promise.all([
      User.findOrCreate({
        where: { email: 'profesor@colegio.edu' },
        defaults: {
          email: 'profesor@colegio.edu',
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          role: 'teacher',
          isActive: true
        }
      }),
      User.findOrCreate({
        where: { email: 'ingles@colegio.edu' },
        defaults: {
          email: 'ingles@colegio.edu',
          firstName: 'María',
          lastName: 'García',
          role: 'teacher',
          isActive: true
        }
      }),
      User.findOrCreate({
        where: { email: 'historia@colegio.edu' },
        defaults: {
          email: 'historia@colegio.edu',
          firstName: 'José',
          lastName: 'Martínez',
          role: 'teacher',
          isActive: true
        }
      }),
      User.findOrCreate({
        where: { email: 'educacionfisica@colegio.edu' },
        defaults: {
          email: 'educacionfisica@colegio.edu',
          firstName: 'Ana',
          lastName: 'López',
          role: 'teacher',
          isActive: true
        }
      }),
      User.findOrCreate({
        where: { email: 'arte@colegio.edu' },
        defaults: {
          email: 'arte@colegio.edu',
          firstName: 'Luis',
          lastName: 'Fernández',
          role: 'teacher',
          isActive: true
        }
      }),
      User.findOrCreate({
        where: { email: 'biologia@colegio.edu' },
        defaults: {
          email: 'biologia@colegio.edu',
          firstName: 'Carmen',
          lastName: 'Ruiz',
          role: 'teacher',
          isActive: true
        }
      })
    ]);

    const teacher = teachers[0][0];
    const englishTeacher = teachers[1][0];
    const historyTeacher = teachers[2][0];
    const peTeacher = teachers[3][0];
    const artTeacher = teachers[4][0];
    const biologyTeacher = teachers[5][0];

    console.log('✅ Profesores creados/encontrados');

    // 2. Crear materias
    console.log('📚 Creando materias...');
    const subjects = await Promise.all([
      Subject.findOrCreate({
        where: { name: 'Matemáticas' },
        defaults: {
          name: 'Matemáticas',
          code: 'MAT',
          description: 'Matemáticas para educación secundaria',
          isActive: true
        }
      }),
      Subject.findOrCreate({
        where: { name: 'Física' },
        defaults: {
          name: 'Física',
          code: 'FIS',
          description: 'Física para educación secundaria',
          isActive: true
        }
      }),
      Subject.findOrCreate({
        where: { name: 'Química' },
        defaults: {
          name: 'Química',
          code: 'QUI',
          description: 'Química para educación secundaria',
          isActive: true
        }
      }),
      Subject.findOrCreate({
        where: { name: 'Inglés' },
        defaults: {
          name: 'Inglés',
          code: 'ENG',
          description: 'Inglés como lengua extranjera',
          isActive: true
        }
      }),
      Subject.findOrCreate({
        where: { name: 'Historia' },
        defaults: {
          name: 'Historia',
          code: 'HIS',
          description: 'Historia universal y nacional',
          isActive: true
        }
      }),
      Subject.findOrCreate({
        where: { name: 'Educación Física' },
        defaults: {
          name: 'Educación Física',
          code: 'EDF',
          description: 'Educación física y deportes',
          isActive: true
        }
      }),
      Subject.findOrCreate({
        where: { name: 'Arte' },
        defaults: {
          name: 'Arte',
          code: 'ART',
          description: 'Artes plásticas y visuales',
          isActive: true
        }
      }),
      Subject.findOrCreate({
        where: { name: 'Biología' },
        defaults: {
          name: 'Biología',
          code: 'BIO',
          description: 'Biología y ciencias naturales',
          isActive: true
        }
      })
    ]);

    const matematicas = subjects[0][0];
    const fisica = subjects[1][0];
    const quimica = subjects[2][0];
    const ingles = subjects[3][0];
    const historia = subjects[4][0];
    const educacionFisica = subjects[5][0];
    const arte = subjects[6][0];
    const biologia = subjects[7][0];

    console.log('✅ Materias creadas/encontradas');

    // 3. Crear grupos
    console.log('👥 Creando grupos...');
    const groups = await Promise.all([
      Group.findOrCreate({
        where: { name: '10A' },
        defaults: {
          name: '10A',
          grade: '10',
          section: 'A',
          academicYear: '2024-2025',
          studentCount: 25,
          isActive: true
        }
      }),
      Group.findOrCreate({
        where: { name: '10B' },
        defaults: {
          name: '10B',
          grade: '10',
          section: 'B',
          academicYear: '2024-2025',
          studentCount: 28,
          isActive: true
        }
      }),
      Group.findOrCreate({
        where: { name: '11A' },
        defaults: {
          name: '11A',
          grade: '11',
          section: 'A',
          academicYear: '2024-2025',
          studentCount: 22,
          isActive: true
        }
      })
    ]);

    const group10A = groups[0][0];
    const group10B = groups[1][0];
    const group11A = groups[2][0];

    console.log('✅ Grupos creados/encontrados');

    // 4. Crear asignaciones de materias a profesores
    console.log('🔗 Creando asignaciones de materias...');
    const assignments = [
      // Carlos Rodríguez - Matemáticas, Física, Química
      { userId: teacher.id, subjectId: matematicas.id, groupId: group10A.id, academicYear: '2024-2025' },
      { userId: teacher.id, subjectId: matematicas.id, groupId: group10B.id, academicYear: '2024-2025' },
      { userId: teacher.id, subjectId: matematicas.id, groupId: group11A.id, academicYear: '2024-2025' },
      { userId: teacher.id, subjectId: fisica.id, groupId: group10A.id, academicYear: '2024-2025' },
      { userId: teacher.id, subjectId: fisica.id, groupId: group11A.id, academicYear: '2024-2025' },
      { userId: teacher.id, subjectId: quimica.id, groupId: group10B.id, academicYear: '2024-2025' },
      { userId: teacher.id, subjectId: quimica.id, groupId: group11A.id, academicYear: '2024-2025' },
      
      // María García - Inglés para todos los grupos
      { userId: englishTeacher.id, subjectId: ingles.id, groupId: group10A.id, academicYear: '2024-2025' },
      { userId: englishTeacher.id, subjectId: ingles.id, groupId: group10B.id, academicYear: '2024-2025' },
      { userId: englishTeacher.id, subjectId: ingles.id, groupId: group11A.id, academicYear: '2024-2025' },
      
      // José Martínez - Historia para todos los grupos
      { userId: historyTeacher.id, subjectId: historia.id, groupId: group10A.id, academicYear: '2024-2025' },
      { userId: historyTeacher.id, subjectId: historia.id, groupId: group10B.id, academicYear: '2024-2025' },
      { userId: historyTeacher.id, subjectId: historia.id, groupId: group11A.id, academicYear: '2024-2025' },
      
      // Ana López - Educación Física para todos los grupos
      { userId: peTeacher.id, subjectId: educacionFisica.id, groupId: group10A.id, academicYear: '2024-2025' },
      { userId: peTeacher.id, subjectId: educacionFisica.id, groupId: group10B.id, academicYear: '2024-2025' },
      { userId: peTeacher.id, subjectId: educacionFisica.id, groupId: group11A.id, academicYear: '2024-2025' },
      
      // Luis Fernández - Arte para 10A y 10B
      { userId: artTeacher.id, subjectId: arte.id, groupId: group10A.id, academicYear: '2024-2025' },
      { userId: artTeacher.id, subjectId: arte.id, groupId: group10B.id, academicYear: '2024-2025' },
      
      // Carmen Ruiz - Biología para 11A
      { userId: biologyTeacher.id, subjectId: biologia.id, groupId: group11A.id, academicYear: '2024-2025' }
    ];

    for (const assignment of assignments) {
      await SubjectAssignment.findOrCreate({
        where: assignment,
        defaults: { ...assignment, isActive: true }
      });
    }

    console.log('✅ Asignaciones creadas');

    // 5. Crear tareas con fechas específicas para probar el calendario
    console.log('📝 Creando tareas...');
    const tasks = [
      // Tareas para diciembre 2024
      {
        title: 'Tarea de Álgebra',
        description: 'Resolver ejercicios de ecuaciones lineales del capítulo 5',
        dueDate: new Date('2024-12-15T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: teacher.id,
        subjectId: matematicas.id,
        groupId: group10A.id
      },
      {
        title: 'Laboratorio de Mecánica',
        description: 'Informe del experimento de caída libre',
        dueDate: new Date('2024-12-15T23:59:59'), // Mismo día para probar color rojo
        status: 'pending',
        priority: 'high',
        userId: teacher.id,
        subjectId: fisica.id,
        groupId: group10A.id
      },
      {
        title: 'Práctica de Química Orgánica',
        description: 'Identificación de grupos funcionales',
        dueDate: new Date('2024-12-20T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: teacher.id,
        subjectId: quimica.id,
        groupId: group10B.id
      },
      {
        title: 'Examen de Geometría',
        description: 'Evaluación de triángulos y círculos',
        dueDate: new Date('2024-12-22T23:59:59'),
        status: 'pending',
        priority: 'high',
        userId: teacher.id,
        subjectId: matematicas.id,
        groupId: group11A.id
      },
      // Tareas para enero 2025
      {
        title: 'Proyecto de Física Moderna',
        description: 'Investigación sobre teoría cuántica',
        dueDate: new Date('2025-01-10T23:59:59'),
        status: 'pending',
        priority: 'high',
        userId: teacher.id,
        subjectId: fisica.id,
        groupId: group11A.id
      },
      {
        title: 'Laboratorio de Reacciones Químicas',
        description: 'Análisis de velocidad de reacción',
        dueDate: new Date('2025-01-12T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: teacher.id,
        subjectId: quimica.id,
        groupId: group11A.id
      },
      {
        title: 'Tarea de Cálculo',
        description: 'Derivadas e integrales básicas',
        dueDate: new Date('2025-01-15T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: teacher.id,
        subjectId: matematicas.id,
        groupId: group11A.id
      },
      {
        title: 'Ensayo de Termodinámica',
        description: 'Análisis de las leyes de la termodinámica',
        dueDate: new Date('2025-01-18T23:59:59'),
        status: 'pending',
        priority: 'low',
        userId: teacher.id,
        subjectId: fisica.id,
        groupId: group10A.id
      },
      
      // ===== TAREAS PARA SEPTIEMBRE 2025 =====
      // Grupo 10A - Septiembre 2025
      {
        title: 'Essay: My Summer Vacation',
        description: 'Write a 300-word essay about your summer vacation in English',
        dueDate: new Date('2025-09-05T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: englishTeacher.id,
        subjectId: ingles.id,
        groupId: group10A.id
      },
      {
        title: 'Revolución Industrial',
        description: 'Investigación sobre las causas y consecuencias de la Revolución Industrial',
        dueDate: new Date('2025-09-08T23:59:59'),
        status: 'pending',
        priority: 'high',
        userId: historyTeacher.id,
        subjectId: historia.id,
        groupId: group10A.id
      },
      {
        title: 'Evaluación Física - Resistencia',
        description: 'Prueba de resistencia cardiovascular - 12 minutos de Cooper',
        dueDate: new Date('2025-09-12T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: peTeacher.id,
        subjectId: educacionFisica.id,
        groupId: group10A.id
      },
      {
        title: 'Proyecto de Pintura',
        description: 'Crear una obra de arte usando técnicas de acuarela',
        dueDate: new Date('2025-09-16T23:59:59'),
        status: 'pending',
        priority: 'low',
        userId: artTeacher.id,
        subjectId: arte.id,
        groupId: group10A.id
      },
      {
        title: 'Ecuaciones Cuadráticas',
        description: 'Resolver problemas de ecuaciones cuadráticas del capítulo 3',
        dueDate: new Date('2025-09-20T23:59:59'),
        status: 'pending',
        priority: 'high',
        userId: teacher.id,
        subjectId: matematicas.id,
        groupId: group10A.id
      },
      {
        title: 'Laboratorio de Cinemática',
        description: 'Análisis del movimiento rectilíneo uniforme',
        dueDate: new Date('2025-09-25T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: teacher.id,
        subjectId: fisica.id,
        groupId: group10A.id
      },
      
      // Grupo 10B - Septiembre 2025
      {
        title: 'Vocabulary Test: Unit 2',
        description: 'Test on vocabulary from Unit 2: Daily Routines',
        dueDate: new Date('2025-09-03T23:59:59'),
        status: 'pending',
        priority: 'high',
        userId: englishTeacher.id,
        subjectId: ingles.id,
        groupId: group10B.id
      },
      {
        title: 'Civilizaciones Antiguas',
        description: 'Ensayo comparativo entre Egipto y Mesopotamia',
        dueDate: new Date('2025-09-10T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: historyTeacher.id,
        subjectId: historia.id,
        groupId: group10B.id
      },
      {
        title: 'Torneo de Voleibol',
        description: 'Participación en el torneo inter-aulas de voleibol',
        dueDate: new Date('2025-09-15T23:59:59'),
        status: 'pending',
        priority: 'low',
        userId: peTeacher.id,
        subjectId: educacionFisica.id,
        groupId: group10B.id
      },
      {
        title: 'Escultura en Arcilla',
        description: 'Crear una escultura pequeña usando técnicas básicas de modelado',
        dueDate: new Date('2025-09-18T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: artTeacher.id,
        subjectId: arte.id,
        groupId: group10B.id
      },
      {
        title: 'Funciones Lineales',
        description: 'Graficar y analizar funciones lineales',
        dueDate: new Date('2025-09-22T23:59:59'),
        status: 'pending',
        priority: 'high',
        userId: teacher.id,
        subjectId: matematicas.id,
        groupId: group10B.id
      },
      {
        title: 'Práctica de Química Inorgánica',
        description: 'Identificación de sales y ácidos en el laboratorio',
        dueDate: new Date('2025-09-28T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: teacher.id,
        subjectId: quimica.id,
        groupId: group10B.id
      },
      
      // Grupo 11A - Septiembre 2025
      {
        title: 'Literature Analysis: Romeo and Juliet',
        description: 'Character analysis of the main protagonists',
        dueDate: new Date('2025-09-06T23:59:59'),
        status: 'pending',
        priority: 'high',
        userId: englishTeacher.id,
        subjectId: ingles.id,
        groupId: group11A.id
      },
      {
        title: 'Segunda Guerra Mundial',
        description: 'Análisis de las causas y consecuencias de la Segunda Guerra Mundial',
        dueDate: new Date('2025-09-11T23:59:59'),
        status: 'pending',
        priority: 'high',
        userId: historyTeacher.id,
        subjectId: historia.id,
        groupId: group11A.id
      },
      {
        title: 'Plan de Entrenamiento Personal',
        description: 'Diseñar un plan de entrenamiento personalizado de 4 semanas',
        dueDate: new Date('2025-09-14T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: peTeacher.id,
        subjectId: educacionFisica.id,
        groupId: group11A.id
      },
      {
        title: 'Ecosistemas y Biodiversidad',
        description: 'Investigación sobre un ecosistema local y su biodiversidad',
        dueDate: new Date('2025-09-17T23:59:59'),
        status: 'pending',
        priority: 'high',
        userId: biologyTeacher.id,
        subjectId: biologia.id,
        groupId: group11A.id
      },
      {
        title: 'Límites y Continuidad',
        description: 'Ejercicios de cálculo diferencial - límites',
        dueDate: new Date('2025-09-21T23:59:59'),
        status: 'pending',
        priority: 'high',
        userId: teacher.id,
        subjectId: matematicas.id,
        groupId: group11A.id
      },
      {
        title: 'Ondas y Sonido',
        description: 'Laboratorio sobre propagación de ondas sonoras',
        dueDate: new Date('2025-09-24T23:59:59'),
        status: 'pending',
        priority: 'medium',
        userId: teacher.id,
        subjectId: fisica.id,
        groupId: group11A.id
      },
      {
        title: 'Química Orgánica Avanzada',
        description: 'Síntesis de compuestos orgánicos simples',
        dueDate: new Date('2025-09-27T23:59:59'),
        status: 'pending',
        priority: 'high',
        userId: teacher.id,
        subjectId: quimica.id,
        groupId: group11A.id
      }
    ];

    for (const taskData of tasks) {
      await Task.findOrCreate({
        where: {
          title: taskData.title,
          userId: taskData.userId,
          subjectId: taskData.subjectId,
          groupId: taskData.groupId
        },
        defaults: taskData
      });
    }

    console.log('✅ Tareas creadas');
    console.log('🎉 Seed completado exitosamente!');
    console.log('');
    console.log('📅 Fechas de tareas creadas:');
    console.log('- 15/12/2024: 2 tareas (debería aparecer en rojo)');
    console.log('- 20/12/2024: 1 tarea (debería aparecer en amarillo)');
    console.log('- 22/12/2024: 1 tarea (debería aparecer en amarillo)');
    console.log('- 10/01/2025: 1 tarea (debería aparecer en amarillo)');
    console.log('- 12/01/2025: 1 tarea (debería aparecer en amarillo)');
    console.log('- 15/01/2025: 1 tarea (debería aparecer en amarillo)');
    console.log('- 18/01/2025: 1 tarea (debería aparecer en amarillo)');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  }
}

// Ejecutar el seed si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTeacherData().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export default seedTeacherData;