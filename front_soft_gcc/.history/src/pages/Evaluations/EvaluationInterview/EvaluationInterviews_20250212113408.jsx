import React, { useState } from 'react';
import EvaluationImport from './EvaluationImport';
import EvaluationFill from './EvaluationFill';
import EvaluationDetails from './EvaluationDetails';
import EvaluationWorkflow from './EvaluationWorkflow';
import '../../../assets/css/Evaluations/EvaluationInterviews.css';
import Template from '../../Template';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const EvaluationInterviews = () => {
    const { state } = useLocation();
    const { interview, employeeId } = state || {};
    const { user } = useUser(); // Récupération de l'objet utilisateur
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [extractedData, setExtractedData] = useState(null);

    // Définition des IDs des rôles pour éviter la comparaison avec du texte
    const ROLE_RH = 1;
    const ROLE_MANAGER = 2;
    const ROLE_DIRECTOR = 3;

    console.log("userRole ID: ", user.role.id, "userRole Title:", user.role.title);

    const handleExtractedData = (data) => {
        console.log('Données extraites :', data);
        setExtractedData(data);
    };

    const renderStepContent = () => {
        if (user.role.id === ROLE_RH) {
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
        } else if (user.role.id === ROLE_MANAGER || user.role.id === ROLE_DIRECTOR) {
            switch (currentStep) {
                case 1:
                    return (
                        <EvaluationDetails
                            interview={interview}
                            employeeId={employeeId}
                            extractedData={extractedData}
                        />
                    );
                case 2:
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

    const validateStepAccess = (step) => {
        if (user.role.id === ROLE_RH && step <= 2) return true;
        if ((user.role.id === ROLE_MANAGER || user.role.id === ROLE_DIRECTOR) && step <= 2) return true;
        return false;
    };

    const handleNextStep = () => {
        const maxSteps = 2; // 2 étapes pour tous les rôles
        if (currentStep < maxSteps) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const getStepName = (roleId, step) => {
        if (roleId === ROLE_RH) {
            return step === 1 ? 'Import de la Fiche' : 'Remplissage de la Fiche';
        }
        if (roleId === ROLE_MANAGER || roleId === ROLE_DIRECTOR) {
            return step === 1 ? 'Détails' : 'Validation';
        }
        return 'Étape Inconnue';
    };

    const handlePreviousStep = () => {
        if (validateStepAccess(currentStep - 1)) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    if (!validateStepAccess(currentStep)) {
        navigate('/');
        return null;
    }

    return (
        <Template>
            <div className="container mt-4">
                <h2 className="mb-4">Gestion des Entretiens d'Évaluation</h2>

                <ul className="step-navigation">
                    {validateStepAccess(1) && (
                        <li
                            className={currentStep === 1 ? 'active' : ''}
                            onClick={() => setCurrentStep(1)}
                        >
                            {getStepName(user.role.id, 1)}
                        </li>
                    )}
                    {validateStepAccess(2) && (
                        <li
                            className={currentStep === 2 ? 'active' : ''}
                            onClick={() => setCurrentStep(2)}
                        >
                            {getStepName(user.role.id, 2)}
                        </li>
                    )}
                </ul>

                <div className="step-content">{renderStepContent()}</div>

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
                        disabled={currentStep === 2 || (user.role.id === ROLE_RH && !extractedData)}
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
