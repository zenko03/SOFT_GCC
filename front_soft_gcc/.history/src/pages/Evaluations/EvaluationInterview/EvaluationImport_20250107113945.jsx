import React, { useState } from 'react';

const EvaluationImport = ({ onExtract, interview, employeeId }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');

    console.log('Interview:', interview);
    console.log('Employee ID:', employeeId);

    // Détecte le type de fichier
    const getFileType = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        if (extension === 'docx') return 'docx';
        if (extension === 'csv') return 'csv';
        if (extension === 'xlsx') return 'excel';
        return null;
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const parseExtractedData = (rawText) => {
        // Ajout d'une séparation explicite entre les paires clé-valeur
        const keys = ['employeeId', 'employeeName', 'position', 'evaluationDate'];
        let separatedText = rawText;
    
        keys.forEach((key) => {
            const regex = new RegExp(`(${key}):`, 'g'); // Trouver chaque clé suivie de ":"
            separatedText = separatedText.replace(regex, '\n$1:'); // Insérer un saut de ligne avant chaque clé
        });
    
        // Maintenant, on peut traiter les données ligne par ligne
        const data = {};
        const lines = separatedText.split('\n'); // Divise le texte en lignes basées sur les sauts de ligne ajoutés
    
        lines.forEach((line) => {
            const [key, ...valueParts] = line.split(':'); // Sépare par `:` pour trouver clé et valeur
            if (!key || valueParts.length === 0) return; // Ignore les lignes mal formatées
            const value = valueParts.join(':').trim(); // Réassemble la valeur si elle contenait `:`
    
            if (key.toLowerCase().includes('employeeid')) {
                data.employeeId = value;
            } else if (key.toLowerCase().includes('employeename')) {
                data.employeeName = value;
            } else if (key.toLowerCase().includes('position')) {
                data.position = value;
            } else if (key.toLowerCase().includes('evaluationdate')) {
                data.evaluationDate = value;
            }
        });
    
        return data;
    };
    
    
    

    const handleFileUpload = async () => {
        if (!file) {
            setError('Veuillez sélectionner un fichier.');
            return;
        }

        const fileType = getFileType(file.name);
        if (!fileType) {
            setError('Le fichier doit être au format .docx, .csv, ou .xlsx.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            let apiUrl = '';
            if (fileType === 'docx') apiUrl = 'https://localhost:7082/api/files/upload-docx';
            if (fileType === 'csv') apiUrl = 'https://localhost:7082/api/files/upload-csv';
            if (fileType === 'excel') apiUrl = 'https://localhost:7082/api/files/upload-excel';

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Erreur lors de l'appel à l'API : ${response.statusText}`);
            }

            const result = await response.json();
            const parsedData = parseExtractedData(result.text); // Analyse les données extraites

            onExtract(parsedData); // Transmet les données extraites au composant parent
            console.log('Données extraites envoyées au parent :', parsedData);

            alert(`Fichier "${file.name}" importé et traité avec succès.`);
        } catch (err) {
            console.error('Erreur lors du traitement du fichier:', err);
            setError('Erreur lors de la lecture ou du traitement du fichier.');
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5>Import de la Fiche d'Évaluation</h5>
                <input
                    type="file"
                    accept=".docx,.csv,.xlsx"
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
