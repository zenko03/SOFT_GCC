import React from 'react';
import { Button } from 'react-bootstrap';

// Contenu du pied de page
function History({ task }) {
  return (
    <div class="row">
        <div class="col-lg-12 grid-margin">
            <div class="card">
                <div class="card-body">
                    <table className="table table-striped table-competences">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Nouveau contrat</td>
                                <td class="description-cell">
                                    Prendre la responsabilité de développement des applications 
                                    client à partir de 19 juillet 2024...
                                </td>
                                <td>19/06/2024</td>
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

export default History;
