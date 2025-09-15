import fetch from 'node-fetch';

async function testHttpLogin() {
  try {
    console.log('🌐 Probando login HTTP...');
    
    const loginData = {
      email: 'ingles@colegio.edu',
      password: '123456'
    };
    
    console.log('📧 Datos de login:', loginData);
    
    // Probar diferentes puertos comunes
    const ports = [5000, 3000, 8000];
    
    for (const port of ports) {
      try {
        console.log(`\n🔍 Probando puerto ${port}...`);
        
        const response = await fetch(`http://localhost:${port}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
          timeout: 5000
        });
        
        console.log('📡 Status:', response.status);
        console.log('📡 Status Text:', response.statusText);
        
        const responseData = await response.json();
        console.log('📤 Respuesta:', JSON.stringify(responseData, null, 2));
        
        if (response.ok) {
          console.log(`✅ Login exitoso en puerto ${port}!`);
          return;
        } else {
          console.log(`❌ Login falló en puerto ${port}`);
        }
        
      } catch (portError) {
        console.log(`❌ Error en puerto ${port}:`, portError.message);
      }
    }
    
    console.log('\n❌ No se pudo conectar a ningún puerto');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testHttpLogin();