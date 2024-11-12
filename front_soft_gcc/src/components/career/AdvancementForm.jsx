import React from 'react';

// Contenu du pied de page
function AdvancementForm({ task }) {
  return (
        <div className="row">            
            <div className="col-md-6 grid-margin stretch-card">
                <div className="card">
                    <div className="card-body">
                        <h4 class="card-title" 
                            style={{
                                color: '#B8860B',  
                                borderBottom: '2px solid #B8860B', 
                                paddingBottom: '5px'
                            }}
                        >Employe</h4>

                        <div className="form-group">
                            <label for="exampleInputUsername1">Departement</label>
                            <select class="form-control" id="exampleSelectGender">
                                <option>Informatique</option>
                                <option>Marketing</option>
                            </select>    
                        </div>
                        <div className="form-group">
                            <label for="exampleInputUsername1">Categorie socio-professionnelle</label>
                            <select class="form-control" id="exampleSelectGender">
                                <option>Categorie A</option>
                                <option>Categorie B</option>
                            </select>    
                        </div>
                        <div className="form-group">
                            <label for="exampleInputUsername1">Indice</label>
                            <select class="form-control" id="exampleSelectGender">
                                <option>Indice 1</option>
                                <option>Indice 2</option>
                            </select>    
                        </div>
                        <div className="form-group">
                            <label for="exampleInputUsername1">Echelon</label>
                            <select class="form-control" id="exampleSelectGender">
                                <option>Echelon 1</option>
                                <option>Echelon 2</option>
                            </select>    
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-md-6 grid-margin stretch-card">
                <div className="card">
                    <div className="card-body">
                        <h4 class="card-title" 
                            style={{
                                color: '#B8860B',  
                                borderBottom: '2px solid #B8860B', 
                                paddingBottom: '5px'
                            }}
                        >Contrat</h4>

                        <div className="form-group">
                            <label for="exampleInputUsername1">Catégorie professionnelle</label>
                            <select class="form-control" id="exampleSelectGender">
                                <option>Categorie 1</option>
                                <option>Categorie 2</option>
                            </select>    
                        </div>
                        <div className="form-group">
                            <label for="exampleInputUsername1">Classe légale</label>
                            <select class="form-control" id="exampleSelectGender">
                                <option>Classe légale 1</option>
                                <option>Classe légale 2</option>
                            </select>    
                        </div>
                    </div>
                </div>
            </div>
        </div>
  );
}

export default AdvancementForm;
