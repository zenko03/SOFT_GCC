import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
    
// Gerer l'inertion d'autres formations
function ModalAddOtherSkill ({ showOtherSkill, handleCloseOtherSkill, idEmployee, fetchData, error, dataEmployeeDescription }) {
    // Gestion état du formulaire
    const [formData, setFormData] = useState({
        description: '',
        startDate: '',
        endDate: '',
        comment: '',
        state: '1',
        employeeId: idEmployee, // Valeur par défaut de l'employé, peut être rendue dynamique
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

            const response = await axios.post(urlApi('/EmployeeOtherFormation'), dataToSend);
            handleCloseOtherSkill(); 
            await fetchData();
            dataEmployeeDescription.otherFormationNumber++;
        } catch (error) {
            error = `Erreur lors d'insertion d'un language : ${error.message}`;
        }
    };

    // Gestion des erreurs
    if(error) {
        <div>
            <Modal show={showOtherSkill} onHide={handleCloseOtherSkill}>
                <Modal.Header closeButton>
                <Modal.Title>Ajouter d'autre formation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error}
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseOtherSkill}>
                    Fermer
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
    }
    return (
        <div>
            <Modal show={showOtherSkill} onHide={handleCloseOtherSkill}>
                <Modal.Header closeButton>
                <Modal.Title>Ajouter d'autre formation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text" name="description" value={formData.description} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Date debut</Form.Label>
                        <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange}/>
                    </Form.Group>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Date fin</Form.Label>
                        <Form.Control type="date" name="endDate" value={formData.endDate} onChange={handleChange} />
                    </Form.Group>
                    <Form.Group controlId="formBasicTextarea">
                        <Form.Label>Commentaires</Form.Label>
                        <Form.Control as="textarea" rows={3} type="comment" name="comment" value={formData.comment} onChange={handleChange} placeholder="Entrez vos commentaires ici" />
                    </Form.Group>
                </Form>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseOtherSkill}>
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
    
    export default ModalAddOtherSkill;
    