import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Template from '../../../Template';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function QuestionEvaluation() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [formData, setFormData] = useState({ 
        question: '', 
        evaluationTypeId: 0, 
        positionId: 0,
        competenceLineId: null,
        responseTypeId: 1, // Valeur par défaut (TEXT)
        state: 1
    });
    const [evaluationTypes, setEvaluationTypes] = useState([]);
    const [positions, setPositions] = useState([]);
    const [competenceLines, setCompetenceLines] = useState([]);
    const [responseTypes, setResponseTypes] = useState([]);

    // États pour les filtres
    const [filterEvaluationType, setFilterEvaluationType] = useState('');
    const [filterPosition, setFilterPosition] = useState('');

    // Pagination states
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchQuestions();
        fetchEvaluationTypes();
        fetchPositions();
        fetchCompetenceLines();
        fetchResponseTypes();
    }, [pageNumber, pageSize]);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get(`https://localhost:7082/api/Evaluation/questions/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            setQuestions(response.data.items);
            setTotalPages(response.data.totalPages);
            console.log("Questions chargées:", response.data.items);
        } catch (error) {
            console.error("Error fetching questions:", error);
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

    const fetchPositions = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/postes');
            setPositions(response.data);
        } catch (error) {
            console.error("Error fetching positions:", error);
        }
    };

    const fetchCompetenceLines = async () => {
        try {
            // Essayer d'abord l'endpoint standard
            const response = await axios.get('https://localhost:7082/api/Evaluation/competence-lines');
            setCompetenceLines(response.data);
        } catch (error) {
            console.error("Error fetching competence lines:", error);
            // Valeurs par défaut si l'API n'existe pas encore
            setCompetenceLines([]);
            
            // Essayer un autre format d'URL
            try {
                const altResponse = await axios.get('https://localhost:7082/api/CompetenceLine');
                setCompetenceLines(altResponse.data);
            } catch (altError) {
                console.log("Alternative endpoint also failed, using empty array for competence lines");
            }
        }
    };

    const fetchResponseTypes = async () => {
        try {
            // Essayer d'abord l'endpoint standard
            const response = await axios.get('https://localhost:7082/api/Evaluation/response-types');
            setResponseTypes(response.data);
        } catch (error) {
            console.error("Error fetching response types:", error);
            // Utiliser des valeurs par défaut si l'API n'existe pas encore
            setResponseTypes([
                { responseTypeId: 1, typeName: 'TEXT', description: 'Réponse textuelle libre' },
                { responseTypeId: 2, typeName: 'QCM', description: 'Choix multiple' },
                { responseTypeId: 3, typeName: 'SCORE', description: 'Évaluation numérique' }
            ]);
            
            // Essayer un autre format d'URL
            try {
                const altResponse = await axios.get('https://localhost:7082/api/ResponseType');
                if (altResponse.data && altResponse.data.length > 0) {
                    setResponseTypes(altResponse.data);
                }
            } catch (altError) {
                console.log("Alternative endpoint also failed, using default values for response types");
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (['evaluationTypeId', 'positionId', 'responseTypeId'].includes(name)) {
            setFormData({ ...formData, [name]: parseInt(value, 10) || 0 });
        } else if (name === 'competenceLineId') {
            setFormData({ ...formData, [name]: value ? parseInt(value, 10) : null });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // S'assurer que tous les IDs sont correctement parsés
            const evaluationTypeId = parseInt(formData.evaluationTypeId);
            const positionId = parseInt(formData.positionId);
            const responseTypeId = parseInt(formData.responseTypeId) || 1;
            const competenceLineId = formData.competenceLineId !== null ? parseInt(formData.competenceLineId) : null;
            
            // Créer l'objet à envoyer
            const requestData = currentQuestion
                ? {
                    // Pour mise à jour, utiliser l'ID existant (Question_id en base de données)
                    questionId: currentQuestion.questionId || currentQuestion.questiondId,
                    question: formData.question,
                    evaluationTypeId: evaluationTypeId,
                    positionId: positionId,
                    competenceLineId: competenceLineId,
                    responseTypeId: responseTypeId,
                    state: formData.state || 1
                }
                : {
                    // Pour création
                    question: formData.question,
                    evaluationTypeId: evaluationTypeId,
                    positionId: positionId,
                    competenceLineId: competenceLineId,
                    responseTypeId: responseTypeId,
                    state: formData.state || 1
                };

            console.log('Sending data to API:', requestData);

            if (currentQuestion) {
                const questionId = currentQuestion.questionId || currentQuestion.questiondId;
                await axios.put(`https://localhost:7082/api/Evaluation/questions/${questionId}`, requestData);
            } else {
                await axios.post('https://localhost:7082/api/Evaluation/questions', requestData);
            }

            fetchQuestions();
            resetForm();
        } catch (error) {
            console.error("Error saving question:", error);
            // Enhanced error logging
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Error details:", error.response.data);
                alert(`Erreur: ${error.response.data.error || "Une erreur inconnue s'est produite"}`);
            }
        }
    };

    const handleEdit = (question) => {
        console.log("Editing question:", question);
        setCurrentQuestion(question);
        setFormData({ 
            question: question.question, 
            evaluationTypeId: question.evaluationTypeId, 
            positionId: question.positionId,
            competenceLineId: question.competenceLineId,
            responseTypeId: question.responseTypeId || 1,
            state: question.state || 1
        });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://localhost:7082/api/Evaluation/questions/${id}`);
            fetchQuestions();
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    const resetForm = () => {
        setFormData({ 
            question: '', 
            evaluationTypeId: 0, 
            positionId: 0,
            competenceLineId: null,
            responseTypeId: 1,
            state: 1
        });
        setCurrentQuestion(null);
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

    const filteredQuestions = (questions || []).filter(question => {
        const matchesEvaluationType = filterEvaluationType ? question.evaluationTypeId === Number(filterEvaluationType) : true;
        const matchesPosition = filterPosition ? question.positionId === Number(filterPosition) : true;
        return matchesEvaluationType && matchesPosition;
    });

    return (
        <Template>
            <div className="container mt-4">
                <h2 className="text-center mb-4">Gestion des Questions d&apos;Évaluation</h2>
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="question">Question</label>
                            <input
                                type="text"
                                name="question"
                                value={formData.question}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="Entrez la question"
                                required
                            />
                        </div>
                        <div className="form-group col-md-3">
                            <label htmlFor="evaluationTypeId">Type d&apos;Évaluation</label>
                            <select
                                name="evaluationTypeId"
                                value={formData.evaluationTypeId}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                <option value="">Sélectionnez un type</option>
                                {evaluationTypes.map(type => (
                                    <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
                                        {type.designation}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group col-md-3">
                            <label htmlFor="positionId">Position</label>
                            <select
                                name="positionId"
                                value={formData.positionId}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                <option value="">Sélectionnez une position</option>
                                {positions.map(position => (
                                    <option key={position.positionId} value={position.positionId}>
                                        {position.positionName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="competenceLineId">Ligne de Compétence (optionnel)</label>
                            <select
                                name="competenceLineId"
                                value={formData.competenceLineId || ''}
                                onChange={handleInputChange}
                                className="form-control"
                            >
                                <option value="">Aucune</option>
                                {competenceLines.map(comp => (
                                    <option key={comp.competenceLineId} value={comp.competenceLineId}>
                                        {comp.competenceName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group col-md-6">
                            <label htmlFor="responseTypeId">Type de Réponse</label>
                            <select
                                name="responseTypeId"
                                value={formData.responseTypeId}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                {responseTypes.map(type => (
                                    <option key={type.responseTypeId} value={type.responseTypeId}>
                                        {type.typeName} - {type.description}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        {currentQuestion ? 'Mettre à jour la question' : 'Ajouter une question'}
                    </button>
                    <button
                        type="button"
                        onClick={resetForm}
                        className="btn btn-secondary ml-2"
                        title="Réinitialiser le formulaire"
                    >
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                </form>

                <div className="mb-4">
                    <div className="form-row">
                        <div className="form-group col-md-4">
                            <label htmlFor="filterEvaluationType">Filtrer par Type d&apos;Évaluation</label>
                            <select
                                id="filterEvaluationType"
                                value={filterEvaluationType}
                                onChange={(e) => setFilterEvaluationType(e.target.value)}
                                className="form-control"
                            >
                                <option value="">Tous</option>
                                {evaluationTypes.map(type => (
                                    <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
                                        {type.designation}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group col-md-4">
                            <label htmlFor="filterPosition">Filtrer par Position</label>
                            <select
                                id="filterPosition"
                                value={filterPosition}
                                onChange={(e) => setFilterPosition(e.target.value)}
                                className="form-control"
                            >
                                <option value="">Tous</option>
                                {positions.map(position => (
                                    <option key={position.positionId} value={position.positionId}>
                                        {position.positionName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <h3>Liste des Questions</h3>
                <ul className="list-group">
                    {filteredQuestions.map((question) => (
                        <li key={question.questionId || question.questiondId} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{question.question}</strong>
                                <div>Type d&apos;Évaluation: {evaluationTypes.find(type => type.evaluationTypeId === question.evaluationTypeId)?.designation}</div>
                                <div>Position: {positions.find(position => position.positionId === question.positionId)?.positionName}</div>
                                {question.competenceLineId && (
                                    <div>Compétence: {competenceLines.find(comp => comp.competenceLineId === question.competenceLineId)?.competenceName}</div>
                                )}
                                <div>Type de réponse: {responseTypes.find(type => type.responseTypeId === question.responseTypeId)?.typeName || 'TEXT'}</div>
                            </div>
                            <div>
                                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEdit(question)}>Modifier</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(question.questionId || question.questiondId)}>Supprimer</button>
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
            </div>
        </Template>
    );
}

export default QuestionEvaluation;