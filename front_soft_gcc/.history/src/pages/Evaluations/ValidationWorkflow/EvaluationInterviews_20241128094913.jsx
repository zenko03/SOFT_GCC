import React, { useState } from 'react';
import EvaluationImport from './EvaluationImport';
import EvaluationFill from './EvaluationFill';
import EvaluationWorkflow from './EvaluationWorkflow';
import '../../../assets/css/Evaluations/EvaluationInterviews.css';
import Template from '../../Template';

const EvaluationInterviews = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [extractedData, setExtractedData] = useState(null);

    // Navigation entre les étapes
    const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
    const handlePreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <EvaluationImport />;
            case 2:
                return <EvaluationFill extractedData={extractedData} />;
            case 3:
                return <EvaluationWorkflow />;
            default:
                return null;
        }
    };

    return (
        <Template>
            <div className="container mt-4">
                <h2 className="mb-4">Gestion des Entretiens d'Évaluation</h2>
                {/* Étapes du processus */}
                <ul className="step-navigation">
                    <li className={currentStep === 1 ? 'active' : ''} onClick={() => setCurrentStep(1)}>
                        Import de la Fiche
                    </li>
                    <li className={currentStep === 2 ? 'active' : ''} onClick={() => setCurrentStep(2)}>
                        Remplissage de la Fiche
                    </li>
                    <li className={currentStep === 3 ? 'active' : ''} onClick={() => setCurrentStep(3)}>
                        Validation
                    </li>
                </ul>

                {/* Contenu de l'étape */}
                <div className="step-content">{renderStepContent()}</div>

                {/* Boutons de navigation */}
                <div className="d-flex justify-content-between mt-4">
                    <button
                        className="btn btn-secondary"
                        disabled={currentStep === 1}
                        onClick={handlePreviousStep}
                    >
                        Précédent
                    </button>
                    <button
                        className="btn btn-primary"
                        disabled={currentStep === 3}
                        onClick={handleNextStep}
                    >
                        Suivant
                    </button>
                </div>
            </div>
        </Template>

    );
};

export default EvaluationInterviews;
