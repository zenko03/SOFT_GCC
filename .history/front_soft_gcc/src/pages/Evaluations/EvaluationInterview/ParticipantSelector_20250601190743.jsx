import { useState, useEffect } from "react";
import PropTypes from 'prop-types';

const ParticipantsSelector = ({
  participantsList,
  selectedParticipants,
  setSelectedParticipants,
  fetchedEmployee
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState('');
  
  // Fonction utilitaire pour obtenir un ID valide
  const getValidId = (participant) => {
    if (!participant) return null;
    
    // Essayer d'obtenir l'ID de différentes façons
    const id = participant.employeeId || participant.id;
    
    // S'assurer que l'ID est un nombre valide
    return id !== undefined && id !== null ? Number(id) : null;
  };
  
  // Debug avancé - log seulement en développement
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("======== DIAGNOSTIC PARTICIPANT SELECTOR ========");
      console.log("selectedParticipants:", selectedParticipants);
      console.log("fetchedEmployee:", fetchedEmployee);
      console.log("window.selectedEmployeeForModal:", window.selectedEmployeeForModal);
      
      // Informations de diagnostic supplémentaires
      if (fetchedEmployee) {
        console.log("Propriétés de fetchedEmployee:", Object.entries(fetchedEmployee));
      }
      
      if (window.selectedEmployeeForModal) {
        console.log("Propriétés de window.selectedEmployeeForModal:", Object.entries(window.selectedEmployeeForModal));
      }
      
      console.log("======== FIN DIAGNOSTIC ========");
    }
  }, [selectedParticipants, fetchedEmployee]);
  
  // Récupérer l'employé cible pour l'affichage - vérifier les deux sources
  const targetEmployee = window.selectedEmployeeForModal || fetchedEmployee;
  // Version de secours : essayer de trouver le premier participant s'il n'y a pas d'employé cible
  const targetEmployeeId = getValidId(targetEmployee);
  
  // Effet pour s'assurer que l'employé concerné est dans la liste des participants
  useEffect(() => {
    // Récupérer l'employé depuis la variable globale ou les props
    const effectiveEmployee = window.selectedEmployeeForModal || fetchedEmployee;
    
    if (effectiveEmployee) {
      console.log("ParticipantSelector - Employé cible trouvé dans useEffect:", effectiveEmployee);
      
      // Obtenir l'ID de l'employé
      const employeeId = getValidId(effectiveEmployee);
      
      if (employeeId && !selectedParticipants.includes(employeeId)) {
        console.log(`ParticipantSelector - Ajout automatique de l'employé ID ${employeeId} à la liste des participants`);
        
        // Créer une nouvelle liste avec l'employé en premier
        const updatedParticipants = [
          employeeId,
          ...selectedParticipants.filter(id => id !== employeeId && id !== null && !isNaN(id))
        ];
        
        setSelectedParticipants(updatedParticipants);
      }
    } else {
      console.warn("ParticipantSelector - Aucun employé cible trouvé pour l'ajout automatique");
    }
  }, [fetchedEmployee, selectedParticipants, setSelectedParticipants]);
  
  // Gérer l'ajout d'un participant depuis la liste déroulante
  const handleParticipantAdd = (e) => {
    const participantIdStr = e.target.value;
    if (!participantIdStr) return;
    
    const participantId = Number(participantIdStr);
    
    if (!isNaN(participantId) && !selectedParticipants.includes(participantId)) {
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
    
    // Réinitialiser la sélection
    setSelectedParticipant('');
  };
  
  // Gérer la suppression d'un participant
  const handleRemoveParticipant = (participantId) => {
    // Récupérer l'employé cible
    const effectiveEmployee = window.selectedEmployeeForModal || fetchedEmployee;
    const targetEmployeeId = getValidId(effectiveEmployee);
    
    // Empêcher la suppression de l'employé concerné
    if (targetEmployeeId && participantId === targetEmployeeId) {
      console.log("ParticipantSelector - Tentative de suppression de l'employé concerné - opération bloquée");
      return;
    }
    
    setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
  };
  
  // Trouver les détails d'un participant par son ID
  const findParticipantById = (participantId) => {
    if (isNaN(participantId)) return null;
    
    // Si c'est l'employé cible, retourner directement les données de l'employé
    if (targetEmployee && getValidId(targetEmployee) === participantId) {
      return targetEmployee;
    }
    
    return participantsList.find(p => {
      const pId = getValidId(p);
      return pId === participantId;
    });
  };
  
  // Les participants qui ne sont pas encore sélectionnés
  const availableParticipants = participantsList.filter(participant => {
    const participantId = getValidId(participant);
    return participantId !== null && !selectedParticipants.includes(participantId);
  });
  
  // Filtrer les participants sélectionnés pour éliminer les valeurs invalides
  const validSelectedParticipants = selectedParticipants.filter(id => id !== null && !isNaN(id));
  
  return (
    <div className="participants-selector">
      {/* Sélecteur de participants - Liste déroulante avec style amélioré */}
      <div className="mb-4">
        <label className="form-label d-block mb-2">Ajouter des participants</label>
        <div className="input-group">
          <span className="input-group-text">
            <i className="mdi mdi-account-plus"></i>
          </span>
          <select 
            className="form-select" 
            value={selectedParticipant}
            onChange={handleParticipantAdd}
            aria-label="Sélectionner un participant"
          >
            <option value="">Sélectionner un participant...</option>
            {availableParticipants.map(participant => {
              const participantId = getValidId(participant);
              
              // Ignorer les participants sans ID valide
              if (participantId === null) return null;
              
              // Ne pas inclure l'employé concerné dans la liste déroulante
              if (targetEmployeeId && participantId === targetEmployeeId) {
                return null;
              }
              
              return (
                <option key={participantId} value={participantId.toString()}>
                  {participant.firstName || participant.FirstName} {participant.lastName || participant.LastName} {(participant.role || participant.Role) && `- ${participant.role || participant.Role}`}
                </option>
              );
            })}
          </select>
        </div>
        <small className="form-text text-muted">
          Sélectionnez les personnes qui participeront à cet entretien
        </small>
      </div>
      
      {/* Liste des participants sélectionnés avec style amélioré */}
      <div className="selected-participants">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">
            <i className="mdi mdi-account-group me-1"></i>
            Participants ({validSelectedParticipants.length})
          </h6>
        </div>
        
        <div className="participants-list">
          {/* Employé concerné (toujours affiché en premier) */}
          {targetEmployee ? (
            <div className="participant-item primary-participant mb-2">
              <div className="card">
                <div className="card-body p-2 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="avatar me-2" style={{ 
                      width: '32px', 
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#4B89DC',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {(targetEmployee.firstName || targetEmployee.FirstName || '?').charAt(0)}
                      {(targetEmployee.lastName || targetEmployee.LastName || '').charAt(0)}
                    </div>
                    <div>
                      <div className="fw-bold">
                        {targetEmployee.firstName || targetEmployee.FirstName} {targetEmployee.lastName || targetEmployee.LastName}
                      </div>
                      <div className="text-muted small">
                        <span className="badge bg-primary">Employé évalué</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning py-2">
              <i className="mdi mdi-alert me-2"></i>
              Aucun employé sélectionné pour l&apos;évaluation
            </div>
          )}
          
          {/* Autres participants sélectionnés */}
          {validSelectedParticipants
            .filter(id => !targetEmployeeId || id !== targetEmployeeId)
            .map(participantId => {
              const participant = findParticipantById(participantId);
              if (!participant) return null;
              
              return (
                <div key={participantId} className="participant-item mb-2">
                  <div className="card">
                    <div className="card-body p-2 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <div className="avatar me-2" style={{ 
                          width: '32px', 
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: '#95a5a6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {(participant.firstName || participant.FirstName || '?').charAt(0)}
                          {(participant.lastName || participant.LastName || '').charAt(0)}
                        </div>
                        <div>
                          <div>
                            {participant.firstName || participant.FirstName} {participant.lastName || participant.LastName}
                          </div>
                          {(participant.role || participant.Role) && (
                            <div className="text-muted small">
                              {participant.role || participant.Role}
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-danger rounded-circle" 
                        onClick={() => handleRemoveParticipant(participantId)}
                        aria-label="Retirer le participant"
                      >
                        <i className="mdi mdi-close"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            
          {/* Message si aucun participant supplémentaire */}
          {validSelectedParticipants.filter(id => !targetEmployeeId || id !== targetEmployeeId).length === 0 && (
            <div className="text-center text-muted p-2 border rounded bg-light">
              <small>
                <i className="mdi mdi-information-outline me-1"></i>
                Aucun participant supplémentaire sélectionné
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ParticipantsSelector.propTypes = {
  participantsList: PropTypes.array.isRequired,
  selectedParticipants: PropTypes.array.isRequired,
  setSelectedParticipants: PropTypes.func.isRequired,
  fetchedEmployee: PropTypes.object
};

export default ParticipantsSelector;
