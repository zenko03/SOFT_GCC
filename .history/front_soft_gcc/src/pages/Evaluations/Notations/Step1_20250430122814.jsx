import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import './Step1.css';

const Step1 = ({ evaluationId, setRatings, ratings, evaluationTypes = [], onEvaluationTypeSelect }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localRatings, setLocalRatings] = useState({});
  const [selectedEvaluationType, setSelectedEvaluationType] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [evaluationDetails, setEvaluationDetails] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('Evaluation ID:', evaluationId);
    console.log('Evaluation Types:', evaluationTypes);
  }, [evaluationId, evaluationTypes]);

  useEffect(() => {
    const fetchEvaluationDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!evaluationId) {
          setError("ID d'évaluation non spécifié");
          setLoading(false);
          return;
        }

        // Premier appel : récupérer les détails généraux de l'évaluation
        const evaluationResponse = await axios.get(`https://localhost:7082/api/Evaluation/${evaluationId}`);
        const evaluationData = evaluationResponse.data;
        setEvaluationDetails(evaluationData);
        console.log('Détails de l\'évaluation:', evaluationData);

        // Trouver le type d'évaluation correspondant
        if (evaluationTypes && evaluationTypes.length > 0) {
          const currentType = evaluationTypes.find(type => 
            type.evaluationTypeId === evaluationData.evaluationTypeId
          );
          
          if (currentType) {
            console.log('Type d\'évaluation trouvé:', currentType);
            setSelectedEvaluationType(currentType);
          } else {
            console.log('Type d\'évaluation non trouvé dans la liste des types');
          }
        }

        // Deuxième appel : récupérer les questions sélectionnées
        const questionsResponse = await axios.get(`https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`);
        console.log('Questions sélectionnées reçues:', questionsResponse.data);
        
        // Transformer les données pour inclure les informations nécessaires
        const formattedQuestions = questionsResponse.data.map(item => ({
          questionId: item.QuestionId,
          text: item.QuestionText,
          competenceLineId: item.CompetenceLineId,
          competenceName: item.CompetenceLine.CompetenceName,
          response: item.Response
        }));
        
        setSelectedQuestions(formattedQuestions);
        
        // Initialiser les notes pour chaque question
        const newRatings = {};
        formattedQuestions.forEach(question => {
          newRatings[question.questionId] = question.response?.ResponseValue || 0;
        });
        setLocalRatings(newRatings);
        setRatings(newRatings);

        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données. Veuillez réessayer.');
        setLoading(false);
      }
    };

    if (evaluationId) {
      fetchEvaluationDetails();
    }
  }, [evaluationId, evaluationTypes, ratings]);

  const handleEvaluationTypeChange = async (e) => {
    const typeId = parseInt(e.target.value);
    console.log('Type sélectionné ID:', typeId);
    
    if (isNaN(typeId)) {
      console.log('ID de type invalide');
      return;
    }
    
    const selectedType = evaluationTypes.find(type => type.evaluationTypeId === typeId);
    
    if (!selectedType) {
      console.log('Type sélectionné non trouvé dans la liste');
      return;
    }
    
    console.log('Type sélectionné:', selectedType);
    setSelectedEvaluationType(selectedType);
    
    if (onEvaluationTypeSelect) {
      onEvaluationTypeSelect(selectedType);
    }

    try {
      // Récupérer les questions sélectionnées pour l'évaluation actuelle
      const response = await axios.get(`https://localhost:7082/api/Evaluation/evaluation/${evaluationId}/selected-questions`);
      console.log('Questions sélectionnées reçues:', response.data);
      
      // Transformer les données pour inclure les informations nécessaires
      const formattedQuestions = response.data.map(item => ({
        questionId: item.QuestionId,
        text: item.QuestionText,
        competenceLineId: item.CompetenceLineId,
        competenceName: item.CompetenceLine.CompetenceName,
        response: item.Response
      }));
      
      setSelectedQuestions(formattedQuestions);
      
      // Initialiser les notes pour chaque question
      const newRatings = {};
      formattedQuestions.forEach(question => {
        newRatings[question.questionId] = question.response?.ResponseValue || 0;
      });
      setLocalRatings(newRatings);
      setRatings(newRatings);
    } catch (err) {
      console.error('Erreur lors de la récupération des questions:', err);
      setError('Erreur lors de la récupération des questions. Veuillez réessayer.');
      setSelectedQuestions([]);
      setLocalRatings({});
      setRatings({});
    }
  };

  const handleRatingChange = (questionId, rating) => {
    const newRatings = { ...localRatings, [questionId]: rating };
    setLocalRatings(newRatings);
    setRatings(newRatings);
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="step1-container">
      <h2>Étape 1 : Notation</h2>
      
      <div className="evaluation-type-section">
        <h3>Type d&apos;évaluation</h3>
        <select
          className="evaluation-type-select"
          value={selectedEvaluationType?.evaluationTypeId || ''}
          onChange={handleEvaluationTypeChange}
        >
          <option value="">Sélectionnez un type d&apos;évaluation</option>
          {evaluationTypes && evaluationTypes.map((type, index) => (
            <option 
              key={`eval-type-${type.evaluationTypeId || index}`} 
              value={type.evaluationTypeId}
            >
              {type.designation}
            </option>
          ))}
        </select>
      </div>

      {selectedQuestions.length > 0 ? (
        <div className="questions-section">
          <h3>Questions</h3>
          {selectedQuestions.map(question => (
            <div key={`question-${question.questionId}`} className="question-item">
              <p>{question.text}</p>
              <div className="rating-buttons">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={`rating-${question.questionId}-${rating}`}
                    className={`rating-button ${localRatings[question.questionId] === rating ? 'selected' : ''}`}
                    onClick={() => handleRatingChange(question.questionId, rating)}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-questions-message">
          Aucune question n'a été sélectionnée pour cette évaluation.
        </div>
      )}

      {!selectedEvaluationType && (
        <div className="select-type-message">
          Veuillez sélectionner un type d&apos;évaluation pour afficher les questions.
        </div>
      )}
    </div>
  );
};

Step1.propTypes = {
  evaluationId: PropTypes.number.isRequired,
  setRatings: PropTypes.func.isRequired,
  ratings: PropTypes.object.isRequired,
  evaluationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      evaluationTypeId: PropTypes.number,
      designation: PropTypes.string,
      state: PropTypes.number
    })
  ),
  onEvaluationTypeSelect: PropTypes.func
};

export default Step1;