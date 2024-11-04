import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Fetcher from '../fetcher';
import useSWR from 'swr';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';

function ModalAddSkill({ showSkill, handleCloseSkill, idEmployee, fetchData, error, dataEmployeeDescription }) {
    const { data: dataDomainSkill, error: errorDomainSkill, isLoading: loadingDomainSkill } = useSWR('/DomainSkill', Fetcher);
    const { data: dataSkill, error: errorSkill, isLoading: loadingSkill } = useSWR('/Skill', Fetcher);

    const [formData, setFormData] = useState({
        domainSkillId: '',
        skillId: '',
        level: '',
        state: '',
        employeeId: idEmployee,
    });

    const [formErrors, setFormErrors] = useState({}); // Pour stocker les erreurs de validation

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.domainSkillId) errors.domainSkillId = "Le domaine est requis.";
        if (!formData.skillId) errors.skillId = "La compétence est requise.";
        if (!formData.level || formData.level < 0 || formData.level > 100) errors.level = "Le niveau doit être compris entre 1 et 100.";
        if (!formData.state) errors.state = "L'état est requis.";

        setFormErrors(errors);
        return Object.keys(errors).length === 0; // Renvoie vrai si aucune erreur
    };

    const handleSubmit = async () => {
        if (!validateForm()) return; // Arrête la soumission si le formulaire est invalide

        try {
            const dataToSend = {
                ...formData,
                creationDate: new Date().toISOString(),
                updateDate: new Date().toISOString(),
            };
            const response = await axios.post(urlApi('/EmployeeSkills'), dataToSend);
            handleCloseSkill();
            await fetchData();
            dataEmployeeDescription.skillNumber++;
        } catch (error) {
            setFormErrors({ submit: `Erreur lors de l'insertion de la compétence : ${error.message}` });
        }
    };

    if (loadingDomainSkill || loadingSkill) {
        return (
            <Modal show={showSkill} onHide={handleCloseSkill}>
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter une nouvelle compétence</Modal.Title>
                </Modal.Header>
                <Modal.Body>Chargement...</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseSkill}>Fermer</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    if (errorDomainSkill || errorSkill) {
        return (
            <Modal show={showSkill} onHide={handleCloseSkill}>
                <Modal.Header closeButton>
                    <Modal.Title>Ajouter une nouvelle compétence</Modal.Title>
                </Modal.Header>
                <Modal.Body>Erreur lors du chargement des données.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseSkill}>Fermer</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    return (
        <Modal show={showSkill} onHide={handleCloseSkill}>
            <Modal.Header closeButton>
                <Modal.Title>Ajouter une nouvelle compétence</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formBasicSelectDomain">
                        <Form.Label>Domaine</Form.Label>
                        <Form.Select name="domainSkillId" value={formData.domainSkillId} onChange={handleChange}>
                            <option value="">Sélectionner un domaine</option>
                            {dataDomainSkill.map((item, id) => (
                                <option key={id} value={item.domainSkillId}>{item.name}</option>
                            ))}
                        </Form.Select>
                        {formErrors.domainSkillId && <div className="text-danger">{formErrors.domainSkillId}</div>}
                    </Form.Group>

                    <Form.Group controlId="formBasicSelectSkill">
                        <Form.Label>Compétence</Form.Label>
                        <Form.Select name="skillId" value={formData.skillId} onChange={handleChange}>
                            <option value="">Sélectionner une compétence</option>
                            {dataSkill.map((item, id) => (
                                <option key={id} value={item.skillId}>{item.name}</option>
                            ))}
                        </Form.Select>
                        {formErrors.skillId && <div className="text-danger">{formErrors.skillId}</div>}
                    </Form.Group>

                    <Form.Group controlId="formBasicLevel">
                        <Form.Label>Niveau (en %)</Form.Label>
                        <Form.Control type="number" name="level" value={formData.level} onChange={handleChange} />
                        {formErrors.level && <div className="text-danger">{formErrors.level}</div>}
                    </Form.Group>

                    <Form.Group controlId="formBasicSelectState">
                        <Form.Label>État</Form.Label>
                        <Form.Select name="state" value={formData.state} onChange={handleChange}>
                            <option value="">Sélectionner un état</option>
                            <option value="1">Non validé</option>
                            <option value="5">Validé par évaluation</option>
                            <option value="10">Confirmé</option>
                        </Form.Select>
                        {formErrors.state && <div className="text-danger">{formErrors.state}</div>}
                    </Form.Group>
                </Form>
                {formErrors.submit && <div className="text-danger mt-2">{formErrors.submit}</div>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseSkill}>Fermer</Button>
                <Button variant="success" onClick={handleSubmit}>Valider</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalAddSkill;
