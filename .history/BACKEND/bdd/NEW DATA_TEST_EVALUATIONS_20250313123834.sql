-- 1. Départements
INSERT INTO Department (Department_name)
VALUES
    ('Informatique'),
    ('Marketing'),
    ('Direction'),
    ('Vente et commerce'),
    ('Reseaux et techniques');

-- 2. Postes
INSERT INTO Postes (title, state)
VALUES
    ('Developpeur', 0),             -- Poste_id = 1
    ('Administrateur Système', 0),   -- Poste_id = 2
    ('Analyste de données', 0),      -- Poste_id = 3
    ('Responsable Marketing', 0),    -- Poste_id = 4
    ('Chargé de communication', 0),  -- Poste_id = 5
    ('Directeur Général', 0),        -- Poste_id = 6
    ('Commercial', 0),               -- Poste_id = 7
    ('Responsable des ventes', 0),   -- Poste_id = 8
    ('Ingénieur Réseaux', 0),        -- Poste_id = 9
    ('Technicien support', 0);       -- Poste_id = 10

-- 3. Rôles
INSERT INTO Roles (title)
VALUES 
    ('Administrator'), -- Role_id = 1 
    ('Manager'),       -- Role_id = 2 
    ('Employee'),      -- Role_id = 3 
    ('Director');      -- Role_id = 4

-- 4. Utilisateurs
-- 4.1 Administrateur
INSERT INTO Users 
    (last_name, first_name, email, password, role_id, departmentid, postId, creation_date, created_by, deletion_date, deleted_by, state)
VALUES 
    ('Rasoanirina', 'Andrianina', 'admin.mg@example.com', 'passAdmin', 1, 1, 2, GETUTCDATE(), 1, NULL, NULL, 1);

-- 4.2 Managers
INSERT INTO Users 
    (last_name, first_name, email, password, role_id, departmentid, postId, creation_date, created_by, deletion_date, deleted_by, state)
VALUES 
    ('Rakotoarisoa', 'Fanja', 'fanja.mg@example.com', 'passManager1', 2, 2, 4, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Randrianarisoa', 'Mialy', 'mialy.mg@example.com', 'passManager2', 2, 4, 8, GETUTCDATE(), 1, NULL, NULL, 1);

-- 4.3 Directeurs
INSERT INTO Users 
    (last_name, first_name, email, password, role_id, departmentid, postId, creation_date, created_by, deletion_date, deleted_by, state)
VALUES 
    ('Rasolofoson', 'Hery', 'hery.mg@example.com', 'passDirector1', 4, 3, 6, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Raharison', 'Andry', 'andry.mg@example.com', 'passDirector2', 4, 3, 6, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Ratsimbazafy', 'Tovo', 'tovo.mg@example.com', 'passDirector3', 4, 3, 6, GETUTCDATE(), 1, NULL, NULL, 1);

-- 4.4 Employés (20 enregistrements)
INSERT INTO Users 
    (last_name, first_name, email, password, role_id, departmentid, postId, creation_date, created_by, deletion_date, deleted_by, state)
VALUES
    -- Affectés à Informatique (Dépt 1) : alternance entre "Developpeur" ( post_id 1) et "Analyste de données" (post_id 3)
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
    (' Rafitoharisoa', 'Nirina', 'nirina.mg@example.com', 'passEmployee19', 3, 2, 5, GETUTCDATE(), 1, NULL, NULL, 1),
    ('Rasolofonirina', 'Faniry', 'faniry.mg@example.com', 'passEmployee20', 3, 2, 5, GETUTCDATE(), 1, NULL, NULL, 1);

-- 5. Types d'évaluation
INSERT INTO Evaluation_type (designation, state)
VALUES
    ('Évaluation annuelle', 1),
    ('Évaluation de période d''essai', 1),
    ('Évaluation de projet', 1);

-- 6. Évaluations (5 évaluations)
INSERT INTO Evaluations (evaluationType_id, userId, supervisorId, startDate, endDate, overallScore, 
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

-- 7. Questions d'évaluation
INSERT INTO Evaluation_questions (evaluationTypeId, postId, question, state)
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

INSERT INTO Evaluation_questions (evaluationTypeId, postId, question, state)
VALUES
    (1, 4, 'Développement et mise en œuvre de stratégies marketing', 1),
    (1, 4, 'Analyse des tendances du marché et adaptation des campagnes', 1),
    (1, 4, 'Capacité à gérer une équipe marketing', 1),
    (1, 4, 'Optimisation des budgets marketing et retour sur investissement', 1),
    (1, 4, 'Suivi et amélioration de la notoriété de la marque', 1);

-- 8. Questionnaire d'évaluation
INSERT INTO Evaluation_questionnaire (evaluationId, questionId, score, comments, state)
VALUES
    (1, 1, 4.5, 'Excellente maîtrise de React et Node.js', 1),
    (1, 2, 4.0, 'Quelques oublis de commentaires', 1),
    
    (2, 5, 3.5, 'Relations professionnelles à améliorer', 1),
    (2, 6, 4.0, 'Apprentissage rapide des procédures', 1),
    
    (4, 7, 4.75, 'Livraison 2 jours avant la deadline', 1),
    (4, 8, 4.25, 'Dépassement budgétaire de 5% justifié', 1);

-- 9. Suggestions de formation
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

-- 10. Interviews d'évaluation
INSERT INTO Evaluation_interviews (evaluationId, scheduled_date, status, notes, manager_approval, manager_comments, director_approval, director_comments)
VALUES
    (1, '2023-05-25T14:00:00', 2, 'Entretien constructif avec objectifs clairs', 1, 'Validation des axes d''amélioration', 1, 'Accord sur le plan de formation'),
    (3, '2023-07-20T10:30:00', 1, 'Nécessité de mettre en place un suivi RH', 0, NULL, 0, NULL),
    (4, '2023-08-30T09:00:00', 2, 'Reconnaissance des performances exceptionnelles', 1, 'Proposition de promotion', 1, 'Promotion validée pour Q4');

-- 11. Participants aux interviews
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
