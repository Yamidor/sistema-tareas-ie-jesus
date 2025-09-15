import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

export interface GroupAttributes {
  id: number;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  studentCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class Group extends Model<InferAttributes<Group>, InferCreationAttributes<Group>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare grade: string;
  declare section: string;
  declare academicYear: string;
  declare studentCount: CreationOptional<number>;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Group.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    section: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    academicYear: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'academic_year',
    },
    studentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'student_count',
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
    modelName: 'Group',
    tableName: 'groups',
  }
);

export default Group;