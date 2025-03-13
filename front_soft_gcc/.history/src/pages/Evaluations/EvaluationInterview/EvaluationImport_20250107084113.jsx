import React, { useState } from 'react';
import * as mammoth from 'mammoth'; 
const EvaluationImport = ({ interview, employeeId, onExtract }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleFileUpload = async () => {
        if (!file) {
            setError('Veuillez sélectionner un fichier.');
            return;
        }

        if (!file.name.endsWith('.docx')) {
            setError('Le fichier doit être au format .docx.');
            return;
        }

        try {
            // Lire le contenu du fichier Word
            const arrayBuffer = await file.arrayBuffer();
            const { value: text } = await mammoth.extractRawText({ arrayBuffer });

            // Simuler l'extraction des données depuis le texte brut
            const mockData = parseDataFromText(text);

            if (!mockData) {
                setError(
                    'Le fichier ne contient pas les informations requises (employeeId, employeeName, position, evaluationDate).'
                );
                return;
            }

            onExtract(mockData); // Transmettre les données extraites au parent
            alert(`Fichier "${file.name}" importé et traité avec succès.`);
        } catch (err) {
            setError('Erreur lors de la lecture ou du traitement du fichier.');
        }
    };

    // Fonction pour extraire des données depuis le texte brut du fichier
    const parseDataFromText = (text) => {
        const lines = text.split('\n');
        const data = {};

        lines.forEach((line) => {
            if (line.includes('employeeId:')) data.employeeId = line.split('employeeId:')[1].trim();
            if (line.includes('employeeName:')) data.employeeName = line.split('employeeName:')[1].trim();
            if (line.includes('position:')) data.position = line.split('position:')[1].trim();
            if (line.includes('evaluationDate:')) data.evaluationDate = line.split('evaluationDate:')[1].trim();
        });

        return data.employeeId && data.employeeName && data.position && data.evaluationDate
            ? data
            : null;
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
