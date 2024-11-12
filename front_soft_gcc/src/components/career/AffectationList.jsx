import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

// Pour lister les types d'affectation
function AffectationList({ task }) {

    const navigate = useNavigate();

    const handleClickEdit = () => {
        navigate('/carriere/fiche/edit'); 
    };

  return (
    <div className="row"> 
        <div className="col-md-12 grid-margin stretch-card">
            <div className="card">
                <div className="card-body">  
                    <div className="template-demo">
                        <div className="dropdown">
                            <button className="btn btn-warning dropdown-toggle" type="button" id="dropdownMenuButton4" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"> Type d'affectation </button>
                            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton4">
                                <h1 className="dropdown-header" style={{color: 'black'}}>Type d'affectation</h1>
                                <a className="dropdown-item" href="#">Nomination</a>
                                <a className="dropdown-item" href="#"> Mise en disponibilites</a>
                                <a className="dropdown-item" href="#"> Avancements</a>
                            </div>
                        </div>
                    </div>

                    {/* Contrat */}
                    <table className="table table-striped table-competences">
                        <thead>
                            <tr>
                                <th>Date d'affectation</th>
                                <th>Etablissement</th>
                                <th>Departement</th>
                                <th>Poste</th>
                                <th>Type</th>
                                <th>Debut</th>
                                <th>Fin</th>
                                <th>Salaire</th>
                                <th>Etat</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>19/06/2020</td>
                                <td>Softwell</td> 
                                <td>Informatique</td>
                                <td>Developpeur</td>
                                <td>CDI</td>
                                <td>19/06/2020</td>
                                <td>19/06/2024</td>
                                <td>700 000</td>
                                <td>
                                    <Button
                                        onClick={() => {
                                            handleClickEdit();
                                        }}
                                        style={{
                                            width: '25px',
                                            height: '25px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: 'white',
                                                border: 'white',
                                        }}
                                    >
                                        <i className="mdi mdi-pencil icon-edit" style={{ fontSize: '20px' }}></i>
                                    </Button>
                                </td>
                                <td>
                                    <Button
                                        style={{
                                            width: '25px',
                                            height: '25px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            backgroundColor: 'white',
                                            border: 'white'
                                        }}
                                    >
                                        <i className="mdi mdi-delete icon-delete" style={{ fontSize: '20px' }}></i>
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
}

export default AffectationList;
