/**
 * Constantes reflétant l'énumération InterviewStatus du backend
 * Ces valeurs doivent correspondre exactement à celles définies dans 
 * BACKEND/Core/Entities/Evaluations/InterviewStatus.cs
 */
export const INTERVIEW_STATUS = {
    PLANNED: 10,            // L'entretien est planifié mais pas encore commencé
    IN_PROGRESS: 20,        // L'entretien est en cours
    PENDING_VALIDATION: 25, // En attente de validation
    COMPLETED: 30,          // L'entretien est terminé avec succès
    REJECTED: 40,           // L'entretien est rejeté (par le Manager ou le Directeur)
    CANCELLED: 50           // L'entretien a été annulé
};

export default INTERVIEW_STATUS; 