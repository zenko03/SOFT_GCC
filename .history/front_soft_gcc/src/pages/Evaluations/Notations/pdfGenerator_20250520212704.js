import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import softwellLogo from '../../../assets/images/Logo/softwellogo.png';

// Ajout d'un verrou global pour éviter les générations multiples de PDF
let pdfGenerationLock = false;

/**
 * Génère un PDF d'évaluation avec prévisualisation ou téléchargement
 * @param {Object} evaluationData - Données de l'évaluation 
 * @param {Object} employeeData - Données de l'employé
 * @param {Object} ratings - Notes par question
 * @param {Number} average - Note moyenne
 * @param {Object} validationData - Données de validation (dates, approbations)
 * @param {Array} trainingSuggestions - Suggestions de formation
 * @param {Boolean} previewOnly - Si true, renvoie l'URL du PDF au lieu de le télécharger
 * @returns {String|null} URL du PDF pour prévisualisation ou null si téléchargé
 */
export const generateEvaluationPDF = (
  evaluationData,
  employeeData,
  ratings,
  average,
  validationData,
  trainingSuggestions = [],
  previewOnly = false
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
  
  // Logo - Une image est chargée via le chemin d'importation
  let imgWidth = 30; // Largeur du logo en mm
  try {
    // Utilisation de l'objet Image pour précharger l'image
    const img = new Image();
    img.src = softwellLogo;
    
    // Attente du chargement de l'image
    img.onload = function() {
      // Ajout du logo une fois chargé
      doc.addImage(img, 'PNG', margin, margin, imgWidth, imgWidth * 0.5);
    };
    
    // En cas d'erreur, on continue sans le logo
    img.onerror = function() {
      console.error("Erreur lors du chargement du logo");
      // Dessiner un texte "SOFTWELL" au lieu du logo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('SOFTWELL', margin, margin + 5);
    };
    
    // On ajoute directement l'image et on remplace si nécessaire
    doc.addImage(softwellLogo, 'PNG', margin, margin, imgWidth, imgWidth * 0.5);
  } catch (error) {
    console.error("Erreur lors de l'ajout du logo:", error);
    // Dessiner un texte "SOFTWELL" au lieu du logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('SOFTWELL', margin, margin + 5);
  }
  
  // Titre du document
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FICHE D\'ÉVALUATION DES COMPÉTENCES', pageWidth / 2, margin + 10, { align: 'center' });
  
  // Sous-titre
  doc.setFontSize(12);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('Rapport détaillé des compétences et suggestions d\'amélioration', pageWidth / 2, margin + 16, { align: 'center' });
  
  // Référence du document
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Référence: EV-${evaluationData.evaluationId}`, pageWidth - margin, margin, { align: 'right' });
  doc.text(`Date d'émission: ${new Date().toLocaleDateString()}`, pageWidth - margin, margin + 5, { align: 'right' });
  
  let yPos = margin + 30; // Position verticale actuelle
  
  // ====== Informations sur l'employé ======
  doc.setFontSize(14);
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
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ DE L\'ÉVALUATION DES COMPÉTENCES', margin, yPos);
  
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
  
  // ====== Détail des évaluations par compétence ======
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('DÉTAIL DES COMPÉTENCES ÉVALUÉES', margin, yPos);
  
  yPos += 8;
  
  // Si nous avons des informations détaillées sur les questions et compétences
  // Nous pourrions afficher un tableau plus détaillé ici
  // Pour l'instant, on utilise les ratings directement
  
  // Convert ratings to array for table
  const ratingsArray = Object.entries(ratings).map(([questionId, score]) => {
    return [`Question #${questionId}`, score.toString() + '/5'];
  });
  
  if (ratingsArray.length > 0) {
    const ratingHeaders = [['COMPÉTENCE', 'ÉVALUATION']];
    
    doc.autoTable({
      startY: yPos,
      head: ratingHeaders,
      body: ratingsArray,
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
  }
  
  // ====== Validation ======
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VALIDATION OFFICIELLE', margin, yPos);
  
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
    
    // Numéro de page
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} sur ${totalPages}`, 
      pageWidth / 2, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: 'center' }
    );
    
    // Copyright
    doc.setFontSize(8);
    doc.text(
      '© SOFTWELL - Document confidentiel', 
      pageWidth - margin, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: 'right' }
    );
  }
  
  // Si c'est pour une prévisualisation, on renvoie l'URL
  if (previewOnly) {
    return URL.createObjectURL(doc.output('blob'));
  }
  
  // Sinon on télécharge le PDF
  const fileName = `Evaluation_${evaluationData.evaluationId}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
  return fileName;
};

/**
 * Télécharge un PDF d'évaluation
 */
export const downloadEvaluationPDF = (
  evaluationData, 
  employeeData, 
  ratings, 
  average, 
  validationData, 
  trainingSuggestions
) => {
  // Vérifier si une génération est déjà en cours
  if (pdfGenerationLock) {
    console.log("Une génération de PDF est déjà en cours, ignoré");
    return null;
  }
  
  // Activer le verrou
  pdfGenerationLock = true;
  console.log("Verrou de génération PDF activé");
  
  try {
    console.log("Génération du PDF pour téléchargement");
    
    // S'assurer que les données sont valides
    const safeEvaluationData = evaluationData || { 
      evaluationId: 0, 
      date: new Date().toLocaleDateString() 
    };
    
    // Générer le contenu complet du PDF d'abord
    try {
      // Générer un nom de fichier unique
      const fileName = `Evaluation_${safeEvaluationData.evaluationId}_${new Date().getTime()}.pdf`;
      
      // MÉTHODE DIRECTE: Créer et télécharger immédiatement un PDF complet
      console.log("Génération directe du PDF avec contenu complet");
      
      // Créer une nouvelle instance jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Ajouter un titre
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('FICHE D\'ÉVALUATION DES COMPÉTENCES', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
      
      // Ajouter les informations sur l'employé
      doc.setFontSize(14);
      doc.text('Informations sur l\'employé:', 20, 40);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Nom: ${employeeData.lastName || 'Non défini'}`, 20, 50);
      doc.text(`Prénom: ${employeeData.firstName || 'Non défini'}`, 20, 56);
      doc.text(`Poste: ${employeeData.position || 'Non défini'}`, 20, 62);
      doc.text(`Département: ${employeeData.department || 'Non défini'}`, 20, 68);
      
      // Ajouter la note moyenne
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Résultat d\'évaluation:', 20, 80);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Note moyenne: ${average}/5`, 20, 88);
      
      // Ajouter les validations
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Validations:', 20, 100);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Validation chef de service: ${validationData.serviceApproved ? 'Oui' : 'Non'}`, 20, 108);
      if (validationData.serviceApproved && validationData.serviceDate) {
        doc.text(`Date: ${validationData.serviceDate}`, 60, 108);
      }
      
      doc.text(`Validation direction générale: ${validationData.dgApproved ? 'Oui' : 'Non'}`, 20, 116);
      if (validationData.dgApproved && validationData.dgDate) {
        doc.text(`Date: ${validationData.dgDate}`, 60, 116);
      }
      
      // Ajouter les notations par question
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Détail des notations:', 20, 130);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      let yPos = 140;
      Object.entries(ratings).forEach(([questionId, rating], index) => {
        // Ajouter une nouvelle page si nécessaire
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(`Question #${questionId}: ${rating}/5`, 20, yPos);
        yPos += 8;
      });
      
      // Télécharger le PDF
      console.log("Téléchargement du PDF avec save()");
      
      // Méthode 1: Utiliser doc.save pour télécharger
      doc.save(fileName);
      
      // Méthode alternative au cas où doc.save ne fonctionne pas
      setTimeout(() => {
        try {
          console.log("Méthode alternative de téléchargement");
          const blob = doc.output('blob');
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          
          // Nettoyer
          setTimeout(() => {
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link);
          }, 200);
        } catch (err) {
          console.error("Erreur dans la méthode alternative:", err);
        }
      }, 500);
      
      return fileName;
    } catch (pdfError) {
      console.error("Erreur lors de la génération du PDF:", pdfError);
      
      // Méthode de secours si tout échoue
      alert(`Erreur lors de la génération du PDF. Résumé de l'évaluation:
Employé: ${employeeData.firstName} ${employeeData.lastName}
Département: ${employeeData.department}
Note moyenne: ${average}/5`);
      
      return null;
    }
  } catch (error) {
    console.error("Erreur globale lors du téléchargement du PDF:", error);
    return null;
  } finally {
    // Désactiver le verrou après un délai pour éviter les appels multiples
    setTimeout(() => {
      pdfGenerationLock = false;
      console.log("Verrou de génération PDF libéré");
    }, 2000); // Délai plus long pour s'assurer que tout est terminé
  }
};

/**
 * Génère une URL de prévisualisation du PDF d'évaluation
 */
export const previewEvaluationPDF = (
  evaluationData, 
  employeeData, 
  ratings, 
  average, 
  validationData, 
  trainingSuggestions
) => {
  // Pour la prévisualisation, pas besoin de verrou car on ne télécharge pas le fichier
  return generateEvaluationPDF(
    evaluationData, 
    employeeData, 
    ratings, 
    average, 
    validationData, 
    trainingSuggestions,
    true // Prévisualisation uniquement
  );
}; 