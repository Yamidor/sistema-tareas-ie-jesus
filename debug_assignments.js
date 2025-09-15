import { SubjectAssignment, Group } from './api/models/index.ts';

async function debugAssignments() {
  try {
    console.log('=== ASIGNACIONES ACTIVAS ===');
    const assignments = await SubjectAssignment.findAll({ 
      where: { isActive: true }, 
      raw: true 
    });
    console.log('Total asignaciones activas:', assignments.length);
    console.log(assignments);
    
    console.log('\n=== GRUPOS ACTIVOS ===');
    const groups = await Group.findAll({ 
      where: { isActive: true }, 
      raw: true 
    });
    console.log('Total grupos activos:', groups.length);
    console.log(groups);
    
    console.log('\n=== IDs DE GRUPOS ASIGNADOS ===');
    const assignedGroupIds = assignments.map(a => a.group_id);
    console.log('IDs de grupos asignados:', assignedGroupIds);
    
    console.log('\n=== GRUPOS DISPONIBLES (sin asignación) ===');
    const availableGroups = groups.filter(g => !assignedGroupIds.includes(g.id));
    console.log('Total grupos disponibles:', availableGroups.length);
    console.log(availableGroups);
    
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

debugAssignments();