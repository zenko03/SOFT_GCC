import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../assets/css/Evaluations/notationModal.css'; // Styles spécifiques
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques
import '../../../assets/css/Evaluations/Steps.css'; // Styles spécifiques
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';


function SalaryList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluationTypes, setEvaluationTypes] = useState([]);
  const [selectedEvaluationType, setSelectedEvaluationType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratings, setRatings] = useState({});
  const [remarks, setRemarks] = useState({
    strengths: '',
    weaknesses: '',
    generalEvaluation: '',
  });
  const [isEmployeeLoaded, setIsEmployeeLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  //etat de validation d'evaluation
  const [validationData, setValidationData] = useState({
    serviceApproved: false,
    dgApproved: false,
    serviceDate: '',
    dgDate: ''
  });

  // Ajouter l'état pour l'ID de l'évaluation
  const [evaluationId, setEvaluationId] = useState(null);

  // Chargement initial des employés
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('https://localhost:7082/api/User/vemployee-details-paginated', {
          params: {
            pageNumber: currentPage,
            pageSize: pageSize,
          },
        });
        setEmployees(response.data.employees);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Erreur lors de la récupération des employés :', error);
      }
    };
    fetchEmployees();
  }, [currentPage, pageSize]);

  // Gestion de la génération du PDF
  useEffect(() => {
    if (validationSuccess && !isGeneratingPDF) {
      setIsGeneratingPDF(true);
      generateEvaluationPDF();
      const timer = setTimeout(() => {
        setValidationSuccess(false);
        setShowModal(false);
        setIsGeneratingPDF(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [validationSuccess]);

  const handleOpenEvaluation = (employeeId, evaluationId) => {
    const path = evaluationId 
      ? `/evaluations/notation/evaluation/${evaluationId}`
      : `/evaluations/notation/employee/${employeeId}`;
    
    navigate(path);
  };

  const handleCloseModal = () => {
    if (!isSaved && window.confirm('Êtes-vous sûr de vouloir fermer sans sauvegarder ?')) {
      setShowModal(false);
      setIsEmployeeLoaded(false);
      setValidationSuccess(false);
    } else if (isSaved) {
      setShowModal(false);
      setIsEmployeeLoaded(false);
      setValidationSuccess(false);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 2) {
      await saveEvaluationResults();
      setCurrentStep(3);
    } else if (currentStep === 3) {
      await validateEvaluation();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  // Ajouter cette fonction dans votre composant SalaryList
  // Fonction améliorée pour générer un PDF d'évaluation avec un design professionnel
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
    const accentColor = [46, 204, 113]; // Vert

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
    // Logo ou image d'en-tête (optionnel)
    // doc.addImage(companyLogo, 'PNG', margin, 10, 40, 20);

    // Titre principal
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

    // ===== REMARQUES =====
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

  // Appeler cette fonction après la validation dans le modal
  const handleSaveAndGeneratePDF = async () => {
    await saveEvaluationResults();
    await validateEvaluation();
    generateEvaluationPDF(); // Générer le PDF après validation
  };

  const allQuestionsRated = () => questions.every(q => ratings[q.questionId] !== undefined);

  const calculateAverage = () => {
    const scores = Object.values(ratings);
    return scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0;
  };

  const handleSearch = (e) => {
    let query_text = e.target.value.toLowerCase();
    setSearchQuery(query_text.trim());
  };

  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    return fullName.includes(searchQuery);
  });

  useEffect(() => {
    setRatings({}); // Reset ratings when evaluation type or employee changes
  }, [selectedEvaluationType, selectedEmployee]);

  const handleSaveRemarks = (newRemarks) => setRemarks(newRemarks);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            employee={selectedEmployee}
            evaluationTypes={evaluationTypes}
            onNext={handleNextStep}
            onEvaluationTypeSelect={setSelectedEvaluationType}
            evaluationId={evaluationId}
            setRatings={setRatings}
            ratings={ratings}
            selectedEmployee={selectedEmployee}
            selectedEvaluationType={selectedEvaluationType}
            onEvaluationTypeChange={setSelectedEvaluationType}
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
        return <Step3
          ratings={ratings}
          average={calculateAverage()}
          evaluationId={selectedEmployee.evaluationId}
          validationData={validationData}
          onValidationChange={(field, value) =>
            setValidationData(prev => ({ ...prev, [field]: value }))
          }
        />;
      default:
        return null;
    }
  };

  const saveEvaluationResults = async () => {
    if (!selectedEmployee || !selectedEvaluationType || !ratings) {
      console.error('Données incomplètes pour sauvegarder l\'évaluation.');
      return;
    }

    const average = calculateAverage();
    const data = {
      evaluationId: selectedEmployee.evaluationId,
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
      console.log('Résultats sauvegardés avec succès :', response.data);
      setIsSaved(true);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des résultats :', error.response?.data || error.message);
    }
  };

  const validateEvaluation = async () => {
    const payload = {
      evaluationId: selectedEmployee.evaluationId,
      ...validationData,
    };

    try {
      const response = await axios.post('https://localhost:7082/api/Evaluation/validate-evaluation', payload);
      console.log('Validation response:', response.data);
      setValidationSuccess(true); // Activer l'affichage de la confirmation
      setTimeout(() => {
        setShowModal(false); // Fermer le modal après un délai
        setValidationSuccess(false); // Réinitialiser l'état de confirmation
      }, 3000); // Fermer après 3 secondes
    } catch (err) {
      console.error('Error validating evaluation:', err);
      setError('Erreur lors de la validation de l\'évaluation.');
    }
  };

  return (
    <Template>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Notation d&apos;évaluation des employés</h4>
              {/* Barre de recherche et filtres */}
              <div className="filters card p-3 mb-4">
                <div className="d-flex align-items-center justify-content-between">
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher un employé..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Dates d&apos;évaluation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee, index) => (
                    <tr key={`${employee.employeeId}-${index}`}>
                      <td>
                        <img src="../../assets/images/faces-clipart/pic-1.png" alt="employee" />
                      </td>
                      <td>{employee.firstName} {employee.lastName}</td>
                      <td>{employee.position}</td>
                      <td>
                        {employee.evaluationDate
                          ? new Date(employee.evaluationDate).toLocaleDateString()
                          : 'Aucune évaluation'}
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleOpenEvaluation(employee.employeeId, employee.evaluationId)}
                        >
                          Notation
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </button>
                <span>
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // Réinitialiser à la première page lorsque la taille de la page change
                  }}
                >
                  <option value={5}>5 par page</option>
                  <option value={10}>10 par page</option>
                  <option value={20}>20 par page</option>
                  <option value={50}>50 par page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default SalaryList;
