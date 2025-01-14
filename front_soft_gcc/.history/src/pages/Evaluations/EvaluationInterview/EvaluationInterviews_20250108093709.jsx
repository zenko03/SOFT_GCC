import React, { useState } from 'react';
import EvaluationImport from './EvaluationImport';
import EvaluationFill from './EvaluationFill';
import EvaluationDetails from './EvaluationDetails'; // Nouveau composant pour les détails
import '../../../assets/css/Evaluations/EvaluationInterviews.css';
import Template from '../../Template';
import { useLocation, useNavigate } from 'react-router-dom';
import EvaluationWorkflow from './EvaluationWorkflow';
import { useUser } from './UserContext ';

const EvaluationInterviews = () => {
    const { state } = useLocation(); // Récupérez l'état transmis
    const { interview, employeeId } = state || {}; // Déstructurez l'état ou définissez des valeurs par défaut

    const [currentStep, setCurrentStep] = useState(1);
    const [extractedData, setExtractedData] = useState(null);
    const { userRole } = useUser(); // Récupère le rôle actuel
    const navigate = useNavigate();

    console.log("userRole: ", userRole); // 'RH', 'Manager', ou 'Director'

    const handleExtractedData = (data) => {
        console.log('Données extraites reçues dans le parent :', data);
        setExtractedData(data);
    };

    // Navigation entre les étapes
    const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
    const handlePreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const renderStepContent = () => {
        if (userRole === 'RH') {
            switch (currentStep) {
                case 1:
                    return <EvaluationImport interview={interview} employeeId={employeeId} onExtract={handleExtractedData} />;
                case 2:
                    console.log('Données transmises à EvaluationFill:', extractedData);
                    return <EvaluationFill interview={interview} employeeId={employeeId} extractedData={extractedData} />;
                case 3:
                default:
                    return null;
            }
        } else if (userRole === 'Manager' || userRole === 'Director') {
            if (currentStep === 1 || currentStep === 2) {
                return <EvaluationDetails interview={interview} employeeId={employeeId} extractedData={extractedData} />;
            } else if (currentStep === 3) {
                return <EvaluationWorkflow interview={interview} employeeId={employeeId} extractedData={extractedData} />;
            } else {
                return null;
            }
        } else {
            return <p>Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>;
        }
    };

    // Validation d'accès aux étapes
    const validateStepAccess = (step) => {
        if (userRole === 'RH') return true; // RH a accès à toutes les étapes
        if ((userRole === 'Manager' || userRole === 'Director') && step === 3) return true; // Manager et Director n'accèdent qu'à la validation
        return false; // Par défaut, accès refusé
    };

    // Redirection si l'utilisateur tente d'accéder à une étape interdite
    if (!validateStepAccess(currentStep)) {
        navigate('/');
        return null;
    }

    return (
        <Template>
            <div className="container mt-4">
                <h2 className="mb-4">Gestion des Entretiens d'Évaluation</h2>
                {/* Étapes du processus */}
                <ul className="step-navigation">
                    {validateStepAccess(1) && (
                        <li className={currentStep === 1 ? 'active' : ''} onClick={() => setCurrentStep(1)}>
                            Import de la Fiche
                        </li>
                    )}
                    {validateStepAccess(2) && (
                        <li className={currentStep === 2 ? 'active' : ''} onClick={() => setCurrentStep(2)}>
                            Remplissage de la Fiche
                        </li>
                    )}
                    {validateStepAccess(3) && (
                        <li className={currentStep === 3 ? 'active' : ''} onClick={() => setCurrentStep(3)}>
                            Validation
                        </li>
                    )}
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
                        disabled={currentStep === 3 || (currentStep === 1 && !extractedData)}
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
