import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  icon, 
  defaultOpen = false,
  children 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <div 
        className={`collapsible-header ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="collapsible-title">
          {icon}
          <span>{title}</span>
        </div>
        <ChevronDown className="collapsible-icon" />
      </div>
      <div className={`collapsible-content ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default CollapsibleSection;

