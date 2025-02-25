import React, { useEffect, useState } from 'react';

const EvaluationFill = ({ extractedData }) => {
    const [evaluationData, setEvaluationData] = useState({
        objectives: '',
        skills: '',
        progress: '',
        recommendations: '',
    });

    // Mettre à jour les données du formulaire avec les données extraites
    useEffect(() => {
        if (extractedData) {
            setEvaluationData({
                objectives: extractedData.objectives || '',
                skills: extractedData.skills || '',
                progress: extractedData.progress || '',
                recommendations: extractedData.recommendations || '',
            });
        }
    }, [extractedData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEvaluationData({ ...evaluationData, [name]: value });
    };

    const handleSave = () => {
        console.log('Données enregistrées :', evaluationData);
        // Ajouter une logique pour enregistrer les données (appel API, etc.)
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5>Remplissage de la Fiche d'Évaluation</h5>
                {extractedData && (
                    <div className="mb-3">
                        <h6>Informations de Base :</h6>
                        <p><strong>Nom :</strong> {extractedData.employeeName || 'Non défini'}</p>
                        <p><strong>Poste :</strong> {extractedData.position || 'Non défini'}</p>
                        <p><strong>Date d'Évaluation :</strong> {extractedData.evaluationDate || 'Non définie'}</p>
                    </div>
                )}

                <textarea
                    name="objectives"
                    placeholder="Objectifs atteints"
                    className="form-control my-3"
                    value={evaluationData.objectives}
                    onChange={handleChange}
                ></textarea>
                <textarea
                    name="skills"
                    placeholder="Compétences observées"
                    className="form-control my-3"
                    value={evaluationData.skills}
                    onChange={handleChange}
                ></textarea>
                <textarea
                    name="progress"
                    placeholder="Axes de progrès"
                    className="form-control my-3"
                    value={evaluationData.progress}
                    onChange={handleChange}
                ></textarea>
                <textarea
                    name="recommendations"
                    placeholder="Recommandations"
                    className="form-control my-3"
                    value={evaluationData.recommendations}
                    onChange={handleChange}
                ></textarea>
                <button className="btn btn-primary" onClick={handleSave}>Enregistrer</button>
            </div>
        </div>
    );
};

export default EvaluationFill;
