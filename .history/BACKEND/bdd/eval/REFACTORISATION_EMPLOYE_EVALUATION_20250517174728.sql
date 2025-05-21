/*
    Auteur : Assistant IA
    Date : 27 septembre 2024
    Description : Script de refactorisation du module Évaluation pour utiliser la table Employee au lieu de Users.
    Ce script modifie la structure des tables sans migration automatique des données, car les données
    de test entre Users et Employee sont différentes.
    
    ATTENTION: Ce script modifie la structure de la base de données sans migrer les données existantes.
    À exécuter uniquement après sauvegarde complète de la base de données!
*/

-- =============================================================================================
-- ÉTAPE 1 : MODIFICATION DES CLÉS ÉTRANGÈRES ET DES CONTRAINTES
-- =============================================================================================

-- Supprimer les contraintes de clé étrangère sur InterviewParticipants
ALTER TABLE InterviewParticipants
DROP CONSTRAINT IF EXISTS FK_InterviewParticipants_Users;

-- Supprimer les contraintes de clé étrangère sur Evaluation_progress
ALTER TABLE Evaluation_progress
DROP CONSTRAINT IF EXISTS FK_EvaluationProgress_Users;

-- Supprimer les contraintes de clé étrangère sur TemporaryAccounts
ALTER TABLE TemporaryAccounts
DROP CONSTRAINT IF EXISTS FK_TemporaryAccounts_Users;

-- Supprimer les contraintes de clé étrangère sur Evaluations
ALTER TABLE Evaluations
DROP CONSTRAINT IF EXISTS FK_Evaluations_Users;

-- =============================================================================================
-- ÉTAPE 2 : MODIFICATION DES TABLES POUR UTILISER EMPLOYEE AU LIEU DE USERS
-- =============================================================================================

-- Modifier la table Evaluations pour ajouter employeeId
ALTER TABLE Evaluations 
ADD employeeId INT NULL;

-- Ajouter la contrainte de clé étrangère vers Employee
ALTER TABLE Evaluations 
ADD CONSTRAINT FK_Evaluations_Employee
FOREIGN KEY (employeeId) REFERENCES Employee(Employee_id);

-- Modifier la table InterviewParticipants pour ajouter EmployeeId
ALTER TABLE InterviewParticipants 
ADD EmployeeId INT NULL;

-- Ajouter la contrainte de clé étrangère vers Employee
ALTER TABLE InterviewParticipants 
ADD CONSTRAINT FK_InterviewParticipants_Employee
FOREIGN KEY (EmployeeId) REFERENCES Employee(Employee_id);

-- Modifier la table Evaluation_progress pour ajouter employeeId
ALTER TABLE Evaluation_progress 
ADD employeeId INT NULL;

-- Ajouter la contrainte de clé étrangère vers Employee
ALTER TABLE Evaluation_progress 
ADD CONSTRAINT FK_EvaluationProgress_Employee
FOREIGN KEY (employeeId) REFERENCES Employee(Employee_id);

-- Modifier la table TemporaryAccounts pour ajouter EmployeeId
ALTER TABLE TemporaryAccounts 
ADD EmployeeId INT NULL;

-- Ajouter la contrainte de clé étrangère vers Employee
ALTER TABLE TemporaryAccounts 
ADD CONSTRAINT FK_TemporaryAccounts_Employee
FOREIGN KEY (EmployeeId) REFERENCES Employee(Employee_id);

-- =============================================================================================
-- ÉTAPE 3 : RECRÉATION DES VUES
-- =============================================================================================

-- Supprimer les vues existantes
DROP VIEW IF EXISTS VEmployeesWithoutEvaluation;
DROP VIEW IF EXISTS VEmployeesFinishedEvaluation;
DROP VIEW IF EXISTS VEmployeesOngoingEvaluation;
DROP VIEW IF EXISTS VEmployeeEvaluationProgress;
DROP VIEW IF EXISTS VTemporaryActiveAccounts;
DROP VIEW IF EXISTS VEvaluationHistory;

-- Recréer la vue VEmployeesWithoutEvaluation
CREATE VIEW VEmployeesWithoutEvaluation AS
SELECT 
    e.Employee_id AS EmployeeId,
    ISNULL(ep.Position_id, 0) AS positionId,
    e.FirstName AS FirstName,
    e.Name AS LastName,
    ISNULL(ep.Position_name, 'Non défini') AS Position,
    e.Department_id AS DepartmentId,
    d.Department_name AS Department,
    ev.start_date AS startDate,
    ev.end_date AS endDate,
    ev.state AS state
FROM Employee e
LEFT JOIN Department d ON e.Department_id = d.Department_id
-- Joindre la vue v_employee_position pour obtenir le poste actuel
LEFT JOIN v_employee_position ep ON e.Employee_id = ep.Employee_id
LEFT JOIN Evaluations ev ON e.Employee_id = ev.employeeId
WHERE NOT EXISTS (
    SELECT 1 
    FROM Evaluations eval
    WHERE eval.employeeId = e.Employee_id 
    AND eval.state IN (10, 15, 20) -- Exclure les employés avec des évaluations actives
)
AND (
    -- Soit l'employé n'a jamais eu d'évaluation
    NOT EXISTS (SELECT 1 FROM Evaluations WHERE employeeId = e.Employee_id)
    -- Soit sa dernière évaluation est archivée (état 30)
    OR EXISTS (
        SELECT 1 
        FROM Evaluations eval
        WHERE eval.employeeId = e.Employee_id 
        AND eval.state = 30
        AND eval.Evaluations_id = (
            SELECT MAX(Evaluations_id) 
            FROM Evaluations 
            WHERE employeeId = e.Employee_id
        )
    )
);

-- Recréer la vue VEmployeesFinishedEvaluation
CREATE VIEW VEmployeesFinishedEvaluation AS
SELECT 
    e.Employee_id AS EmployeeId,
    ISNULL(ep.Position_id, 0) AS positionId,
    e.FirstName AS FirstName,
    e.Name AS LastName,
    ISNULL(ep.Position_name, 'Non défini') AS Position,
    ev.start_date AS startDate,
    ev.end_date AS endDate,
    ev.Evaluations_id AS evaluationId,
    d.Department_name AS Department,
    d.Department_id AS DepartmentId,
    ev.state AS state,
    ev.strengths AS strengths,
    ev.weaknesses AS weaknesses,
    ev.comments AS comments,
    ev.overallScore AS overallScore,
    ei.scheduled_date AS InterviewDate,
    ei.status AS InterviewStatus,
    ei.director_approval AS directorApproval,
    ei.manager_approval AS managerApproval,
    ei.director_comments AS directorComments,
    ei.manager_comments AS managerComments
FROM Employee e
LEFT JOIN Department d ON e.Department_id = d.Department_id
-- Joindre la vue v_employee_position pour obtenir le poste actuel
LEFT JOIN v_employee_position ep ON e.Employee_id = ep.Employee_id
LEFT JOIN Evaluations ev ON e.Employee_id = ev.employeeId
LEFT JOIN Evaluation_interviews ei ON ev.Evaluations_id = ei.evaluationId
WHERE ev.state = 20;

-- Recréer la vue VEmployeesOngoingEvaluation
CREATE VIEW VEmployeesOngoingEvaluation AS
SELECT 
    e.Employee_id AS EmployeeId,
    e.FirstName AS FirstName,
    e.Name AS LastName,
    ISNULL(ep.Position_name, 'Non défini') AS Position,
    ev.start_date AS StartDate,
    ev.end_date AS EndDate,
    ev.Evaluations_id AS EvaluationId,
    et.designation AS EvaluationType,
    et.Evaluation_type_id AS EvaluationTypeId,
    ev.state AS EvaluationState
FROM Employee e
-- Joindre la vue v_employee_position pour obtenir le poste actuel
LEFT JOIN v_employee_position ep ON e.Employee_id = ep.Employee_id
LEFT JOIN Evaluations ev ON e.Employee_id = ev.employeeId
LEFT JOIN Evaluation_type et ON ev.evaluationType_id = et.Evaluation_type_id
WHERE ev.state = 15;

-- Recréer la vue VEmployeeEvaluationProgress
CREATE VIEW VEmployeeEvaluationProgress AS
SELECT 
    ep.evaluationId AS EvaluationId,
    ep.employeeId AS EmployeeId,
    e.FirstName AS FirstName,
    e.Name AS LastName,
    ep.totalQuestions AS TotalQuestions,
    ep.answeredQuestions AS AnsweredQuestions,
    ep.progressPercentage AS Progress,
    ep.lastUpdate AS LastUpdated
FROM Evaluation_progress ep
JOIN Employee e ON ep.employeeId = e.Employee_id;

-- Recréer la vue VTemporaryActiveAccounts
CREATE VIEW VTemporaryActiveAccounts AS
SELECT 
    ta.TempAccountId,
    e.Employee_id AS EmployeeId,
    ta.TempLogin,
    ta.ExpirationDate,
    ev.Evaluations_id,
    ev.start_date AS EvaluationStart,
    ev.end_date AS EvaluationEnd
FROM TemporaryAccounts ta
JOIN Employee e ON ta.EmployeeId = e.Employee_id
JOIN Evaluations ev ON ta.Evaluations_id = ev.Evaluations_id
WHERE ta.ExpirationDate > GETUTCDATE() 
  AND ta.IsUsed = 0;

-- Recréer la vue VEvaluationHistory avec support pour Employee
CREATE VIEW VEvaluationHistory AS
SELECT 
    ev.Evaluations_id AS EvaluationId,
    ev.employeeId AS EmployeeId,
    e.FirstName AS FirstName,
    e.Name AS LastName,
    et.designation AS EvaluationType,
    ev.start_date AS StartDate,
    ev.end_date AS EndDate,
    ev.overallScore AS OverallScore,
    ev.comments AS EvaluationComments,
    ev.strengths AS Strengths,
    ev.weaknesses AS Weaknesses,
    ev.isServiceApproved AS IsServiceApproved,
    ev.isDgApproved AS IsDgApproved,
    ei.scheduled_date AS InterviewDate,
    ei.status AS InterviewStatus,
    ISNULL(ep.Position_name, 'Non défini') AS Position,
    d.Department_name AS Department,
    ev.state AS Status,
    (SELECT STRING_AGG(training.training, ', ')
     FROM (
         SELECT DISTINCT ts.training
         FROM Evaluation_questionnaire eq
         JOIN Training_suggestions ts 
         ON eq.questionId = ts.questionId 
         AND eq.score < ts.scoreThreshold
         WHERE eq.evaluationId = ev.Evaluations_id
     ) AS training
    ) AS Recommendations,
    (SELECT STRING_AGG(participants.full_name, ', ')
     FROM (
         SELECT DISTINCT ip.ParticipantId, e_part.FirstName + ' ' + e_part.Name AS full_name
         FROM InterviewParticipants ip
         JOIN Employee e_part ON ip.EmployeeId = e_part.Employee_id
         WHERE ip.InterviewId = ei.InterviewId
     ) AS participants
    ) AS ParticipantNames,
    (SELECT STRING_AGG(CAST(participant_ids.EmployeeId AS NVARCHAR), ', ')
     FROM (
         SELECT DISTINCT ip.ParticipantId, e_part.Employee_id AS EmployeeId
         FROM InterviewParticipants ip
         JOIN Employee e_part ON ip.EmployeeId = e_part.Employee_id
         WHERE ip.InterviewId = ei.InterviewId
     ) AS participant_ids
    ) AS ParticipantIds,
    (SELECT STRING_AGG(CONCAT('ID:', CAST(eq.Question_id AS NVARCHAR), ', Question:', eq.question, ', Score:', CAST(eqn.score AS NVARCHAR)), '; ')
     FROM Evaluation_questionnaire eqn
     JOIN Evaluation_questions eq ON eqn.questionId = eq.Question_id
     WHERE eqn.evaluationId = ev.Evaluations_id
    ) AS QuestionDetails
FROM Evaluations ev
JOIN Employee e ON ev.employeeId = e.Employee_id
LEFT JOIN Department d ON e.Department_id = d.Department_id
-- Joindre la vue v_employee_position pour obtenir le poste actuel
LEFT JOIN v_employee_position ep ON e.Employee_id = ep.Employee_id
LEFT JOIN Evaluation_type et ON ev.evaluationType_id = et.Evaluation_type_id
LEFT JOIN Evaluation_interviews ei ON ev.Evaluations_id = ei.evaluationId
WHERE ev.state = 20
GROUP BY 
    ev.Evaluations_id, ev.employeeId, e.FirstName, e.Name, et.designation, 
    ev.start_date, ev.end_date, ev.overallScore, ev.comments, 
    ev.strengths, ev.weaknesses, ev.isServiceApproved, ev.isDgApproved, 
    ei.scheduled_date, ei.status, ei.InterviewId,
    ep.Position_name, d.Department_name, ev.state;

-- =============================================================================================
-- ÉTAPE 4 : GESTION DE LA RELATION USERS-EMPLOYEE
-- =============================================================================================

-- Ajouter une colonne EmployeeId à la table Users pour établir la relation
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('Users') AND name = 'EmployeeId'
)
BEGIN
    ALTER TABLE Users 
    ADD EmployeeId INT NULL;

    -- Ajouter la contrainte de clé étrangère
    ALTER TABLE Users 
    ADD CONSTRAINT FK_Users_Employee
    FOREIGN KEY (EmployeeId) REFERENCES Employee(Employee_id);
    
    -- Note: Aucune correspondance automatique n'est établie
    -- puisque les données de test sont différentes
    PRINT 'La colonne EmployeeId a été ajoutée à la table Users. Vous devrez établir manuellement la correspondance.';
END

-- =============================================================================================
-- ÉTAPE 5 : SUPPRESSION DES COLONNES OBSOLÈTES (À EXÉCUTER APRÈS VALIDATION)
-- =============================================================================================

-- Ces commandes sont commentées pour être exécutées ultérieurement, après avoir validé la migration
/*
-- Suppression de la colonne userId dans Evaluations
ALTER TABLE Evaluations 
DROP COLUMN userId;

-- Suppression de la colonne UserId dans InterviewParticipants
ALTER TABLE InterviewParticipants 
DROP COLUMN UserId;

-- Suppression de la colonne userId dans Evaluation_progress
ALTER TABLE Evaluation_progress 
DROP COLUMN userId;

-- Suppression de la colonne UserId dans TemporaryAccounts
ALTER TABLE TemporaryAccounts 
DROP COLUMN UserId;
*/

-- Script terminé
PRINT 'Refactorisation de structure terminée avec succès! Les données existantes n''ont pas été migrées.';
PRINT 'Vous devez maintenant créer manuellement les correspondances entre Users et Employee.';
PRINT 'Une fois la migration et la validation complétées, exécutez les commandes commentées de l''étape 5 pour supprimer les anciennes colonnes.'; 