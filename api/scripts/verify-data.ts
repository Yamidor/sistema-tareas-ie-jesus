import { User, Subject, Group, Task } from '../models/index.ts';
import { Op } from 'sequelize';

async function verifyData() {
  try {
    console.log('🔍 Verificando datos en la base de datos...');
    
    // Verificar profesores
    const teachers = await User.findAll({ where: { role: 'teacher' } });
    console.log(`👨‍🏫 Profesores encontrados: ${teachers.length}`);
    teachers.forEach(teacher => {
      console.log(`  - ${teacher.firstName} ${teacher.lastName} (${teacher.email})`);
    });
    
    // Verificar materias
    const subjects = await Subject.findAll();
    console.log(`\n📚 Materias encontradas: ${subjects.length}`);
    subjects.forEach(subject => {
      console.log(`  - ${subject.name} (${subject.code})`);
    });
    
    // Verificar grupos
    const groups = await Group.findAll();
    console.log(`\n👥 Grupos encontrados: ${groups.length}`);
    groups.forEach(group => {
      console.log(`  - ${group.name} (${group.grade}${group.section})`);
    });
    
    // Verificar tareas de septiembre 2025
    const septemberTasks = await Task.findAll({
      where: {
        dueDate: {
          [Op.between]: ['2025-09-01', '2025-09-30']
        }
      }
    });
    console.log(`\n📝 Tareas de septiembre 2025: ${septemberTasks.length}`);
    septemberTasks.forEach(task => {
      console.log(`  - ${task.title} (${task.dueDate.toISOString().split('T')[0]})`);
    });
    
    // Verificar todas las tareas
    const allTasks = await Task.findAll();
    console.log(`\n📝 Total de tareas en la base de datos: ${allTasks.length}`);
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  }
}

verifyData().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});