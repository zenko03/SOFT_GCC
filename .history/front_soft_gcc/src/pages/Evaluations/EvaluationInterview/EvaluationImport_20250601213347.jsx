import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const EvaluationImport = ({ interview, employeeId, onExtract }) => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [extractionStatus, setExtractionStatus] = useState({
        attempted: false,
        success: false,
        message: ''
    });

    // Effet pour nettoyer les URLs lors du démontage du composant
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Fonction pour récupérer la dernière fiche d'évaluation
    const fetchEvaluationPDF = useCallback(async () => {
        try {
            setIsLoading(true);
            setLoadingMessage("Récupération de la fiche d'évaluation en cours...");
            
            // Utilisation de l'ID d'évaluation de l'interview si disponible
            const evaluationId = interview?.evaluationId;
            console.log(`Récupération de la fiche d'évaluation pour l'interview ${evaluationId}`);
            
            // Récupérer le PDF d'évaluation spécifique à cet employé
            const response = await axios.get(`https://localhost:7082/api/EvaluationInterview/get-evaluation-pdf/${employeeId}`, {
                responseType: 'blob'
            });
            
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
            setFile(pdfBlob);
            
            // Créer une URL pour la prévisualisation
            const newPreviewUrl = URL.createObjectURL(pdfBlob);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl); // Libérer l'ancienne URL
            }
            setPreviewUrl(newPreviewUrl);
            
            toast.success("Fiche d'évaluation récupérée avec succès");
            
            // Lancer automatiquement l'extraction
            await extractPdfData(pdfBlob);
        } catch (error) {
            console.error("Erreur lors de la récupération de la fiche d'évaluation:", error);
            toast.error(error.response?.data || "Erreur lors de la récupération de la fiche d'évaluation");
            setExtractionStatus({
                attempted: true,
                success: false,
                message: "Impossible de récupérer la fiche d'évaluation."
            });
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [employeeId, previewUrl, interview]);
    
    // Gestion du changement de fichier
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                
                // Créer une URL pour la prévisualisation
                if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(URL.createObjectURL(selectedFile));
            } else {
                toast.error("Veuillez sélectionner un fichier PDF valide");
            }
        }
    };
    
    // Fonction pour extraire les données du PDF
    const extractPdfData = async (pdfFile) => {
        if (!pdfFile) {
            toast.error("Aucun fichier PDF à traiter");
            return;
        }
        
        try {
            setIsLoading(true);
            setLoadingMessage("Extraction des données en cours...");
            
            // Créer un FormData pour envoyer le fichier
            const formData = new FormData();
            formData.append('file', pdfFile);
            formData.append('employeeId', employeeId);
            
            // Envoyer au service d'extraction
            const response = await axios.post(
                'https://localhost:7082/api/EvaluationInterview/extract-pdf-data',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            // Si l'extraction a réussi, appeler onExtract avec les données
            if (response.data) {
                onExtract(response.data);
                setExtractionStatus({
                    attempted: true,
                    success: true,
                    message: `${response.data.questions?.length || 0} questions extraites avec succès.`
                });
                toast.success("Données extraites avec succès");
            }
        } catch (error) {
            console.error("Erreur lors de l'extraction des données:", error);
            toast.error(error.response?.data?.message || "Erreur lors de l'extraction des données");
            setExtractionStatus({
                attempted: true,
                success: false,
                message: "L'extraction des données a échoué."
            });
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };
    
    return (
        <div className="evaluation-import-container">
            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center bg-light">
                    <h5 className="mb-0 d-flex align-items-center">
                        <i className="mdi mdi-file-pdf-outline text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
                        Import de la fiche d&apos;évaluation
                    </h5>
                </div>
                
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-4">
                                <button 
                                    className="btn btn-primary d-flex align-items-center justify-content-center w-100"
                                    onClick={fetchEvaluationPDF}
                                    disabled={isLoading}
                                >
                                    {isLoading && loadingMessage.includes("Récupération") ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Récupération en cours...
                                        </>
                                    ) : (
                                        <>
                                            <i className="mdi mdi-cloud-download-outline me-2"></i>
                                            Récupérer la dernière fiche d&apos;évaluation
                                        </>
                                    )}
                                </button>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-muted mb-2">
                                    <i className="mdi mdi-information-outline me-1"></i>
                                    Ou importez une fiche manuellement:
                                </p>
                                <div className="custom-file-input">
                                    <input 
                                        type="file" 
                                        id="pdfFileInput"
                                        className="form-control" 
                                        accept="application/pdf" 
                                        onChange={handleFileChange}
                                        disabled={isLoading} 
                                    />
                                </div>
                            </div>
                            
                            {file && (
                                <div className="mb-4">
                                    <button 
                                        className="btn btn-success w-100"
                                        onClick={() => extractPdfData(file)}
                                        disabled={isLoading}
                                    >
                                        {isLoading && loadingMessage.includes("Extraction") ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Extraction en cours...
                                            </>
                                        ) : (
                                            <>
                                                <i className="mdi mdi-text-recognition me-2"></i>
                                                Extraire les données
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {extractionStatus.attempted && (
                                <div className={`alert ${extractionStatus.success ? 'alert-success' : 'alert-danger'}`}>
                                    <i className={`mdi ${extractionStatus.success ? 'mdi-check-circle' : 'mdi-alert'} me-2`}></i>
                                    {extractionStatus.message}
                                </div>
                            )}
                        </div>
                        
                        <div className="col-md-6">
                            {previewUrl ? (
                                <div className="pdf-preview h-100">
                                    <h6 className="border-bottom pb-2 mb-3">
                                        <i className="mdi mdi-eye-outline me-2"></i>
                                        Aperçu du document
                                    </h6>
                                    <div className="pdf-container" style={{ height: '400px', overflow: 'hidden', border: '1px solid #dee2e6', borderRadius: '4px' }}>
                                        <iframe 
                                            src={previewUrl} 
                                            width="100%" 
                                            height="100%"
                                            title="Aperçu PDF"
                                            style={{ border: 'none' }}
                                        ></iframe>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-5 h-100 d-flex flex-column justify-content-center align-items-center border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                    <i className="mdi mdi-file-document-outline text-muted" style={{ fontSize: '4rem' }}></i>
                                    <p className="mt-3 mb-0 text-muted">Aucun document sélectionné</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

EvaluationImport.propTypes = {
  interview: PropTypes.object.isRequired,
  employeeId: PropTypes.number.isRequired,
  onExtract: PropTypes.func.isRequired
};

export default EvaluationImport;
