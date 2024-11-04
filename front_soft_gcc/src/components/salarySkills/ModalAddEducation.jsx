import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Fetcher from '../fetcher';
import useSWR from 'swr';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
    
// Gerer l'insertion d'une education
function ModalAddEducation({ showEducation, handleCloseEducation, idEmployee, fetchData, error, dataEmployeeDescription }) {
    // Appel API pour charger les données
    const { data: dataStudyPath, error: errorStudyPath, isLoading: loadingStudyPath } = useSWR('/StudyPath', Fetcher);
    const { data: dataDegree, error: errorLevel, isLoading: loadingLevel } = useSWR('/Degree', Fetcher);
    const { data: dataSchool, error: errorSchool, isLoading: loadingSchool } = useSWR('/School', Fetcher);

    // Gestion état du formulaire
    const [formData, setFormData] = useState({
        studyPathId: '',
        degreeId: '',
        schoolId: '',
        year: '',
        state: '1',
        employeeId: idEmployee,
    });

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
                creationDate: new Date().toISOString(),
                updateDate: new Date().toISOString(),
            };

            const response = await axios.post(urlApi('/EmployeeEducation'), dataToSend);
            handleCloseEducation(); 
            await fetchData();
            dataEmployeeDescription.educationNumber++;
        } catch (error) {
            error = `Erreur lors d'insertion d'une diplome et formation : ${error.message}`;
        }
    };

    // Gestion du chargement
    if (loadingStudyPath || loadingLevel || loadingSchool) {
        
        return <Modal show={showEducation} onHide={handleCloseEducation}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ajouter une nouvelle diplomes & formation</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Chargement...</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEducation}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des erreurs
    if (errorStudyPath || errorLevel || errorSchool) {
        return <Modal show={showEducation} onHide={handleCloseEducation}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ajouter une nouvelle diplomes & formation</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Erreur lors du chargement des donnees.</div>;
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEducation}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des validations de données
    if (!dataStudyPath || !dataDegree || !dataSchool) {
        return <Modal show={showEducation} onHide={handleCloseEducation}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ajouter une nouvelle diplomes & formation</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Pas de donnees disponible</div>;
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEducation}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des erreurs 
    if (error) {
        return (
            <Modal show={showSkill} onHide={handleCloseSkill}>
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter une nouvelle diplomes & formations</Modal.Title>
                </Modal.Header>
                <Modal.Body>{error}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseSkill}>Fermer</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <div>
            <Modal show={showEducation} onHide={handleCloseEducation}>
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
                    <Button variant="secondary" onClick={handleCloseEducation} >
                        Fermer
                    </Button>
                    <Button variant="success" onClick={handleSubmit}>
                        Valider
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
      );
    }
    
    export default ModalAddEducation;
    