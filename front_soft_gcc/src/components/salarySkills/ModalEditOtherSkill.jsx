import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
    
// Gerer la modification d'autre formation
function ModalEditOtherSkill ({ showEditOtherSkill, handleCloseEditOtherSkill, selectedOtherSkill, idEmployee, fetchData, error }) {
    // Gestion état du formulaire
    const [formData, setFormData] = useState({
        employeeOtherFormationId: '',
        description: '',
        startDate: '',
        endDate: '',
        comment: '',
        state: '',
        employeeId: idEmployee, // Valeur par défaut de l'employé, peut être rendue dynamique
    });

    // Utilisez useEffect pour pré-remplir les données lorsque la modale s'ouvre
  useEffect(() => {
    if (selectedOtherSkill) {
        setFormData({
            employeeOtherFormationId: selectedOtherSkill.employeeOtherFormationId,
            description: selectedOtherSkill.description || '',
            startDate: new Date(selectedOtherSkill.startDate).toISOString().split('T')[0]  || '',
            endDate: new Date(selectedOtherSkill.endDate).toISOString().split('T')[0]  || '',
            comment: selectedOtherSkill.comment || '',
            state: selectedOtherSkill.state || '',
            employeeId: selectedOtherSkill.employeeId || idEmployee,
        });
    }
}, [selectedOtherSkill, idEmployee]);

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
            const response = await axios.put(urlApi(`/EmployeeOtherFormation/${selectedOtherSkill.employeeOtherFormationId}`), dataToSend);
            handleCloseEditOtherSkill();
            await fetchData();
        } catch (error) {
            error = `Erreur lors de la modification d'une formation : ${error.message}`;
        }
    };

    // Gestion des erreurs
    if (error) {
        
        return <Modal show={showEditOtherSkill} onHide={handleCloseEditOtherSkill}>
                    <Modal.Header closeButton>
                        <Modal.Title>Modifier formation</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>{error}</div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditOtherSkill} >
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>
    }

    return (
        <div>
            <Modal show={showEditOtherSkill} onHide={handleCloseEditOtherSkill}>
                <Modal.Header closeButton>
                <Modal.Title>Modifier formation</Modal.Title>
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
                <Button variant="secondary" onClick={handleCloseEditOtherSkill}>
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
    
    export default ModalEditOtherSkill;
    