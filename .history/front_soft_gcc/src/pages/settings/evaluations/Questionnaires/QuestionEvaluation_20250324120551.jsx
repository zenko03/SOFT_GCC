import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Template from '../../../Template';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function QuestionEvaluation() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [formData, setFormData] = useState({ question: '', evaluationTypeId: 0, positionId: 0 });
    const [evaluationTypes, setEvaluationTypes] = useState([]);
    const [positions, setPositions] = useState([]);

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
    }, [pageNumber, pageSize]);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get(`https://localhost:7082/api/Evaluation/questions/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            setQuestions(response.data.items);
            setTotalPages(response.data.totalPages);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === "evaluationTypeId" || name === "positionId" ? parseInt(value, 10) || 0 : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const evaluationTypeId = parseInt(formData.evaluationTypeId);
            const positionId = parseInt(formData.positionId);

            const requestData = currentQuestion
                ? {
                    questiondId: currentQuestion.questiondId,
                    question: formData.question,
                    evaluationTypeId: evaluationTypeId,
                    positionId: positionId,
                    evaluationType: {
                        evaluationTypeId: evaluationTypeId,
                        designation: evaluationTypes.find(t => t.evaluationTypeId === evaluationTypeId)?.designation || ''
                    },
                    position: {
                        positionId: positionId,
                        position_name: positions.find(p => p.positionId === positionId)?.position_name || ''
                    }
                }
                : {
                    question: formData.question,
                    evaluationTypeId: evaluationTypeId,
                    positionId: positionId
                };

            console.log('Sending data to API:', requestData);

            if (currentQuestion) {
                await axios.put(`https://localhost:7082/api/Evaluation/questions/${currentQuestion.questiondId}`, requestData);
            } else {
                await axios.post('https://localhost:7082/api/Evaluation/questions', requestData);
            }

            fetchQuestions();
            setFormData({ question: '', evaluationTypeId: 0, positionId: 0 });
            setCurrentQuestion(null);
        } catch (error) {
            console.error("Error saving question:", error);
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Error details:", error.response.data);
                alert(`Error: ${error.response.data.error || "An unknown error occurred"}`);
            }
        }
    };

    const handleEdit = (question) => {
        setCurrentQuestion(question);
        setFormData({ 
            question: question.question, 
            evaluationTypeId: question.evaluationTypeId, 
            positionId: question.positionId 
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

    const handleReset = () => {
        setFormData({ question: '', evaluationTypeId: '', positionId: '' });
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

    const filteredQuestions = questions.filter(question => {
        const matchesEvaluationType = filterEvaluationType ? question.evaluationTypeId === Number(filterEvaluationType) : true;
        const matchesPosition = filterPosition ? question.positionId === Number(filterPosition) : true;
        return matchesEvaluationType && matchesPosition;
    });

    return (
        <Template>
            <div className="container mt-4">
                <h2 className="text-center mb-4">Gestion des Questions d'Évaluation</h2>
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
                            <label htmlFor="evaluationTypeId">Type d'Évaluation</label>
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
                                        {position.position_name}
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
                        onClick={handleReset}
                        className="btn btn-secondary"
                        title="Réinitialiser le formulaire"
                    >
                        <FontAwesomeIcon icon={faSync} />
                    </button>
                </form>

                <div className="mb-4">
                    <div className="form-row">
                        <div className="form-group col-md-4">
                            <label htmlFor="filterEvaluationType">Filtrer par Type d'Évaluation</label>
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
                                        {position.position_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <h3>Liste des Questions</h3>
                <ul className="list-group">
                    {filteredQuestions.map((question) => (
                        <li key={question.questiondId} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{question.question}</strong>
                                <div>Type d'Évaluation: {evaluationTypes.find(type => type.evaluationTypeId === question.evaluationTypeId)?.designation}</div>
                                <div>Position: {positions.find(position => position.positionId === question.positionId)?.position_name}</div>
                            </div>
                            <div>
                                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEdit(question)}>Modifier</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(question.questiondId)}>Supprimer</button>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="pagination mt-4">
                    <button onClick={handlePreviousPage} disabled={pageNumber === 1} className="btn btn-secondary">
                        Précédent
                    </button>
                    <span className="mx-2">Page {pageNumber} sur {totalPages}</span>
                    <button onClick={handleNextPage} disabled={pageNumber === totalPages} className="btn btn-secondary">
                        Suivant
                    </button>
                </div>
            </div>
        </Template>
    );
}

export default QuestionEvaluation;