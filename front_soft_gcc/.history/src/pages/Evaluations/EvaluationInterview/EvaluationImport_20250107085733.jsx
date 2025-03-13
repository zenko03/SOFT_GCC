import React, { useState } from 'react';
import mammoth from 'mammoth'; // Notez l'utilisation en minuscule pour Mammoth.js

const EvaluationImport = ({ onExtract }) => {
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

        if (!file.name.toLowerCase().endsWith('.docx')) {
            setError('Le fichier doit être au format .docx.');
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();

            // Utilisation de Mammoth.js pour extraire du texte brut
            const { value: text } = await mammoth.extractRawText({ arrayBuffer });

            // Extraction des données du texte
            const extractedData = parseDataFromText(text);

            if (!extractedData) {
                setError(
                    'Le fichier ne contient pas les informations requises (employeeId, employeeName, position, evaluationDate).'
                );
                return;
            }

            onExtract(extractedData); // Envoi des données extraites au parent
            alert(`Fichier "${file.name}" importé et traité avec succès.`);
        } catch (err) {
            console.error('Erreur lors du traitement du fichier:', err);
            setError('Erreur lors de la lecture ou du traitement du fichier.');
        }
    };

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
                    accept=".docx"
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
