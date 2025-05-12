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
  const [competenceLines, setCompetenceLines] = useState({});
  const [questions, setQuestions] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState({});
  const [loading, setLoading] = useState(false);

  // États pour les erreurs
  const [errors, setErrors] = useState({
    evaluationType: '',
    supervisors: '',
    dates: '',
    employees: ''
  });

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
      if (!selectedEvaluationType) return;

      try {
        setLoading(true);
        const questionsMap = {};

        for (const employeeId of selectedEmployees) {
          const employeeCompetences = competenceLines[employeeId] || [];
          questionsMap[employeeId] = {};

          for (const competence of employeeCompetences) {
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
            questionsMap[employeeId][competence.competenceLineId] = response.data;
          }
        }

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
    if (!supervisorId) return; // Ne rien faire si aucun superviseur n'est sélectionné

    // Convertir l'ID en nombre pour la comparaison
    const numericId = parseInt(supervisorId, 10);

    if (!selectedSupervisors.includes(numericId)) {
      setSelectedSupervisors([...selectedSupervisors, numericId]);
    }
  };

  const handleRemoveSupervisor = (supervisorId) => {
    setSelectedSupervisors(selectedSupervisors.filter(id => id !== supervisorId));
  };

  // Gestion des questions
  // Modification de handleQuestionSelection pour s'assurer que questionId est traité comme un nombre
  // Ajoutons des logs dans la fonction handleQuestionSelection
  const handleQuestionSelection = (employeeId, competenceLineId, questionId, isSelected) => {
    console.log('Avant modification:', {
      employeeId,
      competenceLineId,
      questionId,
      isSelected,
      selectedQuestions: JSON.parse(JSON.stringify(selectedQuestions))
    });

    // Assurez-vous que tous les IDs sont des nombres
    const empId = parseInt(employeeId, 10);
    const compId = parseInt(competenceLineId, 10);
    const qId = parseInt(questionId, 10);

    setSelectedQuestions(prev => {
      // Créer une copie profonde pour éviter des problèmes de référence
      const newSelection = JSON.parse(JSON.stringify(prev));

      if (!newSelection[empId]) {
        newSelection[empId] = {};
      }
      if (!newSelection[empId][compId]) {
        newSelection[empId][compId] = [];
      }

      if (isSelected) {
        // Vérifier si la question n'est pas déjà sélectionnée
        if (!newSelection[empId][compId].includes(qId)) {
          newSelection[empId][compId].push(qId);
        }
      } else {
        // Filtrage pour retirer la question
        newSelection[empId][compId] = newSelection[empId][compId].filter(id => id !== qId);
      }

      console.log('Après modification:', {
        isSelected,
        selectedArray: newSelection[empId][compId]
      });

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
      employees: ''
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

  // Modification de la fonction handleSave pour ne plus sauvegarder
  const handleSave = () => {
    if (!validateConfiguration()) {
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  // Ajout d'une fonction de validation des questions
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

  // Modification de la fonction de planification finale
  const handleFinalizePlanning = async () => {
    try {
      if (!validateQuestions()) {
        return;
      }

      setLoading(true);

      // Préparation des données pour la planification
      const planningData = {
        evaluationTypeId: selectedEvaluationType,
        supervisorIds: selectedSupervisors,
        startDate,
        endDate,
        employeeQuestions: selectedEmployees.map(employeeId => {
          const employee = employees.find(e => e.employeeId === employeeId);
          const employeeQuestions = selectedQuestions[employeeId] || {};

          return {
            employeeId,
            evaluationTypeId: selectedEvaluationType,
            positionId: employee.positionId,
            selectedQuestions: Object.entries(employeeQuestions).map(([competenceLineId, questionIds]) => ({
              competenceLineId: parseInt(competenceLineId, 10),
              questionIds: questionIds.map(id => parseInt(id, 10))
            }))
          };
        })
      };

      console.log('Données envoyées pour la planification:', planningData);

      // Appel à l'API pour planifier les évaluations
      const response = await axios.post('https://localhost:7082/api/Evaluation/create-evaluation-with-questions', planningData);
      console.log('Réponse du serveur:', response.data);

      // Appel de la fonction de complétion fournie par le composant parent
      onComplete();
    } catch (error) {
      console.error('Erreur lors de la planification:', error);
      alert('Une erreur est survenue lors de la planification des évaluations');
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
              return supervisor ? (
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
              ) : null;
            })}
          </div>
        </div>
        {errors.supervisors && <div className="error-message">{errors.supervisors}</div>}
      </div>

      {/* Dates */}
      <div className="form-group">
        <label>Période d&apos;évaluation</label>
        <div className="date-range">
          <div className="date-input">
            <label>Date de début</label>
            <input
              type="date"
              className={`form-control ${errors.dates ? 'is-invalid' : ''}`}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setErrors(prev => ({ ...prev, dates: '' }));
                if (endDate) {
                  const error = validateDates(e.target.value, endDate);
                  if (error) {
                    setErrors(prev => ({ ...prev, dates: error }));
                  }
                }
              }}
            />
          </div>
          <div className="date-input">
            <label>Date de fin</label>
            <input
              type="date"
              className={`form-control ${errors.dates ? 'is-invalid' : ''}`}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setErrors(prev => ({ ...prev, dates: '' }));
                if (startDate) {
                  const error = validateDates(startDate, e.target.value);
                  if (error) {
                    setErrors(prev => ({ ...prev, dates: error }));
                  }
                }
              }}
            />
          </div>
        </div>
        {errors.dates && <div className="error-message">{errors.dates}</div>}
      </div>
    </div>
  );

  // Modification de la fonction handleRemoveEmployee pour utiliser la prop
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
              return (
                <div key={employeeId} className="employee-questions">
                  <h4>{employee?.firstName} {employee?.lastName}</h4>
                  {competenceLines[employeeId]?.map(competence => (
                    <div key={competence.competenceLineId} className="competence-section">
                      <h5>{competence.competenceName}</h5>
                      <div className="questions-list">
                        {questions[employeeId]?.[competence.competenceLineId]?.map(question => {
                          // Convertir tous les IDs en nombres
                          const qId = parseInt(question.questionId, 10);
                          const cId = parseInt(competence.competenceLineId, 10);
                          const eId = parseInt(employeeId, 10);

                          // Vérifiez si cette question est sélectionnée
                          const isChecked = Boolean(selectedQuestions[eId]?.[cId]?.includes(qId));

                          console.log(`Question ${qId} checked:`, isChecked);

                          return (
                            <div key={`${eId}-${cId}-${qId}`} className="question-item">
                              <div className="form-check">
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  id={`question-${eId}-${cId}-${qId}`}
                                  checked={isChecked}
                                  onChange={(e) => handleQuestionSelection(
                                    eId,
                                    cId,
                                    qId,
                                    e.target.checked
                                  )}
                                />
                                <label className="form-check-label" htmlFor={`question-${eId}-${cId}-${qId}`}>
                                  {question.question}
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
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
                <h4>Période d&apos;évaluation</h4>
                <p>
                  Du {new Date(startDate).toLocaleDateString()} au {new Date(endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="summary-section">
                <h4>Employés et questions sélectionnées</h4>
                {selectedEmployees.map(employeeId => {
                  const employee = employees.find(e => e.employeeId === employeeId);
                  const employeeQuestions = selectedQuestions[employeeId] || {};
                  // MODIFIEZ CETTE LIGNE - Renommez la variable locale
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
                      <div className="competence-summary"> {employeeCompetenceLines.map((comp, index) => (
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

  // Modification du rendu des boutons d'action
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
          2. Questions
        </div>
        <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
          3. Confirmation
        </div>
      </div>

      {/* Contenu principal */}
      <div className="configuration-content">
        {loading ? (
          <div className="loading">Chargement...</div>
        ) : (
          renderStepContent()
        )}
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
    lastName: PropTypes.string.isRequired
  })).isRequired,
  onBack: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onRemoveEmployee: PropTypes.func.isRequired
};

export default EvaluationConfiguration; 