import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Génère et télécharge un PDF d'évaluation.
 * @param {Object} evaluationData - Données de l'évaluation
 * @param {Object} employeeData - Données de l'employé
 * @param {Object} ratings - Notes par question
 * @param {Number} average - Note moyenne
 * @param {Object} validationData - Données de validation
 * @param {Array} trainingSuggestions - Suggestions de formation
 * @returns {String} Nom du fichier généré
 */
export const downloadEvaluationPDF = (
  evaluationData,
  employeeData,
  ratings,
  average,
  validationData,
  trainingSuggestions = []
) => {
  // Créer un nouveau document PDF
  const doc = new jsPDF();
  
  // Définir les coordonnées de base
  let y = 20;
  
  // Titre
  doc.setFontSize(16);
  doc.text('Rapport d\'évaluation des compétences', 105, y, { align: 'center' });
  y += 10;
  
  // Informations sur l'employé
  doc.setFontSize(12);
  doc.text(`Employé: ${employeeData.firstName} ${employeeData.lastName}`, 20, y);
  y += 7;
  doc.text(`Poste: ${employeeData.position}`, 20, y);
  y += 7;
  doc.text(`Département: ${employeeData.department}`, 20, y);
  y += 7;
  doc.text(`Date d'évaluation: ${evaluationData.date}`, 20, y);
  y += 15;
  
  // Note moyenne
  doc.setFontSize(14);
  doc.text(`Note moyenne: ${average}/5`, 20, y);
  y += 15;
  
  // Tableau des notations
  const headers = [['Question', 'Note']];
  const data = Object.entries(ratings).map(([questionId, note]) => [`Question #${questionId}`, `${note}/5`]);
  
  doc.autoTable({
    head: headers,
    body: data,
    startY: y,
  });
  
  y = doc.autoTable.previous.finalY + 15;
  
  // Validation
  doc.setFontSize(14);
  doc.text('Validation', 20, y);
  y += 7;
  
  doc.setFontSize(12);
  doc.text(`Chef de service: ${validationData.serviceApproved ? 'Approuvé' : 'Non approuvé'}`, 20, y);
  if (validationData.serviceApproved && validationData.serviceDate) {
    doc.text(`(${validationData.serviceDate})`, 100, y);
  }
  y += 7;
  
  doc.text(`Direction générale: ${validationData.dgApproved ? 'Approuvé' : 'Non approuvé'}`, 20, y);
  if (validationData.dgApproved && validationData.dgDate) {
    doc.text(`(${validationData.dgDate})`, 100, y);
  }
  y += 15;
  
  // Suggestions de formation (si présentes)
  if (trainingSuggestions && trainingSuggestions.length > 0) {
    doc.setFontSize(14);
    doc.text('Suggestions de formation', 20, y);
    y += 7;
    
    doc.setFontSize(12);
    trainingSuggestions.forEach(suggestion => {
      doc.text(`- ${suggestion.training}`, 20, y);
      y += 7;
    });
  }
  
  // Enregistrer et télécharger le PDF
  const fileName = `evaluation_${evaluationData.evaluationId}_${new Date().getTime()}.pdf`;
  
  try {
    // Méthode 1: Utiliser la méthode save() standard
    doc.save(fileName);
    console.log("PDF téléchargé avec la méthode standard");
  } catch (error) {
    console.error("Erreur avec la méthode standard:", error);
    
    try {
      // Méthode 2: Téléchargement manuel via un lien
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = fileName;
      
      // Simuler un clic pour déclencher le téléchargement
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Nettoyer
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log("PDF téléchargé avec la méthode alternative");
    } catch (alternativeError) {
      console.error("Échec des deux méthodes de téléchargement:", alternativeError);
      alert("Erreur lors du téléchargement du PDF. Veuillez réessayer.");
    }
  }
  
  return fileName;
};

/**
 * Génère une URL pour prévisualiser un PDF d'évaluation
 */
export const previewEvaluationPDF = (
  evaluationData,
  employeeData,
  ratings,
  average,
  validationData,
  trainingSuggestions = []
) => {
  // Créer un nouveau document PDF identique à celui du téléchargement
  const doc = new jsPDF();
  
  // Définir les coordonnées de base
  let y = 20;
  
  // Titre
  doc.setFontSize(16);
  doc.text('Rapport d\'évaluation des compétences', 105, y, { align: 'center' });
  y += 10;
  
  // Informations sur l'employé
  doc.setFontSize(12);
  doc.text(`Employé: ${employeeData.firstName} ${employeeData.lastName}`, 20, y);
  y += 7;
  doc.text(`Poste: ${employeeData.position}`, 20, y);
  y += 7;
  doc.text(`Département: ${employeeData.department}`, 20, y);
  y += 7;
  doc.text(`Date d'évaluation: ${evaluationData.date}`, 20, y);
  y += 15;
  
  // Note moyenne
  doc.setFontSize(14);
  doc.text(`Note moyenne: ${average}/5`, 20, y);
  y += 15;
  
  // Tableau des notations
  const headers = [['Question', 'Note']];
  const data = Object.entries(ratings).map(([questionId, note]) => [`Question #${questionId}`, `${note}/5`]);
  
  doc.autoTable({
    head: headers,
    body: data,
    startY: y,
  });
  
  y = doc.autoTable.previous.finalY + 15;
  
  // Validation
  doc.setFontSize(14);
  doc.text('Validation', 20, y);
  y += 7;
  
  doc.setFontSize(12);
  doc.text(`Chef de service: ${validationData.serviceApproved ? 'Approuvé' : 'Non approuvé'}`, 20, y);
  if (validationData.serviceApproved && validationData.serviceDate) {
    doc.text(`(${validationData.serviceDate})`, 100, y);
  }
  y += 7;
  
  doc.text(`Direction générale: ${validationData.dgApproved ? 'Approuvé' : 'Non approuvé'}`, 20, y);
  if (validationData.dgApproved && validationData.dgDate) {
    doc.text(`(${validationData.dgDate})`, 100, y);
  }
  y += 15;
  
  // Suggestions de formation (si présentes)
  if (trainingSuggestions && trainingSuggestions.length > 0) {
    doc.setFontSize(14);
    doc.text('Suggestions de formation', 20, y);
    y += 7;
    
    doc.setFontSize(12);
    trainingSuggestions.forEach(suggestion => {
      doc.text(`- ${suggestion.training}`, 20, y);
      y += 7;
    });
  }
  
  // Générer un blob du PDF et créer une URL pour la prévisualisation
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}; 