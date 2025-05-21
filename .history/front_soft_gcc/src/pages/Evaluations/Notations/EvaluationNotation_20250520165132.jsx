import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Template from '../../Template';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import '../../../assets/css/Evaluations/notationModal.css';
import '../../../assets/css/Evaluations/Questions.css';
import '../../../assets/css/Evaluations/Steps.css';

const EvaluationNotation = () => {
  const { employeeId, evaluationId } = useParams();
  const navigate = useNavigate();
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEvaluationType, setSelectedEvaluationType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [ratings, setRatings] = useState({});
  const [remarks, setRemarks] = useState({
    strengths: '',
    weaknesses: '',
    generalEvaluation: '',
  });
  const [isSaved, setIsSaved] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatePDFFunc, setGeneratePDFFunc] = useState(null);

  // État pour la validation de l'évaluation
  const [validationData, setValidationData] = useState({
    serviceApproved: false,
    dgApproved: false,
    serviceDate: '',
    dgDate: ''
  });

  // Ajout d'un drapeau pour éviter les appels multiples lors de la génération PDF
  const [pdfGenerationRequested, setPdfGenerationRequested] = useState(false);

  // Ajout d'un drapeau pour tracer si une génération PDF est explicitement demandée par l'utilisateur
  const [userRequestedPdf, setUserRequestedPdf] = useState(false);
  
  // Référence pour éviter les appels multiples du useEffect
  const navigationTriggered = useRef(false);

  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les détails de l'employé si employeeId est fourni
        if (employeeId) {
          try {
            // Essayer d'abord avec l'API vemployee-details-paginated qui contient plus d'informations
            const employeeListResponse = await axios.get('https://localhost:7082/api/User/vemployee-details-paginated', {
              params: { pageNumber: 1, pageSize: 100 } // Utiliser une taille suffisamment grande
            });
            
            // Chercher l'employé dans la liste par son ID
            const foundEmployee = employeeListResponse.data.employees?.find(emp => emp.employeeId === parseInt(employeeId));
            console.log('Employé trouvé dans la liste:', foundEmployee);
            
            if (foundEmployee) {
              setSelectedEmployee({
                firstName: foundEmployee.firstName || '',
                lastName: foundEmployee.lastName || '',
                position: foundEmployee.position || '',
                department: foundEmployee.department || '',
                evaluationId: foundEmployee.evaluationId || null
              });
            } else {
              // Si non trouvé dans la liste, essayer l'API User directe
              const employeeResponse = await axios.get(`https://localhost:7082/api/User/${employeeId}`);
              console.log('Données employé reçues via API directe:', employeeResponse.data);
              
              setSelectedEmployee({
                firstName: employeeResponse.data.firstName || '',
                lastName: employeeResponse.data.lastName || '',
                position: employeeResponse.data.position || '',
                department: employeeResponse.data.department || '',
                evaluationId: employeeResponse.data.evaluationId || null
              });
            }
          } catch (error) {
            console.error('Erreur lors de la récupération des données employé:', error);
            setError("Impossible de charger les données de l'employé");
          }
        }
        // Sinon, essayer de récupérer l'évaluation directement
        else if (evaluationId) {
          try {
            // D'abord essayer de récupérer les informations complètes via l'API vemployee-details-paginated
            const employeeListResponse = await axios.get('https://localhost:7082/api/User/vemployee-details-paginated', {
              params: { pageNumber: 1, pageSize: 100 }
            });
            
            // Chercher l'évaluation dans la liste par son ID
            const foundEvaluation = employeeListResponse.data.employees?.find(emp => emp.evaluationId === parseInt(evaluationId));
            console.log('Évaluation trouvée dans la liste:', foundEvaluation);
            
            if (foundEvaluation) {
              setSelectedEmployee({
                firstName: foundEvaluation.firstName || '',
                lastName: foundEvaluation.lastName || '',
                position: foundEvaluation.position || '',
                department: foundEvaluation.department || '',
                evaluationId: parseInt(evaluationId)
              });
            } else {
              // Si non trouvée, essayer l'API Evaluation directe
              const evaluationResponse = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}`);
              console.log('Données évaluation reçues via API directe:', evaluationResponse.data);
              
              if (evaluationResponse.data) {
                setSelectedEmployee({
                  firstName: evaluationResponse.data.firstName || '',
                  lastName: evaluationResponse.data.lastName || '',
                  position: evaluationResponse.data.position || '',
                  department: evaluationResponse.data.department || '',
                  evaluationId: parseInt(evaluationId)
                });
                
                // Si les informations sont incomplètes, essayer de récupérer via l'userId
                if (!evaluationResponse.data.firstName || !evaluationResponse.data.position || !evaluationResponse.data.department) {
                  const employeeId = evaluationResponse.data.userId || evaluationResponse.data.employeeId;
                  if (employeeId) {
                    const employeeDetails = await axios.get(`https://localhost:7082/api/User/${employeeId}`);
                    console.log('Données complémentaires employé:', employeeDetails.data);
                    
                    setSelectedEmployee({
                      firstName: employeeDetails.data.firstName || '',
                      lastName: employeeDetails.data.lastName || '',
                      position: employeeDetails.data.position || '',
                      department: employeeDetails.data.department || '',
                      evaluationId: parseInt(evaluationId)
                    });
                  }
                }
              }
            }
          } catch (error) {
            console.error('Erreur lors de la récupération des données d\'évaluation:', error);
            setError("Impossible de charger les données de l'évaluation");
          }
        }
        else {
          throw new Error("ID d&apos;employé ou d&apos;évaluation non fourni");
        }

        // Récupérer les types d'évaluation
        try {
          const evalTypesResponse = await axios.get('https://localhost:7082/api/Evaluation/types');
          if (evalTypesResponse.data && evalTypesResponse.data.length > 0) {
            setSelectedEvaluationType(evalTypesResponse.data[0]);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des types d\'évaluation:', error);
        }

        // Récupérer les questions pour cette évaluation si evaluationId est disponible
        if (evaluationId) {
          try {
            const questionsResponse = await axios.get(`https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`);
            // Les questions viennent maintenant avec les réponses formatées correctement (texte de l'option pour QCM)
            const formattedQuestions = questionsResponse.data.map(item => ({
              questionId: item.questionId,
              text: item.questionText,
              responseType: item.responseType,
              responseValue: item.responseValue,
              isCorrect: item.isCorrect
            }));
            
            setQuestions(formattedQuestions);
            
            // Initialiser les ratings avec les valeurs existantes si disponibles
            const initialRatings = {};
            formattedQuestions.forEach(question => {
              if (question.responseValue) {
                initialRatings[question.questionId] = question.responseValue;
              }
            });
            
            if (Object.keys(initialRatings).length > 0) {
              setRatings(initialRatings);
            }
          } catch (questionsError) {
            console.error("Erreur lors du chargement des questions:", questionsError);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données. Veuillez réessayer.");
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, evaluationId]);
  
  // Gestion de la génération du PDF
  useEffect(() => {
    // Ne générer le PDF que si la validation est réussie et que toutes les conditions sont remplies
    if (validationSuccess && userRequestedPdf && !pdfGenerationRequested && !isGeneratingPDF && generatePDFFunc && !navigationTriggered.current) {
      console.log("Conditions remplies pour la génération du PDF");
      
      // Marquer comme en cours de génération pour éviter les appels multiples
      setIsGeneratingPDF(true);
      setPdfGenerationRequested(true);
      
      // Utiliser un délai pour s'assurer que la page a eu le temps de mettre à jour l'interface
      const pdfTimeout = setTimeout(() => {
        try {
          console.log("Démarrage de la génération du PDF");
          generatePDFFunc();
        } catch (error) {
          console.error("Erreur lors de la génération du PDF:", error);
        }
        
        // Marquer comme déjà navigué pour éviter les redirections multiples
        navigationTriggered.current = true;
        
        // Redirection après un court délai
        setTimeout(() => {
          console.log("Redirection après génération PDF");
          navigate('/evaluations/salary-list');
        }, 1500);
      }, 800);
      
      return () => clearTimeout(pdfTimeout);
    }
  }, [validationSuccess, userRequestedPdf, pdfGenerationRequested, isGeneratingPDF, generatePDFFunc, navigate]);
  
  // Réinitialiser l'état de génération PDF si l'étape change ou si le composant est démonté
  useEffect(() => {
    // Réinitialiser uniquement si nous ne sommes pas à l'étape 3
    if (currentStep !== 3) {
      setPdfGenerationRequested(false);
      setUserRequestedPdf(false);
      setIsGeneratingPDF(false);
      navigationTriggered.current = false;
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      navigationTriggered.current = false;
    };
  }, [currentStep]);
  
  const handleCancel = () => {
    if (isSaved || window.confirm('Êtes-vous sûr de vouloir annuler? Les modifications non enregistrées seront perdues.')) {
      navigate('/evaluations/salary-list');
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 3) {
      // À l'étape 3, on soumet les résultats et on valide si la soumission réussit
      try {
        // Marquer que l'utilisateur a demandé le PDF (clic sur "Valider et Générer PDF")
        setUserRequestedPdf(true);

        // Essayer de sauvegarder les résultats
        const saveSuccessful = await saveEvaluationResults();
        if (!saveSuccessful) {
          setUserRequestedPdf(false); // Réinitialiser si échec
          return; // Arrêter si la sauvegarde échoue
        }

        // Ensuite essayer de valider l'évaluation
        const validationSuccessful = await validateEvaluation();
        if (!validationSuccessful) {
          setUserRequestedPdf(false); // Réinitialiser si échec
          return; // Arrêter si la validation échoue
        }
        
        // Si tout est réussi, les états correspondants sont déjà mis à jour dans les fonctions
      } catch (error) {
        console.error("Erreur pendant le processus de validation:", error);
        setError("Une erreur est survenue lors de la validation. Veuillez réessayer.");
        setUserRequestedPdf(false); // Réinitialiser en cas d'erreur
      }
    } else {
      // Avancer à l'étape suivante sans sauvegarder
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const allQuestionsRated = () => questions.every(q => ratings[q.questionId] !== undefined);

  const calculateAverage = () => {
    const scores = Object.values(ratings);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
  };

  const handleSaveRemarks = (newRemarks) => setRemarks(newRemarks);

  const saveEvaluationResults = async () => {
    if (!selectedEmployee || !selectedEvaluationType || !ratings) {
      console.error('Données incomplètes pour sauvegarder l\'évaluation.');
      return false;
    }

    const average = calculateAverage();
    const data = {
      evaluationId: evaluationId || selectedEmployee.evaluationId,
      ratings,
      overallScore: average,
      strengths: remarks.strengths,
      weaknesses: remarks.weaknesses,
      generalEvaluation: remarks.generalEvaluation,
    };

    try {
      const response = await axios.post(
        'https://localhost:7082/api/Evaluation/save-evaluation-results',
        data
      );
      console.log('Résultats soumis avec succès :', response.data);
      setIsSaved(true);
      return true;
    } catch (error) {
      console.error('Erreur lors de la soumission des résultats :', error.response?.data || error.message);
      alert('Erreur lors de la soumission des résultats. Veuillez réessayer.');
      return false;
    }
  };

  const validateEvaluation = async () => {
    // Vérifier si des dates sont manquantes quand les validations sont activées
    const errors = [];
    
    if (validationData.serviceApproved && !validationData.serviceDate) {
      errors.push("Date de validation du chef de service manquante");
    }
    
    if (validationData.dgApproved && !validationData.dgDate) {
      errors.push("Date de validation de la direction générale manquante");
    }
    
    // S'il y a des erreurs, on les affiche et on arrête la validation
    if (errors.length > 0) {
      setError("Erreur de validation : " + errors.join(", "));
      return false;
    }
    
    // Préparation des dates au format ISO ou null
    const serviceDate = validationData.serviceApproved && validationData.serviceDate 
      ? new Date(validationData.serviceDate).toISOString() 
      : null;
    
    const dgDate = validationData.dgApproved && validationData.dgDate 
      ? new Date(validationData.dgDate).toISOString() 
      : null;
    
    // Construction du DTO comme attendu par le backend
    const payload = {
      EvaluationId: parseInt(evaluationId || selectedEmployee.evaluationId),
      IsServiceApproved: validationData.serviceApproved,
      IsDgApproved: validationData.dgApproved,
      ServiceApprovalDate: serviceDate,
      DgApprovalDate: dgDate
    };

    console.log('Payload envoyé pour validation:', payload);

    try {
      await axios.post('https://localhost:7082/api/Evaluation/validate-evaluation', payload);
      setValidationSuccess(true);
      return true;
    } catch (err) {
      console.error('Error validating evaluation:', err);
      console.error('Response data:', err.response?.data);
      setError('Erreur lors de la validation de l\'évaluation. ' + 
              (err.response?.data?.message || err.message || ''));
      return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            evaluationId={parseInt(evaluationId || selectedEmployee?.evaluationId) || 0}
            setRatings={setRatings}
            ratings={ratings}
          />
        );
      case 2:
        return (
          <Step2
            ratings={ratings}
            remarks={remarks}
            setRemarks={setRemarks}
            onSaveRemarks={handleSaveRemarks}
          />
        );
      case 3:
        return (
          <Step3
            ratings={ratings}
            average={calculateAverage()}
            evaluationId={parseInt(evaluationId || selectedEmployee?.evaluationId) || 0}
            validationData={validationData}
            onValidationChange={(field, value) =>
              setValidationData(prev => ({ ...prev, [field]: value }))
            }
            onGeneratePDF={setGeneratePDFFunc}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Template>
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
          <p>Chargement des données de l&apos;évaluation...</p>
        </div>
      </Template>
    );
  }

  if (error) {
    return (
      <Template>
        <div className="error-container">
          <div className="alert alert-danger">
            <h4>Une erreur est survenue</h4>
            <p>{error}</p>
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/evaluations/salary-list')}
            >
              Retour à la liste
            </button>
          </div>
        </div>
      </Template>
    );
  }

  return (
    <Template>
      <div className="evaluation-notation-page">
        {validationSuccess ? (
          <div className="validation-success-container">
            <div className="success-animation">
              <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <h4>Validation réussie !</h4>
            <p>La notation a été effectuée avec succès.</p>
            <p>Génération du PDF en cours...</p>
          </div>
        ) : (
          <>
            <div className="header-section">
              <h2>
                Notation de l&apos;évaluation - {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </h2>
              <div className="employee-info">
                <p><strong>Poste :</strong> {selectedEmployee?.position || 'Non défini'}</p>
                <p><strong>Département :</strong> {selectedEmployee?.department || 'Non défini'}</p>
              </div>
            </div>

            <div className="steps-navigation">
              <div className={`step ${currentStep === 1 ? 'active' : ''}`} onClick={() => setCurrentStep(1)}>
                <span className="step-number">1</span>
                <span className="step-label">Notation</span>
              </div>
              <div 
                className={`step ${currentStep === 2 ? 'active' : ''} ${allQuestionsRated() ? '' : 'disabled'}`} 
                onClick={() => allQuestionsRated() ? setCurrentStep(2) : null}
              >
                <span className="step-number">2</span>
                <span className="step-label">Commentaires</span>
              </div>
              <div 
                className={`step ${currentStep === 3 ? 'active' : ''} ${isSaved ? '' : 'disabled'}`}
                onClick={() => isSaved ? setCurrentStep(3) : null}
              >
                <span className="step-number">3</span>
                <span className="step-label">Validation</span>
              </div>
            </div>

            <div className="step-content-container">
              {renderStepContent()}
            </div>

            <div className="navigation-buttons">
              <button 
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Annuler
              </button>
              
              {currentStep > 1 && (
                <button 
                  className="btn btn-light"
                  onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                >
                  Précédent
                </button>
              )}
              
              <button 
                className="btn btn-primary"
                onClick={handleNextStep}
                disabled={!allQuestionsRated() && currentStep === 1}
              >
                {currentStep === 3 ? 'Valider et Générer PDF' : 'Suivant'}
              </button>
            </div>
          </>
        )}
      </div>
    </Template>
  );
};

export default EvaluationNotation; 