import React, { useState } from 'react';
import Template from '../../Template';
import { Link } from 'react-router-dom';
import '../../../assets/css/Evaluations/notationModal.css';


function SalaryListPlanning() {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Gérer l'étape actuelle

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Fonction pour passer à l'étape suivante
  const handleNextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 3)); // Limite à 3 étapes
  };

  // Fonction pour revenir à l'étape précédente
  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1)); // Minimum à la 1ère étape
  };

  // Fonction pour aller à une étape spécifique
  const handleStepClick = (step) => {
    setCurrentStep(step);
  };
  const notes = { 1: 3, 2: 4, 3: 5 }; // Exemple d'objet notes

  // Contenu du wizard par étape
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1/>;
      case 2:
        return  <Step2 notes ={notes}/>;
      case 3:
        return  <Step3/>;
      default:
        return null;
    }
  };
  return (
    <Template>
      {/* Appliquez la classe darken-background lorsque le modal est visible */}
      <div className={`row ${showModal ? 'darken-background' : ''}`}>
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Notation d'évaluation des employés</h4>
              <p className="card-description">Add className <code>.table-striped</code></p>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Date d'évaluation</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1">
                      <img src="../../assets/images/faces-clipart/pic-1.png" alt="image" />
                    </td>
                    <td> Herman Beck </td>
                    <td> Comptable </td>
                    <td> 10/10/2024 </td>
                    <td>
                      <button className="btn btn-primary" onClick={handleOpenModal}>Plannifier</button>
                      <Link className="btn btn-primary" to="/salary-list">Details</Link>
                    </td>
                  </tr>
                  {/* Répétez pour les autres lignes */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Section */}
      {showModal && (
        <div className="modal fade show" tabIndex="-1" role="dialog" style={{ display: 'block' }}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">NOTATIONS</h5>
                <button type="button" className="close" onClick={handleCloseModal}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>

              {/* Navigation des étapes */}
              <div className="modal-body">
                <ul className="step-navigation">
                  <li
                    className={currentStep === 1 ? 'active' : ''}
                    onClick={() => handleStepClick(1)}
                  >
                    Étape 1
                  </li>
                  <li
                    className={currentStep === 2 ? 'active' : ''}
                    onClick={() => handleStepClick(2)}
                  >
                    Étape 2
                  </li>
                  <li
                    className={currentStep === 3 ? 'active' : ''}
                    onClick={() => handleStepClick(3)}
                  >
                    Étape 3
                  </li>
                </ul>
                {/* Rendu du contenu en fonction de l'étape */}
                {renderStepContent()}
              </div>

              <div className="modal-footer">
                {/* Bouton Précédent */}
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1} // Désactivez si on est à la première étape
                >
                  Précédent
                </button>

                {/* Bouton Suivant */}
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleNextStep}
                  disabled={currentStep === 3} // Désactivez si on est à la dernière étape
                >
                  Suivant
                </button>

                {/* Bouton Fermer */}
                <button type="button" className="btn btn-danger" onClick={handleCloseModal}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Template>
  );
}

export default SalaryListPlanning;
