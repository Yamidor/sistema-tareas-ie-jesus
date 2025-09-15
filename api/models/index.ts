import User from './User.js';
import Subject from './Subject.js';
import Group from './Group.js';
import SubjectAssignment from './SubjectAssignment.js';
import Task from './Task.js';

// Define associations

// User associations
User.hasMany(SubjectAssignment, { foreignKey: 'userId', as: 'assignments' });
User.hasMany(Task, { foreignKey: 'userId', as: 'tasks' });

// Subject associations
Subject.hasMany(SubjectAssignment, { foreignKey: 'subjectId', as: 'assignments' });
Subject.hasMany(Task, { foreignKey: 'subjectId', as: 'tasks' });

// Group associations
Group.hasMany(SubjectAssignment, { foreignKey: 'groupId', as: 'assignments' });
Group.hasMany(Task, { foreignKey: 'groupId', as: 'tasks' });

// SubjectAssignment associations
SubjectAssignment.belongsTo(User, { foreignKey: 'userId', as: 'teacher' });
SubjectAssignment.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
SubjectAssignment.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

// Task associations
Task.belongsTo(User, { foreignKey: 'userId', as: 'teacher' });
Task.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Task.belongsTo(Group, { foreignKey: 'groupId', as: 'group' });

export {
  User,
  Subject,
  Group,
  SubjectAssignment,
  Task,
};

export default {
  User,
  Subject,
  Group,
  SubjectAssignment,
  Task,
};