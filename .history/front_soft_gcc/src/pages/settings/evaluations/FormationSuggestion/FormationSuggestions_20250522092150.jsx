import { useEffect, useState } from 'react';
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
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

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
            console.log("Données de suggestions reçues:", response.data.items);
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
            console.log("Structure des questions:", response.data && response.data.length > 0 ? response.data[0] : "Aucune question disponible");
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

            if (currentSuggestion) {
                // Récupérer l'ID avec la bonne casse (TrainingSuggestionId)
                const id = currentSuggestion.TrainingSuggestionId !== undefined 
                    ? currentSuggestion.TrainingSuggestionId 
                    : currentSuggestion.trainingSuggestionId;
                
                console.log("ID de la suggestion à mettre à jour:", id);
                
                if (!id && id !== 0) {
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
        
        // Récupérer l'identifiant de la question selon les différentes nomenclatures possibles
        const questionIdFromSuggestion = suggestion.questiondId || suggestion.QuestiondId || suggestion.questionId || suggestion.QuestionId || 0;
        
        // Vérifier si cette question existe dans notre liste de questions
        const matchingQuestion = questions.find(q => (q.questiondId || q.QuestiondId || q.questionId || q.QuestionId) === questionIdFromSuggestion);
        console.log("ID de question à rechercher:", questionIdFromSuggestion);
        console.log("Question correspondante trouvée:", matchingQuestion ? "Oui" : "Non");
        
        setFormData({
            training: suggestion.training || suggestion.Training || '',
            details: suggestion.details || suggestion.Details || '',
            evaluationTypeId: suggestion.evaluationTypeId || suggestion.EvaluationTypeId || 0,
            questionId: questionIdFromSuggestion,
            scoreThreshold: suggestion.scoreThreshold || suggestion.ScoreThreshold || 0,
            state: suggestion.state || suggestion.State || 1
        });
    };

    const handleDelete = async (id) => {
        try {
            // S'assurer que l'ID est un nombre valide
            const suggestionId = parseInt(id, 10);
            if (isNaN(suggestionId)) {
                console.error("ID de suggestion non valide");
                return;
            }
            
            await axios.delete(`https://localhost:7082/api/Evaluation/training-suggestions/${suggestionId}`);
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
                            <label htmlFor="evaluationTypeId">Type d&apos;Évaluation</label>
                            <select
                                name="evaluationTypeId"
                                value={formData.evaluationTypeId}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                <option value="">Sélectionner le type d&apos;évaluation</option>
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
                        <li key={suggestion.TrainingSuggestionId || suggestion.trainingSuggestionId} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{suggestion.Training || suggestion.training}</strong> - {suggestion.Details || suggestion.details}
                            </div>
                            <div>
                                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEdit(suggestion)}>
                                    <FontAwesomeIcon icon={faEdit} /> Modifier
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(suggestion.TrainingSuggestionId || suggestion.trainingSuggestionId)}>
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