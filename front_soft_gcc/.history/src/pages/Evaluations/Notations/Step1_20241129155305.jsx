import React, { useState } from 'react';
import '../../../assets/css/Evaluations/Steps.css'; // CSS pour le style
import SectionA from '../sections/SectionA'; // Votre composant actuel pour la section A

function Step1({ notes, setNotes, employeePostId }) {
  // Données statiques pour les types d'évaluation
  const staticEvaluationTypes = [
    { evaluation_type_id: 1, designation: 'Évaluation par compétences' },
    { evaluation_type_id: 2, designation: 'Évaluation de performance' },
    { evaluation_type_id: 3, designation: 'Évaluation générale' },
  ];

  // Données statiques pour les questions (dépendant du type d'évaluation)
  const staticQuestions = {
    1: [
      { question_id: 101, question: 'Compétence technique' },
      { question_id: 102, question: 'Communication' },
    ],
    2: [
      { question_id: 201, question: 'Productivité' },
      { question_id: 202, question: 'Respect des délais' },
    ],
    3: [
      { question_id: 301, question: 'Collaboration' },
      { question_id: 302, question: 'Initiative' },
    ],
  };

  // État du composant
  const [evaluationTypes] = useState(staticEvaluationTypes); // Utilisation des données statiques
  const [activeEvaluationType, setActiveEvaluationType] = useState(null); // Type d'évaluation actif
  const [questions, setQuestions] = useState([]); // Questions à afficher

  // Gestion du clic sur un type d'évaluation
  const handleEvaluationTypeClick = (evaluationTypeId) => {
    setActiveEvaluationType(evaluationTypeId);
    setQuestions(staticQuestions[evaluationTypeId] || []);
  };

  // Gestion du changement de note pour une question
  const handleNoteChange = (questionId, value) => {
    setNotes((prevNotes) => ({ ...prevNotes, [questionId]: value }));
  };

  return (
    <div className="modal-step1-container">
      <div className="row">
        {/* Sidebar (Menu bar) */}
        <div className="col-3 modal-sidebar">
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
        <div className="col-9 modal-section-content">
          {questions.length > 0 ? (
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
