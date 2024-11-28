import React, {useState, useEffect} from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
import LoaderComponent from '../../helpers/LoaderComponent';
import DateDisplay from '../../helpers/DateDisplay';

// Contenu du pied de page
function History({ registrationNumber }) {
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(false); 

    // Appel api pour les donnees du formulaire
    const [dataHistory, setDataHistory] = useState([]); 

    // Chargement des donnees depuis l'api 
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [historyResponse] = await Promise.all([
                axios.get(urlApi(`/CareerPlan/employee/${registrationNumber}/history`))
            ]);
            setDataHistory(historyResponse.data || []);
            console.log(historyResponse);
        } catch (error) {
            setError(`Erreur lors de la recuperation des donnees : ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [registrationNumber]);

    console.log(dataHistory);

    /// Gestion d'affichage de loading
    if (isLoading) {
        return <div>
                <LoaderComponent />
            </div>;
    }

    /// Gestion d'affichage d'erreur
    if (error) {
        return <div>Erreur: {error.message}</div>;
    }

  return (
    <div className="row">
        <div className="col-lg-12 grid-margin">
            <div className="card">
                <div className="card-body">
                    <table className="table table-striped table-competences">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(dataHistory) && dataHistory.map((item, id) => (
                            <tr>
                                <td className="description-cell">
                                    {item.description}
                                </td>
                                <td><DateDisplay isoDate={item.dateCreation} /></td>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
}

export default History;
