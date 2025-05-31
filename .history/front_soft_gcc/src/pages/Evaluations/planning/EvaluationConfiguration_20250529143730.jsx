import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/EvaluationConfiguration.css';

function EvaluationConfiguration({ selectedEmployees, employees, onBack, onComplete, onRemoveEmployee }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluationTypes, setEvaluationTypes] = useState([]);
  const [selectedEvaluationType, setSelectedEvaluationType] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [durationWeeks, setDurationWeeks] = useState(''); // Nouveau state pour la durée
  const [competenceLines, setCompetenceLines] = useState({});
  const [questions, setQuestions] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [loading, setLoading] = useState(false);

  // États pour les erreurs
  const [errors, setErrors] = useState({
    evaluationType: '',
    supervisors: '',
    dates: '',
    employees: '',
    duration: ''
  });

  // Fonction pour calculer les dates basées sur la durée
  const calculateDatesFromDuration = (weeks) => {
    if (!weeks || weeks <= 0) return { start: '', end: '' };
    
    const today = new Date();
    const startDate = new Date(today);
    
    // Calculer la date de fin (durée en semaines * 7 jours)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (weeks * 7) - 1); // -1 pour inclure le jour de début
    
    // Formatter les dates pour les inputs datetime-local
    const formatDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = '09'; // Heure de début par défaut
      const minutes = '00';
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    return {
      start: formatDateTime(startDate),
      end: formatDateTime(endDate)
    };
  };

  // Gestionnaire pour le changement de durée
  const handleDurationChange = (weeks) => {
    setDurationWeeks(weeks);
    setErrors(prev => ({ ...prev, duration: '', dates: '' }));
    
    if (weeks && weeks > 0) {
      const { start, end } = calculateDatesFromDuration(parseInt(weeks, 10));
      setStartDate(start);
      setEndDate(end);
    }
  };

  // Fonction pour calculer la durée à partir des dates
  const calculateDurationFromDates = (startDateStr, endDateStr) => {
    if (!startDateStr || !endDateStr) return '';
    
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    
    if (end <= start) return '';
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le jour de début
    const weeks = Math.ceil(diffDays / 7);
    
    return weeks.toString();
  };

  // Gestionnaire pour le changement de date de début
  const handleStartDateChange = (dateStr) => {
    setStartDate(dateStr);
    setErrors(prev => ({ ...prev, dates: '' }));
    
    if (dateStr && endDate) {
      const calculatedWeeks = calculateDurationFromDates(dateStr, endDate);
      setDurationWeeks(calculatedWeeks);
      
      const error = validateDates(dateStr, endDate);
      if (error) {
        setErrors(prev => ({ ...prev, dates: error }));
      }
    }
  };

  // Gestionnaire pour le changement de date de fin
  const handleEndDateChange = (dateStr) => {
    setEndDate(dateStr);
    setErrors(prev => ({ ...prev, dates: '' }));
    
    if (startDate && dateStr) {
      const calculatedWeeks = calculateDurationFromDates(startDate, dateStr);
      setDurationWeeks(calculatedWeeks);
      
      const error = validateDates(startDate, dateStr);
      if (error) {
        setErrors(prev => ({ ...prev, dates: error }));
      }
    }
  };

  // Chargement des données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [evalTypesRes, supervisorsRes] = await Promise.all([
          axios.get('https://localhost:7082/api/Evaluation/types'),
          axios.get('https://localhost:7082/api/User/managers-directors')
        ]);

        setEvaluationTypes(evalTypesRes.data);
        setSupervisors(supervisorsRes.data);

        // Charger les compétences pour chaque employé
        const competencePromises = selectedEmployees.map(async (employeeId) => {
          const employee = employees.find(e => e.employeeId === employeeId);
          if (!employee) return null;

          const response = await axios.get(`https://localhost:7082/api/CompetenceLine/position/${employee.positionId}`);
          return { employeeId, competences: response.data };
        });

        const competenceResults = await Promise.all(competencePromises);
        const competenceMap = {};
        competenceResults.forEach(result => {
          if (result) {
            competenceMap[result.employeeId] = result.competences;
          }
        });
        setCompetenceLines(competenceMap);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [selectedEmployees, employees]);

  // Chargement des questions lorsqu'un type d'évaluation est sélectionné
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedEvaluationType) {
        console.log('Aucun type d\'évaluation sélectionné');
        return;
      }

      try {
        setLoading(true);
        const questionsMap = {};

        for (const employeeId of selectedEmployees) {
          const employeeCompetences = competenceLines[employeeId] || [];
          console.log('Compétences pour l\'employé:', {
            employeeId,
            competences: employeeCompetences
          });

          questionsMap[employeeId] = {};

          for (const competence of employeeCompetences) {
            try {
              console.log('Récupération des questions pour:', {
                evaluationTypeId: selectedEvaluationType,
                positionId: competence.positionId,
                competenceLineId: competence.competenceLineId
              });

              const response = await axios.get(
                `https://localhost:7082/api/Evaluation/questions`,
                {
                  params: {
                    evaluationTypeId: selectedEvaluationType,
                    positionId: competence.positionId,
                    competenceLineId: competence.competenceLineId
                  }
                }
              );

              console.log('Questions reçues:', response.data);
              if (Array.isArray(response.data) && response.data.length > 0) {
                questionsMap[employeeId][competence.competenceLineId] = response.data;
              } else {
                console.warn('Aucune question reçue pour:', {
                  employeeId,
                  competenceLineId: competence.competenceLineId
                });
              }
            } catch (error) {
              console.error('Erreur lors de la récupération des questions pour la compétence:', {
                employeeId,
                competenceLineId: competence.competenceLineId,
                error: error.response?.data || error.message
              });
            }
          }
        }

        console.log('Map finale des questions:', questionsMap);
        setQuestions(questionsMap);
      } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [selectedEvaluationType, competenceLines, selectedEmployees]);

  // Gestion des superviseurs
  const handleAddSupervisor = (supervisorId) => {
    if (!supervisorId) return;

    const numericId = parseInt(supervisorId, 10);

    if (!selectedSupervisors.includes(numericId)) {
      setSelectedSupervisors([...selectedSupervisors, numericId]);
    }
  };

  const handleRemoveSupervisor = (supervisorId) => {
    setSelectedSupervisors(selectedSupervisors.filter(id => id !== supervisorId));
  };

  // Gestion des questions
  const handleQuestionSelection = (employeeId, competenceLineId, questionId, isSelected) => {
    console.log('Sélection de question:', {
      employeeId,
      competenceLineId,
      questionId,
      isSelected,
      type: typeof questionId
    });

    setSelectedQuestions(prev => {
      const newSelection = { ...prev };

      if (!newSelection[employeeId]) {
        newSelection[employeeId] = {};
      }
      if (!newSelection[employeeId][competenceLineId]) {
        newSelection[employeeId][competenceLineId] = [];
      }

      if (isSelected) {
        if (!newSelection[employeeId][competenceLineId].includes(questionId)) {
          newSelection[employeeId][competenceLineId].push(questionId);
        }
      } else {
        newSelection[employeeId][competenceLineId] = newSelection[employeeId][competenceLineId]
          .filter(id => id !== questionId);
      }

      console.log('Après mise à jour:', newSelection[employeeId][competenceLineId]);

      return newSelection;
    });
  };

  // Modification de la validation des dates
  const validateDates = (startDateStr, endDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    let error = '';

    if (!startDate || !endDate) {
        error = 'Les deux dates doivent être définies.';
    } else {
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (startDate < today) {
            error = 'La date de début ne peut pas être antérieure à aujourd\'hui.';
        } else if (endDate < startDate) {
            error = 'La date de fin ne peut pas être antérieure à la date de début.';
        } else {
            const durationInDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            
            const employeeCount = selectedEmployees.length;
            const baseDuration = employeeCount <= 1 ? 3 : Math.max(3, Math.ceil(employeeCount * 2));
            
            const evaluationType = evaluationTypes.find(type => type.evaluationTypeId === parseInt(selectedEvaluationType, 10));
            if (evaluationType) {
                switch (evaluationType.designation.toLowerCase()) {
                    case 'évaluation annuelle':
                        if (durationInDays < baseDuration * 2) {
                            error = `L'évaluation annuelle doit durer au moins ${baseDuration * 2} jours pour ${employeeCount} employé${employeeCount > 1 ? 's' : ''}.`;
                        }
                        break;
                    case 'évaluation de performance':
                    case 'évaluation de compétences':
                        if (durationInDays < baseDuration) {
                            error = `L'évaluation de performance/compétences doit durer au moins ${baseDuration} jours pour ${employeeCount} employé${employeeCount > 1 ? 's' : ''}.`;
                        }
                        break;
                    case 'évaluation de progression':
                        if (durationInDays < Math.max(3, baseDuration / 2)) {
                            error = `L'évaluation de progression doit durer au moins ${Math.max(3, Math.ceil(baseDuration / 2))} jours pour ${employeeCount} employé${employeeCount > 1 ? 's' : ''}.`;
                        }
                        break;
                    default:
                        if (durationInDays < baseDuration) {
                            error = `L'évaluation doit durer au moins ${baseDuration} jours pour ${employeeCount} employé${employeeCount > 1 ? 's' : ''}.`;
                        }
                }
            }
        }
    }

    return error;
  };

  // Modification de la validation de la configuration
  const validateConfiguration = () => {
    const newErrors = {
      evaluationType: '',
      supervisors: '',
      dates: '',
      employees: '',
      duration: ''
    };

    let hasErrors = false;

    if (!selectedEvaluationType) {
      newErrors.evaluationType = 'Veuillez sélectionner un type d\'évaluation';
      hasErrors = true;
    }

    if (selectedSupervisors.length === 0) {
      newErrors.supervisors = 'Veuillez sélectionner au moins un superviseur';
      hasErrors = true;
    }

    if (!durationWeeks || parseInt(durationWeeks, 10) <= 0) {
      newErrors.duration = 'Veuillez définir une durée valide';
      hasErrors = true;
    }

    const dateError = validateDates(startDate, endDate);
    if (dateError) {
      newErrors.dates = dateError;
      hasErrors = true;
    }

    if (selectedEmployees.length === 0) {
      newErrors.employees = 'Veuillez sélectionner au moins un employé';
      hasErrors = true;
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSave = () => {
    if (!validateConfiguration()) {
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const validateQuestions = () => {
    for (const employeeId of selectedEmployees) {
      const employeeQuestions = selectedQuestions[employeeId];
      if (!employeeQuestions || Object.values(employeeQuestions).flat().length === 0) {
        const employee = employees.find(e => e.employeeId === employeeId);
        alert(`Veuillez sélectionner au moins une question pour ${employee?.firstName} ${employee?.lastName}`);
        return false;
      }
    }
    return true;
  };

  const handleFinalizePlanning = async () => {
    try {
      if (!validateQuestions()) {
        return;
      }

      setLoading(true);

      const planningData = {
        evaluationTypeId: parseInt(selectedEvaluationType, 10),
        supervisorIds: selectedSupervisors.map(id => parseInt(id, 10)),
        startDate,
        endDate,
        employeeQuestions: selectedEmployees.map(employeeId => {
          const employee = employees.find(e => e.employeeId === employeeId);
          const employeeQuestions = selectedQuestions[employeeId] || {};

          const selectedQuestionIds = Object.values(employeeQuestions).flat();

          const questionsWithCompetence = selectedQuestionIds.map(questionId => {
            const competenceLineId = Object.entries(employeeQuestions).find(entry => 
              entry[1].includes(questionId)
            )?.[0];

            return {
              questionId: parseInt(questionId, 10),
              competenceLineId: competenceLineId ? parseInt(competenceLineId, 10) : null
            };
          });

          return {
            employeeId: parseInt(employeeId, 10),
            evaluationTypeId: parseInt(selectedEvaluationType, 10),
            positionId: parseInt(employee.positionId, 10),
            selectedQuestions: questionsWithCompetence
          };
        })
      };

      console.log('Données envoyées pour la planification:', planningData);

      const response = await axios.post('https://localhost:7082/api/EvaluationPlanning/create-evaluation-with-questions', planningData);
      console.log('Réponse du serveur:', response.data);

      onComplete();
    } catch (error) {
      console.error('Erreur lors de la planification:', error);
      if (error.response?.data?.error) {
        alert(`Erreur lors de la planification: ${error.response.data.error}`);
      } else {
        alert('Une erreur est survenue lors de la planification des évaluations');
      }
    } finally {
      setLoading(false);
    }
  };

  // Modification du rendu de l'étape 1
  const renderStep1Content = () => (
    <div className="step-content">
      <h3>Configuration de l&apos;évaluation</h3>

      {/* Liste des employés sélectionnés */}
      <div className="form-group">
        <label>Employés sélectionnés</label>
        <div className="selected-employees">
          {selectedEmployees.map(employeeId => {
            const employee = employees.find(e => e.employeeId === employeeId);
            return employee ? (
              <div key={employeeId} className="employee-tag">
                {employee.firstName} {employee.lastName}
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveEmployee(employeeId)}
                >
                  ×
                </button>
              </div>
            ) : null;
          })}
        </div>
        {errors.employees && <div className="error-message">{errors.employees}</div>}
      </div>

      {/* Type d'évaluation */}
      <div className="form-group">
        <label>Type d&apos;évaluation</label>
        <select
          className={`form-control ${errors.evaluationType ? 'is-invalid' : ''}`}
          value={selectedEvaluationType || ''}
          onChange={(e) => {
            setSelectedEvaluationType(e.target.value);
            setErrors(prev => ({ ...prev, evaluationType: '' }));
          }}
        >
          <option value="">Sélectionner un type</option>
          {evaluationTypes.map(type => (
            <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
              {type.designation}
            </option>
          ))}
        </select>
        {errors.evaluationType && <div className="error-message">{errors.evaluationType}</div>}
      </div>

      {/* Gestion des superviseurs */}
      <div className="form-group">
        <label>Superviseurs</label>
        <div className="supervisor-selection">
          <div className="d-flex align-items-center gap-2">
            <select
              className={`form-control ${errors.supervisors ? 'is-invalid' : ''}`}
              onChange={(e) => {
                handleAddSupervisor(e.target.value);
                setErrors(prev => ({ ...prev, supervisors: '' }));
              }}
              value=""
            >
              <option value="">Ajouter un superviseur</option>
              {supervisors
                .filter(s => !selectedSupervisors.includes(parseInt(s.id, 10)))
                .map(supervisor => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.firstName} {supervisor.lastName}
                  </option>
                ))}
            </select>
          </div>
          <div className="selected-supervisors mt-2">
            {selectedSupervisors.map(supervisorId => {
              const supervisor = supervisors.find(s => parseInt(s.id, 10) === supervisorId);
              return (
                <div key={supervisorId} className="supervisor-tag">
                  {supervisor.firstName} {supervisor.lastName}
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleRemoveSupervisor(supervisorId)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        {errors.supervisors && <div className="error-message">{errors.supervisors}</div>}
      </div>

      {/* Durée et Dates */}
      <div className="form-group">
        
        {/* Champ durée en semaines */} 
        <div className="duration-input mb-3">
          <label>Durée (en semaines)</label>
          <input
            type="number"
            min="1"
            max="52"
            className={`form-control ${errors.duration ? 'is-invalid' : ''}`}
            value={durationWeeks}
            placeholder="Ex: 3"
            onChange={(e) => handleDurationChange(e.target.value)}
          />
          {errors.duration && <div className="error-message">{errors.duration}</div>}
          <small className="text-muted">La durée sera automatiquement convertie en dates avec heures</small>
        </div>

        {/* Dates avec heures */}
        <div className="date-range">
          <div className="date-input">
            <label>Date et heure de début</label>
            <input
              type="datetime-local"
              className={`form-control ${errors.dates ? 'is-invalid' : ''}`}
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
            />
          </div>
          <div className="date-input">
            <label>Date et heure de fin</label>
            <input
              type="datetime-local"
              className={`form-control ${errors.dates ? 'is-invalid' : ''}`}
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
            />
          </div>
        </div>
        {errors.dates && <div className="error-message">{errors.dates}</div>}
        
        <div className="mt-2 text-muted small">
          <strong>Durées recommandées :</strong>
          <ul className="mb-0">
            <li>Évaluation annuelle : {selectedEmployees.length <= 1 ? '1-2 semaines' : '3-4 semaines'}</li>
            <li>Évaluation de période d&apos;essai : {selectedEmployees.length <= 1 ? '1 semaine' : '2-3 semaines'}</li>
            <li>Évaluation de projet : {selectedEmployees.length <= 1 ? '1 semaine' : '2-3 semaines'}</li>
          </ul>
          <small className="text-muted mt-1 d-block">
            Note : Les durées sont ajustées en fonction du nombre d&apos;employés à évaluer.
          </small>
        </div>
      </div>
    </div>
  );

  const handleRemoveEmployee = (employeeId) => {
    onRemoveEmployee(employeeId);
  };

  // Rendu des étapes
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1Content();
      case 2:
        return (
          <div className="step-content">
            <h3>Sélection des questions</h3>
            {selectedEmployees.map(employeeId => {
              const employee = employees.find(e => e.employeeId === employeeId);
              console.log('Rendu des questions pour l\'employé:', {
                employeeId,
                employee,
                competenceLines: competenceLines[employeeId],
                questions: questions[employeeId]
              });

              // Trier les compétences par nom alphabétiquement
              const sortedCompetences = competenceLines[employeeId]?.sort((a, b) => 
                (a.competenceName || '').localeCompare(b.competenceName || '')
              ) || [];

              return (
                <div key={`employee-${employeeId}`} className="employee-questions">
                  <h4>
                    <i className="fas fa-user mr-2"></i>
                    {employee?.firstName} {employee?.lastName}
                  </h4>
                  <div className="accordion" id={`accordion-employee-${employeeId}`}>
                    {sortedCompetences.map((competence) => {
                      const competenceQuestions = questions[employeeId]?.[competence.competenceLineId];
                      const accordionId = `collapse-${employeeId}-${competence.competenceLineId}`;
                      const headingId = `heading-${employeeId}-${competence.competenceLineId}`;
                      
                      // Trier les questions alphabétiquement (insensible à la casse) sur une copie
                      const sortedQuestions = [...(competenceQuestions || [])].sort((a, b) => 
                        (a.question || '').toLocaleLowerCase().localeCompare((b.question || '').toLocaleLowerCase())
                      );

                      return (
                        <div key={`competence-${employeeId}-${competence.competenceLineId}`} className="card competence-accordion-card">
                          <div className="card-header competence-header" id={headingId}>
                            <h2 className="mb-0 d-flex align-items-center justify-content-between">
                              <button
                                className="btn btn-link btn-block text-left collapsed competence-toggle"
                                type="button"
                                data-toggle="collapse"
                                data-target={`#${accordionId}`}
                                aria-expanded="false"
                                aria-controls={accordionId}
                              >
                                <span className="competence-title font-weight-bold">
                                  {competence.competenceName}
                                  <span className="badge badge-secondary ml-2">
                                    {sortedQuestions.length} question{sortedQuestions.length > 1 ? 's' : ''}
                                  </span>
                                </span>
                                <i className="fas fa-chevron-right ml-3 chevron-icon"></i>
                              </button>
                            </h2>
                          </div>
                          <div
                            id={accordionId}
                            className="collapse"
                            aria-labelledby={headingId}
                            data-parent={`#accordion-employee-${employeeId}`}
                          >
                            <div className="card-body">
                              <ol className="questions-list">
                                {sortedQuestions.length > 0 ? (
                                  sortedQuestions.map((question, idx) => {
                                    if (!question || !question.questionId) {
                                      console.warn('Question invalide:', question);
                                      return null;
                                    }

                                    const questionKey = `question-${employeeId}-${competence.competenceLineId}-${question.questionId}`;
                                    const isChecked = selectedQuestions[employeeId]?.[competence.competenceLineId]?.includes(question.questionId) || false;

                                    return (
                                      <li key={questionKey} className="question-item">
                                        <div className="form-check">
                                          <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={questionKey}
                                            checked={isChecked}
                                            onChange={(e) => handleQuestionSelection(
                                              employeeId,
                                              competence.competenceLineId,
                                              question.questionId,
                                              e.target.checked
                                            )}
                                          />
                                          <label className="form-check-label" htmlFor={questionKey}>
                                            {question.question}
                                          </label>
                                        </div>
                                      </li>
                                    );
                                  })
                                ) : (
                                  <div className="no-questions">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    Aucune question disponible pour cette compétence
                                  </div>
                                )}
                              </ol>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <h3>Résumé de la configuration</h3>
            <div className="configuration-summary">
              <div className="summary-section">
                <h4>Type d&apos;évaluation</h4>
                <p>
                  {evaluationTypes.find(type => type.evaluationTypeId === parseInt(selectedEvaluationType, 10))?.designation}
                </p>
              </div>

              <div className="summary-section">
                <h4>Superviseurs sélectionnés</h4>
                <ul>
                  {selectedSupervisors.map(supervisorId => {
                    const supervisor = supervisors.find(s => parseInt(s.id, 10) === supervisorId);
                    return (
                      <li key={supervisorId}>
                        {supervisor?.firstName} {supervisor?.lastName}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="summary-section">
                <p>
                  <strong>Durée:</strong> {durationWeeks} semaine{parseInt(durationWeeks, 10) > 1 ? 's' : ''}
                </p>
                <p>
                  <strong>Du:</strong> {startDate ? new Date(startDate).toLocaleString() : 'Non défini'}<br/>
                  <strong>Au:</strong> {endDate ? new Date(endDate).toLocaleString() : 'Non défini'}
                </p>
              </div>

              <div className="summary-section">
                <h4>Employés et questions sélectionnées</h4>
                {selectedEmployees.map(employeeId => {
                  const employee = employees.find(e => e.employeeId === employeeId);
                  const employeeQuestions = selectedQuestions[employeeId] || {};
                  const employeeCompetenceLines = Object.entries(employeeQuestions).map(([competenceLineId, questionIds]) => {
                    const competence = competenceLines[employeeId]?.find(c => c.competenceLineId === parseInt(competenceLineId, 10));
                    return {
                      competenceName: competence?.competenceName || 'Compétence inconnue',
                      questionCount: questionIds.length
                    };
                  });

                  return (
                    <div key={employeeId} className="employee-summary">
                      <h5>{employee?.firstName} {employee?.lastName}</h5>
                      <div className="competence-summary">
                        {employeeCompetenceLines.map((comp, index) => (
                          <div key={index} className="competence-item">
                            <strong>{comp.competenceName}:</strong> {comp.questionCount} questions
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderActionButtons = () => {
    return (
      <div className="action-buttons">
        <button
          className="btn btn-secondary"
          onClick={onBack}
          disabled={loading}
        >
          Retour
        </button>
        {currentStep < 3 ? (
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            Suivant
          </button>
        ) : (
          <button
            className="btn btn-success"
            onClick={handleFinalizePlanning}
            disabled={loading}
          >
            Planifier les évaluations
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="evaluation-configuration">
      {/* Barre de progression */}
      <div className="progress-steps">
        <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
          1. Configuration
        </div>
        <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
          2. Sélection des questions
        </div>
        <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
          3. Résumé de la configuration
        </div>
      </div>

      {/* Contenu des étapes */}
      <div className="step-content-container">
        {renderStepContent()}
      </div>

      {/* Boutons d'action */}
      {renderActionButtons()}
    </div>
  );
}

EvaluationConfiguration.propTypes = {
  selectedEmployees: PropTypes.arrayOf(PropTypes.number).isRequired,
  employees: PropTypes.arrayOf(PropTypes.shape({
    employeeId: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    positionId: PropTypes.number // Assurez-vous que positionId est inclus si utilisé directement depuis employee
  })).isRequired,
  onBack: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onRemoveEmployee: PropTypes.func.isRequired
};

export default EvaluationConfiguration;
