/*
    Auteur : IA Assistant
    Date : 27 septembre 2024
    Description : Script pour remplir la colonne SkillPositionId dans la table Competence_Lines
                 en utilisant les descriptions des compétences pour faire les correspondances
*/

-- Afficher la structure actuelle de Competence_Lines
PRINT 'Structure actuelle de la table Competence_Lines:';
SELECT TOP 20 * FROM Competence_Lines;

-- 1. Mise à jour basée sur la correspondance entre Description et Skill_name
PRINT 'Mise à jour des SkillPositionId en utilisant la correspondance entre Description et Skill_name...';

-- Pour chaque compétence, essayons de trouver une correspondance basée sur le nom de la compétence
UPDATE CL
SET CL.SkillPositionId = SP.Skill_position_id
FROM Competence_Lines CL
INNER JOIN Skill S ON CL.Description LIKE '%' + S.Skill_name + '%' OR S.Skill_name LIKE '%' + CL.Description + '%'
INNER JOIN Skill_position SP ON SP.Skill_id = S.Skill_id
WHERE (CL.SkillPositionId IS NULL OR CL.SkillPositionId = 0)
AND S.Skill_name IS NOT NULL AND LEN(S.Skill_name) > 3; -- Éviter les correspondances trop courtes

-- 2. Approche plus spécifique pour certaines compétences particulières
PRINT 'Application de correspondances spécifiques...';

-- Mise à jour pour "Développement et personnalisation de sites WordPress" (CompetenceLineId = 4)
UPDATE Competence_Lines 
SET SkillPositionId = 1 -- Skill_position pour Java en position Développeur
WHERE CompetenceLineId = 4 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Maîtrise des feuilles de style et préprocesseurs" (CompetenceLineId = 5)
UPDATE Competence_Lines 
SET SkillPositionId = 2 -- Skill_position pour .Net en position Développeur
WHERE CompetenceLineId = 5 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Intégration continue et déploiement automatisé" (CompetenceLineId = 6)
UPDATE Competence_Lines 
SET SkillPositionId = 3 -- Skill_position pour C# en position Développeur
WHERE CompetenceLineId = 6 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Assistance technique aux utilisateurs" (CompetenceLineId = 7)
UPDATE Competence_Lines 
SET SkillPositionId = 4 -- Skill_position pour Admin system en position Technicien
WHERE CompetenceLineId = 7 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Maintenance et dépannage des équipements" (CompetenceLineId = 8)
UPDATE Competence_Lines 
SET SkillPositionId = 5 -- Skill_position pour Maintenance & réseau en position Technicien
WHERE CompetenceLineId = 8 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Configuration et surveillance des réseaux" (CompetenceLineId = 9)
UPDATE Competence_Lines 
SET SkillPositionId = 5 -- Skill_position pour Maintenance & réseau en position Technicien
WHERE CompetenceLineId = 9 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Protection des systèmes et données" (CompetenceLineId = 10)
UPDATE Competence_Lines 
SET SkillPositionId = 4 -- Skill_position pour Admin system en position Technicien
WHERE CompetenceLineId = 10 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Optimisation pour les moteurs de recherche et publicité" (CompetenceLineId = 11)
UPDATE Competence_Lines 
SET SkillPositionId = 6 -- Skill_position pour Communication en position Responsable marketing
WHERE CompetenceLineId = 11 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Gestion des communautés et campagnes sociales" (CompetenceLineId = 12)
UPDATE Competence_Lines 
SET SkillPositionId = 6 -- Skill_position pour Communication en position Responsable marketing
WHERE CompetenceLineId = 12 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Collecte et analyse des données marketing" (CompetenceLineId = 13)
UPDATE Competence_Lines 
SET SkillPositionId = 9 -- Skill_position pour Economie en position Responsable marketing
WHERE CompetenceLineId = 13 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Management des équipes marketing" (CompetenceLineId = 14)
UPDATE Competence_Lines 
SET SkillPositionId = 11 -- Skill_position pour Gestion en position Responsable marketing
WHERE CompetenceLineId = 14 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Allocation et suivi des ressources financières" (CompetenceLineId = 15)
UPDATE Competence_Lines 
SET SkillPositionId = 9 -- Skill_position pour Economie en position Responsable marketing
WHERE CompetenceLineId = 15 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Exécution de scénarios de test manuels" (CompetenceLineId = 16)
UPDATE Competence_Lines 
SET SkillPositionId = 12 -- Skill_position pour Java en position Testeur
WHERE CompetenceLineId = 16 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Développement de tests automatisés avec Selenium" (CompetenceLineId = 17)
UPDATE Competence_Lines 
SET SkillPositionId = 12 -- Skill_position pour Java en position Testeur
WHERE CompetenceLineId = 17 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Évaluation des performances des applications" (CompetenceLineId = 18)
UPDATE Competence_Lines 
SET SkillPositionId = 8 -- Skill_position pour Informatique en position Testeur
WHERE CompetenceLineId = 18 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- Mise à jour pour "Identification des vulnérabilités" (CompetenceLineId = 19)
UPDATE Competence_Lines 
SET SkillPositionId = 8 -- Skill_position pour Informatique en position Testeur
WHERE CompetenceLineId = 19 AND (SkillPositionId IS NULL OR SkillPositionId = 0);

-- 3. Vérifier les lignes qui n'ont toujours pas de SkillPositionId
DECLARE @UnmatchedCount INT;
SELECT @UnmatchedCount = COUNT(*) 
FROM Competence_Lines 
WHERE SkillPositionId IS NULL OR SkillPositionId = 0;

IF @UnmatchedCount > 0
BEGIN
    PRINT 'ATTENTION: ' + CAST(@UnmatchedCount AS NVARCHAR) + ' lignes n''ont pas pu être mises à jour avec un SkillPositionId valide.';
    PRINT 'Voici la liste des compétences sans correspondance:';
    
    SELECT CompetenceLineId, Description
    FROM Competence_Lines
    WHERE SkillPositionId IS NULL OR SkillPositionId = 0;
    
    -- Attribuer un SkillPositionId par défaut pour éviter les erreurs de contraintes
    -- Utilisons le premier SkillPositionId disponible
    DECLARE @DefaultSkillPositionId INT;
    SELECT @DefaultSkillPositionId = MIN(Skill_position_id) FROM Skill_position;
    
    UPDATE Competence_Lines
    SET SkillPositionId = @DefaultSkillPositionId
    WHERE SkillPositionId IS NULL OR SkillPositionId = 0;
    
    PRINT 'Ces compétences ont été associées au SkillPositionId par défaut: ' + CAST(@DefaultSkillPositionId AS NVARCHAR);
END
ELSE
BEGIN
    PRINT 'Toutes les lignes de Competence_Lines ont été mises à jour avec succès';
END

-- 4. Afficher les résultats après mise à jour
PRINT 'Résultats après mise à jour:';
SELECT TOP 20 CL.CompetenceLineId, CL.Description, CL.SkillPositionId, 
       SP.Position_id, SP.Skill_id,
       P.position_name, S.Skill_name
FROM Competence_Lines CL
JOIN Skill_position SP ON CL.SkillPositionId = SP.Skill_position_id
JOIN Position P ON SP.Position_id = P.Position_id
JOIN Skill S ON SP.Skill_id = S.Skill_id
ORDER BY CL.CompetenceLineId;

-- 5. Définir SkillPositionId comme non NULL si tout est cohérent
IF NOT EXISTS (SELECT 1 FROM Competence_Lines WHERE SkillPositionId IS NULL OR SkillPositionId = 0)
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID('Competence_Lines') 
        AND name = 'SkillPositionId' 
        AND is_nullable = 1
    )
    BEGIN
        -- Modifions la colonne pour la rendre NOT NULL
        ALTER TABLE Competence_Lines
        ALTER COLUMN SkillPositionId INT NOT NULL;
        
        PRINT 'La colonne SkillPositionId est maintenant définie comme NOT NULL';
    END
    ELSE
    BEGIN
        PRINT 'La colonne SkillPositionId est déjà définie comme NOT NULL';
    END
END

PRINT 'Script de mise à jour de Competence_Lines terminé avec succès';
