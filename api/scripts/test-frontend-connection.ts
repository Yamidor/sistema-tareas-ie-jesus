import fetch from 'node-fetch';

async function testFrontendConnection() {
  try {
    console.log('🌐 Probando conexión al frontend...');
    
    // Probar puertos comunes del frontend
    const ports = [3000, 5173, 4173, 8080];
    
    for (const port of ports) {
      try {
        console.log(`\n🔍 Probando puerto ${port}...`);
        const response = await fetch(`http://localhost:${port}`, {
          timeout: 3000
        });
        
        if (response.ok) {
          console.log(`✅ Frontend encontrado en puerto ${port}`);
          console.log(`📱 URL: http://localhost:${port}`);
          return;
        }
      } catch (error) {
        console.log(`❌ Puerto ${port} no disponible`);
      }
    }
    
    console.log('\n⚠️  No se encontró el frontend corriendo en ningún puerto común');
    console.log('💡 Asegúrate de ejecutar: npm run dev o npm run client:dev');
    
  } catch (error) {
    console.error('❌ Error probando conexión:', error);
  }
}

testFrontendConnection();