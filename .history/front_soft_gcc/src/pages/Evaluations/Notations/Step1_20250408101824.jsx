import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css';

const Step1 = ({ evaluationId, setRatings, ratings, evaluationTypes, selectedEmployee }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEvaluationType, setCurrentEvaluationType] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer les détails de l'évaluation
        const evaluationResponse = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}`);
        const evaluationType = evaluationResponse.data.evaluationType;
        
        setCurrentEvaluationType({
          EvaluationTypeId: evaluationType.evaluationTypeId,
          Designation: evaluationType.designation
        });

        // Récupérer les questions sélectionnées
        const questionsResponse = await axios.get(`https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`);
        setQuestions(questionsResponse.data.questions || []);
      } catch (err) {
        setError(err.message);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    if (evaluationId) {
      fetchData();
    }
  }, [evaluationId]);

  const handleRatingChange = (questionId, rating) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: rating
    }));
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

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
          {evaluationTypes.map(type => (
            <option
              key={type.EvaluationTypeId}
              value={type.EvaluationTypeId}
              className={type.EvaluationTypeId === currentEvaluationType?.EvaluationTypeId ? 'bg-indigo-100' : 'text-gray-400'}
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
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={ratings[question.questionId] || ''}
                    onChange={(e) => handleRatingChange(question.questionId, parseInt(e.target.value))}
                  >
                    <option value="">Sélectionner une note</option>
                    {[1, 2, 3, 4, 5].map(score => (
                      <option key={score} value={score}>{score}</option>
                    ))}
                  </select>
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
};

Step1.propTypes = {
  evaluationId: PropTypes.number.isRequired,
  setRatings: PropTypes.func.isRequired,
  ratings: PropTypes.object.isRequired,
  evaluationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      EvaluationTypeId: PropTypes.number.isRequired,
      Designation: PropTypes.string.isRequired
    })
  ).isRequired,
  selectedEmployee: PropTypes.shape({
    employeeId: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    department: PropTypes.string.isRequired,
    evaluationId: PropTypes.number
  }).isRequired
};

export default Step1;