import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap'; // Utilisation d'Alert de React-Bootstrap
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
import LoaderComponent from '../../helpers/LoaderComponent';
import DateDisplay from '../../helpers/DateDisplay';
import { Tooltip } from 'react-tooltip';
import './tooltip.css';
import AttestationHistory from '../../pages/certificateManagement/AttestationHistory';

function History({ registrationNumber }) {
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(null); 
    const [successMessage, setSuccessMessage] = useState(null); // État pour le message de succès
    const [dataHistory, setDataHistory] = useState([]); 

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [historyResponse] = await Promise.all([
                axios.get(urlApi(`/CareerPlan/employee/${registrationNumber}/history`))
            ]);
            setDataHistory(historyResponse.data || []);
        } catch (error) {
            setError(`Erreur lors de la récupération des données : ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [registrationNumber]);

    const handleDeleteHistory = async (itemToDelete) => {
        try {
            await axios.delete(urlApi(`/CareerPlan/History/Delete/${itemToDelete.historyId}`));
            setSuccessMessage("L'élément a été supprimé avec succès."); // Définir le message de succès
            fetchData(); // Recharge les données après suppression
        } catch (error) {
            setError(`Erreur lors de la suppression : ${error.message}`);
        }
    };

    // Réinitialise les messages après un certain temps
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setError(null);
            }, 5000); // Cache le message après 5 secondes

            return () => clearTimeout(timer); // Nettoyage
        }
    }, [successMessage, error]);

    if (isLoading) {
        return <LoaderComponent />;
    }

    return (
        <div className="row">
            <div className="col-lg-12 grid-margin">
                {successMessage && (
                    <Alert variant="success" className="mb-4">
                        {successMessage}
                    </Alert>
                )}
                {error && (
                    <Alert variant="danger" className="mb-4">
                        {error}
                    </Alert>
                )}
                <AttestationHistory  registrationNumber={registrationNumber} />
                <div className="card">
                    <div className="card-body">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Date</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(dataHistory) && dataHistory.map((item, id) => (
                                    <tr key={id}>
                                        <td className="description-cell">{item.description}</td>
                                        <td><DateDisplay isoDate={item.dateCreation} /></td>
                                        <td>
                                            <Button
                                                onClick={() => handleDeleteHistory(item)}
                                                data-tooltip-id="example-tooltip"
                                                data-tooltip-content="Supprimer de l'historique"
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
                        <Tooltip id="example-tooltip" className="custom-tooltip fade-in-tooltip" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default History;
