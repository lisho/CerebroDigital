import React from 'react';
import { FamilyMember } from '../../types';

interface SimplifiedGenogramProps {
  familyUnit: FamilyMember[];
  caseHolderName: string;
}

const SimplifiedGenogram: React.FC<SimplifiedGenogramProps> = ({ familyUnit, caseHolderName }) => {
  if (!familyUnit || familyUnit.length === 0) {
    return <p className="text-sm text-theme-text-secondary text-center py-4">No hay datos familiares suficientes para generar un genograma.</p>;
  }

  const NODE_WIDTH = 80;
  const NODE_HEIGHT = 50;
  const TEXT_OFFSET_Y = 10;
  const AGE_OFFSET_Y = 22;
  const SPOUSE_SPACING = 30;
  const GENERATION_SPACING = 80;
  const SIBLING_SPACING = 20;

  const caseHolder = familyUnit.find(p => 
    p.relationshipToCaseHolder === "Ella misma" || 
    p.relationshipToCaseHolder === "Él mismo" ||
    p.fullName === caseHolderName 
  );

  if (!caseHolder) {
     return <p className="text-sm text-theme-text-secondary text-center py-4">No se pudo identificar al titular del caso en la unidad familiar.</p>;
  }
  
  const getAge = (dateOfBirth?: string): string | null => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? age.toString() : null;
  };

  const spouseRelationships = ["Cónyuge", "Pareja", "Esposo", "Esposa"];
  const spouse = familyUnit.find(p => p.id !== caseHolder.id && spouseRelationships.some(r => p.relationshipToCaseHolder.toLowerCase().includes(r.toLowerCase())));
  
  const children = familyUnit.filter(p => 
    p.id !== caseHolder.id && 
    p.id !== (spouse?.id) && 
    (p.relationshipToCaseHolder.toLowerCase().includes("hijo") || p.relationshipToCaseHolder.toLowerCase().includes("hija"))
  ).sort((a,b) => (new Date(a.dateOfBirth || 0).getTime()) - (new Date(b.dateOfBirth || 0).getTime()));

  const elements: React.ReactNode[] = [];
  let currentY = 50;
  let svgHeight = currentY + NODE_HEIGHT + 50; 

  const parentsXStart = 100;
  let caseHolderX = parentsXStart;
  if (spouse) {
    caseHolderX = parentsXStart;
    const spouseX = caseHolderX + NODE_WIDTH + SPOUSE_SPACING;
    
    elements.push(<line key="spouse-line" x1={caseHolderX + NODE_WIDTH / 2} y1={currentY + NODE_HEIGHT / 2} x2={spouseX + NODE_WIDTH / 2} y2={currentY + NODE_HEIGHT / 2} stroke="var(--color-text-primary)" strokeWidth="1.5" />);
    
    const spouseGender = spouse.gender?.toLowerCase();
    if (spouseGender === "femenino") {
      elements.push(<circle key={spouse.id} cx={spouseX + NODE_WIDTH / 2} cy={currentY + NODE_HEIGHT / 2} r={NODE_HEIGHT / 2} fill="var(--color-bg-secondary)" stroke="var(--color-text-primary)" strokeWidth="1.5" />);
    } else if (spouseGender === "masculino") {
      elements.push(<rect key={spouse.id} x={spouseX} y={currentY} width={NODE_WIDTH} height={NODE_HEIGHT} fill="var(--color-bg-secondary)" stroke="var(--color-text-primary)" strokeWidth="1.5" />);
    } else {
      elements.push(<rect key={spouse.id} x={spouseX} y={currentY + NODE_HEIGHT/4} width={NODE_WIDTH} height={NODE_HEIGHT/2} rx="5" ry="5" fill="var(--color-bg-secondary)" stroke="var(--color-text-primary)" strokeWidth="1.5" />);
    }
    elements.push(<text key={`name-${spouse.id}`} x={spouseX + NODE_WIDTH / 2} y={currentY + NODE_HEIGHT + TEXT_OFFSET_Y} textAnchor="middle" fontSize="10" fill="var(--color-text-primary)">{spouse.fullName}</text>);
    const spouseAge = getAge(spouse.dateOfBirth);
    if (spouseAge) elements.push(<text key={`age-${spouse.id}`} x={spouseX + NODE_WIDTH / 2} y={currentY + NODE_HEIGHT + AGE_OFFSET_Y} textAnchor="middle" fontSize="9" fill="var(--color-text-secondary)">({spouseAge} años)</text>);

  } else {
    caseHolderX = parentsXStart + (NODE_WIDTH + SPOUSE_SPACING) / 2; 
  }

  const caseHolderGender = caseHolder.gender?.toLowerCase();
  if (caseHolderGender === "femenino") {
    elements.push(<circle key={caseHolder.id} cx={caseHolderX + NODE_WIDTH / 2} cy={currentY + NODE_HEIGHT / 2} r={NODE_HEIGHT / 2} fill="var(--color-bg-secondary)" stroke="var(--color-text-primary)" strokeWidth="2" />);
  } else if (caseHolderGender === "masculino") {
    elements.push(<rect key={caseHolder.id} x={caseHolderX} y={currentY} width={NODE_WIDTH} height={NODE_HEIGHT} fill="var(--color-bg-secondary)" stroke="var(--color-text-primary)" strokeWidth="2" />);
  } else {
      elements.push(<rect key={caseHolder.id} x={caseHolderX} y={currentY + NODE_HEIGHT/4} width={NODE_WIDTH} height={NODE_HEIGHT/2} rx="5" ry="5" fill="var(--color-bg-secondary)" stroke="var(--color-text-primary)" strokeWidth="2" />);
  }
  elements.push(<text key={`name-${caseHolder.id}`} x={caseHolderX + NODE_WIDTH / 2} y={currentY + NODE_HEIGHT + TEXT_OFFSET_Y} textAnchor="middle" fontSize="10" fill="var(--color-text-primary)">{caseHolder.fullName}</text>);
  const caseHolderAge = getAge(caseHolder.dateOfBirth);
  if (caseHolderAge) elements.push(<text key={`age-${caseHolder.id}`} x={caseHolderX + NODE_WIDTH / 2} y={currentY + NODE_HEIGHT + AGE_OFFSET_Y} textAnchor="middle" fontSize="9" fill="var(--color-text-secondary)">({caseHolderAge} años)</text>);

  if (children.length > 0) {
    const childrenY = currentY + NODE_HEIGHT + GENERATION_SPACING;
    svgHeight = childrenY + NODE_HEIGHT + 50; 

    const parentMidX = spouse ? caseHolderX + NODE_WIDTH + SPOUSE_SPACING / 2 : caseHolderX + NODE_WIDTH / 2;
    
    elements.push(<line key="parent-child-connector" x1={parentMidX} y1={currentY + NODE_HEIGHT / 2} x2={parentMidX} y2={childrenY - GENERATION_SPACING / 2 + NODE_HEIGHT /2} stroke="var(--color-text-primary)" strokeWidth="1.5" />);

    const totalChildrenWidth = children.length * NODE_WIDTH + (children.length - 1) * SIBLING_SPACING;
    let childrenStartX = parentMidX - totalChildrenWidth / 2;
    
    if (children.length > 1) {
        elements.push(<line key="children-line" x1={childrenStartX + NODE_WIDTH/2} y1={childrenY - GENERATION_SPACING / 2 + NODE_HEIGHT /2} x2={childrenStartX + totalChildrenWidth - NODE_WIDTH/2} y2={childrenY - GENERATION_SPACING / 2 + NODE_HEIGHT/2} stroke="var(--color-text-primary)" strokeWidth="1.5" />);
    }

    children.forEach((child, index) => {
      const childX = childrenStartX + index * (NODE_WIDTH + SIBLING_SPACING);
      elements.push(<line key={`child-line-${child.id}`} x1={childX + NODE_WIDTH / 2} y1={childrenY + NODE_HEIGHT/2} x2={childX + NODE_WIDTH / 2} y2={childrenY - GENERATION_SPACING / 2 + NODE_HEIGHT/2} stroke="var(--color-text-primary)" strokeWidth="1.5" />);

      const childGender = child.gender?.toLowerCase();
       if (childGender === "femenino") {
        elements.push(<circle key={child.id} cx={childX + NODE_WIDTH / 2} cy={childrenY + NODE_HEIGHT / 2} r={NODE_HEIGHT / 2} fill="var(--color-bg-secondary)" stroke="var(--color-text-primary)" strokeWidth="1.5" />);
      } else if (childGender === "masculino") {
        elements.push(<rect key={child.id} x={childX} y={childrenY} width={NODE_WIDTH} height={NODE_HEIGHT} fill="var(--color-bg-secondary)" stroke="var(--color-text-primary)" strokeWidth="1.5" />);
      } else {
        elements.push(<rect key={child.id} x={childX} y={childrenY + NODE_HEIGHT/4} width={NODE_WIDTH} height={NODE_HEIGHT/2} rx="5" ry="5" fill="var(--color-bg-secondary)" stroke="var(--color-text-primary)" strokeWidth="1.5" />);
      }
      elements.push(<text key={`name-${child.id}`} x={childX + NODE_WIDTH / 2} y={childrenY + NODE_HEIGHT + TEXT_OFFSET_Y} textAnchor="middle" fontSize="10" fill="var(--color-text-primary)">{child.fullName}</text>);
      const childAge = getAge(child.dateOfBirth);
      if (childAge) elements.push(<text key={`age-${child.id}`} x={childX + NODE_WIDTH / 2} y={childrenY + NODE_HEIGHT + AGE_OFFSET_Y} textAnchor="middle" fontSize="9" fill="var(--color-text-secondary)">({childAge} años)</text>);
    });
  }
  
  const svgWidth = Math.max(350, (spouse ? 2 : 1) * (NODE_WIDTH + SPOUSE_SPACING) + children.length * (NODE_WIDTH + SIBLING_SPACING) + 2 * parentsXStart);

  return (
    <div className="w-full overflow-x-auto bg-theme-bg-tertiary p-4 rounded-md shadow">
        <svg width={svgWidth} height={svgHeight} className="min-w-full">
            {elements}
        </svg>
    </div>
  );
};
export default SimplifiedGenogram;
