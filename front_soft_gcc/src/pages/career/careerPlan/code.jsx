import React, { useState } from 'react';

function App() {
  // État pour stocker la sélection de l'utilisateur
  const [selectedItem, setSelectedItem] = useState('');

  // Liste d'éléments pour la liste déroulante
  const items = [
    { id: 1, label: 'Option 1', value: 'Content for Option 1' },
    { id: 2, label: 'Option 2', value: 'Content for Option 2' },
    { id: 3, label: 'Option 3', value: 'Content for Option 3' },
  ];

  // Fonction qui gère le changement dans la liste déroulante
  const handleSelectChange = (event) => {
    setSelectedItem(event.target.value);
  };

  return (
    <>
      
                    {/* Avancements */}
                    <table className="table table-striped table-competences">
                        <thead>
                            <tr>
                                <th>Date d'affectation</th>
                                <th>Departement</th>
                                <th>Categorie socio-professionnelle</th>
                                <th>Indice</th>
                                <th>Echelon</th>
                                <th>Etat</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>19/06/2020</td>
                                <td>Informatique</td>
                                <td>Categorie A</td>
                                <td>INdice 1</td>
                                <td>Echelon 1</td>
                                <td>En cours</td>
                                <td>
                                    <Button
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

                    {/* Mise en disponibilite */}
                    <table className="table table-striped table-competences">
                        <thead>
                            <tr>
                                <th>Date d'affectation</th>
                                <th>Etablissement</th>
                                <th>Debut</th>
                                <th>fin</th>
                                <th>Motif</th>
                                <th>Etat</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>19/06/2020</td>
                                <td>Softwell</td>
                                <td>19/06/2020</td>
                                <td>19/06/2020</td>
                                <td>Developpement d'application</td>
                                <td>En cours</td>
                                <td>
                                    <Button
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
    </>
  );
}

export default App;
