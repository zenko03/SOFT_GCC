import React, { useState } from 'react';
import Modal from 'react-modal';
import Fetcher from '../fetcher';
import useSWR from 'swr';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
import '../../styles/modal.css';
    
// Gerer l'inertion d'une langue
function ModalAddLanguage ({ showLanguage, handleCloseLanguage, idEmployee, fetchData, error, dataEmployeeDescription }) {
  // Appel API pour charger les données
  const { data: dataLanguage, error: errorLanguage, isLoading: loadingLanguage } = useSWR('/Language', Fetcher);
    
  // Gestion état du formulaire
  const [formData, setFormData] = useState({
    language_id: '',
    level: '',
    state: '',
    employeeId: idEmployee,
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState(''); 

  // Gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
          ...prevData,
          [name]: value,
      }));
  };

  // Gestion de la validation du formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.language_id) errors.language_id = 'Veuillez sélectionner une langue.';
    if (!formData.level) errors.level = 'Veuillez entrer un nombre entre 0 et 100.';
    if (!formData.state) errors.state = 'Veuillez sélectionner un état.';
    else if (formData.level < 0 || formData.level > 100) errors.year = 'Veuillez entrer un nombre entre 0 et 100.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Retourne `true` si aucune erreur
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) return; 

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
          console.error('Erreur lors de l\'insertion :', error.response?.data || error.message);
          setSubmitError(`Erreur lors d'insertion d'un language : ${error.message}`);
      }
  };
        

    return (
      <Modal
          isOpen={showLanguage}
          onRequestClose={handleCloseLanguage}
          contentLabel="Ajouter une nouvelle competence linguistique"
          className="modal-content"
          overlayClassName="modal-overlay"
      >
          <div className="modal-header">
              <h2>Ajouter une nouvelle competence linguistique</h2>
              <button onClick={handleCloseLanguage} className="close-button">&times;</button>
          </div>
          <div className="modal-body">
              {loadingLanguage ? (
                  <div>Chargement...</div>
              ) : errorLanguage ? (
                  <div>Erreur lors du chargement des données.</div>
              ) : (
                  <form>
                      <div className="form-group">
                          <label>Langue</label>
                          <select name="language_id" value={formData.language_id} onChange={handleChange} className="form-control">
                            <option value="">Sélectionner une langue</option>
                            {dataLanguage.map((item, id) => (
                              <option key={id} value={item.languageId}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                          {formErrors.language_id && <small className="error-text">{formErrors.language_id}</small>}
                      </div>
                      <div className="form-group">
                          <label>Niveau (en %)</label>
                          <input type="number" name="level" value={formData.level} onChange={handleChange} className="form-control" />
                          {formErrors.level && <small className="error-text">{formErrors.level}</small>}
                      </div>
                      <div className="form-group">
                          <label>Etat</label>
                          <select name="state" value={formData.state} onChange={handleChange} className="form-control">
                              <option value="">Sélectionner un état</option>
                              <option value="1">Non validé</option>
                              <option value="5">Validé par évaluation</option>
                              <option value="10">Confirmé</option>
                          </select>
                          {formErrors.state && <small className="error-text">{formErrors.state}</small>}
                      </div>
                      {submitError && <small className="error-text">{submitError}</small>}
                    </form>
              )}
          </div>
          <div className="modal-footer">
              <button onClick={handleCloseLanguage} className="button button-secondary">Fermer</button>
              <button onClick={handleSubmit} className="button button-primary">Valider</button>
          </div>
      </Modal>
      );
    }
    
    export default ModalAddLanguage;
    