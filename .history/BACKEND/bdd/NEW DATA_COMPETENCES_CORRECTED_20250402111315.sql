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

-- Questions pour développeurs Java/J2EE (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES 
    (1, 1, 1, 'Comment évaluez-vous votre maîtrise de Java 8+ et de ses fonctionnalités (streams, lambda, etc.) ?', 1),
    (1, 1, 1, 'Dans quelle mesure maîtrisez-vous Spring Boot pour le développement d''applications ?', 1),
    (1, 1, 1, 'Êtes-vous à l''aise avec la configuration et l''optimisation de JPA/Hibernate ?', 1);

-- Questions pour développeurs PHP/Symfony (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 1, 2, 'Comment évaluez-vous vos compétences dans le développement d''applications avec Symfony ?', 1),
    (1, 1, 2, 'Quel est votre niveau de maîtrise de Doctrine ORM pour la gestion des données ?', 1);

-- Questions pour développeurs JavaScript/React (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 1, 3, 'Comment évaluez-vous vos compétences en développement d''interfaces avec React et ses hooks ?', 1),
    (1, 1, 3, 'Êtes-vous à l''aise avec l''utilisation de Redux pour la gestion d''état global ?', 1),
    (1, 1, 3, 'Dans quelle mesure utilisez-vous TypeScript pour améliorer la qualité de votre code JavaScript ?', 1);

-- Questions pour développeurs WordPress/CMS (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 1, 4, 'Comment évaluez-vous votre capacité à développer des thèmes personnalisés sous WordPress ?', 1),
    (1, 1, 4, 'Quel est votre niveau de maîtrise dans le développement de plugins WordPress ?', 1);

-- Questions pour CSS/SASS (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 1, 5, 'Comment évaluez-vous vos compétences en responsive design avec CSS/SASS ?', 1),
    (1, 1, 5, 'Dans quelle mesure maîtrisez-vous les animations et transitions CSS ?', 1);

-- Questions pour DevOps/CI-CD (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 1, 6, 'Comment évaluez-vous votre capacité à mettre en place des pipelines CI/CD ?', 1),
    (1, 1, 6, 'Quel est votre niveau de maîtrise de Docker et de la conteneurisation ?', 1);

-- Questions pour techniciens support (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 2, 7, 'Comment évaluez-vous votre efficacité à résoudre les problèmes techniques des utilisateurs ?', 1),
    (1, 2, 7, 'Dans quelle mesure parvenez-vous à expliquer clairement les solutions techniques aux utilisateurs ?', 1);

-- Questions pour techniciens maintenance (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 2, 8, 'Comment évaluez-vous votre capacité à diagnostiquer et réparer les problèmes matériels ?', 1),
    (1, 2, 8, 'Quel est votre niveau de maîtrise dans l''installation et la configuration de nouveaux équipements ?', 1);

-- Questions pour techniciens réseau (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 2, 9, 'Comment évaluez-vous vos compétences en configuration des équipements réseau ?', 1),
    (1, 2, 9, 'Dans quelle mesure êtes-vous capable de diagnostiquer et résoudre les problèmes de connectivité ?', 1);

-- Questions pour techniciens sécurité (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 2, 10, 'Comment évaluez-vous votre capacité à identifier et corriger les vulnérabilités de sécurité ?', 1),
    (1, 2, 10, 'Quel est votre niveau de maîtrise des bonnes pratiques de sécurité informatique ?', 1);

-- Questions pour responsables marketing SEO/SEM (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 3, 11, 'Comment évaluez-vous l''efficacité de vos stratégies SEO pour améliorer le référencement ?', 1),
    (1, 3, 11, 'Dans quelle mesure vos campagnes SEM ont-elles atteint leurs objectifs cette année ?', 1);

-- Questions pour responsables réseaux sociaux (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 3, 12, 'Comment évaluez-vous l''engagement généré par vos publications sur les réseaux sociaux ?', 1),
    (1, 3, 12, 'Quel est le niveau d''efficacité de votre stratégie de contenu sur les différentes plateformes ?', 1);

-- Questions pour responsables analyse de données (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 3, 13, 'Comment évaluez-vous votre capacité à extraire des insights pertinents des données marketing ?', 1),
    (1, 3, 13, 'Dans quelle mesure utilisez-vous les outils d''analyse pour ajuster les stratégies marketing ?', 1);

-- Questions pour responsables gestion d'équipe (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 3, 14, 'Comment évaluez-vous votre capacité à motiver et développer votre équipe marketing ?', 1),
    (1, 3, 14, 'Quel est votre niveau d''efficacité dans la délégation et le suivi des tâches ?', 1);

-- Questions pour responsables budget (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 3, 15, 'Comment évaluez-vous votre gestion et optimisation du budget marketing ?', 1),
    (1, 3, 15, 'Dans quelle mesure mesurez-vous et optimisez-vous le ROI des actions marketing ?', 1);

-- Questions pour testeurs manuels (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 4, 16, 'Comment évaluez-vous la qualité et la couverture de vos scénarios de test manuels ?', 1),
    (1, 4, 16, 'Quel est votre niveau de précision dans l''identification et la documentation des bugs ?', 1);

-- Questions pour testeurs automatisation (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 4, 17, 'Comment évaluez-vous votre capacité à créer et maintenir des tests automatisés avec Selenium ?', 1),
    (1, 4, 17, 'Dans quelle mesure vos tests automatisés ont-ils permis de détecter des régressions ?', 1);

-- Questions pour testeurs performance (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 4, 18, 'Comment évaluez-vous votre capacité à concevoir et exécuter des tests de performance pertinents ?', 1),
    (1, 4, 18, 'Quel est votre niveau d''expertise dans l''analyse des résultats de tests de charge ?', 1);

-- Questions pour testeurs sécurité (évaluation annuelle - type 1)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (1, 4, 19, 'Comment évaluez-vous votre capacité à identifier les vulnérabilités de sécurité dans les applications ?', 1),
    (1, 4, 19, 'Dans quelle mesure maîtrisez-vous les outils et méthodologies de test de sécurité ?', 1);

-- Questions pour période d'essai (type 2)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (2, 1, 1, 'Comment évaluez-vous votre adaptation aux technologies Java utilisées dans l''entreprise ?', 1),
    (2, 1, 3, 'Dans quelle mesure vous êtes-vous familiarisé avec l''architecture React de nos projets ?', 1),
    (2, 2, 7, 'Comment évaluez-vous votre intégration aux procédures de support technique de l''entreprise ?', 1),
    (2, 3, 11, 'Dans quelle mesure avez-vous assimilé la stratégie SEO/SEM de l''entreprise ?', 1),
    (2, 4, 16, 'Comment évaluez-vous votre compréhension et application des méthodologies de test de l''entreprise ?', 1);

-- Questions pour évaluation de projet (type 3)
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    (3, 1, 1, 'Comment évaluez-vous la qualité du code Java produit pour ce projet ?', 1),
    (3, 1, 3, 'Dans quelle mesure les interfaces React développées répondent-elles aux exigences du projet ?', 1),
    (3, 1, 6, 'Comment évaluez-vous l''efficacité de la pipeline CI/CD mise en place pour ce projet ?', 1),
    (3, 3, 11, 'Dans quelle mesure les actions SEO/SEM ont-elles contribué aux objectifs du projet ?', 1),
    (3, 3, 12, 'Comment évaluez-vous l''impact des campagnes social media sur la visibilité du projet ?', 1),
    (3, 4, 16, 'Dans quelle mesure les tests fonctionnels ont-ils couvert les exigences du projet ?', 1),
    (3, 4, 17, 'Comment évaluez-vous la qualité et la maintenabilité des tests automatisés développés pour ce projet ?', 1);

-- 5. Insertion des suggestions de formation
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

-- Insertion des options pour les questions d'évaluation
-- Options pour les questions Java/J2EE
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES 
    -- Options pour la question sur Java 8+
    (1, 'Maîtrise complète avec utilisation avancée des fonctionnalités', 1, 1),
    (1, 'Bonne maîtrise avec utilisation régulière', 0, 1),
    (1, 'Maîtrise de base avec utilisation occasionnelle', 0, 1),
    (1, 'Connaissance théorique sans pratique', 0, 1),
    (1, 'Débutant dans l''utilisation de ces fonctionnalités', 0, 1),

    -- Options pour la question sur Spring Boot
    (2, 'Expert en développement d''applications Spring Boot', 1, 1),
    (2, 'Développement régulier avec Spring Boot', 0, 1),
    (2, 'Utilisation basique de Spring Boot', 0, 1),
    (2, 'Connaissance théorique sans pratique', 0, 1),
    (2, 'Débutant avec Spring Boot', 0, 1),

    -- Options pour la question sur JPA/Hibernate
    (3, 'Expert en optimisation JPA/Hibernate', 1, 1),
    (3, 'Bonne maîtrise de JPA/Hibernate', 0, 1),
    (3, 'Utilisation basique de JPA/Hibernate', 0, 1),
    (3, 'Connaissance théorique sans pratique', 0, 1),
    (3, 'Débutant avec JPA/Hibernate', 0, 1);

-- Options pour les questions PHP/Symfony
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur Symfony
    (4, 'Expert en développement Symfony', 1, 1),
    (4, 'Développement régulier avec Symfony', 0, 1),
    (4, 'Utilisation basique de Symfony', 0, 1),
    (4, 'Connaissance théorique sans pratique', 0, 1),
    (4, 'Débutant avec Symfony', 0, 1),

    -- Options pour la question sur Doctrine ORM
    (5, 'Expert en Doctrine ORM', 1, 1),
    (5, 'Bonne maîtrise de Doctrine ORM', 0, 1),
    (5, 'Utilisation basique de Doctrine ORM', 0, 1),
    (5, 'Connaissance théorique sans pratique', 0, 1),
    (5, 'Débutant avec Doctrine ORM', 0, 1);

-- Options pour les questions JavaScript/React
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur React et hooks
    (6, 'Expert en développement React et hooks', 1, 1),
    (6, 'Développement régulier avec React', 0, 1),
    (6, 'Utilisation basique de React', 0, 1),
    (6, 'Connaissance théorique sans pratique', 0, 1),
    (6, 'Débutant avec React', 0, 1),

    -- Options pour la question sur Redux
    (7, 'Expert en gestion d''état avec Redux', 1, 1),
    (7, 'Bonne maîtrise de Redux', 0, 1),
    (7, 'Utilisation basique de Redux', 0, 1),
    (7, 'Connaissance théorique sans pratique', 0, 1),
    (7, 'Débutant avec Redux', 0, 1),

    -- Options pour la question sur TypeScript
    (8, 'Expert en TypeScript', 1, 1),
    (8, 'Bonne maîtrise de TypeScript', 0, 1),
    (8, 'Utilisation basique de TypeScript', 0, 1),
    (8, 'Connaissance théorique sans pratique', 0, 1),
    (8, 'Débutant avec TypeScript', 0, 1);

-- Options pour les questions WordPress/CMS
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur les thèmes WordPress
    (9, 'Expert en développement de thèmes WordPress', 1, 1),
    (9, 'Développement régulier de thèmes', 0, 1),
    (9, 'Modification basique de thèmes', 0, 1),
    (9, 'Connaissance théorique sans pratique', 0, 1),
    (9, 'Débutant en développement WordPress', 0, 1),

    -- Options pour la question sur les plugins WordPress
    (10, 'Expert en développement de plugins WordPress', 1, 1),
    (10, 'Développement régulier de plugins', 0, 1),
    (10, 'Modification basique de plugins', 0, 1),
    (10, 'Connaissance théorique sans pratique', 0, 1),
    (10, 'Débutant en développement de plugins', 0, 1);

-- Options pour les questions CSS/SASS
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur le responsive design
    (11, 'Expert en responsive design', 1, 1),
    (11, 'Bonne maîtrise du responsive design', 0, 1),
    (11, 'Utilisation basique du responsive design', 0, 1),
    (11, 'Connaissance théorique sans pratique', 0, 1),
    (11, 'Débutant en responsive design', 0, 1),

    -- Options pour la question sur les animations CSS
    (12, 'Expert en animations CSS', 1, 1),
    (12, 'Bonne maîtrise des animations CSS', 0, 1),
    (12, 'Utilisation basique des animations CSS', 0, 1),
    (12, 'Connaissance théorique sans pratique', 0, 1),
    (12, 'Débutant en animations CSS', 0, 1);

-- Options pour les questions DevOps/CI-CD
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur les pipelines CI/CD
    (13, 'Expert en mise en place de pipelines CI/CD', 1, 1),
    (13, 'Bonne maîtrise des pipelines CI/CD', 0, 1),
    (13, 'Utilisation basique des pipelines CI/CD', 0, 1),
    (13, 'Connaissance théorique sans pratique', 0, 1),
    (13, 'Débutant en CI/CD', 0, 1),

    -- Options pour la question sur Docker
    (14, 'Expert en Docker et conteneurisation', 1, 1),
    (14, 'Bonne maîtrise de Docker', 0, 1),
    (14, 'Utilisation basique de Docker', 0, 1),
    (14, 'Connaissance théorique sans pratique', 0, 1),
    (14, 'Débutant avec Docker', 0, 1);

-- Options pour les questions Support Utilisateur
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur la résolution des problèmes
    (15, 'Expert en résolution de problèmes techniques', 1, 1),
    (15, 'Bonne efficacité dans la résolution', 0, 1),
    (15, 'Capacité basique de résolution', 0, 1),
    (15, 'Connaissance théorique sans pratique', 0, 1),
    (15, 'Débutant en support technique', 0, 1),

    -- Options pour la question sur la communication technique
    (16, 'Expert en communication technique', 1, 1),
    (16, 'Bonne capacité de communication', 0, 1),
    (16, 'Communication technique basique', 0, 1),
    (16, 'Connaissance théorique sans pratique', 0, 1),
    (16, 'Débutant en communication technique', 0, 1);

-- Options pour les questions Maintenance Matérielle
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur le diagnostic matériel
    (17, 'Expert en diagnostic matériel', 1, 1),
    (17, 'Bonne capacité de diagnostic', 0, 1),
    (17, 'Diagnostic basique', 0, 1),
    (17, 'Connaissance théorique sans pratique', 0, 1),
    (17, 'Débutant en maintenance matérielle', 0, 1),

    -- Options pour la question sur l'installation d'équipements
    (18, 'Expert en installation d''équipements', 1, 1),
    (18, 'Bonne maîtrise des installations', 0, 1),
    (18, 'Installation basique', 0, 1),
    (18, 'Connaissance théorique sans pratique', 0, 1),
    (18, 'Débutant en installation', 0, 1);

-- Options pour les questions Gestion Réseau
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur la configuration réseau
    (19, 'Expert en configuration réseau', 1, 1),
    (19, 'Bonne maîtrise de la configuration', 0, 1),
    (19, 'Configuration basique', 0, 1),
    (19, 'Connaissance théorique sans pratique', 0, 1),
    (19, 'Débutant en configuration réseau', 0, 1),

    -- Options pour la question sur le diagnostic réseau
    (20, 'Expert en diagnostic réseau', 1, 1),
    (20, 'Bonne capacité de diagnostic', 0, 1),
    (20, 'Diagnostic basique', 0, 1),
    (20, 'Connaissance théorique sans pratique', 0, 1),
    (20, 'Débutant en diagnostic réseau', 0, 1);

-- Options pour les questions Sécurité Informatique
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur les vulnérabilités
    (21, 'Expert en sécurité informatique', 1, 1),
    (21, 'Bonne capacité d''identification', 0, 1),
    (21, 'Identification basique', 0, 1),
    (21, 'Connaissance théorique sans pratique', 0, 1),
    (21, 'Débutant en sécurité', 0, 1),

    -- Options pour la question sur les bonnes pratiques
    (22, 'Expert en bonnes pratiques de sécurité', 1, 1),
    (22, 'Bonne maîtrise des pratiques', 0, 1),
    (22, 'Application basique des pratiques', 0, 1),
    (22, 'Connaissance théorique sans pratique', 0, 1),
    (22, 'Débutant en sécurité', 0, 1);

-- Options pour les questions SEO/SEM
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur les stratégies SEO
    (23, 'Expert en stratégies SEO', 1, 1),
    (23, 'Bonne maîtrise du SEO', 0, 1),
    (23, 'Utilisation basique du SEO', 0, 1),
    (23, 'Connaissance théorique sans pratique', 0, 1),
    (23, 'Débutant en SEO', 0, 1),

    -- Options pour la question sur les campagnes SEM
    (24, 'Expert en campagnes SEM', 1, 1),
    (24, 'Bonne maîtrise du SEM', 0, 1),
    (24, 'Utilisation basique du SEM', 0, 1),
    (24, 'Connaissance théorique sans pratique', 0, 1),
    (24, 'Débutant en SEM', 0, 1);

-- Options pour les questions Réseaux Sociaux
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur l'engagement social
    (25, 'Expert en engagement social', 1, 1),
    (25, 'Bonne maîtrise de l''engagement', 0, 1),
    (25, 'Gestion basique de l''engagement', 0, 1),
    (25, 'Connaissance théorique sans pratique', 0, 1),
    (25, 'Débutant en réseaux sociaux', 0, 1),

    -- Options pour la question sur la stratégie de contenu
    (26, 'Expert en stratégie de contenu', 1, 1),
    (26, 'Bonne maîtrise de la stratégie', 0, 1),
    (26, 'Gestion basique du contenu', 0, 1),
    (26, 'Connaissance théorique sans pratique', 0, 1),
    (26, 'Débutant en stratégie de contenu', 0, 1);

-- Options pour les questions Analyse de Données
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur l'extraction d'insights
    (27, 'Expert en analyse de données', 1, 1),
    (27, 'Bonne capacité d''analyse', 0, 1),
    (27, 'Analyse basique des données', 0, 1),
    (27, 'Connaissance théorique sans pratique', 0, 1),
    (27, 'Débutant en analyse de données', 0, 1),

    -- Options pour la question sur les outils d'analyse
    (28, 'Expert en outils d''analyse', 1, 1),
    (28, 'Bonne maîtrise des outils', 0, 1),
    (28, 'Utilisation basique des outils', 0, 1),
    (28, 'Connaissance théorique sans pratique', 0, 1),
    (28, 'Débutant avec les outils d''analyse', 0, 1);

-- Options pour les questions Gestion d'Équipe
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur la motivation d'équipe
    (29, 'Expert en management d''équipe', 1, 1),
    (29, 'Bonne capacité de motivation', 0, 1),
    (29, 'Gestion basique d''équipe', 0, 1),
    (29, 'Connaissance théorique sans pratique', 0, 1),
    (29, 'Débutant en management', 0, 1),

    -- Options pour la question sur la délégation
    (30, 'Expert en délégation', 1, 1),
    (30, 'Bonne maîtrise de la délégation', 0, 1),
    (30, 'Délégation basique', 0, 1),
    (30, 'Connaissance théorique sans pratique', 0, 1),
    (30, 'Débutant en délégation', 0, 1);

-- Options pour les questions Planification Budgétaire
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur la gestion budgétaire
    (31, 'Expert en gestion budgétaire', 1, 1),
    (31, 'Bonne maîtrise du budget', 0, 1),
    (31, 'Gestion basique du budget', 0, 1),
    (31, 'Connaissance théorique sans pratique', 0, 1),
    (31, 'Débutant en gestion budgétaire', 0, 1),

    -- Options pour la question sur le ROI
    (32, 'Expert en optimisation du ROI', 1, 1),
    (32, 'Bonne maîtrise du ROI', 0, 1),
    (32, 'Mesure basique du ROI', 0, 1),
    (32, 'Connaissance théorique sans pratique', 0, 1),
    (32, 'Débutant en analyse ROI', 0, 1);

-- Options pour les questions Tests Manuels
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur les scénarios de test
    (33, 'Expert en conception de tests', 1, 1),
    (33, 'Bonne maîtrise des tests', 0, 1),
    (33, 'Conception basique de tests', 0, 1),
    (33, 'Connaissance théorique sans pratique', 0, 1),
    (33, 'Débutant en tests', 0, 1),

    -- Options pour la question sur la documentation des bugs
    (34, 'Expert en documentation des bugs', 1, 1),
    (34, 'Bonne maîtrise de la documentation', 0, 1),
    (34, 'Documentation basique', 0, 1),
    (34, 'Connaissance théorique sans pratique', 0, 1),
    (34, 'Débutant en documentation', 0, 1);

-- Options pour les questions Tests Automatisés
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur Selenium
    (35, 'Expert en tests Selenium', 1, 1),
    (35, 'Bonne maîtrise de Selenium', 0, 1),
    (35, 'Utilisation basique de Selenium', 0, 1),
    (35, 'Connaissance théorique sans pratique', 0, 1),
    (35, 'Débutant avec Selenium', 0, 1),

    -- Options pour la question sur la maintenance des tests
    (36, 'Expert en maintenance des tests', 1, 1),
    (36, 'Bonne maîtrise de la maintenance', 0, 1),
    (36, 'Maintenance basique', 0, 1),
    (36, 'Connaissance théorique sans pratique', 0, 1),
    (36, 'Débutant en maintenance', 0, 1);

-- Options pour les questions Tests de Performance
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur les tests de performance
    (37, 'Expert en tests de performance', 1, 1),
    (37, 'Bonne maîtrise des tests', 0, 1),
    (37, 'Tests basiques', 0, 1),
    (37, 'Connaissance théorique sans pratique', 0, 1),
    (37, 'Débutant en tests de performance', 0, 1),

    -- Options pour la question sur l'analyse des résultats
    (38, 'Expert en analyse de performance', 1, 1),
    (38, 'Bonne capacité d''analyse', 0, 1),
    (38, 'Analyse basique', 0, 1),
    (38, 'Connaissance théorique sans pratique', 0, 1),
    (38, 'Débutant en analyse', 0, 1);

-- Options pour les questions Tests de Sécurité
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur les vulnérabilités
    (39, 'Expert en tests de sécurité', 1, 1),
    (39, 'Bonne maîtrise des tests', 0, 1),
    (39, 'Tests basiques', 0, 1),
    (39, 'Connaissance théorique sans pratique', 0, 1),
    (39, 'Débutant en tests de sécurité', 0, 1),

    -- Options pour la question sur les méthodologies
    (40, 'Expert en méthodologies de test', 1, 1),
    (40, 'Bonne maîtrise des méthodologies', 0, 1),
    (40, 'Utilisation basique', 0, 1),
    (40, 'Connaissance théorique sans pratique', 0, 1),
    (40, 'Débutant en méthodologies', 0, 1);

-- Options pour les questions de période d'essai
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur l'adaptation Java
    (41, 'Adaptation excellente', 1, 1),
    (41, 'Bonne adaptation', 0, 1),
    (41, 'Adaptation moyenne', 0, 1),
    (41, 'Adaptation difficile', 0, 1),
    (41, 'Non adapté', 0, 1),

    -- Options pour la question sur l'architecture React
    (42, 'Maîtrise complète', 1, 1),
    (42, 'Bonne compréhension', 0, 1),
    (42, 'Compréhension moyenne', 0, 1),
    (42, 'Compréhension limitée', 0, 1),
    (42, 'Non compris', 0, 1),

    -- Options pour la question sur le support technique
    (43, 'Intégration excellente', 1, 1),
    (43, 'Bonne intégration', 0, 1),
    (43, 'Intégration moyenne', 0, 1),
    (43, 'Intégration difficile', 0, 1),
    (43, 'Non intégré', 0, 1),

    -- Options pour la question sur SEO/SEM
    (44, 'Maîtrise excellente', 1, 1),
    (44, 'Bonne maîtrise', 0, 1),
    (44, 'Maîtrise moyenne', 0, 1),
    (44, 'Maîtrise limitée', 0, 1),
    (44, 'Non maîtrisé', 0, 1),

    -- Options pour la question sur les tests
    (45, 'Compréhension excellente', 1, 1),
    (45, 'Bonne compréhension', 0, 1),
    (45, 'Compréhension moyenne', 0, 1),
    (45, 'Compréhension limitée', 0, 1),
    (45, 'Non compris', 0, 1);

-- Options pour les questions d'évaluation de projet
INSERT INTO Evaluation_Question_Options (QuestionId, OptionText, IsCorrect, State)
VALUES
    -- Options pour la question sur la qualité du code Java
    (46, 'Qualité excellente', 1, 1),
    (46, 'Bonne qualité', 0, 1),
    (46, 'Qualité moyenne', 0, 1),
    (46, 'Qualité insuffisante', 0, 1),
    (46, 'Qualité très insuffisante', 0, 1),

    -- Options pour la question sur les interfaces React
    (47, 'Réponse excellente aux exigences', 1, 1),
    (47, 'Bonne réponse aux exigences', 0, 1),
    (47, 'Réponse moyenne', 0, 1),
    (47, 'Réponse insuffisante', 0, 1),
    (47, 'Réponse très insuffisante', 0, 1),

    -- Options pour la question sur la pipeline CI/CD
    (48, 'Pipeline excellente', 1, 1),
    (48, 'Bonne pipeline', 0, 1),
    (48, 'Pipeline moyenne', 0, 1),
    (48, 'Pipeline insuffisante', 0, 1),
    (48, 'Pipeline très insuffisante', 0, 1),

    -- Options pour la question sur SEO/SEM
    (49, 'Contribution excellente', 1, 1),
    (49, 'Bonne contribution', 0, 1),
    (49, 'Contribution moyenne', 0, 1),
    (49, 'Contribution insuffisante', 0, 1),
    (49, 'Contribution très insuffisante', 0, 1),

    -- Options pour la question sur les campagnes social media
    (50, 'Impact excellent', 1, 1),
    (50, 'Bon impact', 0, 1),
    (50, 'Impact moyen', 0, 1),
    (50, 'Impact insuffisant', 0, 1),
    (50, 'Impact très insuffisant', 0, 1),

    -- Options pour la question sur les tests fonctionnels
    (51, 'Couverture excellente', 1, 1),
    (51, 'Bonne couverture', 0, 1),
    (51, 'Couverture moyenne', 0, 1),
    (51, 'Couverture insuffisante', 0, 1),
    (51, 'Couverture très insuffisante', 0, 1),

    -- Options pour la question sur les tests automatisés
    (52, 'Maintenabilité excellente', 1, 1),
    (52, 'Bonne maintenabilité', 0, 1),
    (52, 'Maintenabilité moyenne', 0, 1),
    (52, 'Maintenabilité insuffisante', 0, 1),
    (52, 'Maintenabilité très insuffisante', 0, 1);
 
