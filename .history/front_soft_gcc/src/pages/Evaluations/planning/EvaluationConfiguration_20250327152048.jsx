import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/EvaluationConfiguration.css';

function EvaluationConfiguration({ selectedEmployees, employees, onBack, onComplete }) {
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
          const response = await axios.get(`https://localhost:7082/api/Competence/lines/${employeeId}`);
          return { employeeId, competences: response.data };
        });

        const competenceResults = await Promise.all(competencePromises);
        const competenceMap = {};
        competenceResults.forEach(result => {
          competenceMap[result.employeeId] = result.competences;
        });
        setCompetenceLines(competenceMap);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [selectedEmployees]);

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
    if (!selectedSupervisors.includes(supervisorId)) {
      setSelectedSupervisors([...selectedSupervisors, supervisorId]);
    }
  };

  const handleRemoveSupervisor = (supervisorId) => {
    setSelectedSupervisors(selectedSupervisors.filter(id => id !== supervisorId));
  };

  // Gestion des questions
  const handleQuestionSelection = (employeeId, competenceLineId, questionId, isSelected) => {
    setSelectedQuestions(prev => {
      const newSelection = { ...prev };
      if (!newSelection[employeeId]) {
        newSelection[employeeId] = {};
      }
      if (!newSelection[employeeId][competenceLineId]) {
        newSelection[employeeId][competenceLineId] = [];
      }

      if (isSelected) {
        newSelection[employeeId][competenceLineId].push(questionId);
      } else {
        newSelection[employeeId][competenceLineId] = newSelection[employeeId][competenceLineId]
          .filter(id => id !== questionId);
      }

      return newSelection;
    });
  };

  // Ajout de la validation des dates
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
    const errors = [];

    if (!selectedEvaluationType) {
      errors.push('Veuillez sélectionner un type d\'évaluation');
    }

    if (selectedSupervisors.length === 0) {
      errors.push('Veuillez sélectionner au moins un superviseur');
    }

    const dateError = validateDates(startDate, endDate);
    if (dateError) {
      errors.push(dateError);
    }

    if (selectedEmployees.length === 0) {
      errors.push('Veuillez sélectionner au moins un employé');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return false;
    }

    return true;
  };

  // Sauvegarde de la configuration
  const handleSave = async () => {
    if (!validateConfiguration()) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      setLoading(true);
      const configurationData = {
        evaluationTypeId: selectedEvaluationType,
        supervisorIds: selectedSupervisors,
        startDate,
        endDate,
        employeeQuestions: selectedEmployees.map(employeeId => ({
          employeeId,
          evaluationTypeId: selectedEvaluationType,
          selectedQuestionIds: Object.values(selectedQuestions[employeeId] || {})
            .flat()
            .filter(id => id !== undefined)
        }))
      };

      await axios.post('https://localhost:7082/api/Evaluation/create-evaluation-with-questions', configurationData);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Une erreur est survenue lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Ajout de la fonction de planification finale
  const handleFinalizePlanning = async () => {
    try {
      setLoading(true);
      
      // Préparation des données pour la planification
      const planningData = {
        evaluationTypeId: selectedEvaluationType,
        supervisorIds: selectedSupervisors,
        startDate,
        endDate,
        employeeQuestions: selectedEmployees.map(employeeId => ({
          employeeId,
          evaluationTypeId: selectedEvaluationType,
          selectedQuestionIds: Object.values(selectedQuestions[employeeId] || {})
            .flat()
            .filter(id => id !== undefined)
        }))
      };

      // Appel à l'API pour planifier les évaluations
      await axios.post('https://localhost:7082/api/Evaluation/create-evaluation-with-questions', planningData);
      
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
      </div>

      {/* Type d'évaluation */}
      <div className="form-group">
        <label>Type d&apos;évaluation</label>
        <select
          className="form-control"
          value={selectedEvaluationType || ''}
          onChange={(e) => setSelectedEvaluationType(e.target.value)}
        >
          <option value="">Sélectionner un type</option>
          {evaluationTypes.map(type => (
            <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
              {type.designation}
            </option>
          ))}
        </select>
      </div>

      {/* Gestion des superviseurs */}
      <div className="form-group">
        <label>Superviseurs</label>
        <div className="supervisor-selection">
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-control"
              onChange={(e) => handleAddSupervisor(e.target.value)}
              value=""
            >
              <option value="">Ajouter un superviseur</option>
              {supervisors
                .filter(s => !selectedSupervisors.includes(s.id))
                .map(supervisor => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.firstName} {supervisor.lastName}
                  </option>
                ))}
            </select>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const select = document.querySelector('.supervisor-selection select');
                if (select.value) {
                  handleAddSupervisor(select.value);
                  select.value = '';
                }
              }}
            >
              Ajouter
            </button>
          </div>
          <div className="selected-supervisors mt-2">
            {selectedSupervisors.map(supervisorId => {
              const supervisor = supervisors.find(s => s.id === supervisorId);
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
      </div>

      {/* Dates */}
      <div className="form-group">
        <label>Date de début</label>
        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            const error = validateDates(e.target.value, endDate);
            if (error) {
              alert(error);
            }
          }}
        />
      </div>

      <div className="form-group">
        <label>Date de fin</label>
        <input
          type="date"
          className="form-control"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            const error = validateDates(startDate, e.target.value);
            if (error) {
              alert(error);
            }
          }}
        />
      </div>
    </div>
  );

  // Ajout de la fonction pour retirer un employé
  const handleRemoveEmployee = (employeeId) => {
    setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
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
                        {questions[employeeId]?.[competence.competenceLineId]?.map(question => (
                          <div key={question.questionId} className="question-item">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`question-${question.questionId}`}
                                checked={selectedQuestions[employeeId]?.[competence.competenceLineId]?.includes(question.questionId) || false}
                                onChange={(e) => handleQuestionSelection(
                                  employeeId,
                                  competence.competenceLineId,
                                  question.questionId,
                                  e.target.checked
                                )}
                              />
                              <label className="form-check-label" htmlFor={`question-${question.questionId}`}>
                                {question.question}
                              </label>
                            </div>
                          </div>
                        ))}
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
                  {evaluationTypes.find(type => type.evaluationTypeId === selectedEvaluationType)?.designation}
                </p>
              </div>

              <div className="summary-section">
                <h4>Superviseurs sélectionnés</h4>
                <ul>
                  {selectedSupervisors.map(supervisorId => {
                    const supervisor = supervisors.find(s => s.id === supervisorId);
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
                  const selectedCount = Object.values(selectedQuestions[employeeId] || {})
                    .flat()
                    .filter(id => id !== undefined).length;
                  return (
                    <div key={employeeId} className="employee-summary">
                      <h5>{employee?.firstName} {employee?.lastName}</h5>
                      <p>{selectedCount} questions sélectionnées</p>
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
  onComplete: PropTypes.func.isRequired
};

export default EvaluationConfiguration; 