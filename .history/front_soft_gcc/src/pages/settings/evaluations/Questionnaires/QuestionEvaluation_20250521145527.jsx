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
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    // État d'erreur et de chargement
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchQuestions(),
            fetchEvaluationTypes(),
            fetchPositions(),
            fetchCompetenceLines(),
            fetchResponseTypes()
        ])
        .finally(() => setLoading(false));
    }, [pageNumber, pageSize]);

    const fetchQuestions = async () => {
        try {
            setError(null);
            const response = await axios.get(`https://localhost:7082/api/Evaluation/questions/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            if (response.data && Array.isArray(response.data.items)) {
                setQuestions(response.data.items);
                setTotalPages(response.data.totalPages);
                console.log("Questions chargées:", response.data.items);
            } else {
                console.error("Format de données inattendu:", response.data);
                setQuestions([]);
                setError("Format de données inattendu lors du chargement des questions");
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
            setQuestions([]);
            setError("Erreur lors du chargement des questions: " + (error.response?.data?.error || error.message));
        }
    };

    const fetchEvaluationTypes = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/types');
            setEvaluationTypes(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching evaluation types:", error);
            setEvaluationTypes([]);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/postes');
            setPositions(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching positions:", error);
            setPositions([]);
        }
    };

    const fetchCompetenceLines = async () => {
        try {
            // Essayer d'abord l'endpoint standard
            const response = await axios.get('https://localhost:7082/api/Evaluation/competence-lines');
            console.log("Competence lines loaded:", response.data);
            setCompetenceLines(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching competence lines:", error);
            // Valeurs par défaut si l'API n'existe pas encore
            setCompetenceLines([]);
            
            // Essayer un autre format d'URL
            try {
                const altResponse = await axios.get('https://localhost:7082/api/CompetenceLine');
                if (altResponse.data && Array.isArray(altResponse.data)) {
                    setCompetenceLines(altResponse.data);
                }
            } catch (_ignored) {
                console.log("Alternative endpoint also failed, using empty array for competence lines");
            }
        }
    };

    const fetchResponseTypes = async () => {
        try {
            // Essayer d'abord l'endpoint standard
            const response = await axios.get('https://localhost:7082/api/Evaluation/response-types');
            console.log("Response types loaded:", response.data);
            if (response.data && Array.isArray(response.data)) {
                setResponseTypes(response.data);
            } else {
                throw new Error("Format de données inattendu");
            }
        } catch (error) {
            console.error("Error fetching response types:", error);
            // Utiliser des valeurs par défaut si l'API n'existe pas encore
            setResponseTypes([
                { ResponseTypeId: 1, TypeName: 'TEXT', Description: 'Réponse textuelle libre' },
                { ResponseTypeId: 2, TypeName: 'QCM', Description: 'Choix multiple' },
                { ResponseTypeId: 3, TypeName: 'SCORE', Description: 'Évaluation numérique' }
            ]);
            
            // Essayer un autre format d'URL
            try {
                const altResponse = await axios.get('https://localhost:7082/api/ResponseType');
                if (altResponse.data && Array.isArray(altResponse.data) && altResponse.data.length > 0) {
                    setResponseTypes(altResponse.data);
                }
            } catch (_ignored) {
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
            
            // Format exact correspondant à EvaluationQuestion.cs
            const requestData = currentQuestion
                ? {
                    // Respecter le camelCase/PascalCase exact de l'entité backend
                    questionId: currentQuestion.id || currentQuestion.questionId || currentQuestion.questiondId,
                    question: formData.question,
                    evaluationTypeId: evaluationTypeId,
                    positionId: positionId, 
                    CompetenceLineId: competenceLineId,  // PascalCase dans l'entité
                    ResponseTypeId: responseTypeId,      // PascalCase dans l'entité
                    state: formData.state || 1
                }
                : {
                    // Pour création - même structure exacte
                    question: formData.question,
                    evaluationTypeId: evaluationTypeId,
                    positionId: positionId,
                    CompetenceLineId: competenceLineId,  // PascalCase dans l'entité
                    ResponseTypeId: responseTypeId,      // PascalCase dans l'entité
                    state: formData.state || 1
                };

            console.log('Sending data to API (format exact EvaluationQuestion.cs):', requestData);

            if (currentQuestion) {
                const questionId = currentQuestion.id || currentQuestion.questionId || currentQuestion.questiondId;
                console.log(`Updating question with ID: ${questionId}`, currentQuestion);
                
                const response = await axios.put(`https://localhost:7082/api/Evaluation/questions/${questionId}`, requestData);
                console.log("Update response:", response);
            } else {
                const response = await axios.post('https://localhost:7082/api/Evaluation/questions', requestData);
                console.log("Create response:", response);
            }

            fetchQuestions();
            resetForm();
            alert('Opération réussie');
        } catch (error) {
            console.error("Error saving question:", error);
            // Affichage détaillé des erreurs pour faciliter le débogage
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Error details:", error.response.data);
                
                let errorMessage = "Une erreur s'est produite";
                if (error.response.data && error.response.data.errors) {
                    errorMessage = Object.entries(error.response.data.errors)
                        .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
                        .join('\n');
                } else if (error.response.data && error.response.data.error) {
                    errorMessage = error.response.data.error;
                }
                
                alert(`Erreur: ${errorMessage}`);
            } else {
                alert(`Erreur: ${error.message || "Une erreur inconnue s'est produite"}`);
            }
        }
    };

    const handleEdit = (question) => {
        console.log("Editing question:", question);
        setCurrentQuestion(question);
        
        // S'assurer que tous les champs sont correctement extraits
        const questionData = {
            question: question.question, 
            evaluationTypeId: question.evaluationTypeId,
            positionId: question.positionId,
            competenceLineId: question.competenceLineId || question.CompetenceLineId || null,
            responseTypeId: question.responseTypeId || question.ResponseTypeId || 1,
            state: question.state || 1
        };
        
        console.log("Setting form data for edit:", questionData);
        setFormData(questionData);
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

    // Fonction de sécurité pour filtrer les questions
    const getFilteredQuestions = () => {
        // Vérifier si questions est défini et est un tableau
        if (!Array.isArray(questions)) {
            return [];
        }

        return questions.filter(question => {
            if (!question) return false;
            
            const matchesEvaluationType = !filterEvaluationType || 
                question.evaluationTypeId === Number(filterEvaluationType);
                
            const matchesPosition = !filterPosition || 
                question.positionId === Number(filterPosition);
                
            return matchesEvaluationType && matchesPosition;
        });
    };

    // Utiliser la fonction sécurisée au lieu d'appeler directement filter
    const filteredQuestions = getFilteredQuestions();

    return (
        <Template>
            <div className="container mt-4">
                <h2 className="text-center mb-4">Gestion des Questions d&apos;Évaluation</h2>
                
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="d-flex justify-content-center my-5">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Chargement...</span>
                        </div>
                    </div>
                ) : (
                    <>
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
                                        {competenceLines.map(comp => {
                                            // Gestion unifiée des identifiants
                                            const compId = comp.CompetenceLineId !== undefined ? comp.CompetenceLineId : comp.competenceLineId;
                                            // Gestion unifiée des descriptions
                                            const description = comp.Description || comp.description || comp.competenceName || "Ligne de compétence sans description";
                                            
                                            return (
                                                <option key={compId} value={compId}>
                                                    {description}
                                                </option>
                                            );
                                        })}
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
                                        {responseTypes.map(type => {
                                            // Gestion unifiée des identifiants
                                            const typeId = type.ResponseTypeId !== undefined ? type.ResponseTypeId : type.responseTypeId;
                                            // Gestion unifiée des noms et descriptions
                                            const typeName = type.TypeName || type.typeName || "Type inconnu";
                                            const description = type.Description || type.description || "";
                                            
                                            return (
                                                <option key={typeId} value={typeId}>
                                                    {typeName}{description ? ` - ${description}` : ''}
                                                </option>
                                            );
                                        })}
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

                        <h3>Liste des Questions ({filteredQuestions.length})</h3>
                        {filteredQuestions.length === 0 ? (
                            <div className="alert alert-info">
                                Aucune question trouvée. {questions.length > 0 ? "Essayez de modifier vos filtres." : "Veuillez ajouter une nouvelle question."}
                            </div>
                        ) : (
                            <ul className="list-group">
                                {filteredQuestions.map((question) => (
                                    <li key={question.questionId || question.questiondId} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>{question.question}</strong>
                                            <div>Type d&apos;Évaluation: {evaluationTypes.find(type => type.evaluationTypeId === question.evaluationTypeId)?.designation}</div>
                                            <div>Position: {positions.find(position => position.positionId === question.positionId)?.positionName}</div>
                                            {question.competenceLineId && (
                                                <div>Compétence: {
                                                    (() => {
                                                        const competence = competenceLines.find(comp => {
                                                            const compId = comp.CompetenceLineId !== undefined ? comp.CompetenceLineId : comp.competenceLineId;
                                                            return compId === question.competenceLineId || compId === question.CompetenceLineId;
                                                        });
                                                        
                                                        if (!competence) return "Compétence inconnue";
                                                        
                                                        return competence.Description || competence.description || 
                                                               competence.competenceName || "Ligne de compétence sans description";
                                                    })()
                                                }</div>
                                            )}
                                            <div>Type de réponse: {
                                                (() => {
                                                    const respType = responseTypes.find(type => {
                                                        const typeId = type.ResponseTypeId !== undefined ? type.ResponseTypeId : type.responseTypeId;
                                                        return typeId === question.responseTypeId || typeId === question.ResponseTypeId;
                                                    });
                                                    
                                                    if (!respType) return "TEXT";
                                                    
                                                    return respType.TypeName || respType.typeName || "TEXT";
                                                })()
                                            }</div>
                                        </div>
                                        <div>
                                            <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEdit(question)}>Modifier</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(question.questionId || question.questiondId)}>Supprimer</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="pagination mt-4">
                            <button onClick={handlePreviousPage} disabled={pageNumber === 1} className="btn btn-secondary">
                                <FontAwesomeIcon icon={faChevronLeft} /> Précédent
                            </button>
                            <span className="mx-2">Page {pageNumber} sur {totalPages}</span>
                            <button onClick={handleNextPage} disabled={pageNumber === totalPages} className="btn btn-secondary">
                                Suivant <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Template>
    );
}

export default QuestionEvaluation;