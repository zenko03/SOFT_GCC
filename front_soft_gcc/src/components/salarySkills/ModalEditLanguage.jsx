import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Fetcher from '../fetcher';
import useSWR from 'swr';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
    
// Gerer la modification d'une langue
function ModalEditLanguage ({ showEditLanguage, handleCloseEditLanguage, selectedLanguage, idEmployee, fetchData, error }) {
  // Appel API pour charger les données
  const { data: dataLanguage, error: errorLanguage, isLoading: loadingLanguage } = useSWR('/Language', Fetcher);
    
  // Gestion état du formulaire
  const [formData, setFormData] = useState({
    employeeLanguageId: '',
    language_id: '',
    level: '',
    state: '',
    employeeId: idEmployee, // Valeur par défaut de l'employé, peut être rendue dynamique
  });

  // Utilisez useEffect pour pré-remplir les données lorsque la modale s'ouvre
  useEffect(() => {
    if (selectedLanguage) {
        setFormData({
            employeeLanguageId: selectedLanguage.employeeLanguageId,
            language_id: selectedLanguage.languageId || '',
            level: selectedLanguage.level || '',
            state: selectedLanguage.state || '',
            employeeId: selectedLanguage.employeeId || idEmployee,
        });
    }
}, [selectedLanguage, idEmployee]);

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
            const response = await axios.put(urlApi(`/EmployeeLanguage/${selectedLanguage.employeeLanguageId}`), dataToSend);
            console.log('Updated successfully:', response.data);
            handleCloseEditLanguage();
            await fetchData();
        } catch (error) {
          error = `Erreur lors de la modification d'un language : ${error.message}`;
        }
    };

    // Gestion du chargement
    if (loadingLanguage) {
        
        return <Modal show={showEditLanguage} onHide={handleCloseEditLanguage}>
                    <Modal.Header closeButton>
                        <Modal.Title>Modifier une competence linguistique</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Chargement...</div>;
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditLanguage}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des erreurs
    if (errorLanguage) {
        return <Modal show={showEditLanguage} onHide={handleCloseEditLanguage}>
                    <Modal.Header closeButton>
                        <Modal.Title>Modifier une competence linguistique</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Erreur lors du chargement des donnees.</div>;
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditLanguage}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des validations de données
    if (!dataLanguage) {
        return <Modal show={showEditLanguage} onHide={handleLanguage}>
                    <Modal.Header closeButton>
                        <Modal.Title>Modifier une competence linguistique</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Pas de donnees disponible</div>;
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditLanguage}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des erreurs
    if (error) {
      return <Modal show={showEditLanguage} onHide={handleLanguage}>
                  <Modal.Header closeButton>
                      <Modal.Title>Modifier une competence linguistique</Modal.Title>
                  </Modal.Header>

                  <Modal.Body>
                      <div>{error}</div>;
                  </Modal.Body>
                  <Modal.Footer>
                      <Button variant="secondary" onClick={handleCloseEditLanguage}>
                          Fermer
                      </Button>
                  </Modal.Footer>
              </Modal>;
    }

    return (
        <div>
            <Modal show={showEditLanguage} onHide={handleCloseEditLanguage}>
            <Modal.Header closeButton>
              <Modal.Title>Modifier une competence linguistique</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="formBasicSelect">
                  <Form.Label>Langue</Form.Label>
                  <Form.Select name="language_id" value={formData.language_id} onChange={handleChange}>
                    <option value="">Sélectionner une langue</option>
                    {dataLanguage.map((item, id) => (
                      <option key={id} value={item.languageId}>
                        {item.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Niveau</Form.Label>
                  <Form.Control type="number" name="level" value={formData.level} onChange={handleChange} />
                </Form.Group>
                <Form.Group controlId="formBasicSelect">
                  <Form.Label>Etat</Form.Label>
                  <Form.Select name="state" value={formData.state} onChange={handleChange}>
                    <option value="">Sélectionner un état</option>
                    <option value="1">Non validé</option>
                    <option value="5">Validé par évaluation</option>
                    <option value="10">Confirmé</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseEditLanguage}>
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
    
    export default ModalEditLanguage;