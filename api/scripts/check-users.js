import { User } from '../models/index.ts';
import sequelize from '../config/database.ts';
import bcrypt from 'bcrypt';

async function checkAndCreateUsers() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // Verificar usuarios existentes
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive']
    });

    console.log('\n📋 Usuarios existentes:');
    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos.');
    } else {
      users.forEach(user => {
        console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - Rol: ${user.role} - Activo: ${user.isActive}`);
      });
    }

    // Crear usuarios de prueba si no existen
    const testUsers = [
      {
        email: 'coordinador@colegio.edu',
        password: '123456',
        firstName: 'Admin',
        lastName: 'Coordinador',
        role: 'coordinator'
      },
      {
        email: 'profesor@colegio.edu',
        password: '123456',
        firstName: 'Juan',
        lastName: 'Profesor',
        role: 'teacher'
      },
      {
        email: 'maria@colegio.edu',
        password: '123456',
        firstName: 'María',
        lastName: 'García',
        role: 'teacher'
      }
    ];

    console.log('\n🔧 Creando usuarios de prueba...');
    
    for (const userData of testUsers) {
      const existingUser = await User.findOne({ where: { email: userData.email } });
      
      if (!existingUser) {
        await User.create(userData);
        console.log(`✅ Usuario creado: ${userData.email} (${userData.role})`);
      } else {
        console.log(`ℹ️  Usuario ya existe: ${userData.email}`);
      }
    }

    console.log('\n✅ Proceso completado.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkAndCreateUsers();