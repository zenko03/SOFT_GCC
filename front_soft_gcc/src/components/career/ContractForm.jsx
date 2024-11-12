import React from 'react';

// Contenu du pied de page
function ContractForm({ task }) {
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
                        <div className="form-group">
                            <label for="exampleInputEmail1">Detachement</label>
                            <input type="checkbox" className="form-control" id="decimalInput" />
                        </div>
                        <div className="form-group">
                            <label for="exampleInputEmail1">Expatrié</label>
                            <input type="checkbox" className="form-control" id="decimalInput" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
  );
}

export default ContractForm;
