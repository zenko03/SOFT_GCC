import { useState, useEffect } from "react";
import PropTypes from 'prop-types';

const ParticipantsSelector = ({
  participantsList,
  selectedParticipants,
  setSelectedParticipants,
  fetchedEmployee
}) => {
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState('');

  console.log("ParticipantSelector - Props reçues:", { 
    participantsListLength: participantsList?.length,
    selectedParticipantsLength: selectedParticipants?.length,
    fetchedEmployee 
  });

  // Récupérer l'employé sélectionné via le fetchedEmployee
  useEffect(() => {
    console.log("ParticipantSelector - fetchedEmployee changé:", fetchedEmployee);
    
    if (fetchedEmployee) {
      console.log("ParticipantSelector - propriétés disponibles:", Object.keys(fetchedEmployee));
      
      // Normaliser l'employé pour gérer les différences de casse dans les propriétés
      const employeeId = Number(fetchedEmployee.employeeId || fetchedEmployee.EmployeeId);
      const firstName = fetchedEmployee.firstName || fetchedEmployee.FirstName;
      const lastName = fetchedEmployee.lastName || fetchedEmployee.LastName;
      
      console.log(`ParticipantSelector - employé trouvé: ${firstName} ${lastName} (ID: ${employeeId})`);
      
      // Créer un objet employé normalisé
      const normalizedEmployee = {
        employeeId: employeeId,
        firstName: firstName,
        lastName: lastName,
        position: fetchedEmployee.position || fetchedEmployee.Position,
        department: fetchedEmployee.department || fetchedEmployee.Department
      };
      
      setCurrentEmployee(normalizedEmployee);
      
      // S'assurer que l'employé concerné est bien dans la liste des participants
      if (employeeId && !selectedParticipants.includes(employeeId)) {
        console.log("ParticipantSelector - Ajout automatique de l'employé évalué dans les participants");
        setSelectedParticipants([employeeId, ...selectedParticipants]);
      }
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
    // Empêcher la désélection de l'employé concerné
    if (currentEmployee && participantId === Number(currentEmployee.employeeId)) {
      return;
    }
    
    setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
  };

  // Trouver les détails d'un participant par son ID
  const findParticipantById = (participantId) => {
    return participantsList.find(p => {
      // Gérer les différentes possibilités de nommage pour l'ID
      const pId = Number(p.employeeId || p.EmployeeId || p.id || p.Id);
      return pId === participantId;
    });
  };

  // Les participants qui ne sont pas encore sélectionnés
  const availableParticipants = participantsList.filter(participant => {
    // Gérer les différentes possibilités de nommage pour l'ID
    const participantId = Number(participant.employeeId || participant.EmployeeId || participant.id || participant.Id);
    return !selectedParticipants.includes(participantId);
  });

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
            const participantId = Number(participant.employeeId || participant.EmployeeId || participant.id || participant.Id);
            
            // Ne pas inclure l'employé concerné dans la liste déroulante
            if (currentEmployee && participantId === Number(currentEmployee.employeeId)) {
              return null;
            }
            
            return (
              <option key={participantId} value={participantId}>
                {participant.firstName || participant.FirstName} {participant.lastName || participant.LastName} {(participant.role || participant.Role) && `- ${participant.role || participant.Role}`}
              </option>
            );
          })}
        </select>
      </div>
      
      {/* Liste des participants sélectionnés */}
      <div className="selected-participants mt-3">
        <h6>Participants sélectionnés :</h6>
        
        {/* Débogage - utiliser une approche différente pour éviter l'erreur linter */}
        <div className="debug-info mb-2 small text-muted">
          <div>currentEmployee: {currentEmployee ? `${currentEmployee.firstName} ${currentEmployee.lastName} (ID: ${currentEmployee.employeeId})` : 'Non défini'}</div>
          <div>selectedParticipants: {JSON.stringify(selectedParticipants)}</div>
        </div>
        
        <ul className="list-group">
          {/* Employé concerné (toujours affiché en premier) */}
          {fetchedEmployee ? (
            <li className="list-group-item list-group-item-primary d-flex justify-content-between align-items-center">
              <div>
                <strong>
                  {fetchedEmployee.firstName || fetchedEmployee.FirstName} {fetchedEmployee.lastName || fetchedEmployee.LastName}
                </strong>
                <span className="badge bg-primary ms-2">Employé évalué</span>
              </div>
            </li>
          ) : currentEmployee ? (
            <li className="list-group-item list-group-item-primary d-flex justify-content-between align-items-center">
              <div>
                <strong>{currentEmployee.firstName} {currentEmployee.lastName}</strong>
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
            .filter(id => !currentEmployee || id !== Number(currentEmployee?.employeeId))
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
  fetchedEmployee: PropTypes.object,
};

export default ParticipantsSelector;
