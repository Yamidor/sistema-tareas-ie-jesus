import { Task, User, Subject, Group } from './api/models/index.js';
import { sequelize } from './api/config/database.js';
import { Op } from 'sequelize';

async function checkSeptemberTasks() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    const tasks = await Task.findAll({
      where: {
        dueDate: {
          [Op.between]: [new Date('2025-09-01'), new Date('2025-09-30')]
        }
      },
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['name']
        },
        {
          model: Group,
          as: 'group',
          attributes: ['name']
        }
      ]
    });
    
    console.log(`September 2025 tasks found: ${tasks.length}`);
    
    if (tasks.length > 0) {
      console.log('\nTasks details:');
      tasks.forEach(task => {
        console.log(`- ${task.title}`);
        console.log(`  Teacher: ${task.teacher.firstName} ${task.teacher.lastName} (${task.teacher.email})`);
        console.log(`  Subject: ${task.subject.name}`);
        console.log(`  Group: ${task.group.name}`);
        console.log(`  Due Date: ${task.dueDate}`);
        console.log('---');
      });
    } else {
      console.log('No September 2025 tasks found in database');
    }
    
  } catch (error) {
    console.error('Error checking tasks:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkSeptemberTasks();