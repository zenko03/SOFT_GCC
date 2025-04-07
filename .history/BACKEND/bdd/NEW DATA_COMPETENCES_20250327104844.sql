-- 1. Insertion des lignes de compétences (Competence_Lines)
-- Pour le poste Développeur (PositionId = 1)
INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (1, 'Développement Frontend', 'Compétences en HTML, CSS, JavaScript et frameworks associés', 1),
    (1, 'Développement Backend', 'Compétences en PHP, Node.js, Python et frameworks associés', 1),
    (1, 'Base de données', 'Conception et optimisation de bases de données SQL et NoSQL', 1),
    (1, 'DevOps', 'Compétences en intégration continue et déploiement', 1);

-- Pour le poste Technicien (PositionId = 2)
INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (2, 'Support technique', 'Assistance et résolution des problèmes informatiques', 1),
    (2, 'Maintenance matérielle', 'Installation et réparation des équipements informatiques', 1),
    (2, 'Réseaux', 'Configuration et maintenance des infrastructures réseau', 1);

-- Pour le poste Responsable Marketing (PositionId = 3)
INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (3, 'Marketing digital', 'Gestion des campagnes en ligne et réseaux sociaux', 1),
    (3, 'Analyse de marché', 'Étude de marché et analyse concurrentielle', 1),
    (3, 'Gestion d''équipe marketing', 'Management et coordination des activités marketing', 1),
    (3, 'Gestion budgétaire', 'Planification et optimisation des budgets marketing', 1);

-- Pour le poste Testeur (PositionId = 4)
INSERT INTO Competence_Lines (PositionId, CompetenceName, Description, state)
VALUES 
    (4, 'Tests fonctionnels', 'Vérification des fonctionnalités selon les spécifications', 1),
    (4, 'Tests d''automatisation', 'Création et maintenance de scripts de test automatisés', 1),
    (4, 'Tests de performance', 'Évaluation des performances et de la stabilité des applications', 1);

-- 2. Insertion des formations par ligne de compétence (Competence_Trainings)
-- Formations pour Développement Frontend
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (1, 'Maîtriser React', 'Formation complète sur React et son écosystème', '5 jours', 'FormaTech', 'Intermédiaire', 1),
    (1, 'CSS Avancé et Responsive Design', 'Techniques avancées de mise en page et d''adaptation', '3 jours', 'WebDesign Pro', 'Avancé', 1),
    (1, 'JavaScript Moderne', 'ES6+, TypeScript et bonnes pratiques', '4 jours', 'FormaTech', 'Intermédiaire', 1);

-- Formations pour Développement Backend
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (2, 'Node.js et Express', 'Développement d''API RESTful avec Node.js', '5 jours', 'CodeMaster', 'Intermédiaire', 1),
    (2, 'PHP et Laravel', 'Développement d''applications web avec Laravel', '5 jours', 'PHPExpert', 'Intermédiaire', 1),
    (2, 'Architecture Microservices', 'Conception et implémentation de microservices', '3 jours', 'ArchitectIT', 'Avancé', 1);

-- Formations pour Base de données
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (3, 'SQL Avancé', 'Optimisation de requêtes et performances', '3 jours', 'DataMaster', 'Avancé', 1),
    (3, 'MongoDB pour développeurs', 'Conception et utilisation de bases NoSQL', '4 jours', 'NoSQLPro', 'Intermédiaire', 1);

-- Formations pour DevOps
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (4, 'Docker et Kubernetes', 'Conteneurisation et orchestration d''applications', '5 jours', 'CloudExpert', 'Intermédiaire', 1),
    (4, 'CI/CD avec Jenkins', 'Automatisation du pipeline de développement', '3 jours', 'DevOpsAcademy', 'Intermédiaire', 1);

-- Formations pour Support technique
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (5, 'Support Utilisateur Avancé', 'Techniques de communication et résolution de problèmes', '3 jours', 'HelpDeskPro', 'Intermédiaire', 1),
    (5, 'Gestion des incidents ITIL', 'Méthodologie de gestion des incidents', '2 jours', 'ITILExpert', 'Débutant', 1);

-- Formations pour Maintenance matérielle
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (6, 'Maintenance PC et serveurs', 'Diagnostic et réparation de matériel informatique', '5 jours', 'HardwarePro', 'Intermédiaire', 1);

-- Formations pour Réseaux
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (7, 'Administration réseau Cisco', 'Configuration et maintenance d''équipements Cisco', '5 jours', 'NetworkAcademy', 'Intermédiaire', 1),
    (7, 'Sécurité réseau', 'Protection des infrastructures contre les attaques', '4 jours', 'CyberSecurity', 'Avancé', 1);

-- Formations pour Marketing digital
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (8, 'SEO et SEM avancés', 'Stratégies d''optimisation pour les moteurs de recherche', '3 jours', 'DigitalMarketing', 'Intermédiaire', 1),
    (8, 'Social Media Management', 'Gestion efficace des réseaux sociaux', '2 jours', 'SocialPro', 'Intermédiaire', 1);

-- Formations pour Analyse de marché
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (9, 'Études de marché professionnelles', 'Méthodologies d''analyse et interprétation des données', '4 jours', 'MarketAnalytics', 'Intermédiaire', 1);

-- Formations pour Gestion d'équipe marketing
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (10, 'Leadership en marketing', 'Techniques de management d''équipe marketing', '3 jours', 'LeadershipAcademy', 'Avancé', 1);

-- Formations pour Gestion budgétaire
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (11, 'ROI Marketing', 'Optimisation et mesure du retour sur investissement', '2 jours', 'BudgetOptimizer', 'Intermédiaire', 1);

-- Formations pour Tests fonctionnels
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (12, 'Méthodologies de test', 'Approches et techniques de test efficaces', '3 jours', 'QAExpert', 'Intermédiaire', 1);

-- Formations pour Tests d'automatisation
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (13, 'Selenium WebDriver', 'Automatisation des tests web avec Selenium', '4 jours', 'AutomationPro', 'Intermédiaire', 1),
    (13, 'Cypress pour tests E2E', 'Tests end-to-end modernes avec Cypress', '3 jours', 'TestAutomation', 'Intermédiaire', 1);

-- Formations pour Tests de performance
INSERT INTO Competence_Trainings (CompetenceLineId, TrainingName, Description, Duration, Provider, Level, state)
VALUES
    (14, 'JMeter et LoadRunner', 'Tests de charge et de performance', '4 jours', 'PerformanceMaster', 'Avancé', 1);

-- 3. Création de nouvelles questions d'évaluation liées aux lignes de compétence
INSERT INTO Evaluation_questions (evaluationTypeId, positionId, CompetenceLineId, question, state)
VALUES
    -- Questions pour développeurs (évaluation annuelle - type 1)
    (1, 1, 1, 'Capacité à créer des interfaces utilisateur réactives et accessibles', 1),
    (1, 1, 1, 'Maîtrise des frameworks frontend (React, Angular, Vue)', 1),
    (1, 1, 2, 'Conception d''API RESTful performantes et sécurisées', 1),
    (1, 1, 2, 'Maîtrise des frameworks backend (Laravel, Express, Django)', 1),
    (1, 1, 3, 'Conception de schémas de base de données optimisés', 1),
    (1, 1, 4, 'Mise en place de pipelines CI/CD', 1),
    
    -- Questions pour techniciens (évaluation annuelle - type 1)
    (1, 2, 5, 'Résolution efficace des problèmes utilisateurs', 1),
    (1, 2, 5, 'Communication claire avec les utilisateurs', 1),
    (1, 2, 6, 'Rapidité et précision dans les diagnostics matériels', 1),
    (1, 2, 7, 'Configuration et dépannage des équipements réseau', 1),
    
    -- Questions pour responsables marketing (évaluation annuelle - type 1)
    (1, 3, 8, 'Développement de stratégies marketing digitales efficaces', 1),
    (1, 3, 8, 'Optimisation des campagnes publicitaires en ligne', 1),
    (1, 3, 9, 'Réalisation d''études de marché pertinentes', 1),
    (1, 3, 10, 'Gestion et motivation de l''équipe marketing', 1),
    (1, 3, 11, 'Optimisation du budget marketing et mesure du ROI', 1),
    
    -- Questions pour testeurs (évaluation annuelle - type 1)
    (1, 4, 12, 'Qualité et couverture des tests fonctionnels', 1),
    (1, 4, 12, 'Identification et documentation précise des bugs', 1),
    (1, 4, 13, 'Développement et maintenance des suites de tests automatisés', 1),
    (1, 4, 14, 'Conception et exécution de tests de performance', 1),
    
    -- Questions pour période d'essai (type 2)
    (2, 1, 1, 'Capacité d''adaptation aux technologies frontend utilisées', 1),
    (2, 1, 2, 'Compréhension de l''architecture backend du projet', 1),
    (2, 2, 5, 'Rapidité d''apprentissage des procédures de support', 1),
    (2, 3, 8, 'Intégration aux projets marketing en cours', 1),
    (2, 4, 12, 'Application des méthodologies de test de l''entreprise', 1),
    
    -- Questions pour évaluation de projet (type 3)
    (3, 1, 1, 'Qualité des interfaces livrées pour le projet', 1),
    (3, 1, 2, 'Respect des standards de développement backend', 1),
    (3, 1, 4, 'Participation au déploiement continu du projet', 1),
    (3, 3, 8, 'Efficacité des campagnes digitales pour le projet', 1),
    (3, 3, 9, 'Pertinence de l''analyse concurrentielle réalisée', 1),
    (3, 4, 12, 'Couverture des tests pour les fonctionnalités du projet', 1),
    (3, 4, 13, 'Qualité des tests automatisés développés pour le projet', 1);

-- 4. Mise à jour des suggestions de formation pour les lier aux compétences et formations
INSERT INTO Training_suggestions (evaluationTypeId, questionId, CompetenceLineId, TrainingId, training, details, scoreThreshold, state)
VALUES
    -- Suggestions pour les développeurs
    (1, 21, 1, 1, 'Formation React', 'Formation approfondie sur React et Redux', 3, 1),
    (1, 22, 1, 3, 'JavaScript Moderne', 'Maîtriser ES6+ et TypeScript', 3, 1),
    (1, 23, 2, 4, 'Node.js et Express', 'Conception d''API REST avancées', 3, 1),
    (1, 25, 3, 7, 'SQL Avancé', 'Optimisation de requêtes complexes', 3, 1),
    (1, 26, 4, 9, 'Docker et Kubernetes', 'Conteneurisation et déploiement', 3, 1),
    
    -- Suggestions pour les techniciens
    (1, 27, 5, 11, 'Support Utilisateur Avancé', 'Amélioration du service client', 3, 1),
    (1, 29, 6, 13, 'Maintenance PC et serveurs', 'Diagnostic avancé de problèmes matériels', 3, 1),
    (1, 30, 7, 14, 'Administration réseau Cisco', 'Configuration avancée d''équipements réseau', 3, 1),
    
    -- Suggestions pour les responsables marketing
    (1, 31, 8, 17, 'SEO et SEM avancés', 'Amélioration du référencement web', 3, 1),
    (1, 33, 9, 19, 'Études de marché professionnelles', 'Techniques d''analyse de marché', 3, 1),
    (1, 34, 10, 20, 'Leadership en marketing', 'Développement des compétences managériales', 3, 1),
    (1, 35, 11, 21, 'ROI Marketing', 'Optimisation des dépenses marketing', 3, 1),
    
    -- Suggestions pour les testeurs
    (1, 36, 12, 22, 'Méthodologies de test', 'Amélioration des protocoles de test', 3, 1),
    (1, 38, 13, 23, 'Selenium WebDriver', 'Automatisation des tests web', 3, 1),
    (1, 39, 14, 25, 'JMeter et LoadRunner', 'Tests de performance avancés', 3, 1),
    
    -- Suggestions pour période d'essai
    (2, 40, 1, 1, 'React pour débutants', 'Bases de React pour nouveaux développeurs', 2.5, 1),
    (2, 43, 5, 11, 'Fondamentaux du support technique', 'Bases du support utilisateur', 2.5, 1),
    
    -- Suggestions pour évaluation de projet
    (3, 46, 1, 2, 'CSS Avancé et Responsive Design', 'Amélioration des interfaces utilisateur', 3, 1),
    (3, 47, 2, 6, 'Architecture Microservices', 'Meilleures pratiques pour projets évolutifs', 3, 1),
    (3, 50, 8, 18, 'Social Media Management', 'Stratégies social media pour projets', 3, 1); 