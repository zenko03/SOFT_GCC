import React, { useState } from 'react';

const EvaluationImport = () => {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null); // Données extraites simulées

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleFileUpload = () => {
    if (!file) return alert('Veuillez sélectionner un fichier.');
    // Simuler l'extraction de données
    const mockData = {
      employeeName: 'John Doe',
      position: 'Développeur',
      evaluationDate: '2024-11-25',
    };
    setExtractedData(mockData);
    alert(`Fichier "${file.name}" importé avec succès.`);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5>Import de la Fiche d'Évaluation</h5>
        <input type="file" className="form-control my-3" onChange={handleFileChange} />
        <button className="btn btn-primary" onClick={handleFileUpload}>
          Importer
        </button>

        {extractedData && (
          <div className="mt-3">
            <h6>Informations Extraites :</h6>
            <p><strong>Nom :</strong> {extractedData.employeeName}</p>
            <p><strong>Poste :</strong> {extractedData.position}</p>
            <p><strong>Date d'Évaluation :</strong> {extractedData.evaluationDate}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationImport;
