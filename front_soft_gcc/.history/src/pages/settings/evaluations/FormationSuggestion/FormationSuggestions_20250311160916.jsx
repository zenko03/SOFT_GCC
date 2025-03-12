import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Template from '../../../Template';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faEdit, faTrash, faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function FormationSuggestions() {

    const [suggestions, setSuggestions] = useState([]);
    const [currentSuggestion, setCurrentSuggestion] = useState(null);
    const [formData, setFormData] = useState({
        training: '',
        details: '',
        evaluationTypeId: 0,
        questionId: 0,
        scoreThreshold: 0,
        state: 1
    });
    const [evaluationTypes, setEvaluationTypes] = useState([]);
    const [questions, setQuestions] = useState([]);


    // Pagination states
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    // États pour les filtres
    const [filterEvaluationType, setFilterEvaluationType] = useState('');
    const [filterQuestion, setFilterQuestion] = useState('');

    useEffect(() => {
        fetchAllData();
    }, [pageNumber, pageSize]);


    const fetchAllData = () => {
        fetchSuggestions();
        fetchEvaluationTypes();
        fetchQuestions();
    };

    const fetchSuggestions = async () => {
        try {
            const response = await axios.get(`https://localhost:7082/api/Evaluation/training-suggestions/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            setSuggestions(response.data.items);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching training suggestions:", error);
        }
    };


    const handleNextPage = () => {
        if (pageNumber < totalPages) {
            setPageNumber(prev => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(prev => prev - 1);
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
                TrainingSuggestionId: currentSuggestion?.trainingSuggestionId || currentSuggestion?.TrainingSuggestionId || 0,
                Training: formData.training,
                Details: formData.details,
                EvaluationTypeId: parseInt(formData.evaluationTypeId),
                QuestionId: parseInt(formData.questionId),
                ScoreThreshold: parseInt(formData.scoreThreshold),
                State: parseInt(formData.state),
                evaluationType: evaluationType || {},
                evaluationQuestion: question || {}
            };

            console.log("Données envoyées:", requestData);
            console.log("Current suggestion:", currentSuggestion);

            if (currentSuggestion) {
                const id = currentSuggestion.trainingSuggestionId || currentSuggestion.TrainingSuggestionId;
                if (!id) {
                    throw new Error("ID de suggestion non valide");
                }
                // Update
                await axios.put(`https://localhost:7082/api/Evaluation/training-suggestions/${id}`, requestData);
            } else {
                // Create
                await axios.post('https://localhost:7082/api/Evaluation/create-training-suggestion', requestData);
            }

            fetchSuggestions();
            resetForm();
        } catch (error) {
            console.error("Error saving training suggestion:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
            }
        }
    };

    const handleEdit = (suggestion) => {
        console.log("Suggestion à éditer:", suggestion);
        setCurrentSuggestion(suggestion);
        setFormData({
            training: suggestion.training || suggestion.Training || '',
            details: suggestion.details || suggestion.Details || '',
            evaluationTypeId: suggestion.evaluationTypeId || 0,
            questionId: suggestion.questionId || 0,
            scoreThreshold: suggestion.scoreThreshold || 0,
            state: suggestion.state
        });
    };

    const handleDelete = async (id) => {
        try {
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
            <div className="container mt-4">
                <h1 className="text-center mb-4">Gestion des Suggestions de Formation</h1>
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="training">Formation</label>
                            <input
                                type="text"
                                name="training"
                                value={formData.training}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="Entrez le nom de la formation"
                                required
                            />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="details">Détails</label>
                            <input
                                type="text"
                                name="details"
                                value={formData.details}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="Entrez les détails"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="evaluationTypeId">Type d'Évaluation</label>
                            <select
                                name="evaluationTypeId"
                                value={formData.evaluationTypeId}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                <option value="">Sélectionner le type d'évaluation</option>
                                {evaluationTypes.map(type => (
                                    <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
                                        {type.designation}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="questionId">Question</label>
                            <select
                                name="questionId"
                                value={formData.questionId}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                <option value="">Sélectionner la question</option>
                                {questions.map(q => (
                                    <option key={q.questiondId} value={q.questiondId}>
                                        {q.question}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="scoreThreshold">Seuil de score</label>
                            <input
                                type="number"
                                name="scoreThreshold"
                                value={formData.scoreThreshold}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="Entrez le seuil de score"
                                required
                            />
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="state">État</label>
                            <input
                                type="number"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="Entrez l'état"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        {currentSuggestion ? 'Mettre à jour' : 'Créer'}
                    </button>
                    <button type="button" onClick={resetForm} className="btn btn-secondary ml-2">
                        <FontAwesomeIcon icon={faTimes} /> Annuler
                    </button>
                </form>
                <h2>Suggestions de Formation</h2>
                <ul className="list-group">
                    {suggestions.map(suggestion => (
                        <li key={suggestion.TrainingSuggestionId} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{suggestion.training}</strong> - {suggestion.details}
                            </div>
                            <div>
                                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEdit(suggestion)}>
                                    <FontAwesomeIcon icon={faEdit} /> Modifier
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(suggestion.TrainingSuggestionId)}>
                                    <FontAwesomeIcon icon={faTrash} /> Supprimer
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="pagination mt-4">
                    <button onClick={handlePreviousPage} disabled={pageNumber === 1} className="btn btn-secondary">
                        <FontAwesomeIcon icon={faChevronLeft} /> Précédent
                    </button>
                    <span className="mx-2">Page {pageNumber} sur {totalPages}</span>
                    <button onClick={handleNextPage} disabled={pageNumber === totalPages} className="btn btn-secondary">
                        Suivant <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
                <div className="mt-4">
                    <FontAwesomeIcon icon={faSync} onClick={fetchAllData} className="cursor-pointer" title="Rafraîchir les suggestions" />
                </div>
            </div>
        </Template>
    );
}

export default FormationSuggestions;