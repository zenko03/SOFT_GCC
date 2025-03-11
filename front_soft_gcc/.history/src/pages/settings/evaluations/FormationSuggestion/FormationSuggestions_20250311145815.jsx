import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Make sure to install axios for API calls
import Template from '../../../Template'; // Import your Template component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';

function FormationSuggestions() {
    
    const [suggestions, setSuggestions] = useState([]);
    const [currentSuggestion, setCurrentSuggestion] = useState(null);
    const [formData, setFormData] = useState({
        training: '',
        details: '',
        evaluationTypeId: 0,
        questionId: 0,
        scoreThreshold: 0,
        state: 1 // Valeur par défaut pour l'état actif
    });
    const [evaluationTypes, setEvaluationTypes] = useState([]);
    const [questions, setQuestions] = useState([]);

    // États pour les filtres
    const [filterEvaluationType, setFilterEvaluationType] = useState('');
    const [filterQuestion, setFilterQuestion] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = () => {
        fetchSuggestions();
        fetchEvaluationTypes();
        fetchQuestions();
    };

    const fetchSuggestions = async () => {
        try {
            // Vous devrez ajouter cet endpoint à votre contrôleur
            const response = await axios.get('https://localhost:7082/api/Evaluation/training-suggestions');
            setSuggestions(response.data);
        } catch (error) {
            console.error("Error fetching training suggestions:", error);
        }
    };

    const fetchEvaluationTypes = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/types');
            setEvaluationTypes(response.data);
        } catch (error) {
            console.error("Error fetching evaluation types:", error);
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/questionsAll');
            setQuestions(response.data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: ['evaluationTypeId', 'questionId', 'scoreThreshold', 'state'].includes(name)
                ? parseInt(value, 10) || 0
                : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const evaluationType = evaluationTypes.find(type => type.evaluationTypeId === parseInt(formData.evaluationTypeId));
            const question = questions.find(q => q.questiondId === parseInt(formData.questionId));

            const requestData = {
                TrainingSuggestionId: currentSuggestion?.TrainingSuggestionId || 0,
                Training: formData.training,
                Details: formData.details,
                EvaluationTypeId: parseInt(formData.evaluationTypeId),
                QuestionId: parseInt(formData.questionId),
                ScoreThreshold: parseInt(formData.scoreThreshold),
                State: parseInt(formData.state),
                evaluationType: evaluationType || {},
                evaluationQuestion: question || {}
            };

            if (currentSuggestion) {
                // Update
                // Vous devrez ajouter cet endpoint à votre contrôleur
                await axios.put(`https://localhost:7082/api/ Evaluation/training-suggestions/${currentSuggestion.TrainingSuggestionId}`, requestData);
            } else {
                // Create
                await axios.post('https://localhost:7082/api/Evaluation/create-training-suggestion', requestData);
            }

            fetchSuggestions();
            resetForm();
        } catch (error) {
            console.error("Error saving training suggestion:", error);
        }
    };

    const handleEdit = (suggestion) => {
        setCurrentSuggestion(suggestion);
        setFormData({
            training: suggestion.Training,
            details: suggestion.Details,
            evaluationTypeId: suggestion.evaluationTypeId,
            questionId: suggestion.questionId,
            scoreThreshold: suggestion.scoreThreshold,
            state: suggestion.state
        });
    };

    const handleDelete = async (id) => {
        try {
            // Vous devrez ajouter cet endpoint à votre contrôleur
            await axios.delete(`https://localhost:7082/api/Evaluation/training-suggestions/${id}`);
            fetchSuggestions();
        } catch (error) {
            console.error("Error deleting training suggestion:", error);
        }
    };

    const resetForm = () => {
        setCurrentSuggestion(null);
        setFormData({
            training: '',
            details: '',
            evaluationTypeId: 0,
            questionId: 0,
            scoreThreshold: 0,
            state: 1
        });
    };

    return (
        <Template>
            <h1>Gestion des Suggestions de Formation</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="training" value={formData.training} onChange={handleInputChange} placeholder="Formation" required />
                <input type="text" name="details" value={formData.details} onChange={handleInputChange} placeholder="Détails" required />
                <select name="evaluationTypeId" value={formData.evaluationTypeId} onChange={handleInputChange} required>
                    <option value="">Sélectionner le type d'évaluation</option>
                    {evaluationTypes.map(type => (
                        <option key={type.evaluationTypeId} value={type.evaluationTypeId}>{type.designation}</option>
                    ))}
                </select>
                <select name="questionId" value={formData.questionId} onChange={handleInputChange} required>
                    <option value="">Sélectionner la question</option>
                    {questions.map(q => (
                        <option key={q.questiondId} value={q.questiondId}>{q.question}</option>
                    ))}
                </select>
                <input type="number" name="scoreThreshold" value={formData.scoreThreshold} onChange={handleInputChange} placeholder="Seuil de score" required />
                <input type="number" name="state" value={formData.state} onChange={handleInputChange} placeholder="État" required />
                <button type="submit">{currentSuggestion ? 'Mettre à jour' : 'Créer'}</button>
                <button type="button" onClick={resetForm}>Annuler</button>
            </form>
            <h2>Suggestions de Formation</h2>
            <ul>
                {suggestions.map(suggestion => (
                    <li key={suggestion.TrainingSuggestionId}>
                        {suggestion.Training} - {suggestion.Details}
                        <button onClick={() => handleEdit(suggestion)}>Modifier</button>
                        <button onClick={() => handleDelete(suggestion.TrainingSuggestionId)}>Supprimer</button>
                    </li>
                ))}
            </ul>
            <FontAwesomeIcon icon={faSync} onClick={fetchAllData} />
        </Template>
    );
}


export default FormationSuggestions;