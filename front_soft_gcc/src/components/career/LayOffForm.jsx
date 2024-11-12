import React from 'react';

// Contenu du pied de page
function LayOffForm({ task }) {
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
                        >Mise en disponibilité</h4>

                        <div className="form-group">
                            <label for="exampleInputEmail1">Motif</label>
                            <input type="text" className="form-control" id="decimalInput" />
                        </div>
                        <div className="form-group">
                            <label for="exampleInputEmail1">Institution d'affectation</label>
                            <input type="text" className="form-control" id="decimalInput" />
                        </div>                                
                        <div className="form-group">
                            <label for="exampleInputEmail1">Date début</label>
                            <input type="date" className="form-control" id="decimalInput" />
                        </div>
                        <div className="form-group">
                            <label for="exampleInputEmail1">Date fin</label>
                            <input type="date" className="form-control" id="decimalInput" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
  );
}

export default LayOffForm;
