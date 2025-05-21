import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import logoSoftwell from '../assets/images/softwell-logo.png';

/**
 * Génère un PDF d'évaluation administratif
 * @param {Object} evaluationData - Données de l'évaluation 
 * @param {Object} employeeData - Données de l'employé
 * @param {Object} ratings - Notes par question
 * @param {Number} average - Note moyenne
 * @param {Object} validationData - Données de validation (dates, approbations)
 * @param {Array} trainingSuggestions - Suggestions de formation
 * @returns {jsPDF} Document PDF généré
 */
export const generateEvaluationPDF = (
  evaluationData,
  employeeData,
  ratings,
  average,
  validationData,
  trainingSuggestions = []
) => {
  // Création du document PDF en format A4
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Marges
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Couleurs
  const primaryColor = [0, 102, 153]; // Bleu professionnel
  const secondaryColor = [102, 102, 102]; // Gris
  
  // ====== En-tête du document ======
  
  // Logo
  try {
    const imgWidth = 30; // Largeur du logo en mm
    doc.addImage(logoSoftwell, 'PNG', margin, margin, imgWidth, imgWidth * 0.5);
  } catch (error) {
    console.error("Erreur lors du chargement du logo:", error);
  }
  
  // Titre du document
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('RAPPORT D\'ÉVALUATION', pageWidth / 2, margin + 10, { align: 'center' });
  
  // Référence du document
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Référence: EV-${evaluationData.evaluationId}`, pageWidth - margin, margin, { align: 'right' });
  doc.text(`Date d'émission: ${new Date().toLocaleDateString()}`, pageWidth - margin, margin + 5, { align: 'right' });
  
  let yPos = margin + 25; // Position verticale actuelle
  
  // ====== Informations sur l'employé ======
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS SUR L\'EMPLOYÉ', margin, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Tableau des infos employé
  const employeeHeaders = [['ATTRIBUT', 'VALEUR']];
  
  const employeeData2 = [
    ['Nom', employeeData.lastName || 'N/A'],
    ['Prénom', employeeData.firstName || 'N/A'],
    ['Département', employeeData.department || 'N/A'],
    ['Poste', employeeData.position || 'N/A'],
    ['Date de l\'évaluation', evaluationData.date || new Date().toLocaleDateString()]
  ];
  
  doc.autoTable({
    startY: yPos,
    head: employeeHeaders,
    body: employeeData2,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255]
    },
    margin: { left: margin, right: margin },
    styles: { 
      cellPadding: 3,
      fontSize: 9
    }
  });
  
  yPos = doc.autoTable.previous.finalY + 15;
  
  // ====== Résumé de l'évaluation ======
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ DE L\'ÉVALUATION', margin, yPos);
  
  yPos += 8;
  
  // Note moyenne
  doc.setFontSize(14);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`Note moyenne: ${average}/5`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Calcul des statistiques
  const ratingGroups = {};
  Object.values(ratings).forEach(rating => {
    ratingGroups[rating] = (ratingGroups[rating] || 0) + 1;
  });
  
  // Tableau des statistiques
  const statsHeaders = [['NOTE', 'NOMBRE DE QUESTIONS', 'POURCENTAGE']];
  const totalQuestions = Object.keys(ratings).length;
  
  const statsData = [5, 4, 3, 2, 1].map(rating => {
    const count = ratingGroups[rating] || 0;
    const percentage = totalQuestions > 0 ? Math.round((count / totalQuestions) * 100) : 0;
    return [rating.toString(), count.toString(), `${percentage}%`];
  });
  
  doc.autoTable({
    startY: yPos,
    head: statsHeaders,
    body: statsData,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255]
    },
    margin: { left: margin, right: margin },
    styles: {
      cellPadding: 3,
      fontSize: 9
    }
  });
  
  yPos = doc.autoTable.previous.finalY + 15;
  
  // ====== Validation ======
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VALIDATION', margin, yPos);
  
  yPos += 8;
  
  const validationHeaders = [['APPROBATION', 'STATUT', 'DATE']];
  
  const validationRows = [
    ['Chef de service', validationData.serviceApproved ? 'Approuvé' : 'En attente', validationData.serviceDate || 'N/A'],
    ['Direction générale', validationData.dgApproved ? 'Approuvé' : 'En attente', validationData.dgDate || 'N/A'],
  ];
  
  doc.autoTable({
    startY: yPos,
    head: validationHeaders,
    body: validationRows,
    theme: 'grid',
    headStyles: { 
      fillColor: primaryColor,
      textColor: [255, 255, 255]
    },
    margin: { left: margin, right: margin },
    styles: {
      cellPadding: 3,
      fontSize: 9
    }
  });
  
  yPos = doc.autoTable.previous.finalY + 15;
  
  // ====== Suggestions de formation ======
  if (trainingSuggestions && trainingSuggestions.length > 0) {
    // Vérifier s'il reste assez d'espace sur la page actuelle
    if (yPos > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      yPos = margin;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SUGGESTIONS DE FORMATION', margin, yPos);
    
    yPos += 8;
    
    const trainingHeaders = [['QUESTION', 'FORMATION SUGGÉRÉE']];
    const trainingRows = trainingSuggestions.map(suggestion => [
      suggestion.question,
      suggestion.training
    ]);
    
    doc.autoTable({
      startY: yPos,
      head: trainingHeaders,
      body: trainingRows,
      theme: 'grid',
      headStyles: { 
        fillColor: primaryColor,
        textColor: [255, 255, 255]
      },
      margin: { left: margin, right: margin },
      styles: {
        cellPadding: 3,
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 'auto' }
      }
    });
    
    yPos = doc.autoTable.previous.finalY + 10;
  }
  
  // ====== Pied de page ======
  // Numéro de page
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Ligne de séparation
    doc.setDrawColor(200, 200, 200);
    doc.line(
      margin, 
      doc.internal.pageSize.getHeight() - 15, 
      doc.internal.pageSize.getWidth() - margin, 
      doc.internal.pageSize.getHeight() - 15
    );
    
    // Texte de pied de page
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Document généré automatiquement - Confidentiel - Page ${i} sur ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  return doc;
};

/**
 * Génère et télécharge un PDF d'évaluation
 */
export const downloadEvaluationPDF = (evaluationData, employeeData, ratings, average, validationData, trainingSuggestions) => {
  const doc = generateEvaluationPDF(evaluationData, employeeData, ratings, average, validationData, trainingSuggestions);
  
  // Nom du fichier
  const fileName = `Evaluation_${evaluationData.evaluationId || 'rapport'}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  // Téléchargement du fichier
  doc.save(fileName);
  
  return fileName;
}; 