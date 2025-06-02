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
    <div className="form-group">
      <label>Participants à l&apos;entretien</label>
      
      {/* Débogage */}
      <div className="debug-info mb-2 small text-muted">
        <div>targetEmployee: {targetEmployee ? `${targetEmployee.firstName || targetEmployee.FirstName} ${targetEmployee.lastName || targetEmployee.LastName} (ID: ${getValidId(targetEmployee)})` : 'Non défini'}</div>
        <div>selectedParticipants: {JSON.stringify(validSelectedParticipants)}</div>
        <div>window.selectedEmployeeForModal: {window.selectedEmployeeForModal ? 'Défini' : 'Non défini'}</div>
      </div>
      
      {/* Sélecteur de participants - Liste déroulante */}
      <div className="input-group mb-3">
        <select 
          className="form-select" 
          value={selectedParticipant}
          onChange={handleParticipantAdd}
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
      
      {/* Liste des participants sélectionnés */}
      <div className="selected-participants mt-3">
        <h6>Participants sélectionnés :</h6>
        
        <ul className="list-group">
          {/* Employé concerné (toujours affiché en premier) */}
          {targetEmployee ? (
            <li className="list-group-item list-group-item-primary d-flex justify-content-between align-items-center">
              <div>
                <strong>
                  {targetEmployee.firstName || targetEmployee.FirstName} {targetEmployee.lastName || targetEmployee.LastName}
                </strong>
                <span className="badge bg-primary ms-2">Employé évalué</span>
              </div>
            </li>
          ) : (
            <li className="list-group-item list-group-item-warning">
              Aucun employé sélectionné pour l&apos;évaluation
            </li>
          )}
          
          {/* Autres participants sélectionnés */}
          {validSelectedParticipants
            .filter(id => !targetEmployeeId || id !== targetEmployeeId)
            .map(participantId => {
              const participant = findParticipantById(participantId);
              if (!participant) return null;
              
              return (
                <li key={participantId} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    {participant.firstName || participant.FirstName} {participant.lastName || participant.LastName} {(participant.role || participant.Role) && `- ${participant.role || participant.Role}`}
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-danger" 
                    onClick={() => handleRemoveParticipant(participantId)}
                  >
                    ×
                  </button>
                </li>
              );
            })}
        </ul>
        
        {/* Information sur les participants sélectionnés */}
        <div className="mt-2">
          <small className="text-muted">
            {validSelectedParticipants.length} participant(s) sélectionné(s)
          </small>
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
