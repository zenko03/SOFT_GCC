import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../../styles/modal.css';
import useSWR from 'swr';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
    
// Gerer l'insertion d'autres formations
function ModalParameter ({ Fetcher,showParameter, handleCloseParameter, fetchFilteredData }) {
    const { data: parameter, error: errorParameter, isLoading: loadingParameter } = useSWR('/Retirement/parametre/1', Fetcher);

    // Gestion état du formulaire
    const [formData, setFormData] = useState({
        retirementParameterId: 1,
        womanAge: '',
        manAge: ''
    });

    const [formErrors, setFormErrors] = useState({});

    // Mettre le valeurs par defaut du parametre
    useEffect(() => {
        if (parameter) {
            setFormData({
                retirementParameterId: 1,
                womanAge : parameter.womanAge,
                manAge : parameter.manAge
            });
        }
    }, []);

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
        
        if (!formData.manAge || formData.manAge < 50) errors.manAge = 'Veuillez entrer un nombre valide.';
        if (!formData.womanAge || formData.womanAge < 50) errors.womanAge = 'Veuillez entrer un nombre valide.';

        setFormErrors(errors);
        return Object.keys(errors).length === 0; // Retourne `true` si aucune erreur
  };

    // Gérer la soumission du formulaire
    const handleSubmit = async () => {
        if (!validateForm()) return; // Arrête la soumission en cas d'erreurs

        try {
            const dataToSend = {
                ...formData
            };
            const response = await axios.put(urlApi(`/Retirement/parametre/1`), dataToSend);
            handleCloseParameter(); 
            await fetchFilteredData();
        } catch (error) {
            setSubmitError(`Erreur lors de la mise a jour du parametre : ${error.message}`);
            console.log("Error : "+error.message);
        }
    };

    
    return (
        <Modal
          isOpen={showParameter}
          onRequestClose={handleCloseParameter}
          contentLabel="Parametre retraite"
          className="modal-content"
          overlayClassName="modal-overlay"
        >
          <div className="modal-header">
              <h3 className='subtitle'>Paramètre légal du départ à la retraite</h3>
              <button onClick={handleCloseParameter} className="close-button">&times;</button>
          </div>
          <div className="modal-body">
                {loadingParameter ? (
                    <div>Chargement...</div>
                ) : errorParameter ? (
                    <div>Erreur lors du chargement des données.</div>
                ) : (
                <form>
                    <div className="form-group">
                        <label>Age homme</label>
                        <input type="number" name="manAge" value={formData.manAge} onChange={handleChange} className="form-control" />
                        {formErrors.manAge && <small className="error-text">{formErrors.manAge}</small>}
                    </div>
                    <div className="form-group">
                        <label>Age femme</label>
                        <input type="number" name="womanAge" value={formData.womanAge} onChange={handleChange} className="form-control" />
                        {formErrors.womanAge && <small className="error-text">{formErrors.womanAge}</small>}
                    </div>    
                </form>
                )}
          </div>
          <div className="modal-footer">
              <button onClick={handleCloseParameter} className="button button-secondary">Fermer</button>
              <button onClick={handleSubmit} className="button button-primary">Modifier</button>
          </div>
        </Modal>
      );
    }
    
    export default ModalParameter;
    