import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Fetcher from '../fetcher';
import useSWR from 'swr';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
    
// Gerer l'inertion d'une langue
function ModalAddLanguage ({ showLanguage, handleCloseLanguage, idEmployee, fetchData, error, dataEmployeeDescription }) {
  // Appel API pour charger les données
  const { data: dataLanguage, error: errorLanguage, isLoading: loadingLanguage } = useSWR('/Language', Fetcher);
    
  // Gestion état du formulaire
  const [formData, setFormData] = useState({
    language_id: '',
    level: '',
    state: '',
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

          const response = await axios.post(urlApi('/EmployeeLanguage'), dataToSend);
          handleCloseLanguage(); 
          await fetchData();
          dataEmployeeDescription.languageNumber++;
        } catch (error) {
          error = `Erreur lors d'insertion d'un language : ${error.message}`;
      }
  };

    // Gestion du chargement
    if (loadingLanguage) {
        
        return <Modal show={showLanguage} onHide={handleCloseLanguage}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ajouter une nouvelle competence linguistique</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Chargement...</div>;
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseLanguage}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des erreurs
    if (errorLanguage) {
        return <Modal show={showLanguage} onHide={handleCloseLanguage}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ajouter une nouvelle competence linguistique</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Erreur lors du chargement des donnees.</div>;
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseLanguage}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des validations de données
    if (!dataLanguage) {
        return <Modal show={showLanguage} onHide={handleLanguage}>
                    <Modal.Header closeButton>
                        <Modal.Title>Ajouter une nouvelle competence linguistique</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div>Pas de donnees disponible</div>;
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseLanguage}>
                            Fermer
                        </Button>
                    </Modal.Footer>
                </Modal>;
    }

    // Gestion des erreurs
    if (error) {
      return <Modal show={showLanguage} onHide={handleLanguage}>
                  <Modal.Header closeButton>
                      <Modal.Title>Ajouter une nouvelle competence linguistique</Modal.Title>
                  </Modal.Header>

                  <Modal.Body>
                      <div>{error}</div>;
                  </Modal.Body>
                  <Modal.Footer>
                      <Button variant="secondary" onClick={handleCloseLanguage}>
                          Fermer
                      </Button>
                  </Modal.Footer>
              </Modal>;
  }

    return (
        <div>
            <Modal show={showLanguage} onHide={handleCloseLanguage}>
            <Modal.Header closeButton>
              <Modal.Title>Ajouter une nouvelle competence linguistique</Modal.Title>
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
                  <Form.Label>Niveau (en %)</Form.Label>
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
              <Button variant="secondary" onClick={handleCloseLanguage}>
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
    
    export default ModalAddLanguage;
    