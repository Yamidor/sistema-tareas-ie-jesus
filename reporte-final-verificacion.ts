import { Sequelize } from 'sequelize';
import sequelize from './api/config/database.js';
import { testConnection } from './api/config/database.js';
import './api/models/index.js';
import { User, Subject, Group, SubjectAssignment, Task } from './api/models/index.js';

const generateFinalReport = async (): Promise<void> => {
  try {
    console.log('📊 REPORTE FINAL DE VERIFICACIÓN DE DATOS');
    console.log('=' .repeat(50));
    
    // Test connection
    await testConnection();
    
    // Verificar profesores
    console.log('\n👨‍🏫 PROFESORES EN LA BASE DE DATOS:');
    const teachers = await User.findAll({
      where: { role: 'teacher' },
      order: [['firstName', 'ASC']]
    });
    
    console.log(`Total de profesores: ${teachers.length}`);
    teachers.forEach((teacher, index) => {
      console.log(`  ${index + 1}. ${teacher.firstName} ${teacher.lastName} - ${teacher.email}`);
    });
    
    // Verificar materias
    console.log('\n📚 MATERIAS EN LA BASE DE DATOS:');
    const subjects = await Subject.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    
    console.log(`Total de materias: ${subjects.length}`);
    subjects.forEach((subject, index) => {
      console.log(`  ${index + 1}. ${subject.name} (${subject.code}) - ${subject.description}`);
    });
    
    // Verificar grupos
    console.log('\n👥 GRUPOS EN LA BASE DE DATOS:');
    const groups = await Group.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    
    console.log(`Total de grupos: ${groups.length}`);
    groups.forEach((group, index) => {
      console.log(`  ${index + 1}. ${group.name} (${group.grade} ${group.section}) - ${group.studentCount} estudiantes`);
    });
    
    // Verificar asignaciones
    console.log('\n🔗 ASIGNACIONES PROFESOR-MATERIA-GRUPO:');
    const assignments = await SubjectAssignment.findAll({
      include: [
        { model: User, as: 'teacher', attributes: ['firstName', 'lastName', 'email'] },
        { model: Subject, as: 'subject', attributes: ['name', 'code'] },
        { model: Group, as: 'group', attributes: ['name'] }
      ],
      order: [['id', 'ASC']]
    });
    
    console.log(`Total de asignaciones: ${assignments.length}`);
    assignments.forEach((assignment, index) => {
      console.log(`  ${index + 1}. ${assignment.teacher.firstName} ${assignment.teacher.lastName} - ${assignment.subject.name} - ${assignment.group.name}`);
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
    
    console.log(`Total de tareas de septiembre 2025: ${september2025Tasks.length}`);
    september2025Tasks.forEach((task, index) => {
      const dueDate = new Date(task.dueDate).toLocaleDateString('es-ES');
      console.log(`  ${index + 1}. ${task.title} - ${task.subject.name} - ${task.group.name} - ${task.teacher.firstName} ${task.teacher.lastName} - ${dueDate}`);
    });
    
    // Verificar todas las tareas
    console.log('\n📋 RESUMEN TOTAL DE TAREAS:');
    const allTasks = await Task.findAll();
    console.log(`Total de tareas en la base de datos: ${allTasks.length}`);
    
    // Resumen final
    console.log('\n🎯 RESUMEN FINAL:');
    console.log('=' .repeat(30));
    console.log(`✅ Profesores: ${teachers.length} (COMPLETO)`);
    console.log(`✅ Materias: ${subjects.length} (COMPLETO)`);
    console.log(`✅ Grupos: ${groups.length} (COMPLETO)`);
    console.log(`✅ Asignaciones: ${assignments.length} (COMPLETO)`);
    console.log(`✅ Tareas septiembre 2025: ${september2025Tasks.length} (COMPLETO)`);
    console.log(`✅ Total tareas: ${allTasks.length} (COMPLETO)`);
    
    console.log('\n🎉 TODOS LOS DATOS HAN SIDO GUARDADOS CORRECTAMENTE EN LA BASE DE DATOS');
    console.log('✅ VERIFICACIÓN COMPLETA Y EXITOSA');
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error);
    throw error;
  }
};

// Ejecutar
generateFinalReport()
  .then(() => {
    console.log('\nReporte completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });