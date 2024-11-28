import React, {useState} from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';

// Pour lister les types d'affectation
function AffectationList({ dataAssignmentAppointment, dataAssignmentAdvancement, dataAssignmentAvailability, fetchData }) {

    const navigate = useNavigate();
    const [selectedAssignment, setSelectedAssignment] = useState(1);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false); // State pour la modale de confirmation
    const [itemToDelete, setItemToDelete] = useState(null); // L'élément à supprimer
    const [descriptionToDelete, setDescriptionToDelete] = useState(null); // Description a afficher au moment de la validation de suppression
 
    const handleClickEdit = (item) => {
        navigate(`/carriere/fiche/edit/${item.careerPlanId}`); 
    };

    /// Affichage d'une modale de confirmation d'une suppression d'item de competence
    const confirmDeleteItem = (url, description) => {
        setItemToDelete(url);
        setDescriptionToDelete(description);
        setShowConfirmDelete(true); 
    };

    const handleCloseDelete = () => setShowConfirmDelete(false); // Fermer le popup

    // Valider une suppression d'item de competence
    const handleDeleteConfirmed = async () => {
        try {
            await axios.put(urlApi(itemToDelete));
            setShowConfirmDelete(false);
            await fetchData();
            // Récupérer à nouveau les données après la suppression
        } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        }
    };

  return (
    <div className="row"> 
        <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
                <div className="card-body">  
                    <div className="template-demo">
                        <div className="dropdown">
                            <button className="btn btn-warning dropdown-toggle" type="button" id="dropdownMenuButton4" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> Type d'affectation </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton4">
                                <h1 className="dropdown-header" style={{color: 'black'}}>Type d'affectation</h1>
                                <a className="dropdown-item" onClick={() => { setSelectedAssignment(1); }}>Nomination</a>
                                <a className="dropdown-item" onClick={() => { setSelectedAssignment(2); }}> Avancements</a>
                                <a className="dropdown-item" onClick={() => { setSelectedAssignment(3); }}> Mise en disponibilites</a>
                            </div>
                        </div>
                    </div>

                    <Modal show={showConfirmDelete} onHide={handleCloseDelete}>
                      <Modal.Header closeButton>
                        <Modal.Title>Confirmer la suppression</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>Êtes-vous sûr de vouloir supprimer {descriptionToDelete} ?</Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDelete}>
                          Non
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfirmed}>
                          Oui
                        </Button>
                      </Modal.Footer>
                    </Modal>

                    {selectedAssignment === 1 ? (
                        <>
                            {/* Nomination */}
                            <table className="table table-striped table-competences">
                                <thead>
                                    <tr>
                                        <th>Date d'affectation</th>
                                        <th>Etablissement</th>
                                        <th>Departement</th>
                                        <th>Poste</th>
                                        <th>Type</th>
                                        <th>Debut</th>
                                        <th>Fin</th>
                                        <th>Salaire</th>
                                        <th>Etat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(dataAssignmentAppointment) && dataAssignmentAppointment.map((item, id) => (
                                        <tr key={id}>
                                            <td>{new Date(item.assignmentDate).toLocaleDateString()}</td>
                                            <td>{item.establishmentName}</td> 
                                            <td>{item.departmentName}</td>
                                            <td>{item.positionName}</td>
                                            <td>{item.employeeTypeName}</td>
                                            <td>{new Date(item.assignmentDate).toLocaleDateString()}</td>
                                            <td>{new Date(item.endingContract).toLocaleDateString()}</td>
                                            <td>{item.netSalary}</td>
                                            <td>{item.careerState}</td>
                                            {item.careerState !== 'termine' ? (
                                                <>
                                                    <td>
                                                        <Button
                                                            onClick={() => {
                                                                handleClickEdit(item);
                                                            }}
                                                            style={{
                                                                width: '25px',
                                                                height: '25px',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                backgroundColor: 'white',
                                                                    border: 'white',
                                                            }}
                                                        >
                                                            <i className="mdi mdi-pencil icon-edit" style={{ fontSize: '20px' }}></i>
                                                        </Button>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            onClick={() => confirmDeleteItem(`/CareerPlan/delete/${item.careerPlanId}`, ` la carriere ${item.assignmentTypeName} pour l'employe ${item.registrationNumber}`)}
                                                            style={{
                                                                width: '25px',
                                                                height: '25px',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                backgroundColor: 'white',
                                                                border: 'white'
                                                            }}
                                                        >
                                                            <i className="mdi mdi-delete icon-delete" style={{ fontSize: '20px' }}></i>
                                                        </Button>
                                                    </td>
                                                </>
                                            ) : (
                                                <td></td>
                                            )}
                                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : selectedAssignment === 2 ? (
                        <>
                            {/* Avancements */}
                            <table className="table table-striped table-competences">
                                <thead>
                                    <tr>
                                        <th>Date d'affectation</th>
                                        <th>Departement</th>
                                        <th>Categorie socio-professionnelle</th>
                                        <th>Indice</th>
                                        <th>Echelon</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(dataAssignmentAdvancement) && dataAssignmentAdvancement.map((item, id) => (
                                        <tr>
                                            <td>{new Date(item.assignmentDate).toLocaleDateString()}</td>
                                            <td>{item.departmentName}</td>
                                            <td>{item.socioCategoryProfessionalName}</td>
                                            <td>{item.indicationName}</td>
                                            <td>{item.echelonName}</td>
                                            <td>
                                                <Button
                                                    onClick={() => {
                                                        handleClickEdit(item);
                                                    }}
                                                    style={{
                                                        width: '25px',
                                                        height: '25px',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        backgroundColor: 'white',
                                                            border: 'white',
                                                    }}
                                                >
                                                    <i className="mdi mdi-pencil icon-edit" style={{ fontSize: '20px' }}></i>
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    onClick={() => confirmDeleteItem(`/CareerPlan/delete/${item.careerPlanId}`, ` la carriere ${item.assignmentTypeName} pour l'employe ${item.registrationNumber}`)}
                                                    style={{
                                                        width: '25px',
                                                        height: '25px',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        backgroundColor: 'white',
                                                        border: 'white'
                                                    }}
                                                >
                                                    <i className="mdi mdi-delete icon-delete" style={{ fontSize: '20px' }}></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <>
                            {/* Mise en disponibilite */}
                            <table className="table table-striped table-competences">
                                <thead>
                                    <tr>
                                        <th>Date d'affectation</th>
                                        <th>Institution</th>
                                        <th>Debut</th>
                                        <th>fin</th>
                                        <th>Motif</th>
                                        <th>Etat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(dataAssignmentAvailability) && dataAssignmentAvailability.map((item, id) => (
                                        <tr>
                                            <td>{new Date(item.assignmentDate).toLocaleDateString()}</td>
                                            <td>{item.assigningInstitution}</td> 
                                            <td>{new Date(item.startDate).toLocaleDateString()}</td>
                                            <td>{new Date(item.endDate).toLocaleDateString()}</td>
                                            <td>{item.reason}</td>
                                            <td>{item.careerState}</td>
                                            {item.careerState !== 'termine' ? (
                                                <>
                                                    <td>
                                                        <Button
                                                            onClick={() => {
                                                                handleClickEdit(item);
                                                            }}
                                                            style={{
                                                                width: '25px',
                                                                height: '25px',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                backgroundColor: 'white',
                                                                    border: 'white',
                                                            }}
                                                        >
                                                            <i className="mdi mdi-pencil icon-edit" style={{ fontSize: '20px' }}></i>
                                                        </Button>
                                                    </td>
                                                    <td>
                                                        <Button
                                                            onClick={() => confirmDeleteItem(`/CareerPlan/delete/${item.careerPlanId}`, ` la carriere ${item.assignmentTypeName} pour l'employe ${item.registrationNumber}`)}
                                                            style={{
                                                                width: '25px',
                                                                height: '25px',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                backgroundColor: 'white',
                                                                border: 'white'
                                                            }}
                                                        >
                                                            <i className="mdi mdi-delete icon-delete" style={{ fontSize: '20px' }}></i>
                                                        </Button>
                                                    </td>
                                                </>
                                            ) : (
                                                <td></td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
}

export default AffectationList;
