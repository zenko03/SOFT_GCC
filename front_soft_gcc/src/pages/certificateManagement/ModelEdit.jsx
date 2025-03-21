import React, { useState } from "react";
import Template from "../Template";
import Loader from "../../helpers/Loader";
import PageHeader from "../../components/PageHeader";

// Page de la liste des modèles d'attestation crée
const ModelEdit = () => {
    // URL en tête de page 
    const module = 'Modèle attestation';
    const action = 'Liste';
    const url = '/modèle'; 

    // Initialisation des variables d'états
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

  return (
    <Template>
        {loading && <Loader />}
        <PageHeader module={module} action={action} url={url} />
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row header-title">
            <div className="col-lg-10 skill-header">
                <i className="mdi mdi-map-marker-path skill-icon"></i>
                <h4 className="skill-title">CREATION D'UN MODELE D'ATTESTATION</h4>
            </div>
        </div>
        <div className="row">
            <div className="button-save-profil">
                <button type="button" className="btn btn-success btn-fw">
                    <i className="mdi mdi-content-save-edit" style={{paddingRight: '5px'}}></i>Enregistrer
                </button>
                <button type="button" className="btn btn-light btn-fw">
                    <i className="mdi mdi-arrow-left-circle" style={{paddingRight: '5px'}}></i>
                    Retour
                </button>
            </div>
        </div>

        <form className="forms-sample">
            <div className="row">            
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Nom du modèle</label>
                                <input type="text" name="modelName" className="form-control" id="exampleInputEmail1"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="form-group">
                                <label htmlFor="exampleInputUsername1">Type d'affectation</label>
                                <select name="assignmentTypeId" className="form-control" id="exampleSelectGender">
                                    <option value="">Sélectionner une affectation</option>
                                </select>   
                            </div>
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Numero de decision</label>
                                <input type="text" name="decisionNumber" className="form-control" id="exampleInputEmail1"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Date de decision</label>
                                <input type="date" name="decisionDate" className="form-control" id="exampleInputEmail1"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Date d'affectation</label>
                                <input type="date" name="assignmentDate" className="form-control" id="exampleInputEmail1"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Description</label>
                                <textarea name="description" className="form-control" id="exampleTextarea1" rows="4"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    </Template>
  );
};

export default ModelEdit;
