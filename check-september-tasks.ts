import { User, Subject, Group, SubjectAssignment, Task } from './api/models/index.ts';
import { Op } from 'sequelize';

async function checkSeptemberTasks() {
  try {
    console.log('🔍 Checking September 2025 tasks for logged-in teacher...');
    
    // Find the English teacher (logged-in user)
    const teacher = await User.findOne({
      where: { 
        email: 'ingles@colegio.edu',
        role: 'teacher'
      }
    });
    
    if (!teacher) {
      console.log('❌ English teacher not found in database');
      return;
    }
    
    console.log(`✅ Found teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.email})`);
    
    // Get teacher's subject assignments
    const assignments = await SubjectAssignment.findAll({
      where: { userId: teacher.id },
      include: [
        {
          model: Subject,
          as: 'subject'
        },
        {
          model: Group,
          as: 'group'
        }
      ]
    });
    
    console.log(`📚 Teacher has ${assignments.length} subject assignments`);
    
    // Check for September 2025 tasks
    const septemberTasks = await Task.findAll({
      where: {
        userId: teacher.id,
        dueDate: {
          [Op.between]: ['2025-09-01', '2025-09-30']
        }
      },
      include: [
        {
          model: Subject,
          as: 'subject'
        },
        {
          model: Group,
          as: 'group'
        }
      ],
      order: [['dueDate', 'ASC']]
    });
    
    console.log(`📅 Found ${septemberTasks.length} tasks for September 2025`);
    
    if (septemberTasks.length === 0) {
      console.log('⚠️  No tasks found for September 2025. Creating sample tasks...');
      
      // Get the first assignment for creating sample tasks
      if (assignments.length > 0) {
        const assignment = assignments[0];
        
        // Create a few sample tasks
        const sampleTasks = [
          {
            title: 'English Grammar Quiz',
            description: 'Quiz on present perfect tense',
            dueDate: '2025-09-05',
            userId: teacher.id,
            subjectId: assignment.subjectId,
            groupId: assignment.groupId,
            status: 'pending'
          },
          {
            title: 'Reading Comprehension Assignment',
            description: 'Read chapter 3 and answer questions',
            dueDate: '2025-09-12',
            userId: teacher.id,
            subjectId: assignment.subjectId,
            groupId: assignment.groupId,
            status: 'pending'
          },
          {
            title: 'Vocabulary Test',
            description: 'Test on unit 2 vocabulary',
            dueDate: '2025-09-19',
            userId: teacher.id,
            subjectId: assignment.subjectId,
            groupId: assignment.groupId,
            status: 'pending'
          }
        ];
        
        for (const taskData of sampleTasks) {
          await Task.create(taskData);
          console.log(`✅ Created task: ${taskData.title} (Due: ${taskData.dueDate})`);
        }
        
        console.log('🎉 Sample tasks created successfully!');
      } else {
        console.log('❌ No subject assignments found for teacher');
      }
    } else {
      console.log('\n📋 Existing September 2025 tasks:');
      septemberTasks.forEach((task, index) => {
        console.log(`${index + 1}. ${task.title}`);
        console.log(`   Subject: ${task.subject?.name || 'N/A'}`);
        console.log(`   Group: ${task.group?.name || 'N/A'}`);
        console.log(`   Due Date: ${task.dueDate}`);
        console.log(`   Status: ${task.status}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking September tasks:', error);
  }
}

checkSeptemberTasks();