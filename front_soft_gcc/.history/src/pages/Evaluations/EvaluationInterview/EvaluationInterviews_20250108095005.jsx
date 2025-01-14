import React, { useState } from 'react';
import EvaluationImport from './EvaluationImport';
import EvaluationFill from './EvaluationFill';
import EvaluationDetails from './EvaluationDetails'; // Nouveau composant pour les détails
import EvaluationWorkflow from './EvaluationWorkflow';
import '../../../assets/css/Evaluations/EvaluationInterviews.css';
import Template from '../../Template';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext ';

const EvaluationInterviews = () => {
    const { state } = useLocation(); // Récupération de l'état transmis
    const { interview, employeeId } = state || {}; // Déstructurez l'état avec valeurs par défaut
    const [userRole, setUserRole] = useState('RH'); // Changez ici pour 'Manager' ou 'Director'
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1); // Gestion de l'étape active
    const [extractedData, setExtractedData] = useState(null);

    console.log("userRole: ", userRole); // Débug pour vérifier le rôle

    // Gestion des données extraites depuis EvaluationImport
    const handleExtractedData = (data) => {
        console.log('Données extraites :', data);
        setExtractedData(data);
    };

    // Gestion du contenu des étapes
    const renderStepContent = () => {
        if (userRole === 'RH') {
            switch (currentStep) {
                case 1:
                    return (
                        <EvaluationImport
                            interview={interview}
                            employeeId={employeeId}
                            onExtract={handleExtractedData}
                        />
                    );
                case 2:
                    return (
                        <EvaluationFill
                            interview={interview}
                            employeeId={employeeId}
                            extractedData={extractedData}
                        />
                    );
                default:
                    return null;
            }
        } else if (userRole === 'Manager' || userRole === 'Director') {
            switch (currentStep) {
                case 1:
                case 2:
                    return (
                        <EvaluationDetails
                            interview={interview}
                            employeeId={employeeId}
                            extractedData={extractedData}
                        />
                    );
                case 3:
                    return (
                        <EvaluationWorkflow
                            interview={interview}
                            employeeId={employeeId}
                            extractedData={extractedData}
                        />
                    );
                default:
                    return null;
            }
        }
        return <p>Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>;
    };

    // Vérification des autorisations d'accès aux étapes
    const validateStepAccess = (step) => {
        if (userRole === 'RH' && step <= 2) return true; // RH : accès à l'import et au remplissage
        if ((userRole === 'Manager' || userRole === 'Director') && step <= 3) return true; // Manager/Director : accès complet
        return false;
    };

    // Navigation entre étapes (avec validation)
    const handleNextStep = () => {
        if (validateStepAccess(currentStep + 1)) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePreviousStep = () => {
        if (validateStepAccess(currentStep - 1)) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    // Redirection en cas d'accès non autorisé
    if (!validateStepAccess(currentStep)) {
        navigate('/');
        return null;
    }

    return (
        <Template>
            <div className="container mt-4">
                <h2 className="mb-4">Gestion des Entretiens d'Évaluation</h2>

                {/* Navigation des étapes */}
                <ul className="step-navigation">
                    {validateStepAccess(1) && (
                        <li
                            className={currentStep === 1 ? 'active' : ''}
                            onClick={() => setCurrentStep(1)}
                        >
                            Import de la Fiche
                        </li>
                    )}
                    {validateStepAccess(2) && (
                        <li
                            className={currentStep === 2 ? 'active' : ''}
                            onClick={() => setCurrentStep(2)}
                        >
                            Remplissage de la Fiche
                        </li>
                    )}
                    {validateStepAccess(3) && userRole !== 'RH' && (
                        <li
                            className={currentStep === 3 ? 'active' : ''}
                            onClick={() => setCurrentStep(3)}
                        >
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
                        disabled={
                            currentStep === 3 || 
                            (currentStep === 2 && userRole === 'RH' && !extractedData)
                        }
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
