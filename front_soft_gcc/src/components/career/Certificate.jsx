import React from 'react';

// Contenu du pied de page
function Certificate({ task }) {
  return (
            <form method='POST'>
                <div className="row"> 
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">                                
                                <div className="form-group">
                                    <label for="exampleInputEmail1">Reference</label>
                                    <input type="text" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label for="exampleInputEmail1">Societe</label>
                                    <input type="text" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label for="exampleInputUsername1">Type d'attestation</label>
                                    <select class="form-control" id="exampleSelectGender">
                                    <option>Attestation travail</option>
                                    <option>Certificat de travail</option>
                                    </select>    
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <div className="form-group">
                                    <label for="exampleInputEmail1">Motif</label>
                                    <input type="text" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label for="exampleInputEmail1">Date</label>
                                    <input type="date" className="form-control" />
                                </div>
                                <div className="form-group">
                                    <button type="button" className="btn btn-success btn-fw">Export pdf</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
  );
}

export default Certificate;
