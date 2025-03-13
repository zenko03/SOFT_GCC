import React, { useState } from 'react';

const EvaluationImport = ({ interview, employeeId, onExtract }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(''); // Réinitialiser l'erreur lors de la sélection d'un nouveau fichier
    };

    const handleFileUpload = async () => {
        if (!file) {
            setError('Veuillez sélectionner un fichier.');
            return;
        }

        if (file.type !== 'application/json') {
            setError('Le fichier doit être au format JSON.');
            return;
        }

        try {
            const fileContent = await file.text(); // Lire le contenu du fichier
            const data = JSON.parse(fileContent);

            // Validation des données du fichier
            if (
                !data.employeeId ||
                !data.employeeName ||
                !data.position ||
                !data.evaluationDate
            ) {
                setError(
                    'Le fichier JSON doit contenir les champs : employeeId, employeeName, position et evaluationDate.'
                );
                return;
            }

            onExtract(data); // Transmettre les données extraites au parent
            alert(`Fichier "${file.name}" importé et traité avec succès.`);
        } catch (err) {
            setError('Erreur lors de la lecture ou du traitement du fichier.');
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5>Import de la Fiche d'Évaluation</h5>
                <input
                    type="file"
                    className="form-control my-3"
                    onChange={handleFileChange}
                />
                {error && <div className="text-danger mb-3">{error}</div>}
                <button className="btn btn-primary" onClick={handleFileUpload}>
                    Importer
                </button>
            </div>
        </div>
    );
};

export default EvaluationImport;
