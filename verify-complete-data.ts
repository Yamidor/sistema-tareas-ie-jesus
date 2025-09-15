import { Sequelize } from 'sequelize';
import sequelize from './api/config/database.js';
import { testConnection } from './api/config/database.js';
import './api/models/index.js';
import { User, Subject, Group, SubjectAssignment, Task } from './api/models/index.js';

const verifyCompleteData = async (): Promise<void> => {
  try {
    console.log('🔍 Verificando datos completos en la base de datos...');
    
    // Test connection
    await testConnection();
    
    // Verificar usuarios/profesores
    console.log('\n📋 PROFESORES:');
    const users = await User.findAll({
      where: { role: 'teacher' },
      order: [['email', 'ASC']]
    });
    
    const expectedTeachers = [
      'profesor@colegio.edu',
      'ingles@colegio.edu', 
      'historia@colegio.edu',
      'educacionfisica@colegio.edu',
      'arte@colegio.edu',
      'biologia@colegio.edu'
    ];
    
    console.log(`Profesores encontrados: ${users.length}`);
    users.forEach(user => {
      console.log(`  ✅ ${user.firstName} ${user.lastName} - ${user.email}`);
    });
    
    const missingTeachers = expectedTeachers.filter(email => 
      !users.some(user => user.email === email)
    );
    
    if (missingTeachers.length > 0) {
      console.log('❌ Profesores faltantes:');
      missingTeachers.forEach(email => console.log(`  - ${email}`));
    } else {
      console.log('✅ Todos los profesores están presentes');
    }
    
    // Verificar materias
    console.log('\n📚 MATERIAS:');
    const subjects = await Subject.findAll({
      order: [['name', 'ASC']]
    });
    
    const expectedSubjects = [
      'Matemáticas', 'Lengua Española', 'Ciencias Naturales',
      'Inglés', 'Historia', 'Educación Física', 'Arte', 'Biología', 'Física', 'Química'
    ];
    
    console.log(`Materias encontradas: ${subjects.length}`);
    subjects.forEach(subject => {
      console.log(`  ✅ ${subject.name} (${subject.code})`);
    });
    
    const missingSubjects = expectedSubjects.filter(name => 
      !subjects.some(subject => subject.name === name)
    );
    
    if (missingSubjects.length > 0) {
      console.log('❌ Materias faltantes:');
      missingSubjects.forEach(name => console.log(`  - ${name}`));
    } else {
      console.log('✅ Todas las materias están presentes');
    }
    
    // Verificar grupos
    console.log('\n👥 GRUPOS:');
    const groups = await Group.findAll({
      order: [['name', 'ASC']]
    });
    
    const expectedGroups = ['1° A', '1° B', '2° A', '10° A', '10° B', '11° A'];
    
    console.log(`Grupos encontrados: ${groups.length}`);
    groups.forEach(group => {
      console.log(`  ✅ ${group.name} (${group.studentCount} estudiantes)`);
    });
    
    const missingGroups = expectedGroups.filter(name => 
      !groups.some(group => group.name === name)
    );
    
    if (missingGroups.length > 0) {
      console.log('❌ Grupos faltantes:');
      missingGroups.forEach(name => console.log(`  - ${name}`));
    } else {
      console.log('✅ Todos los grupos están presentes');
    }
    
    // Verificar asignaciones
    console.log('\n🔗 ASIGNACIONES PROFESOR-MATERIA-GRUPO:');
    const assignments = await SubjectAssignment.findAll({
      include: [
        { model: User, as: 'teacher', attributes: ['firstName', 'lastName', 'email'] },
        { model: Subject, as: 'subject', attributes: ['name'] },
        { model: Group, as: 'group', attributes: ['name'] }
      ]
    });
    
    console.log(`Asignaciones encontradas: ${assignments.length}`);
    assignments.forEach(assignment => {
      const teacher = assignment.teacher;
      const subject = assignment.subject;
      const group = assignment.group;
      console.log(`  ✅ ${teacher.firstName} ${teacher.lastName} - ${subject.name} - ${group.name}`);
    });
    
    // Verificar tareas de septiembre 2025
    console.log('\n📝 TAREAS DE SEPTIEMBRE 2025:');
    const september2025Tasks = await Task.findAll({
      where: {
        dueDate: {
          [Sequelize.Op.between]: ['2025-09-01', '2025-09-30']
        }
      },
      include: [
        { model: User, as: 'teacher', attributes: ['firstName', 'lastName'] },
        { model: Subject, as: 'subject', attributes: ['name'] },
        { model: Group, as: 'group', attributes: ['name'] }
      ],
      order: [['dueDate', 'ASC']]
    });
    
    console.log(`Tareas de septiembre 2025 encontradas: ${september2025Tasks.length}`);
    september2025Tasks.forEach(task => {
      const teacher = task.teacher;
      const subject = task.subject;
      const group = task.group;
      console.log(`  ✅ ${task.title} - ${subject.name} - ${group.name} - ${teacher.firstName} ${teacher.lastName} - ${task.dueDate.toISOString().split('T')[0]}`);
    });
    
    // Verificar todas las tareas
    console.log('\n📋 RESUMEN TOTAL DE TAREAS:');
    const allTasks = await Task.findAll();
    console.log(`Total de tareas en la base de datos: ${allTasks.length}`);
    
    // Resumen final
    console.log('\n🎯 RESUMEN DE VERIFICACIÓN:');
    console.log(`✅ Profesores: ${users.length}/6 ${users.length === 6 ? '(COMPLETO)' : '(INCOMPLETO)'}`);
    console.log(`✅ Materias: ${subjects.length}/10 ${subjects.length === 10 ? '(COMPLETO)' : '(INCOMPLETO)'}`);
    console.log(`✅ Grupos: ${groups.length}/6 ${groups.length === 6 ? '(COMPLETO)' : '(INCOMPLETO)'}`);
    console.log(`✅ Asignaciones: ${assignments.length}`);
    console.log(`✅ Tareas septiembre 2025: ${september2025Tasks.length}`);
    console.log(`✅ Total tareas: ${allTasks.length}`);
    
    const isComplete = users.length === 6 && subjects.length === 10 && groups.length === 6 && september2025Tasks.length >= 8;
    
    if (isComplete) {
      console.log('\n🎉 ¡VERIFICACIÓN EXITOSA! Todos los datos están completos en la base de datos.');
    } else {
      console.log('\n⚠️  VERIFICACIÓN INCOMPLETA. Algunos datos faltan en la base de datos.');
    }
    
  } catch (error) {
    console.error('❌ Error en verificación:', error);
    throw error;
  }
};

// Ejecutar verificación
verifyCompleteData()
  .then(() => {
    console.log('\nVerificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error en verificación:', error);
    process.exit(1);
  });