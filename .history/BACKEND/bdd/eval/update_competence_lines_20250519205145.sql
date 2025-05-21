-- Script pour mettre à jour la table Competence_Lines avec les valeurs SkillPositionId
-- conformément au modèle CompetenceLine.cs

-- D'abord, vérifier la structure actuelle de la table
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Competence_Lines';

-- Nous devons d'abord ajouter la colonne SkillPositionId si elle n'existe pas
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Competence_Lines' AND COLUMN_NAME = 'SkillPositionId'
)
BEGIN
    ALTER TABLE Competence_Lines
    ADD SkillPositionId INT NULL;
    
    PRINT 'Colonne SkillPositionId ajoutée à la table Competence_Lines';
END

-- Mettre à jour les associations selon les données de Skill_position
-- Pour les développeurs (PositionId = 1)
UPDATE cl
SET cl.SkillPositionId = sp.Skill_position_id
FROM Competence_Lines cl
JOIN Skill_position sp ON sp.Position_id = 1 
WHERE cl.PositionId = 1 AND (
    (sp.Skill_id = 1 AND (cl.CompetenceName LIKE '%Java%' OR cl.Description LIKE '%Java%')) OR
    (sp.Skill_id = 2 AND (cl.CompetenceName LIKE '%.Net%' OR cl.Description LIKE '%.Net%')) OR
    (sp.Skill_id = 3 AND (cl.CompetenceName LIKE '%C#%' OR cl.Description LIKE '%C#%')) OR
    (sp.Skill_id = 7 AND (cl.CompetenceName LIKE '%JavaScript%' OR cl.CompetenceName LIKE '%CSS%' OR cl.CompetenceName LIKE '%DevOps%'))
);

-- Pour les techniciens (PositionId = 2)
UPDATE cl
SET cl.SkillPositionId = sp.Skill_position_id
FROM Competence_Lines cl
JOIN Skill_position sp ON sp.Position_id = 2
WHERE cl.PositionId = 2 AND (
    (sp.Skill_id = 5 AND (cl.CompetenceName LIKE '%Maintenance%' OR cl.CompetenceName LIKE '%Réseau%' 
                     OR cl.Description LIKE '%Maintenance%' OR cl.Description LIKE '%réseau%')) OR
    (sp.Skill_id = 7 AND (cl.CompetenceName LIKE '%Support%' OR cl.CompetenceName LIKE '%Sécurité%')) OR
    (sp.Skill_id = 4 AND cl.SkillPositionId IS NULL)
);

-- Pour les responsables marketing (PositionId = 3)
UPDATE cl
SET cl.SkillPositionId = sp.Skill_position_id
FROM Competence_Lines cl
JOIN Skill_position sp ON sp.Position_id = 3
WHERE cl.PositionId = 3 AND (
    (sp.Skill_id = 6 AND (cl.CompetenceName LIKE '%Réseaux Sociaux%' OR cl.CompetenceName LIKE '%SEO%' 
                     OR cl.Description LIKE '%communauté%' OR cl.Description LIKE '%campagne%')) OR
    (sp.Skill_id = 9 AND (cl.CompetenceName LIKE '%Analyse%' OR cl.CompetenceName LIKE '%Planification%' 
                     OR cl.Description LIKE '%données%' OR cl.Description LIKE '%budget%')) OR
    (sp.Skill_id = 11 AND (cl.CompetenceName LIKE '%Gestion%' OR cl.Description LIKE '%équipe%'))
);

-- Pour les testeurs (PositionId = 4)
UPDATE cl
SET cl.SkillPositionId = sp.Skill_position_id
FROM Competence_Lines cl
JOIN Skill_position sp ON sp.Position_id = 4
WHERE cl.PositionId = 4 AND (
    (sp.Skill_id = 7 AND (cl.CompetenceName LIKE '%Tests%' OR cl.Description LIKE '%test%')
                     AND cl.CompetenceName NOT LIKE '%Selenium%') OR
    (sp.Skill_id = 1 AND (cl.CompetenceName LIKE '%Selenium%' OR cl.Description LIKE '%Selenium%'))
);

-- Mettre à jour l'état si nécessaire
UPDATE Competence_Lines
SET State = 1
WHERE State IS NULL;

-- Vérification des mises à jour
SELECT CompetenceLineId, PositionId, CompetenceName, Description, SkillPositionId, State
FROM Competence_Lines
ORDER BY PositionId, CompetenceLineId; 