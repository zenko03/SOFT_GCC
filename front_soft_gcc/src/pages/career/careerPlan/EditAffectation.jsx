// SearchForm.js
import React, { useState } from 'react';
import Template from '../../Template';
import PageHeader from '../../../components/PageHeader';
import AppointmentForm from '../../../components/career/AppointmentForm';
import AdvancementForm from '../../../components/career/AdvancementForm';
import ContractForm from '../../../components/career/ContractForm';
import LayOffForm from '../../../components/career/LayOffForm';

// Page de creation d'un plan de carriere
function EditAffectation({ onSearch }) {
    // Url d'en-tete de page
    const module = "Plan de carrière";
    const action = "Edit";
    const url = "/carriere/fiche/edit affectation";

    // Initialisation des states
    const [selectedItem, setSelectedItem] = useState('1');

    // Fonction qui gère le changement dans la liste déroulante
    const handleSelectChange = (event) => {
        setSelectedItem(event.target.value);
    };

    return (
        <Template>

            <PageHeader module={module} action={action} url={url} />
            <div className="row">
                <div className="button-save-profil">
                    <button type="button" className="btn btn-success btn-fw">Modifier</button>
                    <button type="button" className="btn btn-light btn-fw">Annuler</button>
                </div>
            </div>

            <form className="forms-sample">
                <div className="row">            
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <div className="form-group">
                                    <label htmlFor="exampleInputUsername1">Matricule</label>
                                    <select className="form-control" id="exampleSelectGender">
                                        <option>NUM0012</option>
                                        <option>NUM0014</option>
                                        <option>NUM0015</option>
                                    </select>    
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <div className="form-group">
                                    <label htmlFor="exampleInputUsername1">Type d'affectation</label>
                                    <select className="form-control" id="exampleSelectGender" onChange={handleSelectChange}>
                                        <option value="1">Nomination</option>
                                        <option value="2">Mise en disponibilité</option>
                                        <option value="3">Avancement</option>
                                        <option value="4">Contrat</option>
                                    </select>    
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Numero de decision</label>
                                    <input type="text" className="form-control" id="exampleInputEmail1"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Date de decision</label>
                                    <input type="date" className="form-control" id="exampleInputEmail1"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Date d'affectation</label>
                                    <input type="date" className="form-control" id="exampleInputEmail1"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Description</label>
                                    <textarea className="form-control" id="exampleTextarea1" rows="4"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {selectedItem === '1' ? (
                    <AppointmentForm />
                  ) : selectedItem === '2' ? (
                    <LayOffForm />
                  ) : selectedItem === '3' ?(
                    <AdvancementForm />
                  ) : (
                    <ContractForm />
                  )}
                
            </form>
        </Template>
    );
}

export default EditAffectation;
