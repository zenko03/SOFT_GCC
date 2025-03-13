import React, { useState } from 'react';
import * as JSZip from 'jszip';

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
            const content = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(content);

            // Extraction du document.xml (contenu principal du fichier Word)
            const xmlContent = await zip.file('word/document.xml').async('text');
            console.log("contenu de l'xml ",xmlContent); // Affiche le contenu XML extrait

            // Parser le contenu XML pour extraire les informations
            const mockData = parseDataFromXML(xmlContent);

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

    // Fonction pour extraire des données depuis le contenu XML
    const parseDataFromXML = (xmlContent) => {
        const data = {};
        const matches = {
            employeeId: /employeeId:\s*([\w-]+)/,
            employeeName: /employeeName:\s*([\w\s]+)/,
            position: /position:\s*([\w\s]+)/,
            evaluationDate: /evaluationDate:\s*([\d-]+)/,
        };

        Object.keys(matches).forEach((key) => {
            const match = xmlContent.match(matches[key]);
            if (match) data[key] = match[1];
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
