-- Script pour mettre à jour la table Competence_Lines avec les valeurs SkillPositionId
-- correspondant aux associations position-compétence existantes

-- Mise à jour des compétences Java pour les développeurs
UPDATE Competence_Lines
SET SkillPositionId = 1
WHERE PositionId = 1 AND CompetenceName = 'Java/J2EE'
AND Description LIKE '%Java%';

-- Mise à jour des compétences .Net pour les développeurs
UPDATE Competence_Lines
SET SkillPositionId = 2
WHERE PositionId = 1 AND (CompetenceName LIKE '%.Net%' OR Description LIKE '%.Net%');

-- Mise à jour des compétences C# pour les développeurs
UPDATE Competence_Lines
SET SkillPositionId = 3
WHERE PositionId = 1 AND (CompetenceName LIKE '%C#%' OR Description LIKE '%C#%');

-- Mise à jour des compétences informatiques générales pour les développeurs
UPDATE Competence_Lines
SET SkillPositionId = 9
WHERE PositionId = 1 AND SkillPositionId IS NULL 
AND (CompetenceName LIKE '%JavaScript%' OR CompetenceName LIKE '%CSS%' OR CompetenceName LIKE '%DevOps%');

-- Mise à jour des compétences pour les techniciens - Maintenance & réseau
UPDATE Competence_Lines
SET SkillPositionId = 4
WHERE PositionId = 2 AND (CompetenceName LIKE '%Maintenance%' OR CompetenceName LIKE '%Réseau%' 
OR Description LIKE '%Maintenance%' OR Description LIKE '%réseau%');

-- Mise à jour des compétences informatiques pour les techniciens
UPDATE Competence_Lines
SET SkillPositionId = 5
WHERE PositionId = 2 AND SkillPositionId IS NULL 
AND (CompetenceName LIKE '%Support%' OR CompetenceName LIKE '%Sécurité%' 
OR Description LIKE '%Support%' OR Description LIKE '%Sécurité%');

-- Mise à jour des compétences Admin system pour les techniciens
UPDATE Competence_Lines
SET SkillPositionId = 10
WHERE PositionId = 2 AND SkillPositionId IS NULL;

-- Mise à jour des compétences Communication pour les responsables marketing
UPDATE Competence_Lines
SET SkillPositionId = 6
WHERE PositionId = 3 AND (CompetenceName LIKE '%Réseaux Sociaux%' OR CompetenceName LIKE '%SEO%' 
OR Description LIKE '%communauté%' OR Description LIKE '%campagne%');

-- Mise à jour des compétences Économie pour les responsables marketing
UPDATE Competence_Lines
SET SkillPositionId = 7
WHERE PositionId = 3 AND (CompetenceName LIKE '%Analyse%' OR CompetenceName LIKE '%Planification%' 
OR Description LIKE '%données%' OR Description LIKE '%budget%');

-- Mise à jour des compétences Gestion pour les responsables marketing
UPDATE Competence_Lines
SET SkillPositionId = 11
WHERE PositionId = 3 AND (CompetenceName LIKE '%Gestion%' OR Description LIKE '%équipe%');

-- Mise à jour des compétences informatiques pour les testeurs
UPDATE Competence_Lines
SET SkillPositionId = 8
WHERE PositionId = 4 AND (CompetenceName LIKE '%Tests%' OR Description LIKE '%test%')
AND CompetenceName NOT LIKE '%Selenium%';

-- Mise à jour des compétences Java pour les testeurs (automatisation avec Selenium)
UPDATE Competence_Lines
SET SkillPositionId = 12
WHERE PositionId = 4 AND (CompetenceName LIKE '%Selenium%' OR Description LIKE '%Selenium%');

-- Vérification des mises à jour
SELECT CompetenceLineId, PositionId, CompetenceName, Description, SkillPositionId
FROM Competence_Lines
ORDER BY PositionId, CompetenceLineId; 