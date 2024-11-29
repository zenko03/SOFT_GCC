import React, { useState } from 'react';

const EvaluationImport = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => setFile(e.target.files[0]);
    const handleFileUpload = () => {
        if (!file) return alert('Veuillez sélectionner un fichier.');
        alert(`Fichier "${file.name}" importé avec succès.`);
        // Simuler l'extraction des données ici
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5>Import de la Fiche d'Évaluation</h5>
                <input type="file" className="form-control my-3" onChange={handleFileChange} />
                <button className="btn btn-primary" onClick={handleFileUpload}>
                    Importer
                </button>
            </div>
        </div>
    );
};

export default EvaluationImport;
