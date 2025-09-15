import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type ForeignKey } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Subject from './Subject.js';
import Group from './Group.js';

export interface SubjectAssignmentAttributes {
  id: number;
  userId: number;
  subjectId: number;
  groupId: number;
  academicYear: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class SubjectAssignment extends Model<InferAttributes<SubjectAssignment>, InferCreationAttributes<SubjectAssignment>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare subjectId: ForeignKey<Subject['id']>;
  declare groupId: ForeignKey<Group['id']>;
  declare academicYear: string;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

SubjectAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'academic_year',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
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
    modelName: 'SubjectAssignment',
    tableName: 'subject_assignments',
  }
);

export default SubjectAssignment;