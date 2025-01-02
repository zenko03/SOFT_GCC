import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EvaluationImport from './EvaluationImport';
import EvaluationFill from './EvaluationFill';
import EvaluationWorkflow from './EvaluationInterviews';
import '../../../assets/css/Evaluations/EvaluationInterviews.css';
import Template from '../../Template';

const EvaluationInterviews = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [extractedData, setExtractedData] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    // Charger les employés depuis le backend
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get('/api/employees/interviews');
                setEmployees(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération des données :', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const handlePlanInterview = async (id) => {
        const newDate = prompt('Entrez la date de l’entretien (YYYY-MM-DD) :');
        if (newDate) {
            try {
                await axios.put(`/api/employees/${id}/schedule-interview`, {
                    interviewDate: newDate,
                });
                setEmployees((prev) =>
                    prev.map((emp) =>
                        emp.id === id ? { ...emp, interviewDate: newDate } : emp
                    )
                );
            } catch (error) {
                console.error('Erreur lors de la planification :', error);
            }
        }
    };

    const handleStartInterview = (id) => {
        alert(`Entretien pour l'employé ${id} démarré !`);
        // Logique supplémentaire pour démarrer l'entretien
    };

    const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
    const handlePreviousStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <EvaluationImport />;
            case 2:
                return <EvaluationFill extractedData={extractedData} />;
            case 3:
                return <EvaluationWorkflow />;
            default:
                return null;
        }
    };

    if (loading) {
        return <div className="container mt-4">Chargement des données...</div>;
    }

    return (
        <Template>
            <div className="container mt-4">
                <h2 className="mb-4">Gestion des Entretiens d'Évaluation</h2>

                {/* Liste des employés */}
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Nom de l'employé</th>
                            <th>Date d'entretien</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee) => (
                            <tr key={employee.id}>
                                <td>{employee.name}</td>
                                <td>
                                    {employee.interviewDate
                                        ? employee.interviewDate
                                        : 'Non planifiée'}
                                </td>
                                <td>
                                    {!employee.interviewDate ? (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                handlePlanInterview(employee.id)
                                            }
                                        >
                                            Planifier l'entretien
                                        </button>
                                    ) : employee.interviewDate === today ? (
                                        <button
                                            className="btn btn-success"
                                            onClick={() =>
                                                handleStartInterview(employee.id)
                                            }
                                        >
                                            Démarrer l'entretien
                                        </button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Étapes du processus */}
                <ul className="step-navigation">
                    <li
                        className={currentStep === 1 ? 'active' : ''}
                        onClick={() => setCurrentStep(1)}
                    >
                        Import de la Fiche
                    </li>
                    <li
                        className={currentStep === 2 ? 'active' : ''}
                        onClick={() => setCurrentStep(2)}
                    >
                        Remplissage de la Fiche
                    </li>
                    <li
                        className={currentStep === 3 ? 'active' : ''}
                        onClick={() => setCurrentStep(3)}
                    >
                        Validation
                    </li>
                </ul>

                {/* Contenu de l'étape */}
                <div className="step-content">{renderStepContent()}</div>

                {/* Boutons de navigation */}
                <div className="d-flex justify-content-between mt-4">
                    <button
                        className="btn btn-secondary"
                        disabled={currentStep === 1}
                        onClick={handlePreviousStep}
                    >
                        Précédent
                    </button>
                    <button
                        className="btn btn-primary"
                        disabled={currentStep === 3}
                        onClick={handleNextStep}
                    >
                        Suivant
                    </button>
                </div>
            </div>
        </Template>
    );
};

export default EvaluationInterviews;
