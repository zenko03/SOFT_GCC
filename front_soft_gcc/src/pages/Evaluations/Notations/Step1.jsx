import React, { useState } from 'react';
import '../../../assets/css/Evaluations/Steps.css'; // Vous pouvez créer un fichier CSS séparé pour le style

function Step1() {
  const [activeSection, setActiveSection] = useState('A'); // Gérer la section active

  // Fonction pour gérer le clic sur une section
  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  // Rendu du contenu de la section en fonction de la section active
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'A':
        return <div>Contenu de la Section A</div>;
      case 'B':
        return <div>Contenu de la Section B</div>;
      default:
        return null;
    }
  };

  return (
    <div className="step1-container">
      <div className="row">
        {/* Sidebar (Menu bar) */}
        <div className="col-3 sidebar">
          <ul className="menu-list">
            <li
              className={activeSection === 'A' ? 'active' : ''}
              onClick={() => handleSectionClick('A')}
            >
              Section A
            </li>
            <li
              className={activeSection === 'B' ? 'active' : ''}
              onClick={() => handleSectionClick('B')}
            >
              Section B
            </li>
          </ul>
        </div>

        {/* Contenu */}
        <div className="col-9 section-content">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
}

export default Step1;
