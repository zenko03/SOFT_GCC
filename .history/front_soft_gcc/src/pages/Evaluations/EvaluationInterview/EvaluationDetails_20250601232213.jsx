import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../../assets/css/Evaluations/EvaluationDetails.css'; // Styles spécifiques
import axios from 'axios';
import { useUser } from '../../Authentification/UserContext';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const EvaluationDetails = ({ interview, employeeId }) => {
    const { interviewId: urlInterviewId } = useParams(); // Récupération de l'ID depuis l'URL si disponible
    const actualInterviewId = interview?.interviewId || urlInterviewId;
    const navigate = useNavigate();
    
    const [interviewDetails, setInterviewDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const { user } = useUser(); // Récupération de l'objet utilisateur
    
    // État pour le formulaire de validation
    const [validationForm, setValidationForm] = useState({
        approved: false,
        comments: ''
    });
    
    // Déterminer si l'utilisateur est manager ou directeur
    const isManager = user?.role === 'Manager' || user?.permissions?.some(p => p.name === 'VALIDATE_AS_MANAGER');
    const isDirector = user?.role === 'Director' || user?.permissions?.some(p => p.name === 'VALIDATE_AS_DIRECTOR');

    // Variable pour déterminer si l'utilisateur a déjà validé cet entretien
    const [alreadyValidated, setAlreadyValidated] = useState(false);

    useEffect(() => {
        const fetchInterviewDetails = async () => {
            if (!actualInterviewId) {
                setError("ID d'entretien manquant");
                setLoading(false);
                return;
            }

            try {
                // Utiliser l'employeeId pour des requêtes spécifiques si nécessaire
                console.log("Employé concerné ID:", employeeId);
                
                const response = await axios.get(`https://localhost:7082/api/EvaluationInterview/interview-details/${actualInterviewId}`);
                const data = response.data;
                setInterviewDetails(data);
                
                // Vérifier si l'utilisateur a déjà validé cet entretien
                if (isManager && data.managerApproval !== null) {
                    setAlreadyValidated(true);
                    setValidationForm({
                        approved: data.managerApproval,
                        comments: data.managerComments || ''
                    });
                } else if (isDirector && data.directorApproval !== null) {
                    setAlreadyValidated(true);
                    setValidationForm({
                        approved: data.directorApproval,
                        comments: data.directorComments || ''
                    });
                }
                
                // Si l'entretien a des notes au format JSON, les parser
                if (data.notes) {
                    try {
                        const parsedNotes = JSON.parse(data.notes);
                        // Associer les notes parsées aux détails de l'entretien
                        setInterviewDetails({
                            ...data,
                            parsedNotes: parsedNotes
                        });
                    } catch (e) {
                        console.error("Erreur lors du parsing des notes JSON:", e);
                    }
                }
            } catch (err) {
                setError(err.response?.data || 'Erreur lors du chargement des détails');
            } finally {
                setLoading(false);
            }
        };

        fetchInterviewDetails();
    }, [actualInterviewId, isManager, isDirector, employeeId]);

    const handleValidationChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValidationForm({
            ...validationForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleValidationSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            // Créer le payload avec les données de validation appropriées selon le rôle
            const payload = {
                notes: interviewDetails.notes, // Préserver les notes existantes
                status: 25, // PENDING_VALIDATION
            };
            
            // Ajouter les champs spécifiques selon le rôle
            if (isManager) {
                payload.managerApproval = validationForm.approved;
                payload.managerComments = validationForm.comments;
                
                // Si directeur et déjà validé par directeur, préserver ses données
                if (interviewDetails.directorApproval !== null) {
                    payload.directorApproval = interviewDetails.directorApproval;
                    payload.directorComments = interviewDetails.directorComments;
                }
            } else if (isDirector) {
                payload.directorApproval = validationForm.approved;
                payload.directorComments = validationForm.comments;
                
                // Si manager et déjà validé par manager, préserver ses données
                if (interviewDetails.managerApproval !== null) {
                    payload.managerApproval = interviewDetails.managerApproval;
                    payload.managerComments = interviewDetails.managerComments;
                }
            }
            
            // Si validation complète, mettre le statut à COMPLETED (30)
            if ((isManager && payload.managerApproval && interviewDetails.directorApproval) || 
                (isDirector && payload.directorApproval && interviewDetails.managerApproval)) {
                payload.status = 30; // COMPLETED
            }
            
            console.log("Envoi de la validation:", payload);
            
            // Utiliser l'endpoint complete-interview pour la validation
            const response = await axios.put(
                `https://localhost:7082/api/EvaluationInterview/complete-interview/${actualInterviewId}`,
                payload
            );
            
            if (response.status === 200 || response.status === 204) {
                toast.success("Validation enregistrée avec succès");
                
                // Rediriger après un court délai
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (error) {
            console.error("Erreur lors de la validation:", error);
            toast.error("Erreur lors de la validation. Veuillez réessayer.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>Chargement des détails de l&apos;entretien...</p>;
    }

    if (error) {
        return <p className="text-danger">Erreur : {error}</p>;
    }

    if (!interviewDetails) {
        return <p>Aucun détail disponible pour cet entretien.</p>;
    }

    // Fonction pour afficher les notes structurées
    const renderStructuredNotes = () => {
        const notes = interviewDetails.parsedNotes;
        if (!notes) return <p>Aucune note structurée disponible</p>;
        
        return (
            <div className="structured-notes">
                {/* Section Général */}
                {notes.general && (
                    <div className="note-section">
                        <h5>Informations générales</h5>
                        {notes.general.date && <p><strong>Date:</strong> {notes.general.date}</p>}
                        {notes.general.location && <p><strong>Lieu:</strong> {notes.general.location}</p>}
                        {notes.general.context && (
                            <div>
                                <p><strong>Contexte:</strong></p>
                                <p className="note-text">{notes.general.context}</p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Bilan précédent */}
                {notes.previousPeriod && (
                    <div className="note-section">
                        <h5>Bilan de la période précédente</h5>
                        {notes.previousPeriod.achievements && (
                            <div>
                                <p><strong>Réalisations:</strong></p>
                                <p className="note-text">{notes.previousPeriod.achievements}</p>
                            </div>
                        )}
                        {notes.previousPeriod.challenges && (
                            <div>
                                <p><strong>Défis:</strong></p>
                                <p className="note-text">{notes.previousPeriod.challenges}</p>
                            </div>
                        )}
                        {notes.previousPeriod.previousObjectivesAchieved && (
                            <div>
                                <p><strong>Objectifs atteints:</strong></p>
                                <p className="note-text">{notes.previousPeriod.previousObjectivesAchieved}</p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Objectifs */}
                {notes.objectives && notes.objectives.length > 0 && (
                    <div className="note-section">
                        <h5>Objectifs</h5>
                        <div className="objectives-list">
                            {notes.objectives.map((objective, i) => (
                                <div key={i} className="objective-item">
                                    <p><strong>Objectif {i+1}:</strong> {objective.description}</p>
                                    {objective.dueDate && <p><strong>Échéance:</strong> {objective.dueDate}</p>}
                                    {objective.indicator && <p><strong>Indicateur:</strong> {objective.indicator}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Notes globales */}
                {notes.globalNotes && (
                    <div className="note-section">
                        <h5>Notes globales</h5>
                        <p className="note-text">{notes.globalNotes}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="evaluation-details-container">
            <h2>Détails de l&apos;entretien</h2>
            
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                    <h5>Informations générales</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <p><strong>Date de l&apos;entretien :</strong> {interviewDetails.interviewDate ? new Date(interviewDetails.interviewDate).toLocaleDateString() : "Non spécifiée"}</p>
                            <p><strong>Statut :</strong> {
                                interviewDetails.status === 10 ? "Planifié" :
                                interviewDetails.status === 20 ? "En cours" :
                                interviewDetails.status === 25 ? "En attente de validation" :
                                interviewDetails.status === 30 ? "Complété" :
                                interviewDetails.status === 40 ? "Rejeté" :
                                interviewDetails.status === 50 ? "Annulé" : "Inconnu"
                            }</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Validation manager :</strong> {
                                interviewDetails.managerApproval === null ? "En attente" : 
                                interviewDetails.managerApproval ? "Approuvé" : "Rejeté"
                            }</p>
                            <p><strong>Validation directeur :</strong> {
                                interviewDetails.directorApproval === null ? "En attente" : 
                                interviewDetails.directorApproval ? "Approuvé" : "Rejeté"
                            }</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Affichage des notes structurées */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                    <h5>Compte-rendu de l&apos;entretien</h5>
                </div>
                <div className="card-body">
                    {renderStructuredNotes()}
                </div>
            </div>
            
            {/* Formulaire de validation pour Manager/Directeur */}
            {(isManager || isDirector) && (
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h5>Validation de l&apos;entretien {isManager ? "(Manager)" : "(Directeur)"}</h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleValidationSubmit}>
                            <div className="form-group mb-3">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="approvalCheck"
                                        name="approved"
                                        checked={validationForm.approved}
                                        onChange={handleValidationChange}
                                    />
                                    <label className="form-check-label" htmlFor="approvalCheck">
                                        J&apos;approuve cet entretien d&apos;évaluation
                                    </label>
                                </div>
                            </div>
                            
                            <div className="form-group mb-4">
                                <label htmlFor="validationComments">Commentaires</label>
                                <textarea
                                    className="form-control"
                                    id="validationComments"
                                    name="comments"
                                    rows="4"
                                    value={validationForm.comments}
                                    onChange={handleValidationChange}
                                    placeholder="Ajoutez vos commentaires concernant cet entretien d'évaluation"
                                ></textarea>
                            </div>
                            
                            <div className="d-flex justify-content-end">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <span>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Enregistrement...
                                        </span>
                                    ) : (
                                        "Enregistrer ma validation"
                                    )}
                                </button>
                            </div>
                            
                            {alreadyValidated && (
                                <div className="alert alert-info mt-3">
                                    <i className="mdi mdi-information-outline me-2"></i>
                                    Vous avez déjà validé cet entretien. Vos modifications écraseront votre précédente validation.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
            
            {/* Commentaires existants */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-light">
                    <h5>Commentaires</h5>
                </div>
                <div className="card-body">
                    <div className="existing-comments">
                        {interviewDetails.managerComments && (
                            <div className="comment-block">
                                <p><strong>Commentaires du manager:</strong></p>
                                <p className="comment-text">{interviewDetails.managerComments}</p>
                            </div>
                        )}
                        
                        {interviewDetails.directorComments && (
                            <div className="comment-block">
                                <p><strong>Commentaires du directeur:</strong></p>
                                <p className="comment-text">{interviewDetails.directorComments}</p>
                            </div>
                        )}
                        
                        {!interviewDetails.managerComments && !interviewDetails.directorComments && (
                            <p className="text-muted">Aucun commentaire ajouté</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

EvaluationDetails.propTypes = {
    interview: PropTypes.object,
    employeeId: PropTypes.number
};

export default EvaluationDetails;
