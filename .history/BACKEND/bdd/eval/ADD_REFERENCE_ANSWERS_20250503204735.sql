-- Script pour ajouter la table des réponses de référence pour les évaluations
-- Cette table permettra aux RH d'avoir des références pour évaluer correctement les réponses

-- Création de la table Evaluation_Reference_Answers
CREATE TABLE Evaluation_Reference_Answers (
    ReferenceAnswerId INT PRIMARY KEY IDENTITY(1,1),
    QuestionId INT NOT NULL,
    ReferenceText NVARCHAR(MAX) NOT NULL,
    EvaluationGuidelines NVARCHAR(MAX) NULL,
    ExpectedKeyPoints NVARCHAR(MAX) NULL,
    ScoreDescription1 NVARCHAR(255) NULL, -- Description de ce qu'est une réponse de niveau 1
    ScoreDescription2 NVARCHAR(255) NULL, -- Description de ce qu'est une réponse de niveau 2
    ScoreDescription3 NVARCHAR(255) NULL, -- Description de ce qu'est une réponse de niveau 3
    ScoreDescription4 NVARCHAR(255) NULL, -- Description de ce qu'est une réponse de niveau 4
    ScoreDescription5 NVARCHAR(255) NULL, -- Description de ce qu'est une réponse de niveau 5
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME NULL,
    CreatedById INT NULL,
    UpdatedById INT NULL,
    State INT DEFAULT 1,
    FOREIGN KEY (QuestionId) REFERENCES Evaluation_questions(Question_id),
    FOREIGN KEY (CreatedById) REFERENCES Users(UserId),
    FOREIGN KEY (UpdatedById) REFERENCES Users(UserId)
);

-- Ajout d'un index pour accélérer les recherches par question
CREATE INDEX IX_EvaluationReferenceAnswers_QuestionId
ON Evaluation_Reference_Answers (QuestionId);

-- Exemple d'insertion de données de référence pour quelques questions
-- (utilise les IDs des questions existantes dans la table Evaluation_questions)
INSERT INTO Evaluation_Reference_Answers (
    QuestionId, 
    ReferenceText, 
    EvaluationGuidelines, 
    ExpectedKeyPoints,
    ScoreDescription1,
    ScoreDescription2,
    ScoreDescription3,
    ScoreDescription4,
    ScoreDescription5
)
VALUES 
-- Pour une question sur Java/J2EE (Exemple pour questionId 1)
(1, 
'Java 8+ a introduit plusieurs fonctionnalités importantes comme les Streams, les expressions Lambda, les interfaces fonctionnelles et Optional. Les Streams permettent de manipuler des collections de manière déclarative, les Lambdas offrent une syntaxe concise pour les interfaces fonctionnelles, et Optional aide à gérer les valeurs nulles de façon plus sûre.',
'Évaluez si la réponse montre une compréhension des concepts fondamentaux de Java 8+ et si le candidat peut expliquer comment ces fonctionnalités améliorent le code.',
'- Mention et compréhension des Streams API
- Explication correcte des expressions Lambda et leur utilité
- Comprendre les interfaces fonctionnelles (Predicate, Consumer, etc.)
- Connaissance d''Optional pour la gestion des nulls
- Autres fonctionnalités: Date/Time API, Méthodess par défaut dans les interfaces',
'Ne connaît pas ou confond les fonctionnalités de Java 8+',
'Connaît quelques fonctionnalités de base mais ne peut pas les expliquer correctement',
'Comprend les concepts de base (lambdas, streams) et peut les expliquer',
'Bonne maîtrise des concepts et peut donner des exemples pertinents d''utilisation',
'Compréhension approfondie de toutes les fonctionnalités et peut expliquer les avantages/inconvénients'),

-- Pour une question sur Spring Boot (Exemple pour questionId 2)
(2, 
'Spring Boot est un framework qui facilite le développement d''applications Spring en offrant une configuration automatique, un serveur embarqué, et une approche "opinionated" qui favorise les conventions plutôt que la configuration. Il permet de créer des applications autonomes, prêtes pour la production, avec un minimum de configuration.',
'Évaluez si le candidat comprend les avantages de Spring Boot par rapport à Spring classique et s''il peut expliquer comment configurer et optimiser une application Spring Boot.',
'- Auto-configuration et facilité de mise en place
- Starters et dépendances
- Configuration externe (application.properties/yaml)
- Sécurité et gestion des profils
- Actuators et monitoring
- Tests avec Spring Boot',
'Connaissance très limitée, ne peut pas expliquer ce qu''est Spring Boot',
'Connaît les bases mais ne peut pas expliquer les avantages par rapport à Spring classique',
'Comprend les concepts clés et peut configurer une application simple',
'Bonne maîtrise, peut expliquer l''autoconfiguration et l''utilisation des starters',
'Maîtrise avancée, comprend les mécanismes internes et l''optimisation pour la production');

-- Ajoutez d'autres exemples selon vos besoins 