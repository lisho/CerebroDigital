import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  bgColorClass?: string;
  valueColorClass?: string; // Can be a direct class or empty if using accentColor
  titleColorClass?: string;
  accentColor?: string; // CSS variable string e.g. "var(--color-accent-primary)"
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  value, 
  bgColorClass = 'bg-theme-bg-card', 
  valueColorClass = '',
  titleColorClass = 'text-theme-text-secondary',
  accentColor 
}) => {
  const valueStyle = accentColor ? { color: accentColor } : {};

  return (
    <div className={`${bgColorClass} p-5 rounded-xl shadow-md h-full flex flex-col justify-between`}>
      <div>
        <p 
          className={`text-4xl font-bold ${valueColorClass || ''}`} 
          style={valueStyle}
        >
          {value}
        </p>
        <p className={`text-sm ${titleColorClass} opacity-90 mt-1`}>{title}</p>
      </div>
    </div>
  );
};

export default SummaryCard;