import React, { useState, useEffect } from 'react';
import EvaluationImport from './EvaluationImport';
import EvaluationFill from './EvaluationFill';
import EvaluationDetails from './EvaluationDetails';
import EvaluationWorkflow from './EvaluationWorkflow';
import '../../../assets/css/Evaluations/EvaluationInterviews.css';
import Template from '../../Template';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import { toast } from 'react-toastify';
import PermissionService from '../../../services/PermissionService';

const EvaluationInterviews = () => {
  const { state } = useLocation();
  const { interview, employeeId } = state || {};
  const { user, hasPermission, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [extractedData, setExtractedData] = useState(null);

  useEffect(() => {
    if (!state) {
      toast.error('Paramètres manquants pour accéder à cette page');
      navigate('/');
      return;
    }

    if (userLoading) {
      return;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour accéder à cette page');
      navigate('/login');
      return;
    }

    setLoading(false);
  }, [user, userLoading, navigate, state]);

  const handleExtractedData = (data) => {
    console.log('Données extraites :', data);
    setExtractedData(data);
  };

  // Vérification si l'utilisateur est un RH
  const isRH = () => PermissionService.isRH(user);
  
  // Vérification si l'utilisateur est un Manager
  const isManager = () => PermissionService.isManager(user);
  
  // Vérification si l'utilisateur est un Directeur
  const isDirector = () => PermissionService.isDirector(user);
  
  // Vérification des permissions fonctionnelles
  const hasImportPermission = () => PermissionService.checkFunctionalPermission(hasPermission, 'IMPORT_EVALUATION');
  const hasFillPermission = () => PermissionService.checkFunctionalPermission(hasPermission, 'FILL_EVALUATION');
  const hasViewPermission = () => PermissionService.checkFunctionalPermission(hasPermission, 'VIEW_EVALUATION_DETAILS');
  const hasValidateAsManagerPermission = () => PermissionService.checkFunctionalPermission(hasPermission, 'VALIDATE_AS_MANAGER');
  const hasValidateAsDirectorPermission = () => PermissionService.checkFunctionalPermission(hasPermission, 'VALIDATE_AS_DIRECTOR');

  const renderStepContent = () => {
    if (!user) return null;

    // Déterminer le contenu à afficher en fonction de l'étape et des permissions
    if (currentStep === 1) {
      if (isRH() && hasImportPermission()) {
        return (
          <EvaluationImport
            interview={interview}
            employeeId={employeeId}
            onExtract={handleExtractedData}
          />
        );
      } else if ((isManager() || isDirector()) && hasViewPermission()) {
        return (
          <EvaluationDetails
            interview={interview}
            employeeId={employeeId}
            extractedData={extractedData}
          />
        );
      }
    } else if (currentStep === 2) {
      if (isRH() && hasFillPermission()) {
        return (
          <EvaluationFill
            interview={interview}
            employeeId={employeeId}
            extractedData={extractedData}
          />
        );
      } else if (isManager() && hasValidateAsManagerPermission()) {
        return (
          <EvaluationWorkflow
            interview={interview}
            employeeId={employeeId}
            extractedData={extractedData}
          />
        );
      } else if (isDirector() && hasValidateAsDirectorPermission()) {
        return (
          <EvaluationWorkflow
            interview={interview}
            employeeId={employeeId}
            extractedData={extractedData}
          />
        );
      }
    }
    
    return <p>Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>;
  };

  const validateStepAccess = (step) => {
    if (isRH() && hasImportPermission() && step <= 2) return true;
    if ((isManager() || isDirector()) && (hasValidateAsManagerPermission() || hasValidateAsDirectorPermission()) && step <= 2) return true;
    return false;
  };

  const handleNextStep = () => {
    const maxSteps = 2;
    if (currentStep < maxSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const getStepName = (step) => {
    if (isRH()) {
      return step === 1 ? 'Import de la Fiche' : 'Remplissage de la Fiche';
    }
    if (isManager() || isDirector()) {
      return step === 1 ? 'Détails' : 'Validation';
    }
    return 'Étape Inconnue';
  };

  const handlePreviousStep = () => {
    if (validateStepAccess(currentStep - 1)) setCurrentStep((prev) => prev - 1);
  };

  if (!validateStepAccess(currentStep)) {
    navigate('/');
    return null;
  }

  if (userLoading || loading) {
    return (
      <Template>
        <div className="container mt-4">
          <h2 className="mb-4">Gestion des Entretiens d'Évaluation</h2>
          <div className="loading-spinner">Chargement...</div>
        </div>
      </Template>
    );
  }

  if (!user) {
    return (
      <Template>
        <div className="container mt-4">
          <h2 className="mb-4">Gestion des Entretiens d'Évaluation</h2>
          <div className="alert alert-danger">
            Vous devez être connecté pour accéder à cette page.
            Redirection vers la page de connexion...
          </div>
        </div>
      </Template>
    );
  }

  return (
    <Template>
      <div className="container mt-4">
        <h2 className="mb-4">Gestion des Entretiens d'Évaluation</h2>

        {/* Navigation des étapes */}
        <ul className="step-navigation">
          {validateStepAccess(1) && user && (
            <li
              className={currentStep === 1 ? 'active' : ''}
              onClick={() => setCurrentStep(1)}
            >
              {getStepName(1)}
            </li>
          )}
          {validateStepAccess(2) && user && (
            <li
              className={currentStep === 2 ? 'active' : ''}
              onClick={() => setCurrentStep(2)}
            >
              {getStepName(2)}
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
            disabled={currentStep === 2 || (isRH() && !extractedData)}
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