import React from "react";
import PropTypes from "prop-types";

const ParticipantsSelector = ({
  participantsList,
  selectedParticipants,
  setSelectedParticipants,
  fetchedEmployee,
}) => {
  const [currentEmployee, setCurrentEmployee] = React.useState(null);

  // Récupérer l'employé sélectionné via le fetchedEmployee
  React.useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (fetchedEmployee) {
        setCurrentEmployee(fetchedEmployee);
      }
    };

    fetchEmployeeDetails();
  }, [fetchedEmployee]);

  // Gestion de la sélection d'un participant
  const handleParticipantSelection = (participantId) => {
    const id = participantId ? participantId : null;

    if (id && !selectedParticipants.includes(id)) {
      setSelectedParticipants([...selectedParticipants, id]);
    } else if (id && selectedParticipants.includes(id)) {
      // Si le participant est déjà sélectionné, on le retire
      // sauf s'il s'agit de l'employé évalué
      if (id === Number(currentEmployee?.employeeId)) {
        return; // Empêche la suppression de l'employé sélectionné
      }
      setSelectedParticipants(
        selectedParticipants.filter((pid) => pid !== id)
      );
    }
  };

  return (
    <div className="form-group">
      <label>Participants</label>
      
      {/* Affichage de l'employé concerné */}
      {fetchedEmployee && (
        <div className="mb-3 p-2 border rounded bg-light">
          <div className="d-flex align-items-center">
            <input 
              type="checkbox"
              checked={true}
              disabled={true}
              className="me-2"
            />
            <strong>{fetchedEmployee.firstName} {fetchedEmployee.lastName}</strong>
            <span className="badge bg-primary ms-2">Employé évalué</span>
          </div>
        </div>
      )}
      
      {/* Autres participants */}
      <div className="participants-list">
        {participantsList.map((participant) => (
          <div key={participant.id || participant.employeeId} className="mb-2">
            <input
              type="checkbox"
              id={`participant-${participant.id || participant.employeeId}`}
              checked={selectedParticipants.includes(Number(participant.id || participant.employeeId))}
              onChange={() => handleParticipantSelection(Number(participant.id || participant.employeeId))}
              className="me-2"
            />
            <label htmlFor={`participant-${participant.id || participant.employeeId}`}>
              {participant.firstName} {participant.lastName} - {participant.role || 'Non spécifié'}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

// PropTypes validation
ParticipantsSelector.propTypes = {
  participantsList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      employeeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      role: PropTypes.string
    })
  ).isRequired,
  selectedParticipants: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ).isRequired,
  setSelectedParticipants: PropTypes.func.isRequired,
  fetchedEmployee: PropTypes.shape({
    employeeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    firstName: PropTypes.string,
    lastName: PropTypes.string
  })
};

export default ParticipantsSelector;