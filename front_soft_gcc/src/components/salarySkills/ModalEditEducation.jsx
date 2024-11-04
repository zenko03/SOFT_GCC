import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Fetcher from '../fetcher';
import useSWR from 'swr';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
    
// Gerer la modification d'une education
function ModalEditEducation({ showEditEducation, handleCloseEditEducation, selectedEducation, idEmployee, fetchData, error }) {
    // Appel API pour charger les données
    const { data: dataStudyPath, error: errorStudyPath, isLoading: loadingStudyPath } = useSWR('/StudyPath', Fetcher);
    const { data: dataDegree, error: errorLevel, isLoading: loadingLevel } = useSWR('/Degree', Fetcher);
    const { data: dataSchool, error: errorSchool, isLoading: loadingSchool } = useSWR('/School', Fetcher);

    // Gestion état du formulaire
    const [formData, setFormData] = useState({
        employeeEducationId: '',
        studyPathId: '',
        degreeId: '',
        schoolId: '',
        year: '',
        state: '',
        employeeId: idEmployee, // Valeur par défaut de l'employé, peut être rendue dynamique
    });

     // Utilisez useEffect pour pré-remplir les données lorsque la modale s'ouvre
     useEffect(() => {
        if (selectedEducation) {
            setFormData({
                employeeEducationId: selectedEducation.employeeEducationId,
                studyPathId: selectedEducation.studyPathId,
                degreeId: selectedEducation.degreeId || '',
                schoolId: selectedEducation.schoolId || '',
                year: selectedEducation.year || '',
                state: selectedEducation.state || '',
                employeeId: selectedEducation.employeeId || idEmployee,
            });
        }
    }, [selectedEducation, idEmployee]);

    // Gérer les changements dans les champs du formulaire
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Gérer la soumission du formulaire
    const handleSubmit = async () => {
        try {
            const dataToSend = {
                ...formData,
                updateDate: new Date().toISOString(),
            };

            // Requête PUT pour mettre à jour les données
            const response = await axios.put(urlApi(`/EmployeeEducation/${selectedEducation.employeeEducationId}`), dataToSend);
            handleCloseEditEducation();
            await fetchData();
        } catch (error) {
            error = `Erreur lors de la modification d'une education : ${error.message}`;
        }
    };

    // Gestion du chargement
    if (loadingStudyPath || loadingLevel || loadingSchool) {
        
        return <Modal show={showEditEducation} onHide={handleCloseEditEducation}>
                    <Modal.Header closeButton>
                        <Modal.Title>Modifier diplomes & formation</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Chargement...</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditEducation}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des erreurs
    if (errorStudyPath || errorLevel || errorSchool) {
        return <Modal show={showEditEducation} onHide={handleCloseEditEducation}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ajouter une nouvelle diplomes & formation</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Erreur lors du chargement des donnees.</div>;
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditEducation}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des validations de données
    if (!dataStudyPath || !dataDegree || !dataSchool) {
        return <Modal show={showEditEducation} onHide={handleCloseEditEducation}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ajouter une nouvelle diplomes & formation</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Pas de donnees disponible</div>;
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditEducation}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des erreurs
    if (error) {
        return <Modal show={showEditEducation} onHide={handleCloseEditEducation}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ajouter une nouvelle diplomes & formation</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>{error}</div>;
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditEducation}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    return (
        <div>
            <Modal show={showEditEducation} onHide={handleCloseEditEducation}>
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter une nouvelle diplomes & formations</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formBasicSelect">
                            <Form.Label>Filiere</Form.Label>
                            <Form.Select name="studyPathId" value={formData.studyPathId} onChange={handleChange}>
                                <option value="">Sélectionner une filiere</option>
                                {dataStudyPath.map((item, id) => (
                                    <option key={id} value={item.studyPathId}>
                                        {item.studyPathName}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="formBasicSelect">
                            <Form.Label>Niveau</Form.Label>
                            <Form.Select name="degreeId" value={formData.degreeId} onChange={handleChange}>
                                <option value="">Sélectionner un niveau</option>
                                {dataDegree.map((item, id) => (
                                    <option key={id} value={item.degreeId}>
                                        {item.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="formBasicSelect">
                            <Form.Label>Ecole</Form.Label>
                            <Form.Select name="schoolId" value={formData.schoolId} onChange={handleChange}>
                                <option value="">Sélectionner une ecole</option>
                                {dataSchool.map((item, id) => (
                                    <option key={id} value={item.schoolId}>
                                        {item.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Label>Annee</Form.Label>
                            <Form.Control type="number" name="year" value={formData.year} onChange={handleChange} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEditEducation} >
                        Fermer
                    </Button>
                    <Button variant="success" onClick={handleSubmit}>
                        Modifier
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
      );
    }
    
    export default ModalEditEducation;
    