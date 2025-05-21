-- Script d'ajout de la colonne MaxTimeInMinutes à la table Evaluation_questions
ALTER TABLE Evaluation_questions
ADD MaxTimeInMinutes INT NULL DEFAULT 15;

-- Mise à jour des valeurs existantes
UPDATE Evaluation_questions 
SET MaxTimeInMinutes = 15
WHERE MaxTimeInMinutes IS NULL;

PRINT 'Colonne MaxTimeInMinutes ajoutée et initialisée avec succès.'; 