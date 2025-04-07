import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Step1.css';

function Step1({ employee, evaluationTypes, onNext, onEvaluationTypeSelect, evaluationId }) {
  const [selectedType, setSelectedType] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (evaluationId) {
      fetchQuestionsForEvaluation(evaluationId);
    }
  }, [evaluationId]);

  const fetchQuestionsForEvaluation = async (evalId) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://localhost:7082/api/Evaluation/${evalId}/selected-questions`);
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Erreur lors de la récupération des questions:', error);
      setError('Erreur lors de la récupération des questions');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (e) => {
    const typeId = e.target.value;
    setSelectedType(typeId);
    onEvaluationTypeSelect(typeId);
  };

  const handleNext = () => {
    if (!selectedType) {
      setError('Veuillez sélectionner un type d&apos;évaluation');
      return;
    }
    onNext();
  };

  return (
    <div className="step-container">
      <h3>Étape 1 : Sélection du type d&apos;évaluation</h3>
      
      <div className="form-group">
        <label htmlFor="evaluationType">Type d&apos;évaluation :</label>
        <select
          id="evaluationType"
          value={selectedType}
          onChange={handleTypeChange}
          className="form-control"
        >
          <option value="">Sélectionnez un type</option>
          {evaluationTypes.map((type) => (
            <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
              {type.designation}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div>Chargement des questions...</div>}

      {questions.length > 0 && (
        <div className="questions-preview">
          <h4>Questions associées :</h4>
          <ul>
            {questions.map((question) => (
              <li key={question.questionId}>{question.text}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="step-actions">
        <button onClick={handleNext} className="btn btn-primary">
          Suivant
        </button>
      </div>
    </div>
  );
}

export default Step1;