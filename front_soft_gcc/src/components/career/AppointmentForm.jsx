import React from 'react';

// Contenu du pied de page
function AppointmentForm({ task }) {
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
                  >Employé</h4>
                                
                  <div className="form-group">
                    <label for="exampleInputUsername1">Etablissement</label>
                    <select class="form-control" id="exampleSelectGender">
                      <option>Softwell</option>
                    </select>    
                  </div>
                  <div className="form-group">
                    <label for="exampleInputUsername1">Departement</label>
                    <select class="form-control" id="exampleSelectGender">
                      <option>Informatique</option>
                      <option>Marketing</option>
                      <option>Commerciale</option>
                      <option>Direction</option>
                    </select>    
                  </div>
                  <div className="form-group">
                    <label for="exampleInputUsername1">Poste</label>
                    <select class="form-control" id="exampleSelectGender">
                      <option>Developpeur Backend</option>
                      <option>Developpeur Frontend</option>
                      <option>Developpeur Fullstack</option>
                      <option>Technicien informatique</option>
                    </select>    
                  </div>
                  <div className="form-group">
                    <label for="exampleInputUsername1">Type de salarie</label>
                    <select class="form-control" id="exampleSelectGender">
                      <option>Contrat à durée indéterminée (CDI)</option>
                      <option>Contrat à durée déterminée (CDD)</option>
                      <option>Contrat de travail temporaire</option>
                      <option>Contrat de travail à temps partiel</option>
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
                    <label for="exampleInputEmail1">Salaire de base</label>
                    <input type="number" className="form-control" id="decimalInput" step="0.01" min="0" />
                  </div>
                  <div className="form-group">
                    <label for="exampleInputEmail1">Salaire net</label>
                    <input type="number" className="form-control" id="decimalInput" step="0.01" min="0" />
                  </div>
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
                  <div className="form-group">
                    <label for="exampleInputUsername1">Modèle de bulletin</label>
                    <select class="form-control" id="exampleSelectGender">
                      <option>Bulletin 1</option>
                      <option>Bulletin 2</option>
                    </select>    
                  </div>
                  <div className="form-group">
                    <label for="exampleInputUsername1">Modes de paiement</label>
                    <select class="form-control" id="exampleSelectGender">
                      <option>Paiement 1</option>
                      <option>Paiement 2</option>
                    </select>    
                  </div>
                  <div className="form-group">
                    <label for="exampleInputEmail1">Fin contrat</label>
                    <input type="date" className="form-control" id="decimalInput" />
                  </div>
                </div>
              </div>
            </div>
          </div>
  );
}

export default AppointmentForm;
