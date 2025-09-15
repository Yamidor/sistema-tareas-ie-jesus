import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type ForeignKey } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Subject from './Subject.js';
import Group from './Group.js';

export interface TaskAttributes {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  userId: number;
  subjectId: number;
  groupId: number;
  createdAt: Date;
  updatedAt: Date;
}

class Task extends Model<InferAttributes<Task>, InferCreationAttributes<Task>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare description: string;
  declare dueDate: Date;
  declare status: CreationOptional<'pending' | 'in_progress' | 'completed' | 'overdue'>;
  declare priority: CreationOptional<'low' | 'medium' | 'high'>;
  declare userId: ForeignKey<User['id']>;
  declare subjectId: ForeignKey<Subject['id']>;
  declare groupId: ForeignKey<Group['id']>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Task.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'due_date',
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'overdue'),
      allowNull: false,
      defaultValue: 'pending',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: User,
        key: 'id',
      },
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'subject_id',
      references: {
        model: Subject,
        key: 'id',
      },
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'group_id',
      references: {
        model: Group,
        key: 'id',
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'tasks',
  }
);

export default Task;