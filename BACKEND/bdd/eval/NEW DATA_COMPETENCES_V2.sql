-- 1. Nettoyage des tables existantes pour éviter les conflits
-- ⚠️ Exécuter dans cet ordre pour respecter les contraintes d'intégrité référentielle
DELETE FROM Training_suggestions;
DELETE FROM Evaluation_questionnaire;
DELETE FROM Evaluation_questions;
DELETE FROM Competence_Trainings;
DELETE FROM Competence_Lines;

-- 2. Insertion des lignes de compétences (Competence_Lines)
-- Pour le poste Développeur (PositionId = 1)
INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (1, 'Java/J2EE', 'Développement d''applications Java et frameworks associés (Spring, Hibernate)', 1),
    (1, 'PHP/Symfony', 'Développement d''applications en PHP et Symfony', 1),
    (1, 'JavaScript/React', 'Développement frontend avec JavaScript et React', 1),
    (1, 'WordPress/CMS', 'Développement et personnalisation de sites WordPress', 1),
    (1, 'CSS/SASS', 'Maîtrise des feuilles de style et préprocesseurs', 1),
    (1, 'DevOps/CI-CD', 'Intégration continue et déploiement automatisé', 1);

-- Pour le poste Technicien (PositionId = 2)
INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (2, 'Support Utilisateur', 'Assistance technique aux utilisateurs', 1),
    (2, 'Maintenance Matérielle', 'Maintenance et dépannage des équipements', 1),
    (2, 'Gestion Réseau', 'Configuration et surveillance des réseaux', 1),
    (2, 'Sécurité Informatique', 'Protection des systèmes et données', 1);

-- Pour le poste Responsable Marketing (PositionId = 3)
INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (3, 'SEO/SEM', 'Optimisation pour les moteurs de recherche et publicité', 1),
    (3, 'Réseaux Sociaux', 'Gestion des communautés et campagnes sociales', 1),
    (3, 'Analyse de Données', 'Collecte et analyse des données marketing', 1),
    (3, 'Gestion d''Équipe', 'Management des équipes marketing', 1),
    (3, 'Planification Budgétaire', 'Allocation et suivi des ressources financières', 1);

-- Pour le poste Testeur (PositionId = 4)
INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (4, 'Tests Manuels', 'Exécution de scénarios de test manuels', 1),
    (4, 'Automatisation Selenium', 'Développement de tests automatisés avec Selenium', 1),
    (4, 'Tests de Performance', 'Évaluation des performances des applications', 1),
    (4, 'Tests de Sécurité', 'Identification des vulnérabilités', 1);

-- 3. Insertion des formations par ligne de compétence (Competence_Trainings)
-- Formations pour Java/J2EE
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (1, 'Java 17 et nouveautés', 'Formation sur les dernières fonctionnalités de Java', '4 jours', 'JavaExpert', 'Intermédiaire', 1),
    (1, 'Spring Boot Avancé', 'Développement d''applications avec Spring Boot', '5 jours', 'SpringAcademy', 'Avancé', 1),
    (1, 'Hibernate et JPA', 'Persistance des données avec JPA', '3 jours', 'JavaExpert', 'Intermédiaire', 1);

-- Formations pour PHP/Symfony
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (2, 'Symfony 6', 'Développement d''applications PHP avec Symfony 6', '5 jours', 'PHPExpert', 'Intermédiaire', 1),
    (2, 'API Platform', 'Création d''API REST avec API Platform', '3 jours', 'WebDevPro', 'Intermédiaire', 1);

-- Formations pour JavaScript/React
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (3, 'React et Redux', 'Développement d''applications frontend avec React', '5 jours', 'JSMaster', 'Intermédiaire', 1),
    (3, 'TypeScript Avancé', 'Développement d''applications typées avec TypeScript', '3 jours', 'TypeScriptPro', 'Avancé', 1);

-- Formations pour WordPress/CMS
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (4, 'WordPress pour Développeurs', 'Développement de thèmes et plugins WordPress', '4 jours', 'WPAcademy', 'Intermédiaire', 1),
    (4, 'Gutenberg Block Editor', 'Développement de blocs personnalisés', '2 jours', 'WPAcademy', 'Intermédiaire', 1);

-- Formations pour CSS/SASS
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (5, 'CSS Avancé et Animations', 'Techniques avancées de mise en page et animations', '3 jours', 'CSSMaster', 'Avancé', 1),
    (5, 'SASS et Architecture CSS', 'Organisation et optimisation des feuilles de style', '2 jours', 'FrontEndPro', 'Intermédiaire', 1);

-- Formations pour DevOps/CI-CD
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (6, 'GitLab CI/CD', 'Intégration et déploiement continu avec GitLab', '3 jours', 'DevOpsAcademy', 'Intermédiaire', 1),
    (6, 'Docker et Kubernetes', 'Conteneurisation et orchestration d''applications', '5 jours', 'CloudExpert', 'Intermédiaire', 1);

-- Formations pour Support Utilisateur
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (7, 'Service Desk ITIL', 'Gestion des incidents selon ITIL', '3 jours', 'ITILExpert', 'Débutant', 1),
    (7, 'Communication Technique', 'Techniques de communication avec les utilisateurs', '2 jours', 'SupportPro', 'Intermédiaire', 1);

-- Formations pour autres compétences 
-- Je continue avec quelques exemples pour d'autres compétences
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

-- 4. Création de questions d'évaluation liées aux lignes de compétence
-- Je vais stocker les IDs générés pour les utiliser plus tard dans les suggestions de formation

-- Développeurs Java/J2EE (annuel)
DECLARE @Java1Id INT, @Java2Id INT, @Java3Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 1, 'Comment évaluez-vous votre maîtrise de Java 8+ et de ses fonctionnalités (streams, lambda, etc.) ?', 1);
SET @Java1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 1, 'Dans quelle mesure maîtrisez-vous Spring Boot pour le développement d''applications ?', 1);
SET @Java2Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 1, 'Êtes-vous à l''aise avec la configuration et l''optimisation de JPA/Hibernate ?', 1);
SET @Java3Id = SCOPE_IDENTITY();

-- Développeurs PHP/Symfony (annuel)
DECLARE @PHP1Id INT, @PHP2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 2, 'Comment évaluez-vous vos compétences dans le développement d''applications avec Symfony ?', 1);
SET @PHP1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 2, 'Quel est votre niveau de maîtrise de Doctrine ORM pour la gestion des données ?', 1);
SET @PHP2Id = SCOPE_IDENTITY();

-- Développeurs JavaScript/React (annuel)
DECLARE @JS1Id INT, @JS2Id INT, @JS3Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 3, 'Comment évaluez-vous vos compétences en développement d''interfaces avec React et ses hooks ?', 1);
SET @JS1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 3, 'Êtes-vous à l''aise avec l''utilisation de Redux pour la gestion d''état global ?', 1);
SET @JS2Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 3, 'Dans quelle mesure utilisez-vous TypeScript pour améliorer la qualité de votre code JavaScript ?', 1);
SET @JS3Id = SCOPE_IDENTITY();

-- WordPress (annuel)
DECLARE @WP1Id INT, @WP2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 4, 'Comment évaluez-vous votre capacité à développer des thèmes personnalisés sous WordPress ?', 1);
SET @WP1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 4, 'Quel est votre niveau de maîtrise dans le développement de plugins WordPress ?', 1);
SET @WP2Id = SCOPE_IDENTITY();

-- CSS/SASS (annuel) 
DECLARE @CSS1Id INT, @CSS2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 5, 'Comment évaluez-vous vos compétences en responsive design avec CSS/SASS ?', 1);
SET @CSS1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 5, 'Dans quelle mesure maîtrisez-vous les animations et transitions CSS ?', 1);
SET @CSS2Id = SCOPE_IDENTITY();

-- DevOps (annuel)
DECLARE @DevOps1Id INT, @DevOps2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 6, 'Comment évaluez-vous votre capacité à mettre en place des pipelines CI/CD ?', 1);
SET @DevOps1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 1, 6, 'Quel est votre niveau de maîtrise de Docker et de la conteneurisation ?', 1);
SET @DevOps2Id = SCOPE_IDENTITY();

-- Support Utilisateur (annuel)
DECLARE @Support1Id INT, @Support2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 2, 7, 'Comment évaluez-vous votre efficacité à résoudre les problèmes techniques des utilisateurs ?', 1);
SET @Support1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 2, 7, 'Dans quelle mesure parvenez-vous à expliquer clairement les solutions techniques aux utilisateurs ?', 1);
SET @Support2Id = SCOPE_IDENTITY();

-- Maintenance (annuel)
DECLARE @Maint1Id INT, @Maint2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 2, 8, 'Comment évaluez-vous votre capacité à diagnostiquer et réparer les problèmes matériels ?', 1);
SET @Maint1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 2, 8, 'Quel est votre niveau de maîtrise dans l''installation et la configuration de nouveaux équipements ?', 1);
SET @Maint2Id = SCOPE_IDENTITY();

-- Réseau (annuel)
DECLARE @Network1Id INT, @Network2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 2, 9, 'Comment évaluez-vous vos compétences en configuration des équipements réseau ?', 1);
SET @Network1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 2, 9, 'Dans quelle mesure êtes-vous capable de diagnostiquer et résoudre les problèmes de connectivité ?', 1);
SET @Network2Id = SCOPE_IDENTITY();

-- Sécurité (annuel)
DECLARE @Sec1Id INT, @Sec2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 2, 10, 'Comment évaluez-vous votre capacité à identifier et corriger les vulnérabilités de sécurité ?', 1);
SET @Sec1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 2, 10, 'Quel est votre niveau de maîtrise des bonnes pratiques de sécurité informatique ?', 1);
SET @Sec2Id = SCOPE_IDENTITY();

-- SEO/SEM (annuel)
DECLARE @SEO1Id INT, @SEO2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 3, 11, 'Comment évaluez-vous l''efficacité de vos stratégies SEO pour améliorer le référencement ?', 1);
SET @SEO1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 3, 11, 'Dans quelle mesure vos campagnes SEM ont-elles atteint leurs objectifs cette année ?', 1);
SET @SEO2Id = SCOPE_IDENTITY();

-- Réseaux sociaux (annuel)
DECLARE @Social1Id INT, @Social2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 3, 12, 'Comment évaluez-vous l''engagement généré par vos publications sur les réseaux sociaux ?', 1);
SET @Social1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 3, 12, 'Quel est le niveau d''efficacité de votre stratégie de contenu sur les différentes plateformes ?', 1);
SET @Social2Id = SCOPE_IDENTITY();

-- Analyse de données (annuel)
DECLARE @Ana1Id INT, @Ana2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 3, 13, 'Comment évaluez-vous votre capacité à extraire des insights pertinents des données marketing ?', 1);
SET @Ana1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 3, 13, 'Dans quelle mesure utilisez-vous les outils d''analyse pour ajuster les stratégies marketing ?', 1);
SET @Ana2Id = SCOPE_IDENTITY();

-- Gestion d'équipe (annuel)
DECLARE @Team1Id INT, @Team2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 3, 14, 'Comment évaluez-vous votre capacité à motiver et développer votre équipe marketing ?', 1);
SET @Team1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 3, 14, 'Quel est votre niveau d''efficacité dans la délégation et le suivi des tâches ?', 1);
SET @Team2Id = SCOPE_IDENTITY();

-- Budget (annuel)
DECLARE @Budget1Id INT, @Budget2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 3, 15, 'Comment évaluez-vous votre gestion et optimisation du budget marketing ?', 1);
SET @Budget1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 3, 15, 'Dans quelle mesure mesurez-vous et optimisez-vous le ROI des actions marketing ?', 1);
SET @Budget2Id = SCOPE_IDENTITY();

-- Tests manuels (annuel)
DECLARE @TestM1Id INT, @TestM2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 4, 16, 'Comment évaluez-vous la qualité et la couverture de vos scénarios de test manuels ?', 1);
SET @TestM1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 4, 16, 'Quel est votre niveau de précision dans l''identification et la documentation des bugs ?', 1);
SET @TestM2Id = SCOPE_IDENTITY();

-- Tests automatisés (annuel)
DECLARE @TestA1Id INT, @TestA2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 4, 17, 'Comment évaluez-vous votre capacité à créer et maintenir des tests automatisés avec Selenium ?', 1);
SET @TestA1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 4, 17, 'Dans quelle mesure vos tests automatisés ont-ils permis de détecter des régressions ?', 1);
SET @TestA2Id = SCOPE_IDENTITY();

-- Tests de performance (annuel)
DECLARE @TestP1Id INT, @TestP2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 4, 18, 'Comment évaluez-vous votre capacité à concevoir et exécuter des tests de performance pertinents ?', 1);
SET @TestP1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 4, 18, 'Quel est votre niveau d''expertise dans l''analyse des résultats de tests de charge ?', 1);
SET @TestP2Id = SCOPE_IDENTITY();

-- Tests de sécurité (annuel)
DECLARE @TestS1Id INT, @TestS2Id INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 4, 19, 'Comment évaluez-vous votre capacité à identifier les vulnérabilités de sécurité dans les applications ?', 1);
SET @TestS1Id = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (1, 4, 19, 'Dans quelle mesure maîtrisez-vous les outils et méthodologies de test de sécurité ?', 1);
SET @TestS2Id = SCOPE_IDENTITY();

-- Questions pour période d'essai (type 2)
DECLARE @JavaTrialId INT, @JSTrialId INT, @SupportTrialId INT, @SEOTrialId INT, @TestTrialId INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (2, 1, 1, 'Comment évaluez-vous votre adaptation aux technologies Java utilisées dans l''entreprise ?', 1);
SET @JavaTrialId = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (2, 1, 3, 'Dans quelle mesure vous êtes-vous familiarisé avec l''architecture React de nos projets ?', 1);
SET @JSTrialId = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (2, 2, 7, 'Comment évaluez-vous votre intégration aux procédures de support technique de l''entreprise ?', 1);
SET @SupportTrialId = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (2, 3, 11, 'Dans quelle mesure avez-vous assimilé la stratégie SEO/SEM de l''entreprise ?', 1);
SET @SEOTrialId = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (2, 4, 16, 'Comment évaluez-vous votre compréhension et application des méthodologies de test de l''entreprise ?', 1);
SET @TestTrialId = SCOPE_IDENTITY();

-- Questions pour évaluation de projet (type 3)
DECLARE @JavaProjId INT, @JSProjId INT, @DevOpsProjId INT, @SEOProjId INT, @SocialProjId INT, @TestMProjId INT, @TestAProjId INT;

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (3, 1, 1, 'Comment évaluez-vous la qualité du code Java produit pour ce projet ?', 1);
SET @JavaProjId = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (3, 1, 3, 'Dans quelle mesure les interfaces React développées répondent-elles aux exigences du projet ?', 1);
SET @JSProjId = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (3, 1, 6, 'Comment évaluez-vous l''efficacité de la pipeline CI/CD mise en place pour ce projet ?', 1);
SET @DevOpsProjId = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (3, 3, 11, 'Dans quelle mesure les actions SEO/SEM ont-elles contribué aux objectifs du projet ?', 1);
SET @SEOProjId = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (3, 3, 12, 'Comment évaluez-vous l''impact des campagnes social media sur la visibilité du projet ?', 1);
SET @SocialProjId = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (3, 4, 16, 'Dans quelle mesure les tests fonctionnels ont-ils couvert les exigences du projet ?', 1);
SET @TestMProjId = SCOPE_IDENTITY();

INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES (3, 4, 17, 'Comment évaluez-vous la qualité et la maintenabilité des tests automatisés développés pour ce projet ?', 1);
SET @TestAProjId = SCOPE_IDENTITY();

-- 5. Mise à jour des suggestions de formation pour les lier aux compétences et formations
-- Utilisons les variables d'ID pour les questions que nous avons créées

-- Suggestions pour les développeurs Java
INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state)
VALUES 
    (1, @Java1Id, 1, 1, 'Java 17 et nouveautés', 'Formation approfondie sur les dernières fonctionnalités de Java', 3, 1),
    (1, @Java2Id, 1, 2, 'Spring Boot Avancé', 'Maîtriser le développement d''applications avec Spring Boot', 3, 1),
    (1, @Java3Id, 1, 3, 'Hibernate et JPA', 'Optimisation de la persistance des données', 3, 1);

-- Suggestions pour les développeurs PHP/Symfony  
INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state) 
VALUES
    (1, @PHP1Id, 2, 4, 'Symfony 6', 'Développement d''applications PHP avec Symfony 6', 3, 1),
    (1, @PHP2Id, 2, 5, 'API Platform', 'Création d''API REST avec API Platform', 3, 1);

-- Suggestions pour les développeurs JavaScript/React
INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state)
VALUES
    (1, @JS1Id, 3, 6, 'React et Redux', 'Maîtriser le développement React avec gestion d''état Redux', 3, 1),
    (1, @JS2Id, 3, 6, 'React et Redux', 'Maîtriser la gestion d''état avec Redux', 3, 1),
    (1, @JS3Id, 3, 7, 'TypeScript Avancé', 'Améliorer la qualité du code avec TypeScript', 3, 1);

-- Suggestions pour les développeurs WordPress
INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state)
VALUES
    (1, @WP1Id, 4, 8, 'WordPress pour Développeurs', 'Développement avancé de thèmes et plugins', 3, 1),
    (1, @WP2Id, 4, 9, 'Gutenberg Block Editor', 'Création de blocs personnalisés', 3, 1);

-- Suggestions pour CSS/SASS
INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state)
VALUES
    (1, @CSS1Id, 5, 10, 'CSS Avancé et Animations', 'Techniques avancées de mise en page et animations', 3, 1),
    (1, @CSS2Id, 5, 10, 'CSS Avancé et Animations', 'Maîtriser les animations CSS avancées', 3, 1);

-- Suggestions pour DevOps
INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state)
VALUES
    (1, @DevOps1Id, 6, 12, 'GitLab CI/CD', 'Maîtriser l''intégration et déploiement continu', 3, 1),
    (1, @DevOps2Id, 6, 13, 'Docker et Kubernetes', 'Conteneurisation et orchestration d''applications', 3, 1);

-- Suggestions pour support utilisateur
INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state)
VALUES
    (1, @Support1Id, 7, 14, 'Service Desk ITIL', 'Gestion des incidents selon les bonnes pratiques ITIL', 3, 1),
    (1, @Support2Id, 7, 15, 'Communication Technique', 'Améliorer la communication avec les utilisateurs', 3, 1);

-- Suggestions pour période d'essai
INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state)
VALUES
    (2, @JavaTrialId, 1, 1, 'Java 17 pour débutants', 'Formation accélérée sur Java pour nouveaux développeurs', 2.5, 1),
    (2, @SupportTrialId, 7, 14, 'Fondamentaux du support technique', 'Bases du support utilisateur dans l''entreprise', 2.5, 1);

-- Suggestions pour évaluation de projet
INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state)
VALUES
    (3, @JavaProjId, 1, 2, 'Optimisation des applications Java', 'Amélioration des performances Java', 3, 1),
    (3, @JSProjId, 3, 6, 'Architecture React avancée', 'Meilleures pratiques pour projets React complexes', 3, 1),
    (3, @SEOProjId, 11, 19, 'SEO Technique Avancé', 'Optimisation technique pour sites complexes', 3, 1); 