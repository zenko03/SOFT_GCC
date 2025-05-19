import { useState, useEffect } from "react";
import PropTypes from 'prop-types';

const ParticipantsSelector = ({
  participantsList,
  selectedParticipants,
  setSelectedParticipants,
  fetchedEmployee
}) => {
  const [selectedParticipant, setSelectedParticipant] = useState('');
  
  // Effet pour s'assurer que l'employé concerné est dans la liste des participants
  useEffect(() => {
    // Récupérer l'employé depuis la variable globale ou les props
    const targetEmployee = window.selectedEmployeeForModal || fetchedEmployee;
    
    if (targetEmployee) {
      console.log("ParticipantSelector - Employé cible trouvé:", targetEmployee);
      
      // Obtenir l'ID de l'employé
      const employeeId = Number(targetEmployee.employeeId);
      
      if (employeeId && !selectedParticipants.includes(employeeId)) {
        console.log(`ParticipantSelector - Ajout automatique de l'employé ID ${employeeId} à la liste des participants`);
        
        // Créer une nouvelle liste avec l'employé en premier
        const updatedParticipants = [
          employeeId,
          ...selectedParticipants.filter(id => id !== employeeId)
        ];
        
        setSelectedParticipants(updatedParticipants);
      }
    } else {
      console.warn("ParticipantSelector - Aucun employé cible trouvé pour l'ajout automatique");
    }
  }, [fetchedEmployee, selectedParticipants, setSelectedParticipants]);

  // Gérer l'ajout d'un participant depuis la liste déroulante
  const handleParticipantAdd = (e) => {
    const participantId = Number(e.target.value);
    
    if (participantId && !selectedParticipants.includes(participantId)) {
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
    
    // Réinitialiser la sélection
    setSelectedParticipant('');
  };
  
  // Gérer la suppression d'un participant
  const handleRemoveParticipant = (participantId) => {
    // Récupérer l'employé cible
    const targetEmployee = window.selectedEmployeeForModal || fetchedEmployee;
    const targetEmployeeId = targetEmployee ? Number(targetEmployee.employeeId) : null;
    
    // Empêcher la suppression de l'employé concerné
    if (targetEmployeeId && participantId === targetEmployeeId) {
      console.log("ParticipantSelector - Tentative de suppression de l'employé concerné - opération bloquée");
      return;
    }
    
    setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
  };

  // Trouver les détails d'un participant par son ID
  const findParticipantById = (participantId) => {
    return participantsList.find(p => Number(p.employeeId) === participantId);
  };

  // Les participants qui ne sont pas encore sélectionnés
  const availableParticipants = participantsList.filter(participant => {
    const participantId = Number(participant.employeeId);
    return !selectedParticipants.includes(participantId);
  });

  // Récupérer l'employé cible pour l'affichage
  const targetEmployee = window.selectedEmployeeForModal || fetchedEmployee;
  const targetEmployeeId = targetEmployee ? Number(targetEmployee.employeeId) : null;

  return (
    <div className="form-group">
      <label>Participants à l&apos;entretien</label>
      
      {/* Sélecteur de participants - Liste déroulante */}
      <div className="input-group mb-3">
        <select 
          className="form-select" 
          value={selectedParticipant}
          onChange={handleParticipantAdd}
        >
          <option value="">Sélectionner un participant...</option>
          {availableParticipants.map(participant => {
            const participantId = Number(participant.employeeId);
            
            // Ne pas inclure l'employé concerné dans la liste déroulante
            if (targetEmployeeId && participantId === targetEmployeeId) {
              return null;
            }
            
            return (
              <option key={participantId} value={participantId}>
                {participant.firstName} {participant.lastName} {participant.role && `- ${participant.role}`}
              </option>
            );
          })}
        </select>
      </div>
      
      {/* Liste des participants sélectionnés */}
      <div className="selected-participants mt-3">
        <h6>Participants sélectionnés :</h6>
        
        {/* Débogage */}
        <div className="debug-info mb-2 small text-muted">
          <div>targetEmployee: {targetEmployee ? `${targetEmployee.firstName} ${targetEmployee.lastName} (ID: ${targetEmployee.employeeId})` : 'Non défini'}</div>
          <div>selectedParticipants: {JSON.stringify(selectedParticipants)}</div>
        </div>
        
        <ul className="list-group">
          {/* Employé concerné (toujours affiché en premier) */}
          {targetEmployee ? (
            <li className="list-group-item list-group-item-primary d-flex justify-content-between align-items-center">
              <div>
                <strong>
                  {targetEmployee.firstName} {targetEmployee.lastName}
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
          {selectedParticipants
            .filter(id => !targetEmployeeId || id !== targetEmployeeId)
            .map(participantId => {
              const participant = findParticipantById(participantId);
              if (!participant) return null;
              
              return (
                <li key={participantId} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    {participant.firstName} {participant.lastName} {participant.role && `- ${participant.role}`}
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
            {selectedParticipants.length} participant(s) sélectionné(s)
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
