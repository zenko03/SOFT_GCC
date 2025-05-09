import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Template from '../../Template';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import '../../../assets/css/Evaluations/notationModal.css';
import '../../../assets/css/Evaluations/Questions.css';
import '../../../assets/css/Evaluations/Steps.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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

  // État pour la validation de l'évaluation
  const [validationData, setValidationData] = useState({
    serviceApproved: false,
    dgApproved: false,
    serviceDate: '',
    dgDate: ''
  });

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
            setQuestions(questionsResponse.data.map(item => ({
              questionId: item.questionId,
              text: item.questionText
            })));
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
    if (validationSuccess && !isGeneratingPDF) {
      setIsGeneratingPDF(true);
      generateEvaluationPDF();
      const timer = setTimeout(() => {
        setValidationSuccess(false);
        setIsGeneratingPDF(false);
        navigate('/evaluations/salary-list'); // Redirection vers la liste après validation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [validationSuccess, navigate]);
  
  const handleCancel = () => {
    if (isSaved || window.confirm('Êtes-vous sûr de vouloir annuler? Les modifications non enregistrées seront perdues.')) {
      navigate('/evaluations/salary-list');
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 3) {
      // À l'étape 3, on soumet les résultats et on valide si la soumission réussit
      const saveSuccessful = await saveEvaluationResults();
      if (saveSuccessful) {
        await validateEvaluation();
      }
    } else {
      // Avancer à l'étape suivante sans sauvegarder
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  // Fonction pour générer un PDF d'évaluation
  const generateEvaluationPDF = () => {
    if (!selectedEmployee || !ratings || Object.keys(ratings).length === 0) {
      console.error("Données insuffisantes pour générer le PDF");
      return;
    }

    const doc = new jsPDF();
    const average = calculateAverage();

    // Couleurs (style corporate)
    const primaryColor = [41, 128, 185]; // Bleu
    const secondaryColor = [44, 62, 80]; // Gris foncé

    // Marge
    const margin = 14;

    // Métadonnées du document
    doc.setProperties({
      title: `Évaluation de ${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      subject: 'Rapport d\'évaluation professionnelle',
      author: 'Système d\'Évaluation des Employés',
      keywords: 'évaluation, performance, employé',
      creator: 'Application RH'
    });

    // ===== HEADER =====
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('FICHE D\'ÉVALUATION PROFESSIONNELLE', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Type d'évaluation (mis en évidence)
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 30, doc.internal.pageSize.getWidth(), 12, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(`TYPE D'ÉVALUATION: ${selectedEvaluationType?.designation || "Non spécifié"}`, doc.internal.pageSize.getWidth() / 2, 38, { align: 'center' });

    // ===== INFORMATIONS DE L'EMPLOYÉ =====
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');

    // Section info employé avec cadre
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, 50, doc.internal.pageSize.getWidth() - (margin * 2), 50, 3, 3, 'S');

    doc.setFontSize(14);
    doc.text("INFORMATIONS DE L'EMPLOYÉ", margin + 5, 60);
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');

    // Colonnes pour informations employé
    const colWidth = (doc.internal.pageSize.getWidth() - (margin * 2) - 10) / 2;

    // Colonne gauche
    doc.text("Nom complet:", margin + 5, 70);
    doc.text("Poste:", margin + 5, 80);
    doc.text("Date d'évaluation:", margin + 5, 90);
    doc.text("Département:", margin + 5, 100);

    // Colonne droite
    doc.text(`${selectedEmployee.firstName} ${selectedEmployee.lastName}`, margin + colWidth, 70);
    doc.text(selectedEmployee.position, margin + colWidth, 80);
    doc.text(new Date().toLocaleDateString(), margin + colWidth, 90);
    doc.text(selectedEmployee.department, margin + colWidth, 100);

    // ===== TABLEAU DES COMPÉTENCES ÉVALUÉES =====
    const tableColumn = ["Compétence", "Note"];
    const tableRows = questions.map(question => {
      const score = ratings[question.questionId] || "N/A";
      return [question.text, score];
    });

    // Ajout du tableau au document
    doc.autoTable({
      startY: 120,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: { cellPadding: 3, fontSize: 10 },
      headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 12 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    // Note moyenne
    const finalY = doc.lastAutoTable.finalY || 120;
    doc.setFontSize(12);
    doc.text(`Note moyenne: ${average}/5`, margin, finalY + 10);

    // Remarques générales
    const remarksY = finalY + 20;
    if (remarks.generalEvaluation) {
      doc.text("Remarques générales:", margin, remarksY);
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(remarks.generalEvaluation, doc.internal.pageSize.getWidth() - (margin * 2));
      doc.text(splitText, margin, remarksY + 10);
    }

    // Points forts
    if (remarks.strengths) {
      const strengthY = remarksY + (remarks.generalEvaluation ? 30 : 10);
      doc.setFontSize(12);
      doc.text("Points forts:", margin, strengthY);
      doc.setFontSize(10);
      const splitStrengths = doc.splitTextToSize(remarks.strengths, doc.internal.pageSize.getWidth() - (margin * 2));
      doc.text(splitStrengths, margin, strengthY + 10);
    }

    // Points à améliorer
    if (remarks.weaknesses) {
      const weaknessY = remarksY + (remarks.generalEvaluation ? 50 : 30) + (remarks.strengths ? 20 : 0);
      doc.setFontSize(12);
      doc.text("Points à améliorer:", margin, weaknessY);
      doc.setFontSize(10);
      const splitWeaknesses = doc.splitTextToSize(remarks.weaknesses, doc.internal.pageSize.getWidth() - (margin * 2));
      doc.text(splitWeaknesses, margin, weaknessY + 10);
    }

    // Sauvegarde du PDF
    const fileName = `fiche_${selectedEmployee.firstName}_${selectedEmployee.lastName}.pdf`;
    doc.save(fileName);
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

    // Confirmation avant soumission définitive
    if (!window.confirm('Vous êtes sur le point de soumettre définitivement les résultats de cette évaluation. Cette action ne pourra pas être annulée. Voulez-vous continuer ?')) {
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
      alert('Les résultats de l\'évaluation ont été soumis avec succès !');
      setIsSaved(true);
      return true;
    } catch (error) {
      console.error('Erreur lors de la soumission des résultats :', error.response?.data || error.message);
      alert('Erreur lors de la soumission des résultats. Veuillez réessayer.');
      return false;
    }
  };

  const validateEvaluation = async () => {
    // Vérifier si la sauvegarde a été effectuée
    if (!isSaved) {
      alert('Les résultats de l\'évaluation doivent d\'abord être soumis. Veuillez réessayer.');
      return;
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
      // Calculer les résultats par compétence avant la validation finale
      await axios.post(`https://localhost:7082/api/EvaluationCompetence/calculate/${payload.EvaluationId}`);
      console.log('Calcul des résultats par compétence effectué');
      
      // Valider l'évaluation
      await axios.post('https://localhost:7082/api/Evaluation/validate-evaluation', payload);
      setValidationSuccess(true);
    } catch (err) {
      console.error('Error validating evaluation:', err);
      console.error('Response data:', err.response?.data);
      setError('Erreur lors de la validation de l\'évaluation.');
      alert('Une erreur est survenue lors de la validation. Veuillez réessayer.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            evaluationId={evaluationId || selectedEmployee?.evaluationId}
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
            evaluationId={evaluationId || selectedEmployee?.evaluationId}
            validationData={validationData}
            onValidationChange={(field, value) =>
              setValidationData(prev => ({ ...prev, [field]: value }))
            }
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