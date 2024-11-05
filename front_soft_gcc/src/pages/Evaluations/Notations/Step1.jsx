import React, { useState } from 'react';
import '../../../assets/css/Evaluations/Steps.css'; // CSS séparé pour le style
import SectionA from '../sections/SectionA';

function Step1({notes, setNotes}) {
  const [activeSection, setActiveSection] = useState('A'); // Gérer la section active

  // Fonction pour gérer le clic sur une section
  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  // Rendu du contenu de la section en fonction de la section active
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'A':
        return <SectionA notes={notes} setNotes={setNotes}  />;
      case 'B':
        return <div>Contenu de la Section B</div>;
      default:
        return null;
    }
  };

  return (
    <div className="modal-step1-container"> {/* Nom de classe spécifique pour le modal */}
      <div className="row">
        {/* Sidebar (Menu bar) */}
        <div className="col-3 modal-sidebar"> {/* Classe spécifique pour le sidebar */}
          <ul className="modal-menu-list">
            <li
              className={activeSection === 'A' ? 'active' : ''}
              onClick={() => handleSectionClick('A')}
            >
             Evaluation par Competences
            </li>
            <li
              className={activeSection === 'B' ? 'active' : ''}
              onClick={() => handleSectionClick('B')}
            >
              Auto-Evaluation
            </li>
          </ul>
        </div>

        {/* Contenu */}
        <div className="col-9 modal-section-content"> {/* Classe spécifique pour le contenu */}
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
}

export default Step1;
