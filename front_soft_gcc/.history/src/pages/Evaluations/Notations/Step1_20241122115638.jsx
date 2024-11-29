import React, { useState, useEffect } from 'react';
import '../../../assets/css/Evaluations/Steps.css'; // CSS pour le style
import SectionA from '../sections/SectionA'; // Votre composant actuel pour la section A
import { fetchEvaluationTypes, fetchEvaluationQuestions } from '../../../services/evaluationService'; // Service pour l'API

function Step1({ notes, setNotes, employeePostId }) {
  const [evaluationTypes, setEvaluationTypes] = useState([]); // Stocker les types d'évaluation
  const [activeEvaluationType, setActiveEvaluationType] = useState(null); // Type d'évaluation actif
  const [questions, setQuestions] = useState([]); // Questions à afficher
  const [loading, setLoading] = useState(false); // Gestion du chargement des données

  // Charger les types d'évaluation depuis l'API au montage du composant
  useEffect(() => {
    const loadEvaluationTypes = async () => {
      try {
        const types = await fetchEvaluationTypes();
        setEvaluationTypes(types);
      } catch (error) {
        console.error("Erreur lors du chargement des types d'évaluation :", error);
        setEvaluationTypes([]);
      }
    };

    loadEvaluationTypes();
  }, []);

  // Gestion du clic sur un type d'évaluation
  const handleEvaluationTypeClick = async (evaluationTypeId) => {
    setActiveEvaluationType(evaluationTypeId);
    setLoading(true);
    try {
      const fetchedQuestions = await fetchEvaluationQuestions(evaluationTypeId, employeePostId);
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error("Erreur lors du chargement des questions :", error);
      setQuestions([]);
    }
    setLoading(false);
  };

  // Gestion du changement de note pour une question
  const handleNoteChange = (questionId, value) => {
    setNotes((prevNotes) => ({ ...prevNotes, [questionId]: value }));
  };

  return (
    <div className="modal-step1-container"> {/* Nom de classe spécifique pour le modal */}
      <div className="row">
        {/* Sidebar (Menu bar) */}
        <div className="col-3 modal-sidebar"> {/* Classe spécifique pour le sidebar */}
          <ul className="modal-menu-list">
            {evaluationTypes.map((type) => (
              <li
                key={type.evaluation_type_id}
                className={activeEvaluationType === type.evaluation_type_id ? 'active' : ''}
                onClick={() => handleEvaluationTypeClick(type.evaluation_type_id)}
              >
                {type.designation}
              </li>
            ))}
          </ul>
        </div>

        {/* Contenu */}
        <div className="col-9 modal-section-content"> {/* Classe spécifique pour le contenu */}
          {loading ? (
            <p>Chargement des questions...</p>
          ) : questions.length > 0 ? (
            <div>
              <h4>Questionnaire</h4>
              {questions.map((question) => (
                <div key={question.question_id} className="question">
                  <p>{question.question}</p>
                  <div className="note-selection">
                    {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
                      <label key={`${question.question_id}-${num}`}>
                        <input
                          type="radio"
                          name={`question-${question.question_id}`}
                          value={num}
                          checked={notes[question.question_id] === num}
                          onChange={() => handleNoteChange(question.question_id, num)}
                        />
                        {num}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Sélectionnez un type d'évaluation pour afficher les questions.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step1;
