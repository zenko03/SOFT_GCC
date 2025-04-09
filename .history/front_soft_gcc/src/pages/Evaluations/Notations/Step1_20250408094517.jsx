import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css';

const Step1 = ({ evaluationId, setRatings, ratings, evaluationTypes }) => {
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
        setCurrentEvaluationType(evaluationResponse.data.evaluationType);

        // Récupérer les questions sélectionnées
        const questionsResponse = await axios.get(`https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`);
        // S'assurer que questions est un tableau
        const questionsData = Array.isArray(questionsResponse.data) ? questionsResponse.data : [];
        setQuestions(questionsData);
      } catch (err) {
        setError(err.message);
        setQuestions([]); // S'assurer que questions reste un tableau vide en cas d'erreur
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
      <div>
        <h3 className="text-lg font-medium">Type d&apos;évaluation</h3>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={currentEvaluationType?.evaluationTypeId || ''}
          disabled
        >
          {evaluationTypes.map(type => (
            <option
              key={type.evaluationTypeId}
              value={type.evaluationTypeId}
              className={type.evaluationTypeId === currentEvaluationType?.evaluationTypeId ? 'bg-gray-100' : 'text-gray-400'}
            >
              {type.designation}
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
                <p className="font-medium">{question.questionText}</p>
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
      evaluationTypeId: PropTypes.number.isRequired,
      designation: PropTypes.string.isRequired
    })
  ).isRequired
};

export default Step1;