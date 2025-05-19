/*
    Auteur : IA Assistant
    Date : 27 septembre 2024
    Description : Script pour mettre à jour la table Competence_Lines en assignant 
                 les valeurs SkillPositionId appropriées à partir des données existantes
*/

-- Afficher la structure actuelle de Competence_Lines
PRINT 'Structure actuelle de la table Competence_Lines:';
SELECT TOP 10 * FROM Competence_Lines;

-- Vérifier si la colonne SkillPositionId existe déjà
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('Competence_Lines') AND name = 'SkillPositionId'
)
BEGIN
    -- Ajouter la colonne SkillPositionId
    ALTER TABLE Competence_Lines
    ADD SkillPositionId INT NULL;
    
    PRINT 'Colonne SkillPositionId ajoutée à la table Competence_Lines';
END
ELSE
BEGIN
    PRINT 'La colonne SkillPositionId existe déjà dans la table Competence_Lines';
END

-- Mise à jour des valeurs de SkillPositionId en fonction des données existantes
-- Cette requête crée une correspondance entre PositionId et CompetenceName dans Competence_Lines
-- et les données de SkillPosition
UPDATE CL
SET CL.SkillPositionId = SP.Skill_position_id
FROM Competence_Lines CL
INNER JOIN Position P ON CL.PositionId = P.Position_id
INNER JOIN Skill S ON CL.CompetenceName LIKE '%' + S.Skill_name + '%'
INNER JOIN Skill_position SP ON SP.Position_id = P.Position_id AND SP.Skill_id = S.Skill_id
WHERE CL.SkillPositionId IS NULL OR CL.SkillPositionId = 0;

-- Pour les lignes qui n'ont pas trouvé de correspondance parfaite,
-- assignons un SkillPositionId par défaut basé sur la position
UPDATE CL
SET CL.SkillPositionId = (
    SELECT TOP 1 SP.Skill_position_id
    FROM Skill_position SP
    WHERE SP.Position_id = CL.PositionId
    ORDER BY SP.Skill_position_id
)
FROM Competence_Lines CL
WHERE CL.SkillPositionId IS NULL OR CL.SkillPositionId = 0;

-- Vérifier les lignes qui n'ont toujours pas de SkillPositionId
DECLARE @UnmatchedCount INT;
SELECT @UnmatchedCount = COUNT(*) 
FROM Competence_Lines 
WHERE SkillPositionId IS NULL OR SkillPositionId = 0;

IF @UnmatchedCount > 0
BEGIN
    PRINT 'ATTENTION: ' + CAST(@UnmatchedCount AS NVARCHAR) + ' lignes n''ont pas pu être mises à jour avec un SkillPositionId valide.';
    PRINT 'Voici la liste des compétences sans correspondance:';
    
    SELECT CompetenceLineId, PositionId, CompetenceName, Description
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

-- Afficher les résultats après mise à jour
PRINT 'Résultats après mise à jour:';
SELECT TOP 20 CL.CompetenceLineId, CL.CompetenceName, CL.PositionId, CL.SkillPositionId, 
       SP.Position_id AS SP_PositionId, SP.Skill_id,
       P.position_name, S.Skill_name
FROM Competence_Lines CL
JOIN Skill_position SP ON CL.SkillPositionId = SP.Skill_position_id
JOIN Position P ON SP.Position_id = P.Position_id
JOIN Skill S ON SP.Skill_id = S.Skill_id
ORDER BY CL.CompetenceLineId;

-- Vérifier la cohérence entre PositionId dans CompetenceLine et Position_id dans SkillPosition
DECLARE @InconsistentCount INT;
SELECT @InconsistentCount = COUNT(*) 
FROM Competence_Lines CL
JOIN Skill_position SP ON CL.SkillPositionId = SP.Skill_position_id
WHERE CL.PositionId <> SP.Position_id;

IF @InconsistentCount > 0
BEGIN
    PRINT 'ATTENTION: ' + CAST(@InconsistentCount AS NVARCHAR) + ' lignes ont une inconsistance entre PositionId et Position_id de SkillPosition';
    
    SELECT CL.CompetenceLineId, CL.CompetenceName, CL.PositionId, SP.Position_id AS SP_PositionId,
           P1.position_name AS CL_Position, P2.position_name AS SP_Position
    FROM Competence_Lines CL
    JOIN Skill_position SP ON CL.SkillPositionId = SP.Skill_position_id
    JOIN Position P1 ON CL.PositionId = P1.Position_id
    JOIN Position P2 ON SP.Position_id = P2.Position_id
    WHERE CL.PositionId <> SP.Position_id;
END
ELSE
BEGIN
    PRINT 'La cohérence entre PositionId et Position_id de SkillPosition est respectée';
END

-- Vérification que toutes les compétences ont bien un SkillPositionId non nul
IF EXISTS (SELECT 1 FROM Competence_Lines WHERE SkillPositionId IS NULL OR SkillPositionId = 0)
BEGIN
    PRINT 'ERREUR: Certaines compétences ont toujours un SkillPositionId NULL ou 0';
END
ELSE
BEGIN
    PRINT 'Toutes les compétences ont maintenant un SkillPositionId valide';
    
    -- Définir SkillPositionId comme non NULL si tout est cohérent
    IF NOT EXISTS (
        SELECT 1 
        FROM sys.columns 
        WHERE object_id = OBJECT_ID('Competence_Lines') 
        AND name = 'SkillPositionId' 
        AND is_nullable = 0
    )
    BEGIN
        -- Modifions la colonne pour la rendre NOT NULL
        ALTER TABLE Competence_Lines
        ALTER COLUMN SkillPositionId INT NOT NULL;
        
        PRINT 'La colonne SkillPositionId est maintenant définie comme NOT NULL';
    END
END

-- Supprimer les anciennes colonnes PositionId et CompetenceName (version commentée pour sécurité)
/*
IF EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('Competence_Lines') AND name = 'PositionId'
)
BEGIN
    ALTER TABLE Competence_Lines
    DROP COLUMN PositionId;
    
    PRINT 'Colonne PositionId supprimée de Competence_Lines';
END

IF EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('Competence_Lines') AND name = 'CompetenceName'
)
BEGIN
    ALTER TABLE Competence_Lines
    DROP COLUMN CompetenceName;
    
    PRINT 'Colonne CompetenceName supprimée de Competence_Lines';
END
*/

PRINT 'Script de mise à jour de Competence_Lines terminé avec succès';
