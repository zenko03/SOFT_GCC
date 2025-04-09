import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css';

function Step1({ evaluationId, setRatings, evaluationTypes }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});
  const [currentEvaluationType, setCurrentEvaluationType] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les détails de l'évaluation
        const evaluationResponse = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}`);
        const evaluation = evaluationResponse.data;

        // Récupérer les questions sélectionnées
        const questionsResponse = await axios.get(`https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`);
        const questionsData = questionsResponse.data.questions || [];
        setQuestions(questionsData);

        // Mettre à jour le type d'évaluation actuel
        const currentType = evaluationTypes.find(type => type.EvaluationTypeId === evaluation.evaluationTypeId);
        if (currentType) {
          setCurrentEvaluationType(currentType);
        }

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setLoading(false);
      }
    };

    if (evaluationId) {
      fetchData();
    }
  }, [evaluationId, evaluationTypes]);

  const handleRatingChange = (questionId, value) => {
    const newRatings = { ...localRatings, [questionId]: value };
    setLocalRatings(newRatings);
    setRatings(newRatings);
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Informations de l'employé */}
      {selectedEmployee && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-2">Informations de l&apos;employé</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nom complet</p>
              <p className="font-medium">{selectedEmployee.firstName} {selectedEmployee.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Poste</p>
              <p className="font-medium">{selectedEmployee.position}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Département</p>
              <p className="font-medium">{selectedEmployee.department}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium">Type d&apos;évaluation</h3>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={currentEvaluationType?.EvaluationTypeId || ''}
          disabled
        >
          <option value="">Sélectionnez un type</option>
          {evaluationTypes && evaluationTypes.map(type => (
            <option
              key={type.EvaluationTypeId}
              value={type.EvaluationTypeId}
              style={{
                backgroundColor: type.EvaluationTypeId === currentEvaluationType?.EvaluationTypeId ? '#e9ecef' : 'white',
                color: type.EvaluationTypeId === currentEvaluationType?.EvaluationTypeId ? '#495057' : '#6c757d'
              }}
            >
              {type.Designation}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-lg font-medium">Questions</h3>
        <div className="mt-4 space-y-4">
          {questions.length > 0 ? (
            questions.map(question => (
              <div key={question.questionId} className="border rounded-lg p-4">
                <p className="font-medium">{question.text}</p>
                <div className="mt-2">
                  <div className="rating-options">
                    {[1, 2, 3, 4, 5].map(value => (
                      <button
                        key={value}
                        type="button"
                        className={`rating-button ${localRatings[question.questionId] === value ? 'selected' : ''}`}
                        onClick={() => handleRatingChange(question.questionId, value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">Aucune question disponible</div>
          )}
        </div>
      </div>
    </div>
  );
}

Step1.propTypes = {
  evaluationId: PropTypes.number.isRequired,
  setRatings: PropTypes.func.isRequired,
  evaluationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      EvaluationTypeId: PropTypes.number.isRequired,
      Designation: PropTypes.string.isRequired
    })
  ).isRequired
};

export default Step1;