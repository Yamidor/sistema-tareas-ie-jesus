import User from '../models/User.js';
import sequelize from '../config/database.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testLogin() {
  try {
    console.log('🧪 Probando proceso de login...');
    
    const email = 'ingles@colegio.edu';
    const password = '123456';
    
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Paso 1: Buscar usuario activo
    console.log('\n🔍 Paso 1: Buscando usuario activo...');
    const user = await User.findOne({
      where: { email, isActive: true }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado o inactivo');
      return;
    }
    
    console.log('✅ Usuario encontrado:');
    console.log('- ID:', user.id);
    console.log('- Email:', user.email);
    console.log('- Activo:', user.isActive);
    console.log('- Rol:', user.role);
    
    // Paso 2: Validar contraseña
    console.log('\n🔐 Paso 2: Validando contraseña...');
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      console.log('❌ Contraseña inválida');
      return;
    }
    
    console.log('✅ Contraseña válida');
    
    // Paso 3: Verificar JWT_SECRET
    console.log('\n🔑 Paso 3: Verificando JWT_SECRET...');
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.log('❌ JWT_SECRET no configurado');
      return;
    }
    
    console.log('✅ JWT_SECRET configurado:', jwtSecret.substring(0, 10) + '...');
    
    // Paso 4: Generar token
    console.log('\n🎫 Paso 4: Generando token...');
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    console.log('✅ Token generado exitosamente');
    console.log('Token (primeros 50 chars):', token.substring(0, 50) + '...');
    
    // Paso 5: Simular respuesta exitosa
    console.log('\n🎉 Paso 5: Login exitoso!');
    const response = {
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: user.toJSON(),
      },
    };
    
    console.log('📤 Respuesta del servidor:');
    console.log('- Success:', response.success);
    console.log('- Message:', response.message);
    console.log('- User ID:', response.data.user.id);
    console.log('- User Email:', response.data.user.email);
    console.log('- User Role:', response.data.user.role);
    
    console.log('\n✅ CONCLUSIÓN: El proceso de login funciona correctamente');
    console.log('🔍 El problema puede estar en:');
    console.log('  1. El frontend no está enviando los datos correctamente');
    console.log('  2. Hay un problema de red o CORS');
    console.log('  3. El servidor no está ejecutándose en el puerto correcto');
    
  } catch (error) {
    console.error('❌ Error en el proceso de login:', error);
  } finally {
    await sequelize.close();
  }
}

testLogin();