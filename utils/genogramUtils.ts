/**
 * @file genogramUtils.ts
 * @description Este módulo contiene funciones de utilidad para transformar datos de casos
 * en un formato adecuado para el componente `GoJSGenogramDiagram`.
 * Se centra en procesar la información de composición familiar y de convivencia
 * para extraer nodos (personas) y inferir relaciones (padres, cónyuges)
 * que `GenogramLayout` de GoJS puede utilizar para dibujar el diagrama.
 */
import { CaseDetail, FamilyMember, HouseholdMember, Person, Gender, CompositionUnitRecord } from '../types';
import { GoJSNodeData, GoJSLinkData } from '../components/cases/GoJSGenogramDiagram'; // Asegúrate que la ruta sea correcta

// Helper to get the role string for a person in a unit (No exportado, uso interno)
// Este helper no se usa actualmente en transformCaseDataToGenogram pero se mantiene por si es útil en el futuro.
/*
const getPersonRoleInUnit = (personId: string, unit: FamilyMember[] | HouseholdMember[]): string | undefined => {
  const member = unit.find(m => m.id === personId);
  if (member && 'relationshipToCaseHolder' in member) {
    return (member as FamilyMember).relationshipToCaseHolder;
  }
  if (member && 'cohabitationNotes' in member) {
    return (member as HouseholdMember).isFamilyMember ? undefined : (member as HouseholdMember).cohabitationNotes;
  }
  return undefined;
};
*/

/**
 * @function transformCaseDataToGenogram
 * @description Transforma los datos de un `CaseDetail` (específicamente su `compositionHistory`)
 * en arrays de nodos y enlaces compatibles con `GoJSGenogramDiagram`.
 * 
 * @param {CaseDetail | undefined} caseData - El objeto detallado del caso que contiene la información
 * de la composición familiar y de convivencia. Si es undefined o no tiene historial de composición,
 * se retornarán arrays vacíos.
 * 
 * @returns {{ nodes: GoJSNodeData[]; links: GoJSLinkData[] }} Un objeto que contiene:
 *  - `nodes`: Un array de `GoJSNodeData` representando a cada persona única.
 *  - `links`: Un array de `GoJSLinkData` para relaciones explícitas (actualmente usado de forma mínima,
 *    ya que `GenogramLayout` infiere la mayoría de los enlaces a partir de las propiedades `parents` y `spouses` en los nodos).
 * 
 * @summary Lógica de Transformación y Asunciones:
 * 1.  **Fuente de Datos**: Utiliza el registro más reciente de `compositionHistory` del `caseData`.
 * 2.  **Creación de Nodos**:
 *     - Combina `familyUnit` y `householdUnit` para obtener una lista de todas las personas únicas.
 *     - Para cada persona, crea un nodo con `key` (ID de la persona), `name` (nombre completo),
 *       y `gender` (género, con `Gender.Unknown` como fallback).
 *     - Inicializa las propiedades `spouses` y `parents` como arrays vacíos en cada nodo.
 * 3.  **Inferencia de Relaciones Parentales**:
 *     - Itera sobre `familyUnit`. Si un miembro tiene un rol como "Hijo/a", busca otros miembros
 *       en la misma `familyUnit` con roles parentales (ej. "Padre", "Madre").
 *     - **Asunción**: Considera como padres a aquellos miembros adultos de `familyUnit` con roles explícitos de "Padre", "Madre" o "Progenitor".
 *       Esta lógica es simplificada y podría requerir un modelo de datos más explícito para relaciones complejas
 *       (ej. si un niño tuviera un campo `parentIds`).
 *     - Las 'keys' de los padres identificados se añaden al array `parents` del nodo del hijo.
 * 4.  **Inferencia de Relaciones Conyugales (Simplificada)**:
 *     - Intenta identificar parejas buscando miembros en `familyUnit` con roles como "Cónyuge", "Esposo/a", "Pareja".
 *     - **Asunción Principal**: Si dos personas son padres de al menos un hijo en común (según los arrays `parents` inferidos previamente),
 *       se consideran cónyuges y sus 'keys' se añaden mutuamente a sus arrays `spouses`.
 *     - Esta es una heurística; un modelo de datos con identificadores explícitos de pareja sería más robusto.
 *       `GenogramLayout` utiliza los arrays `spouses` para dibujar los enlaces matrimoniales.
 * 5.  **Enlaces Explícitos (`links` array)**:
 *     - Actualmente, el array `links` se retorna mayormente vacío. La intención es que `GenogramLayout`
 *       dibuje los enlaces basándose en las propiedades `parents` y `spouses` de los nodos.
 *     - Se podrían añadir enlaces explícitos aquí si fuera necesario para relaciones que `GenogramLayout` no maneje
 *       automáticamente (ej. matrimonios múltiples no secuenciales o tipos de relación muy específicos).
 * 6.  **Miembros de Convivencia vs. Familiares**:
 *     - Todos los miembros de `familyUnit` y `householdUnit` se incluyen como nodos.
 *     - No se realiza un filtrado especial para excluir a miembros de convivencia que no sean familiares,
 *       aunque esto podría ser un refinamiento futuro si el genograma debe centrarse estrictamente en lazos de parentesco.
 */
export const transformCaseDataToGenogram = (
  caseData: CaseDetail | undefined
): { nodes: GoJSNodeData[]; links: GoJSLinkData[] } => {
  if (!caseData || !caseData.compositionHistory || caseData.compositionHistory.length === 0) {
    // Si no hay datos del caso o historial de composición, retorna arrays vacíos.
    return { nodes: [], links: [] };
  }

  // Utiliza el primer registro de composición (asumido como el más reciente o relevante).
  const currentComposition = caseData.compositionHistory[0];
  if (!currentComposition) {
    return { nodes: [], links: [] };
  }

  const { familyUnit, householdUnit } = currentComposition;
  const nodes: GoJSNodeData[] = [];
  const links: GoJSLinkData[] = []; // Para enlaces explícitos, si fueran necesarios.

  // Paso 1: Consolidar todas las personas únicas de familyUnit y householdUnit.
  const allPersonsMap = new Map<string, Person>();

  familyUnit.forEach(p => allPersonsMap.set(p.id, p));
  householdUnit.forEach(p => { 
    if (!allPersonsMap.has(p.id)) { // Solo añadir si no está ya (desde familyUnit).
      allPersonsMap.set(p.id, p);
    }
  });
  
  const allPersonsArray = Array.from(allPersonsMap.values());

  // Paso 2: Crear un nodo GoJS para cada persona.
  allPersonsArray.forEach(person => {
    nodes.push({
      key: person.id, // ID único del nodo.
      name: person.fullName, // Nombre a mostrar.
      gender: person.gender || Gender.Unknown, // Género para la forma/color del nodo.
      spouses: [], // Array para IDs de cónyuges; se llenará después.
      parents: [], // Array para IDs de padres; se llenará para los hijos.
    });
  });

  // Paso 3: Inferir relaciones padres-hijos.
  // Se basa en los roles definidos en `familyUnit`.
  familyUnit.forEach(member => {
    const memberRole = member.relationshipToCaseHolder?.toLowerCase();
    const memberNode = nodes.find(n => n.key === member.id);

    if (!memberNode) return; // El miembro debería existir en `nodes`.

    // Si el miembro es identificado como "hijo/a".
    if (memberRole === 'hijo/a' || memberRole === 'hijo' || memberRole === 'hija') {
      const parentKeys: string[] = [];
      // Buscar posibles padres dentro de la misma `familyUnit`.
      familyUnit.forEach(potentialParent => {
        if (potentialParent.id === member.id) return; // No puede ser su propio padre.

        const parentRole = potentialParent.relationshipToCaseHolder?.toLowerCase();
        // Asunción: roles como "padre", "madre", "progenitor" indican una relación parental con el "hijo/a".
        // Roles como "cónyuge" también se consideran por si son padres del hijo/a del titular del caso.
        // Esta lógica es una simplificación. Un modelo de datos más explícito (ej. `child.parentIds`) sería ideal.
        if (parentRole === 'padre' || parentRole === 'madre' || parentRole === 'progenitor') {
             parentKeys.push(potentialParent.id);
        }
        // Podría extenderse: si el titular es "Padre" y su "Cónyuge" está presente, ¿es también madre/padre del niño?
        // Esta inferencia puede ser compleja y propensa a errores sin datos más directos.
      });
      if (parentKeys.length > 0) {
        memberNode.parents = parentKeys; // Asignar los padres encontrados al nodo del hijo.
      }
    }
  });
  
  // Paso 4: Inferir relaciones conyugales (simplificado).
  // GoJS GenogramLayout usa la propiedad 'spouses' en los nodos.
  // Esta lógica intenta popular 'spouses' si dos personas comparten hijos.
  nodes.forEach(node1 => {
    if (node1.parents && node1.parents.length > 0) { // Si este nodo es un hijo (tiene padres)
        // Iterar sobre todos los demás nodos para encontrar un posible "otro padre" de este hijo
        // que no sea uno de los padres ya listados para node1 (esto es para encontrar hermanos y sus padres).
        // Esta lógica es más compleja que simplemente buscar "Cónyuge" y se enfoca en co-parentalidad.
    }
  });

  // Lógica de ejemplo más directa para cónyuges basada en roles (si es aplicable y los roles son claros):
  const familyMembers = Array.from(familyUnit.values()); // Convertir a array si es necesario
  for (let i = 0; i < familyMembers.length; i++) {
    for (let j = i + 1; j < familyMembers.length; j++) {
        const p1 = familyMembers[i];
        const p2 = familyMembers[j];
        const p1Node = nodes.find(n => n.key === p1.id);
        const p2Node = nodes.find(n => n.key === p2.id);

        if (!p1Node || !p2Node) continue;

        // Criterio 1: ¿Son padres de los mismos hijos? (Más robusto)
        let commonChildrenCount = 0;
        nodes.forEach(childNode => {
            if (childNode.parents && childNode.parents.includes(p1.id) && childNode.parents.includes(p2.id)) {
                commonChildrenCount++;
            }
        });

        if (commonChildrenCount > 0) {
            if (!p1Node.spouses?.includes(p2.id)) p1Node.spouses?.push(p2.id);
            if (!p2Node.spouses?.includes(p1.id)) p2Node.spouses?.push(p1.id);
            // Opcional: añadir un enlace explícito si se desea un control total o una categoría específica.
            // links.push({ from: p1.id, to: p2.id, category: "Marriage" });
        } else {
            // Criterio 2: ¿Tienen roles explícitos de pareja? (Menos robusto, depende de los datos)
            // Esta parte es muy dependiente de cómo se definan los roles en `relationshipToCaseHolder`.
            // Ejemplo: si p1 es "Esposo" y p2 es "Esposa" DENTRO del mismo `familyUnit` (no necesariamente del titular del caso).
            // Esta lógica se omite aquí por su complejidad y dependencia del modelo de datos específico,
            // pero es donde se procesarían roles como "Cónyuge", "Pareja", etc., para formar parejas
            // incluso si no tienen hijos registrados en el sistema.
        }
    }
  }
  
  // Nota: La inferencia de relaciones es la parte más compleja y dependiente del modelo de datos.
  // Las heurísticas actuales son simplificaciones y pueden necesitar ajustes
  // basados en la calidad y estructura de los datos de entrada.

  return { nodes, links };
};
