-- Désactiver temporairement toutes les contraintes
EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';

BEGIN TRANSACTION;

-- Tables de niveau le plus profond (dépendantes)
DELETE FROM InterviewParticipants;
DELETE FROM Evaluation_interviews;
DELETE FROM Training_suggestions;
DELETE FROM Evaluation_questionnaire;
DELETE FROM Evaluation_progress;
DELETE FROM Evaluations;
DELETE FROM Evaluation_questions;

-- Suppression des données dans les nouvelles tables
DELETE FROM Competence_Trainings; -- Si elle existe
DELETE FROM Competence_Lines; -- Si elle existe

-- Gestion des références circulaires dans Users
UPDATE Users SET deleted_by = NULL, created_by = NULL; 
DELETE FROM Users;

-- Tables Permission (si vous souhaitez les conserver, commentez ces lignes)
DELETE FROM Role_Permissions;
DELETE FROM Permissions;

-- Réactiver toutes les contraintes
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';

-- Réinitialisation de toutes les séquences IDENTITY (sauf Department, Position, Roles)
DBCC CHECKIDENT ('Users', RESEED, 0);
DBCC CHECKIDENT ('Evaluation_type', RESEED, 0);
DBCC CHECKIDENT ('Evaluations', RESEED, 0);
DBCC CHECKIDENT ('Evaluation_questions', RESEED, 0);
DBCC CHECKIDENT ('Evaluation_questionnaire', RESEED, 0);
DBCC CHECKIDENT ('Training_suggestions', RESEED, 0);
DBCC CHECKIDENT ('Evaluation_interviews', RESEED, 0);
DBCC CHECKIDENT ('InterviewParticipants', RESEED, 0);
DBCC CHECKIDENT ('Evaluation_progress', RESEED, 0);
DBCC CHECKIDENT ('Competence_Lines', RESEED, 0);
DBCC CHECKIDENT ('Competence_Trainings', RESEED, 0);
--DBCC CHECKIDENT ('Permissions', RESEED, 0);
--DBCC CHECKIDENT ('Role_Permissions', RESEED, 0);

COMMIT TRANSACTION;







INSERT INTO Department (Department_name)
VALUES
    ('Informatique'),
    ( 'Marketing'),
    ('Direction'),
    ( 'Vente et commerce'),
    ('Reseaux et techniques');
	use BaseGcc_presentation
INSERT INTO Position(position_name)
VALUES
    ('Developpeur'),             -- Poste_id = 1
    ('Technicien'),				-- Poste_id = 2
    ('Responsable Marketing'),     -- Poste_id = 3
    ('Testeur');					-- Poste_id = 4

 INSERT INTO Roles (title)
 VALUES 
    ('Administrator'), -- Role_id = 1 
    ('Manager'),       -- Role_id = 2 
    ('Employee'),      -- Role_id = 3 
    ('Director');      -- Role_id = 4
---------------------------
-- 1. Administrateur
---------------------------
INSERT INTO Users 
    (last_name, first_name, email, password, role_id, departmentid, positionId, creation_date, created_by, deletion_date, deleted_by, state)
VALUES 
    ('Rasoanirina', 'Andrianina', 'admin.mg@example.com', 'passAdmin', 1, 1, 2, GETUTCDATE(), 1, NULL, NULL, 1);

---------------------------
-- 2. Managers
---------------------------
INSERT INTO Users 
    (last_name, first_name, email, password, role_id, departmentid, positionId, creation_date, created_by, deletion_date, deleted_by, state)
VALUES 
    ('Rakotoarisoa', 'Fanja', 'fanja.mg@example.com', 'passManager1', 2, 2, 4, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Randrianarisoa', 'Mialy', 'mialy.mg@example.com', 'passManager2', 2, 4, 8, GETUTCDATE(), 1, NULL, NULL, 1);

---------------------------
-- 3. Directeurs
---------------------------
INSERT INTO Users 
    (last_name, first_name, email, password, role_id, departmentid, positionId, creation_date, created_by, deletion_date, deleted_by, state)
VALUES 
    ('Rasolofoson', 'Hery', 'hery.mg@example.com', 'passDirector1', 4, 3, 6, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Raharison', 'Andry', 'andry.mg@example.com', 'passDirector2', 4, 3, 6, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Ratsimbazafy', 'Tovo', 'tovo.mg@example.com', 'passDirector3', 4, 3, 6, GETUTCDATE(), 1, NULL, NULL, 1);

---------------------------
-- 4. Employés (20 enregistrements)
---------------------------
INSERT INTO Users 
    (last_name, first_name, email, password, role_id, departmentid, positionId, creation_date, created_by, deletion_date, deleted_by, state)
VALUES
    -- Affectés à Informatique (Dépt 1) : alternance entre "Developpeur" (post_id 1) et "Analyste de données" (post_id 3)
    ('Rakotomavo', 'Lala', 'lala.mg@example.com', 'passEmployee1', 3, 1, 1, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Raharivelo', 'Fetra', 'fetra.mg@example.com', 'passEmployee2', 3, 1, 3, GETUTCDATE(), 1, NULL, NULL, 1),
    
    -- Affectés à Marketing (Dépt 2) avec "Chargé de communication" (post_id 5)
    ('Razanirina', 'Jean', 'jean.mg@example.com', 'passEmployee3', 3, 2, 5, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Ranaivoson', 'Solo', 'solo.mg@example.com', 'passEmployee4', 3, 2, 5, GETUTCDATE(), 1, NULL, NULL, 1),
    
    -- Affectés à Vente et commerce (Dépt 4) avec "Commercial" (post_id 7)
    ('Ratsimbazaka', 'Mandro', 'mandro.mg@example.com', 'passEmployee5', 3, 4, 7, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Rakotomalala', 'Noro', 'noro.mg@example.com', 'passEmployee6', 3, 4, 7, GETUTCDATE(), 1, NULL, NULL, 1),
    
    -- Affectés à Reseaux et techniques (Dépt 5) avec "Technicien support" (post_id 10)
    ('Rasoanaivo', 'Vola', 'vola.mg@example.com', 'passEmployee7', 3, 5, 10, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Randrianarivelo', 'Zafy', 'zafy.mg@example.com', 'passEmployee8', 3, 5, 10, GETUTCDATE(), 1, NULL, NULL, 1),
    
    -- Retour à Informatique
    ('Rasolomampianina', 'Faly', 'faly.mg@example.com', 'passEmployee9', 3, 1, 1, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Rakotondramanana', 'Mamy', 'mamy.mg@example.com', 'passEmployee10', 3, 1, 3, GETUTCDATE(), 1, NULL, NULL, 1),
    
    -- Nouveau groupe en Marketing
    ('Rafanomezantsoa', 'Herizo', 'herizo.mg@example.com', 'passEmployee11', 3, 2, 5, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Ranaivoson', 'Oliva', 'oliva.mg@example.com', 'passEmployee12', 3, 2, 5, GETUTCDATE(), 1, NULL, NULL, 1),
    
    -- Retour à Vente et commerce
    ('Rajaonarivelo', 'Tiana', 'tiana.mg@example.com', 'passEmployee13', 3, 4, 7, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Rafindrakoto', 'Lova', 'lova.mg@example.com', 'passEmployee14', 3, 4, 7, GETUTCDATE(), 1, NULL, NULL, 1),
    
    -- Nouveau groupe en Reseaux et techniques
    ('Ratsimandrava', 'Fanja', 'fanja2.mg@example.com', 'passEmployee15', 3, 5, 10, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Rakotondravelo', 'Miora', 'miora.mg@example.com', 'passEmployee16', 3, 5, 10, GETUTCDATE(), 1, NULL, NULL, 1),
    
    -- De nouveau en Informatique
    ('Rasolofo', 'Tsiory', 'tsiory.mg@example.com', 'passEmployee17', 3, 1, 1, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Rabarison', 'Feno', 'feno.mg@example.com', 'passEmployee18', 3, 1, 3, GETUTCDATE(), 1, NULL, NULL, 1),
    
    -- Dernier groupe en Marketing
    ('Rafitoharisoa', 'Nirina', 'nirina.mg@example.com', 'passEmployee19', 3, 2, 5, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Rasolofonirina', 'Faniry', 'faniry.mg@example.com', 'passEmployee20', 3, 2, 5, GETUTCDATE(), 1, NULL, NULL, 1);



	----------------------------
-- Evaluation_type
----------------------------
INSERT INTO Evaluation_type (designation, state)
VALUES
    ('Évaluation annuelle', 1),
    ('Évaluation de période d''essai', 1),
    ('Évaluation de projet', 1);

----------------------------
-- Evaluations (5 évaluations)
----------------------------
INSERT INTO Evaluations (evaluationType_id, userId, startDate, endDate, overallScore, 
                        comments, isServiceApproved, isDgApproved, serviceApprovalDate, 
                        dgApprovalDate, state)
VALUES
    (1, 7, 2, '2023-05-01', '2023-05-15', 4.25, 
    'Bonne performance globale',  1, 1, '2023-05-20', '2023-05-22', 1),
    
    (2, 9, 3, '2023-06-01', '2023-06-10', 3.75, 
    'Adaptation rapide à l''équipe', 1, 0, '2023-06-12', NULL, 1),
    
    (1, 15, 2, '2023-07-01', '2023-07-15', 2.90, 
    'Problèmes de ponctualité',  0, 0, NULL, NULL, 1),
    
    (3, 12, 3, '2023-08-01', '2023-08-20', 4.50, 
    'Excellente gestion du projet X', 1, 1, '2023-08-25', '2023-08-28', 1),
    
    (1, 20, 2, '2023-09-01', '2023-09-15', 4.00, 
    'Satisfait les attentes',  1, 1, '2023-09-18', '2023-09-20', 1);

----------------------------
-- Evaluation_questions
----------------------------
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, question, state)
VALUES
    -- Questions pour évaluation annuelle (type 1)
    (1, 1, 'Maîtrise des technologies requises', 1),
    (1, 1, 'Qualité du code produit', 1),
    (1, 5, 'Créativité dans les campagnes', 1),
    (1, 7, 'Atteinte des objectifs commerciaux', 1),
    
    -- Questions pour évaluation de période d'essai (type 2)
    (2, 10, 'Intégration dans l''équipe', 1),
    (2, 3, 'Capacité d''apprentissage', 1),
    
    -- Questions pour évaluation de projet (type 3)
    (3, 1, 'Respect des délais', 1),
    (3, 5, 'Gestion du budget alloué', 1);


	INSERT INTO Evaluation_questions (evaluationTypeId, positionId, question, state)
VALUES
    (1, 4, 'Développement et mise en œuvre de stratégies marketing', 1),
    (1, 4, 'Analyse des tendances du marché et adaptation des campagnes', 1),
    (1, 4, 'Capacité à gérer une équipe marketing', 1),
    (1, 4, 'Optimisation des budgets marketing et retour sur investissement', 1),
    (1, 4, 'Suivi et amélioration de la notoriété de la marque', 1);


----------------------------
-- Evaluation_questionnaire
----------------------------
INSERT INTO Evaluation_questionnaire (evaluationId, questionId, score, comments, state)
VALUES
    (1, 1, 4.5, 'Excellente maîtrise de React et Node.js', 1),
    (1, 2, 4.0, 'Quelques oublis de commentaires', 1),
    
    (2, 5, 3.5, 'Relations professionnelles à améliorer', 1),
    (2, 6, 4.0, 'Apprentissage rapide des procédures', 1),
    
    (4, 7, 4.75, 'Livraison 2 jours avant la deadline', 1),
    (4, 8, 4.25, 'Dépassement budgétaire de 5% justifié', 1);

----------------------------
-- Training_suggestions
----------------------------
INSERT INTO Training_suggestions (evaluationTypeId, questionId, training, details, scoreThreshold, state)
VALUES
    (1, 2, 'Clean Code Workshop', 'Formation aux bonnes pratiques de codage', 3.0, 1),
    (1, 3, 'Formation Marketing Digital', 'Création de campagnes multi-canaux', 3.5, 1),
    (2, 5, 'Team Building', 'Ateliers de collaboration inter-équipes', 2.5, 1);


	INSERT INTO Training_suggestions (evaluationTypeId, questionId, training, details, scoreThreshold, state)
VALUES
    (1, 9, 'Stratégies Marketing Avancées', 'Approfondissement des stratégies marketing et techniques de mise en œuvre', 3, 1),
    (1, 10, 'Analyse de Marché et Veille Concurrentielle', 'Techniques pour analyser les tendances et s’adapter au marché', 3, 1),
    (1, 11, 'Leadership et Management d''Équipe', 'Formation sur la gestion et la motivation d''une équipe marketing', 3, 1),
    (1, 12, 'Optimisation Budgétaire et ROI', 'Techniques pour maximiser l''efficacité des budgets marketing', 3, 1),
    (1, 13, 'Branding et Notoriété de Marque', 'Stratégies pour améliorer et suivre l''image de marque', 3, 1);

----------------------------
-- Evaluation_interviews
----------------------------
INSERT INTO Evaluation_interviews (evaluationId, scheduled_date, status, notes, manager_approval, manager_comments, director_approval, director_comments)
VALUES
    (1, '2023-05-25T14:00:00', 2, 'Entretien constructif avec objectifs clairs', 1, 'Validation des axes d''amélioration', 1, 'Accord sur le plan de formation'),
    (3, '2023-07-20T10:30:00', 1, 'Nécessité de mettre en place un suivi RH', 0, NULL, 0, NULL),
    (4, '2023-08-30T09:00:00', 2, 'Reconnaissance des performances exceptionnelles', 1, 'Proposition de promotion', 1, 'Promotion validée pour Q4');

----------------------------
-- InterviewParticipants
----------------------------
INSERT INTO InterviewParticipants (InterviewId, UserId)
VALUES
    (1, 7),  -- Employé évalué
    (1, 2),  -- Manager
    (1, 4),  -- Directeur
    
    (2, 15),
    (2, 2),
    
    (3, 12),
    (3, 3),

    (3, 5);


	BEGIN TRANSACTION;

-- Step 1: Set deleted_by to NULL for all users to avoid foreign key issues
UPDATE Users SET deleted_by = NULL;

-- Step 2: Delete from the most dependent tables first
DELETE FROM InterviewParticipants;
DELETE FROM Evaluation_interviews;
DELETE FROM Training_suggestions;
DELETE FROM Evaluation_questionnaire;
DELETE FROM Evaluation_questions;
DELETE FROM Evaluations;
DELETE FROM Users;
DELETE FROM Postes;
DELETE FROM Evaluation_type;
DELETE FROM Roles;
DELETE FROM Department;

COMMIT TRANSACTION;

EXEC sp_MSforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
EXEC sp_MSforeachtable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL';

UPDATE Users SET deleted_by = NULL;

BEGIN TRANSACTION;

-- Tables de niveau le plus profond (dépendantes)
DELETE FROM InterviewParticipants;
DELETE FROM Evaluation_interviews;
DELETE FROM Training_suggestions;
DELETE FROM Evaluation_questionnaire;
DELETE FROM Evaluations;
DELETE FROM Evaluation_questions;

-- Gestion des références circulaires dans Users
UPDATE Users SET deleted_by = NULL, created_by = NULL; 
DELETE FROM Users;

-- Tables de référence
DELETE FROM Postes;
DELETE FROM Evaluation_type;
DELETE FROM Roles;
DELETE FROM Department;

COMMIT TRANSACTION;


-- Réinitialisation de toutes les séquences IDENTITY
DBCC CHECKIDENT ('Roles', RESEED, 0);
DBCC CHECKIDENT ('Users', RESEED, 0);
DBCC CHECKIDENT ('Postes', RESEED, 0);
DBCC CHECKIDENT ('Department', RESEED, 0);
DBCC CHECKIDENT ('Evaluation_type', RESEED, 0);
DBCC CHECKIDENT ('Evaluations', RESEED, 0);
DBCC CHECKIDENT ('Evaluation_questions', RESEED, 0);
DBCC CHECKIDENT ('Evaluation_questionnaire', RESEED, 0);
DBCC CHECKIDENT ('Training_suggestions', RESEED, 0);
DBCC CHECKIDENT ('Evaluation_interviews', RESEED, 0);
DBCC CHECKIDENT ('InterviewParticipants', RESEED, 0);
DBCC CHECKIDENT ('Evaluation_history', RESEED, 0); -- Si elle existe


 -- Insertion des permissions de base
INSERT INTO Permissions (name, description, state)
VALUES
    -- Permissions liées aux utilisateurs
    ('VIEW_USERS', 'Voir la liste des utilisateurs', 1),
    ('CREATE_USERS', 'Créer de nouveaux utilisateurs', 1),
    ('EDIT_USERS', 'Modifier les utilisateurs existants', 1),
    ('DELETE_USERS', 'Supprimer des utilisateurs', 1),
    
    -- Permissions liées aux rôles
    ('VIEW_ROLES', 'Voir la liste des rôles', 1),
    ('CREATE_ROLES', 'Créer de nouveaux rôles', 1),
    ('EDIT_ROLES', 'Modifier les rôles existants', 1),
    ('DELETE_ROLES', 'Supprimer des rôles', 1),
    
    -- Permissions liées aux permissions
    ('VIEW_PERMISSIONS', 'Voir la liste des permissions', 1),
    ('MANAGE_PERMISSIONS', 'Gérer les permissions des rôles', 1),
    
    -- Permissions liées aux évaluations
    ('VIEW_EVALUATIONS', 'Voir les évaluations', 1),
    ('CREATE_EVALUATIONS', 'Créer des évaluations', 1),
    ('EDIT_EVALUATIONS', 'Modifier les évaluations', 1),
    ('DELETE_EVALUATIONS', 'Supprimer des évaluations', 1),
    ('APPROVE_EVALUATIONS', 'Approuver les évaluations', 1),
    
    -- Permissions liées aux départements
    ('VIEW_DEPARTMENTS', 'Voir la liste des départements', 1),
    ('MANAGE_DEPARTMENTS', 'Gérer les départements', 1),
    
    -- Permissions liées aux postes
    ('VIEW_POSITIONS', 'Voir la liste des postes', 1),
    ('MANAGE_POSITIONS', 'Gérer les postes', 1),
    
    -- Permissions liées aux rapports
    ('VIEW_REPORTS', 'Voir les rapports', 1),
    ('EXPORT_REPORTS', 'Exporter les rapports', 1);

-- Attribution des permissions aux rôles
-- Administrator (Role_id = 1) : Toutes les permissions
INSERT INTO Role_Permissions (role_id, permission_id)
SELECT 1, Permission_id FROM Permissions;

-- Manager (Role_id = 2) : Permissions limitées
INSERT INTO Role_Permissions (role_id, permission_id)
SELECT 2, Permission_id 
FROM Permissions 
WHERE name IN (
    'VIEW_USERS',
    'VIEW_EVALUATIONS',
    'CREATE_EVALUATIONS',
    'EDIT_EVALUATIONS',
    'APPROVE_EVALUATIONS',
    'VIEW_DEPARTMENTS',
    'VIEW_POSITIONS',
    'VIEW_REPORTS'
);

-- Employee (Role_id = 3) : Permissions minimales
INSERT INTO Role_Permissions (role_id, permission_id)
SELECT 3, Permission_id 
FROM Permissions 
WHERE name IN (
    'VIEW_EVALUATIONS',
    'VIEW_DEPARTMENTS',
    'VIEW_POSITIONS'
);

-- Director (Role_id = 4) : Permissions étendues
INSERT INTO Role_Permissions (role_id, permission_id)
SELECT 4, Permission_id 
FROM Permissions 
WHERE name IN (
    'VIEW_USERS',
    'VIEW_EVALUATIONS',
    'CREATE_EVALUATIONS',
    'EDIT_EVALUATIONS',
    'APPROVE_EVALUATIONS',
    'VIEW_DEPARTMENTS',
    'VIEW_POSITIONS',
    'VIEW_REPORTS',
    'EXPORT_REPORTS'
);

INSERT INTO Permissions (name, description, state)
VALUES
    ('MANAGE_CAREER', 'Gérer les carrières', 1),
    ('MANAGE_RETIREMENT', 'Gérer les retraites', 1);

	-- Attribution des nouvelles permissions à l'administrateur
INSERT INTO Role_Permissions (role_id, permission_id)
SELECT 1, Permission_id 
FROM Permissions 
WHERE name IN ('MANAGE_CAREER', 'MANAGE_RETIREMENT');



SELECT p.name, p.description
FROM Permissions p
JOIN Role_Permissions rp ON p.Permission_id = rp.permission_id
WHERE rp.role_id = 1;





INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (1, 'Java/J2EE', 'Développement d''applications Java et frameworks associés (Spring, Hibernate)', 1),
    (1, 'PHP/Symfony', 'Développement d''applications en PHP et Symfony', 1),
    (1, 'JavaScript/React', 'Développement frontend avec JavaScript et React', 1),
    (1, 'WordPress/CMS', 'Développement et personnalisation de sites WordPress', 1),
    (1, 'CSS/SASS', 'Maîtrise des feuilles de style et préprocesseurs', 1),
    (1, 'DevOps/CI-CD', 'Intégration continue et déploiement automatisé', 1);

	INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (2, 'Support Utilisateur', 'Assistance technique aux utilisateurs', 1),
    (2, 'Maintenance Matérielle', 'Maintenance et dépannage des équipements', 1),
    (2, 'Gestion Réseau', 'Configuration et surveillance des réseaux', 1),
    (2, 'Sécurité Informatique', 'Protection des systèmes et données', 1);


	INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (3, 'SEO/SEM', 'Optimisation pour les moteurs de recherche et publicité', 1),
    (3, 'Réseaux Sociaux', 'Gestion des communautés et campagnes sociales', 1),
    (3, 'Analyse de Données', 'Collecte et analyse des données marketing', 1),
    (3, 'Gestion d''Équipe', 'Management des équipes marketing', 1),
    (3, 'Planification Budgétaire', 'Allocation et suivi des ressources financières', 1);

	INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (4, 'Tests Manuels', 'Exécution de scénarios de test manuels', 1),
    (4, 'Automatisation Selenium', 'Développement de tests automatisés avec Selenium', 1),
    (4, 'Tests de Performance', 'Évaluation des performances des applications', 1),
    (4, 'Tests de Sécurité', 'Identification des vulnérabilités', 1);

	INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (1, 'Java 17 et nouveautés', 'Formation sur les dernières fonctionnalités de Java', '4 jours', 'JavaExpert', 'Intermédiaire', 1),
    (1, 'Spring Boot Avancé', 'Développement d''applications avec Spring Boot', '5 jours', 'SpringAcademy', 'Avancé', 1),
    (1, 'Hibernate et JPA', 'Persistance des données avec JPA', '3 jours', 'JavaExpert', 'Intermédiaire', 1);

	INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (2, 'Symfony 6', 'Développement d''applications PHP avec Symfony 6', '5 jours', 'PHPExpert', 'Intermédiaire', 1),
    (2, 'API Platform', 'Création d''API REST avec API Platform', '3 jours', 'WebDevPro', 'Intermédiaire', 1);

	-- Formations pour JavaScript/React
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (3, 'React et Redux', 'Développement d''applications frontend avec React', '5 jours', 'JSMaster', 'Intermédiaire', 1),
    (3, 'TypeScript Avancé', 'Développement d''applications typées avec TypeScript', '3 jours', 'TypeScriptPro', 'Avancé', 1);


	INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (4, 'WordPress pour Développeurs', 'Développement de thèmes et plugins WordPress', '4 jours', 'WPAcademy', 'Intermédiaire', 1),
    (4, 'Gutenberg Block Editor', 'Développement de blocs personnalisés', '2 jours', 'WPAcademy', 'Intermédiaire', 1);

	INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (5, 'CSS Avancé et Animations', 'Techniques avancées de mise en page et animations', '3 jours', 'CSSMaster', 'Avancé', 1),
    (5, 'SASS et Architecture CSS', 'Organisation et optimisation des feuilles de style', '2 jours', 'FrontEndPro', 'Intermédiaire', 1);

	INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (6, 'GitLab CI/CD', 'Intégration et déploiement continu avec GitLab', '3 jours', 'DevOpsAcademy', 'Intermédiaire', 1),
    (6, 'Docker et Kubernetes', 'Conteneurisation et orchestration d''applications', '5 jours', 'CloudExpert', 'Intermédiaire', 1);



	INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (7, 'Service Desk ITIL', 'Gestion des incidents selon ITIL', '3 jours', 'ITILExpert', 'Débutant', 1),
    (7, 'Communication Technique', 'Techniques de communication avec les utilisateurs', '2 jours', 'SupportPro', 'Intermédiaire', 1);


	INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (8, 'Maintenance Hardware', 'Diagnostic et réparation matérielle', '4 jours', 'TechRepair', 'Intermédiaire', 1),
    (9, 'Administration Cisco', 'Configuration et maintenance d''équipements Cisco', '5 jours', 'NetworkAcademy', 'Intermédiaire', 1),
    (10, 'Sécurité des Systèmes', 'Protection et audit de sécurité', '4 jours', 'SecurePro', 'Avancé', 1),
    (11, 'SEO Avancé', 'Optimisation technique pour les moteurs de recherche', '3 jours', 'SEOMaster', 'Avancé', 1),
    (12, 'Community Management', 'Animation de communautés et création de contenu', '3 jours', 'SocialMediaPro', 'Intermédiaire', 1),
    (13, 'Google Analytics 4', 'Analyse des données marketing avec GA4', '2 jours', 'AnalyticsMaster', 'Intermédiaire', 1),
    (14, 'Leadership Marketing', 'Management d''équipe marketing', '3 jours', 'LeadershipAcademy', 'Avancé', 1),
    (15, 'Planification Budgétaire', 'Gestion et optimisation des budgets marketing', '2 jours', 'FinanceMarketing', 'Intermédiaire', 1),
    (16, 'Test Case Design', 'Conception efficace de cas de test', '3 jours', 'TestingAcademy', 'Intermédiaire', 1),
    (17, 'Selenium WebDriver', 'Automatisation des tests web', '4 jours', 'AutoTest', 'Intermédiaire', 1),
    (18, 'JMeter', 'Tests de charge et de performance', '3 jours', 'PerformancePro', 'Intermédiaire', 1),
    (19, 'OWASP Top 10', 'Tests de sécurité basés sur OWASP Top 10', '2 jours', 'SecureTesting', 'Avancé', 1);


	INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    -- Questions pour développeurs Java/J2EE (évaluation annuelle - type 1)
    (1, 1, 1, 'Comment évaluez-vous votre maîtrise de Java 8+ et de ses fonctionnalités (streams, lambda, etc.) ?', 1),
    (1, 1, 1, 'Dans quelle mesure maîtrisez-vous Spring Boot pour le développement d''applications ?', 1),
    (1, 1, 1, 'Êtes-vous à l''aise avec la configuration et l''optimisation de JPA/Hibernate ?', 1),
    
    -- Questions pour développeurs PHP/Symfony (évaluation annuelle - type 1)
    (1, 1, 2, 'Comment évaluez-vous vos compétences dans le développement d''applications avec Symfony ?', 1),
    (1, 1, 2, 'Quel est votre niveau de maîtrise de Doctrine ORM pour la gestion des données ?', 1),
    
    -- Questions pour développeurs JavaScript/React (évaluation annuelle - type 1)
    (1, 1, 3, 'Comment évaluez-vous vos compétences en développement d''interfaces avec React et ses hooks ?', 1),
    (1, 1, 3, 'Êtes-vous à l''aise avec l''utilisation de Redux pour la gestion d''état global ?', 1),
    (1, 1, 3, 'Dans quelle mesure utilisez-vous TypeScript pour améliorer la qualité de votre code JavaScript ?', 1),
    
    -- Questions pour développeurs WordPress/CMS (évaluation annuelle - type 1)
    (1, 1, 4, 'Comment évaluez-vous votre capacité à développer des thèmes personnalisés sous WordPress ?', 1),
    (1, 1, 4, 'Quel est votre niveau de maîtrise dans le développement de plugins WordPress ?', 1),
    
    -- Questions pour CSS/SASS (évaluation annuelle - type 1)
    (1, 1, 5, 'Comment évaluez-vous vos compétences en responsive design avec CSS/SASS ?', 1),
    (1, 1, 5, 'Dans quelle mesure maîtrisez-vous les animations et transitions CSS ?', 1),
    
    -- Questions pour DevOps/CI-CD (évaluation annuelle - type 1)
    (1, 1, 6, 'Comment évaluez-vous votre capacité à mettre en place des pipelines CI/CD ?', 1),
    (1, 1, 6, 'Quel est votre niveau de maîtrise de Docker et de la conteneurisation ?', 1),
    
    -- Questions pour techniciens support (évaluation annuelle - type 1)
    (1, 2, 7, 'Comment évaluez-vous votre efficacité à résoudre les problèmes techniques des utilisateurs ?', 1),
    (1, 2, 7, 'Dans quelle mesure parvenez-vous à expliquer clairement les solutions techniques aux utilisateurs ?', 1),
    
    -- Questions pour techniciens maintenance (évaluation annuelle - type 1)
    (1, 2, 8, 'Comment évaluez-vous votre capacité à diagnostiquer et réparer les problèmes matériels ?', 1),
    (1, 2, 8, 'Quel est votre niveau de maîtrise dans l''installation et la configuration de nouveaux équipements ?', 1),
    
    -- Questions pour techniciens réseau (évaluation annuelle - type 1)
    (1, 2, 9, 'Comment évaluez-vous vos compétences en configuration des équipements réseau ?', 1),
    (1, 2, 9, 'Dans quelle mesure êtes-vous capable de diagnostiquer et résoudre les problèmes de connectivité ?', 1),
    
    -- Questions pour techniciens sécurité (évaluation annuelle - type 1)
    (1, 2, 10, 'Comment évaluez-vous votre capacité à identifier et corriger les vulnérabilités de sécurité ?', 1),
    (1, 2, 10, 'Quel est votre niveau de maîtrise des bonnes pratiques de sécurité informatique ?', 1),
    
    -- Questions pour responsables marketing SEO/SEM (évaluation annuelle - type 1)
    (1, 3, 11, 'Comment évaluez-vous l''efficacité de vos stratégies SEO pour améliorer le référencement ?', 1),
    (1, 3, 11, 'Dans quelle mesure vos campagnes SEM ont-elles atteint leurs objectifs cette année ?', 1),
    
    -- Questions pour responsables réseaux sociaux (évaluation annuelle - type 1)
    (1, 3, 12, 'Comment évaluez-vous l''engagement généré par vos publications sur les réseaux sociaux ?', 1),
    (1, 3, 12, 'Quel est le niveau d''efficacité de votre stratégie de contenu sur les différentes plateformes ?', 1),
    
    -- Questions pour responsables analyse de données (évaluation annuelle - type 1)
    (1, 3, 13, 'Comment évaluez-vous votre capacité à extraire des insights pertinents des données marketing ?', 1),
    (1, 3, 13, 'Dans quelle mesure utilisez-vous les outils d''analyse pour ajuster les stratégies marketing ?', 1),
    
    -- Questions pour responsables gestion d'équipe (évaluation annuelle - type 1)
    (1, 3, 14, 'Comment évaluez-vous votre capacité à motiver et développer votre équipe marketing ?', 1),
    (1, 3, 14, 'Quel est votre niveau d''efficacité dans la délégation et le suivi des tâches ?', 1),
    
    -- Questions pour responsables budget (évaluation annuelle - type 1)
    (1, 3, 15, 'Comment évaluez-vous votre gestion et optimisation du budget marketing ?', 1),
    (1, 3, 15, 'Dans quelle mesure mesurez-vous et optimisez-vous le ROI des actions marketing ?', 1),
    
    -- Questions pour testeurs manuels (évaluation annuelle - type 1)
    (1, 4, 16, 'Comment évaluez-vous la qualité et la couverture de vos scénarios de test manuels ?', 1),
    (1, 4, 16, 'Quel est votre niveau de précision dans l''identification et la documentation des bugs ?', 1),
    
    -- Questions pour testeurs automatisation (évaluation annuelle - type 1)
    (1, 4, 17, 'Comment évaluez-vous votre capacité à créer et maintenir des tests automatisés avec Selenium ?', 1),
    (1, 4, 17, 'Dans quelle mesure vos tests automatisés ont-ils permis de détecter des régressions ?', 1),
    
    -- Questions pour testeurs performance (évaluation annuelle - type 1)
    (1, 4, 18, 'Comment évaluez-vous votre capacité à concevoir et exécuter des tests de performance pertinents ?', 1),
    (1, 4, 18, 'Quel est votre niveau d''expertise dans l''analyse des résultats de tests de charge ?', 1),
    
    -- Questions pour testeurs sécurité (évaluation annuelle - type 1)
    (1, 4, 19, 'Comment évaluez-vous votre capacité à identifier les vulnérabilités de sécurité dans les applications ?', 1),
    (1, 4, 19, 'Dans quelle mesure maîtrisez-vous les outils et méthodologies de test de sécurité ?', 1),
    
    -- Questions pour période d'essai (type 2)
    (2, 1, 1, 'Comment évaluez-vous votre adaptation aux technologies Java utilisées dans l''entreprise ?', 1),
    (2, 1, 3, 'Dans quelle mesure vous êtes-vous familiarisé avec l''architecture React de nos projets ?', 1),
    (2, 2, 7, 'Comment évaluez-vous votre intégration aux procédures de support technique de l''entreprise ?', 1),
    (2, 3, 11, 'Dans quelle mesure avez-vous assimilé la stratégie SEO/SEM de l''entreprise ?', 1),
    (2, 4, 16, 'Comment évaluez-vous votre compréhension et application des méthodologies de test de l''entreprise ?', 1),
    
    -- Questions pour évaluation de projet (type 3)
    (3, 1, 1, 'Comment évaluez-vous la qualité du code Java produit pour ce projet ?', 1),
    (3, 1, 3, 'Dans quelle mesure les interfaces React développées répondent-elles aux exigences du projet ?', 1),
    (3, 1, 6, 'Comment évaluez-vous l''efficacité de la pipeline CI/CD mise en place pour ce projet ?', 1),
    (3, 3, 11, 'Dans quelle mesure les actions SEO/SEM ont-elles contribué aux objectifs du projet ?', 1),
    (3, 3, 12, 'Comment évaluez-vous l''impact des campagnes social media sur la visibilité du projet ?', 1),
    (3, 4, 16, 'Dans quelle mesure les tests fonctionnels ont-ils couvert les exigences du projet ?', 1),
    (3, 4, 17, 'Comment évaluez-vous la qualité et la maintenabilité des tests automatisés développés pour ce projet ?', 1);

	SELECT Question_id, question, CompetenceLineId FROM Evaluation_questions;


	INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state)
VALUES
    -- Suggestions pour les développeurs Java (évaluation annuelle)
    (1, 1, 1, 1, 'Java 17 et nouveautés', 'Formation approfondie sur les dernières fonctionnalités de Java', 3, 1),
    (1, 2, 1, 2, 'Spring Boot Avancé', 'Maîtriser le développement d''applications avec Spring Boot', 3, 1),
    (1, 3, 1, 3, 'Hibernate et JPA', 'Optimisation de la persistance des données', 3, 1),

    -- Suggestions pour les développeurs PHP/Symfony
    (1, 4, 2, 4, 'Symfony 6', 'Développement d''applications PHP avec Symfony 6', 3, 1),
    (1, 5, 2, 5, 'API Platform', 'Création d''API REST avec API Platform', 3, 1),

    -- Suggestions pour les développeurs JavaScript/React
    (1, 6, 3, 6, 'React et Redux', 'Maîtriser le développement React avec gestion d''état Redux', 3, 1),
    (1, 7, 3, 6, 'React et Redux', 'Maîtriser la gestion d''état avec Redux', 3, 1),
    (1, 8, 3, 7, 'TypeScript Avancé', 'Améliorer la qualité du code avec TypeScript', 3, 1),

    -- Suggestions pour les développeurs WordPress
    (1, 9, 4, 8, 'WordPress pour Développeurs', 'Développement avancé de thèmes et plugins', 3, 1),
    (1, 10, 4, 9, 'Gutenberg Block Editor', 'Création de blocs personnalisés', 3, 1),

    -- Suggestions pour CSS/SASS
    (1, 11, 5, 10, 'CSS Avancé et Animations', 'Techniques avancées de mise en page et animations', 3, 1),
    (1, 12, 5, 10, 'CSS Avancé et Animations', 'Maîtriser les animations CSS avancées', 3, 1),

    -- Suggestions pour DevOps
    (1, 13, 6, 12, 'GitLab CI/CD', 'Maîtriser l''intégration et déploiement continu', 3, 1),
    (1, 14, 6, 13, 'Docker et Kubernetes', 'Conteneurisation et orchestration d''applications', 3, 1),

    -- Suggestions pour support utilisateur
    (1, 15, 7, 14, 'Service Desk ITIL', 'Gestion des incidents selon les bonnes pratiques ITIL', 3, 1),
    (1, 16, 7, 15, 'Communication Technique', 'Améliorer la communication avec les utilisateurs', 3, 1),

    -- Suggestions pour maintenance matérielle
    (1, 17, 8, 16, 'Maintenance Hardware', 'Diagnostic et réparation matérielle avancée', 3, 1),
    (1, 18, 8, 16, 'Maintenance Hardware', 'Installation et configuration d''équipements', 3, 1),

    -- Suggestions pour gestion réseau
    (1, 19, 9, 17, 'Administration Cisco', 'Configuration et maintenance d''équipements réseau', 3, 1),
    (1, 20, 9, 17, 'Administration Cisco', 'Diagnostic et résolution des problèmes réseau', 3, 1),

    -- Suggestions pour sécurité
    (1, 21, 10, 18, 'Sécurité des Systèmes', 'Protection et audit de sécurité', 3, 1),
    (1, 22, 10, 18, 'Sécurité des Systèmes', 'Bonnes pratiques de sécurité informatique', 3, 1),

    -- Suggestions pour SEO/SEM
    (1, 23, 11, 19, 'SEO Avancé', 'Optimisation technique pour les moteurs de recherche', 3, 1),
    (1, 24, 11, 19, 'SEO Avancé', 'Gestion des campagnes SEM', 3, 1),

    -- Suggestions pour réseaux sociaux
    (1, 25, 12, 20, 'Community Management', 'Animation de communautés et création de contenu', 3, 1),
    (1, 26, 12, 20, 'Community Management', 'Stratégie de contenu multi-plateformes', 3, 1),

    -- Suggestions pour analyse de données
    (1, 27, 13, 21, 'Google Analytics 4', 'Analyse des données marketing avec GA4', 3, 1),
    (1, 28, 13, 21, 'Google Analytics 4', 'Utilisation des outils d''analyse marketing', 3, 1),

    -- Suggestions pour gestion d'équipe
    (1, 29, 14, 22, 'Leadership Marketing', 'Management d''équipe marketing', 3, 1),
    (1, 30, 14, 22, 'Leadership Marketing', 'Délégation et suivi des tâches', 3, 1),

    -- Suggestions pour gestion budgétaire
    (1, 31, 15, 23, 'Planification Budgétaire', 'Gestion et optimisation des budgets marketing', 3, 1),
    (1, 32, 15, 23, 'Planification Budgétaire', 'Mesure et optimisation du ROI', 3, 1),

    -- Suggestions pour tests manuels
    (1, 33, 16, 24, 'Test Case Design', 'Conception efficace de cas de test', 3, 1),
    (1, 34, 16, 24, 'Test Case Design', 'Documentation des bugs et suivi', 3, 1),

    -- Suggestions pour tests automatisés
    (1, 35, 17, 25, 'Selenium WebDriver', 'Automatisation des tests web', 3, 1),
    (1, 36, 17, 25, 'Selenium WebDriver', 'Maintenance des tests automatisés', 3, 1),

    -- Suggestions pour tests de performance
    (1, 37, 18, 26, 'JMeter', 'Tests de charge et de performance', 3, 1),
    (1, 38, 18, 26, 'JMeter', 'Analyse des résultats de performance', 3, 1),

    -- Suggestions pour tests de sécurité
    (1, 39, 19, 27, 'OWASP Top 10', 'Tests de sécurité basés sur OWASP Top 10', 3, 1),
    (1, 40, 19, 27, 'OWASP Top 10', 'Méthodologies de test de sécurité', 3, 1),

    -- Suggestions pour période d'essai
    (2, 41, 1, 1, 'Java 17 pour débutants', 'Formation accélérée sur Java pour nouveaux développeurs', 2.5, 1),
    (2, 42, 3, 6, 'React pour débutants', 'Introduction à React et son architecture', 2.5, 1),
    (2, 43, 7, 14, 'Fondamentaux du support technique', 'Bases du support utilisateur dans l''entreprise', 2.5, 1),
    (2, 44, 11, 19, 'SEO/SEM de base', 'Introduction aux stratégies SEO/SEM', 2.5, 1),
    (2, 45, 16, 24, 'Fondamentaux des tests', 'Introduction aux méthodologies de test', 2.5, 1),

    -- Suggestions pour évaluation de projet
    (3, 46, 1, 2, 'Optimisation des applications Java', 'Amélioration des performances Java', 3, 1),
    (3, 47, 3, 6, 'Architecture React avancée', 'Meilleures pratiques pour projets React complexes', 3, 1),
    (3, 48, 6, 12, 'Pipeline CI/CD avancée', 'Optimisation des pipelines de déploiement', 3, 1),
    (3, 49, 11, 19, 'SEO Technique Avancé', 'Optimisation technique pour sites complexes', 3, 1),
    (3, 50, 12, 20, 'Stratégie Social Media Avancée', 'Optimisation des campagnes social media', 3, 1),
    (3, 51, 16, 24, 'Tests Fonctionnels Avancés', 'Couverture complète des exigences fonctionnelles', 3, 1),
    (3, 52, 17, 25, 'Tests Automatisés Avancés', 'Maintenance et optimisation des tests automatisés', 3, 1);
 

 -- Questions sur Java/J2EE
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES 
-- Pour la question sur la maîtrise de Java 8+
(1, 'Je maîtrise parfaitement les streams, lambdas et les nouvelles fonctionnalités de Java 8+', 1, 1),
(1, 'Je connais bien les streams et lambdas mais je peux m''améliorer', 0, 1),
(1, 'Je connais les bases de Java 8+', 0, 1),
(1, 'Je débute avec Java 8+', 0, 1),

-- Pour la question sur Spring Boot
(2, 'Je peux développer des applications complexes avec Spring Boot', 1, 1),
(2, 'Je peux développer des applications simples avec Spring Boot', 0, 1),
(2, 'Je connais les bases de Spring Boot', 0, 1),
(2, 'Je débute avec Spring Boot', 0, 1),

-- Pour la question sur JPA/Hibernate
(3, 'Je peux optimiser et configurer JPA/Hibernate efficacement', 1, 1),
(3, 'Je peux utiliser JPA/Hibernate pour des cas simples', 0, 1),
(3, 'Je connais les bases de JPA/Hibernate', 0, 1),
(3, 'Je débute avec JPA/Hibernate', 0, 1);

-- Questions sur le support utilisateur
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES 
-- Pour la question sur la résolution des problèmes
(15, 'Je résous efficacement les problèmes techniques des utilisateurs', 1, 1),
(15, 'Je peux résoudre la plupart des problèmes courants', 0, 1),
(15, 'Je peux résoudre des problèmes simples', 0, 1),
(15, 'Je dois améliorer mes compétences de résolution', 0, 1),

-- Pour la question sur l'explication des solutions
(16, 'Je peux expliquer clairement les solutions techniques à tous les niveaux', 1, 1),
(16, 'Je peux expliquer les solutions de manière compréhensible', 0, 1),
(16, 'J''ai parfois du mal à expliquer les solutions', 0, 1),
(16, 'Je dois améliorer ma communication technique', 0, 1);

-- Questions sur les tests
select * from Evaluation_Question_Options
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES 
-- Pour la question sur les tests manuels
(33, 'Je crée des scénarios de test complets et pertinents', 1, 1),
(33, 'Je peux créer des scénarios de test basiques', 0, 1),
(33, 'Je dois améliorer mes compétences en création de scénarios', 0, 1),
(33, 'Je débute dans la création de scénarios', 0, 1),

-- Pour la question sur la documentation des bugs
(34, 'Je documente précisément les bugs avec toutes les informations nécessaires', 1, 1),
(34, 'Je documente les bugs de manière basique', 0, 1),
(34, 'Je dois améliorer ma documentation des bugs', 0, 1),
(34, 'Je débute dans la documentation des bugs', 0, 1);

 
