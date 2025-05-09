-- 1. Insertion des lignes de compétences (Competence_Lines)
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

-- 2. Insertion des formations par ligne de compétence (Competence_Trainings)
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

-- 3. Création de questions d'évaluation liées aux lignes de compétence
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

-- 4. Mise à jour des suggestions de formation pour les lier aux compétences et formations
INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state)
VALUES
    -- Suggestions pour les développeurs Java
    (1, 21, 1, 1, 'Java 17 et nouveautés', 'Formation approfondie sur les dernières fonctionnalités de Java', 3, 1),
    (1, 22, 1, 2, 'Spring Boot Avancé', 'Maîtriser le développement d''applications avec Spring Boot', 3, 1),
    (1, 23, 1, 3, 'Hibernate et JPA', 'Optimisation de la persistance des données', 3, 1),
    
    -- Suggestions pour les développeurs PHP/Symfony
    (1, 24, 2, 4, 'Symfony 6', 'Développement d''applications PHP avec Symfony 6', 3, 1),
    (1, 25, 2, 5, 'API Platform', 'Création d''API REST avec API Platform', 3, 1),
    
    -- Suggestions pour les développeurs JavaScript/React
    (1, 26, 3, 6, 'React et Redux', 'Maîtriser le développement React avec gestion d''état Redux', 3, 1),
    (1, 27, 3, 7, 'TypeScript Avancé', 'Améliorer la qualité du code avec TypeScript', 3, 1),
    
    -- Suggestions pour les développeurs WordPress
    (1, 29, 4, 8, 'WordPress pour Développeurs', 'Développement avancé de thèmes et plugins', 3, 1),
    (1, 30, 4, 9, 'Gutenberg Block Editor', 'Création de blocs personnalisés', 3, 1),
    
    -- Suggestions pour CSS/SASS
    (1, 31, 5, 10, 'CSS Avancé et Animations', 'Techniques avancées de mise en page et animations', 3, 1),
    (1, 32, 5, 11, 'SASS et Architecture CSS', 'Organisation optimale des feuilles de style', 3, 1),
    
    -- Suggestions pour DevOps
    (1, 33, 6, 12, 'GitLab CI/CD', 'Maîtriser l''intégration et déploiement continu', 3, 1),
    (1, 34, 6, 13, 'Docker et Kubernetes', 'Conteneurisation et orchestration d''applications', 3, 1),
    
    -- Suggestions pour support utilisateur
    (1, 35, 7, 14, 'Service Desk ITIL', 'Gestion des incidents selon les bonnes pratiques ITIL', 3, 1),
    (1, 36, 7, 15, 'Communication Technique', 'Améliorer la communication avec les utilisateurs', 3, 1),
    
    -- Suggestions pour période d'essai
    (2, 51, 1, 1, 'Java 17 pour débutants', 'Formation accélérée sur Java pour nouveaux développeurs', 2.5, 1),
    (2, 53, 7, 14, 'Fondamentaux du support technique', 'Bases du support utilisateur dans l''entreprise', 2.5, 1),
    
    -- Suggestions pour évaluation de projet
    (3, 56, 1, 2, 'Optimisation des applications Java', 'Amélioration des performances Java', 3, 1),
    (3, 57, 3, 6, 'Architecture React avancée', 'Meilleures pratiques pour projets React complexes', 3, 1),
    (3, 60, 11, 19, 'SEO Technique Avancé', 'Optimisation technique pour sites complexes', 3, 1); 