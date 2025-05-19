{showModal && (
  <>
    <div
      className="modal-backdrop fade show"
      onClick={handleCloseModal}
    ></div>
    <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable custom-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Planning d&apos;entretien</h5>
            <button type="button" className="close" onClick={handleCloseModal}>
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {/* Afficher les informations de l'employé sélectionné */}
            {window.selectedEmployeeForModal && (
              <div className="alert alert-info">
                Planification d'entretien pour: <strong>{window.selectedEmployeeForModal.firstName} {window.selectedEmployeeForModal.lastName}</strong>
              </div>
            )}
            
            <form>
              <div className="form-group">
                <label htmlFor="scheduledDateTime">Date et heure planifiée</label>
                {dateError && <div className="alert alert-danger">{dateError}</div>}
                <input
                  type="datetime-local"
                  id="scheduledDateTime"
                  className="form-control"
                  value={evaluationDetails.scheduledDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const currentDate = new Date().toISOString().split('T')[0];
                    if (selectedDate < currentDate) {
                      setDateError("La date ne peut pas être dans le passé.");
                    } else {
                      setDateError("");
                      handleEvaluationDetailsChange({ name: 'scheduledDate', value: selectedDate });
                    }
                  }}
                  aria-label="Date et heure planifiée"
                />
              </div>

              <ParticipantsSelector
                participantsList={participantsList}
                selectedParticipants={evaluationDetails.participants}
                setSelectedParticipants={(participants) => {
                  setEvaluationDetails((prev) => ({
                    ...prev,
                    participants: participants,
                  }));
                }}
                fetchedEmployee={window.selectedEmployeeForModal}
              />
            </form>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={handleMassPlanning}>
              Planifier
            </button>
            <button className="btn btn-secondary" onClick={handleCloseModal}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}
