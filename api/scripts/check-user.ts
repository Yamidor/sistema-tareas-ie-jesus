import User from '../models/User.js';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

async function checkUser() {
  try {
    console.log('🔍 Verificando usuario: ingles@colegio.edu');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Buscar el usuario en la base de datos
    const user = await User.findOne({
      where: {
        email: 'ingles@colegio.edu'
      }
    });

    if (!user) {
      console.log('❌ Usuario NO encontrado en la base de datos');
      console.log('📝 Creando usuario con email: ingles@colegio.edu');
      
      // Crear el usuario
      const newUser = await User.create({
        email: 'ingles@colegio.edu',
        password: '123456', // Se hasheará automáticamente por el hook
        firstName: 'Profesor',
        lastName: 'Inglés',
        role: 'teacher',
        isActive: true
      });
      
      console.log('✅ Usuario creado exitosamente:');
      console.log('- ID:', newUser.id);
      console.log('- Email:', newUser.email);
      console.log('- Nombre:', newUser.firstName, newUser.lastName);
      console.log('- Rol:', newUser.role);
      console.log('- Activo:', newUser.isActive);
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Nombre:', user.firstName, user.lastName);
    console.log('- Activo:', user.isActive);
    console.log('- Rol:', user.role);
    console.log('- Fecha creación:', user.createdAt);
    
    // Verificar contraseña
    console.log('\n🔐 Verificando contraseña...');
    const passwordMatch = await user.validatePassword('123456');
    
    if (passwordMatch) {
      console.log('✅ La contraseña "123456" es CORRECTA');
    } else {
      console.log('❌ La contraseña "123456" es INCORRECTA');
      console.log('🔧 Actualizando contraseña a "123456"...');
      
      // Actualizar la contraseña (se hasheará automáticamente por el hook)
      await user.update({ password: '123456' });
      
      console.log('✅ Contraseña actualizada correctamente');
      
      // Verificar nuevamente
      const newPasswordMatch = await user.validatePassword('123456');
      if (newPasswordMatch) {
        console.log('✅ Verificación: La nueva contraseña funciona correctamente');
      }
    }

  } catch (error) {
    console.error('❌ Error al verificar usuario:', error);
  } finally {
    await sequelize.close();
  }
}

checkUser();