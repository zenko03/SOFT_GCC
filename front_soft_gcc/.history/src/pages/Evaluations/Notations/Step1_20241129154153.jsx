import React, { useState, useEffect } from 'react';
import '../../../assets/css/Evaluations/Steps.css';
import SectionA from '../sections/SectionA';
import EvaluationService from "../../../services/Evaluations/EvaluationService";

function Step1({ notes, setNotes, employeePostId }) {
  const [evaluationTypes, setEvaluationTypes] = useState([]);
  const [activeEvaluationType, setActiveEvaluationType] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employeePostId) {
      console.log("Employé sélectionné :", employeePostId);
    }
  }, [employeePostId]);

  useEffect(() => {
    const loadEvaluationTypes = async () => {
      try {
        const types = await EvaluationService.fetchEvaluationTypes();
        console.log("Types d'évaluation récupérés :", types);
        setEvaluationTypes(types);
      } catch (error) {
        console.error("Erreur lors du chargement des types d'évaluation :", error);
      }
    };

    loadEvaluationTypes();
  }, []);

  const handleEvaluationTypeClick = async (evaluationTypeId) => {
    if (!employeePostId) {
      console.error("Impossible de charger les questions : `employeePostId` est manquant.");
      return;
    }
    setActiveEvaluationType(evaluationTypeId);
    setLoading(true);
    try {
      const fetchedQuestions = await EvaluationService.fetchEvaluationQuestions(evaluationTypeId, employeePostId);
      if (Array.isArray(fetchedQuestions)) {
        setQuestions(fetchedQuestions);
      } else {
        console.error("Les questions récupérées ne sont pas valides :", fetchedQuestions);
        setQuestions([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des questions :", error);
    }
    setLoading(false);
  };

  const handleNoteChange = (questionId, value) => {
    setNotes((prevNotes) => ({ ...prevNotes, [questionId]: value }));
  };

  return (
    <div className="modal-step1-container">
      <div className="row">
        <div className="col-3 modal-sidebar">
          <ul className="modal-menu-list">
            {Array.isArray(evaluationTypes) && evaluationTypes.length > 0 ? (
              evaluationTypes.map((type) => (
                <li
                  key={type.evaluationTypeId}
                  className={activeEvaluationType === type.evaluationTypeId ? 'active' : ''}
                  onClick={() => handleEvaluationTypeClick(type.evaluationTypeId)}
                >
                  {type.designation}
                </li>
              ))
            ) : (
              <p>Aucun type d'évaluation disponible</p>
            )}
          </ul>

        </div>

        <div className="col-9 modal-section-content">
          {loading ? (
            <p>Chargement des questions...</p>
          ) : questions.length > 0 ? (
            questions.map((question) => (
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
            ))
          ) : (
            <p>Sélectionnez un type d'évaluation pour afficher les questions.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Step1;
