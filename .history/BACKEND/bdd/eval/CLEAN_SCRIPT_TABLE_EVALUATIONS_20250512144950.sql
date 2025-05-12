-- ====================================================
-- 1. TABLES IND�PENDANTES (sans cl�s �trang�res)
-- ====================================================

CREATE TABLE Roles (
    Role_id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    state INT
);

CREATE TABLE Department (
    Department_id INT PRIMARY KEY IDENTITY(1,1),
    Department_name NVARCHAR(255) NOT NULL,
    state INT
);

CREATE TABLE Position (
    Position_id INT PRIMARY KEY IDENTITY(1,1),
    position_name NVARCHAR(255) NOT NULL, 
    state INT
);

CREATE TABLE Permissions (
    Permission_id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(255),
    state INT DEFAULT 1
);

CREATE TABLE Evaluation_type (
    Evaluation_type_id INT PRIMARY KEY IDENTITY(1,1),
    designation NVARCHAR(100),
    state INT
);

	CREATE TABLE EvaluationSupervisors (
    EvaluationId INT NOT NULL,
    SupervisorId INT NOT NULL,
    PRIMARY KEY (EvaluationId, SupervisorId),
    FOREIGN KEY (EvaluationId) REFERENCES Evaluations(Evaluations_id),
    FOREIGN KEY (SupervisorId) REFERENCES Users(UserId)
);
-- ====================================================
-- 2. TABLES AVEC R�F�RENCES DE PREMIER NIVEAU
-- ====================================================

CREATE TABLE Competence_Lines (
    CompetenceLineId INT PRIMARY KEY IDENTITY(1,1),
    PositionId INT NOT NULL,
    CompetenceName NVARCHAR(100) NOT NULL, 
    Description NVARCHAR(255),
    state INT,
    FOREIGN KEY (PositionId) REFERENCES Position(Position_id)
);

CREATE TABLE Role_Permissions (
    Role_Permission_id INT PRIMARY KEY IDENTITY(1,1),
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES Roles(Role_id),
    FOREIGN KEY (permission_id) REFERENCES Permissions(Permission_id)
);

-- ====================================================
-- 3. TABLES AVEC R�F�RENCES DE DEUXI�ME NIVEAU
-- ====================================================

CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    last_name NVARCHAR(255) NOT NULL,
    first_name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    password NVARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    departmentid INT,
    positionId INT,
    creation_date DATE NOT NULL DEFAULT GETUTCDATE(),
    created_by INT NOT NULL,
    deletion_date DATE,
    deleted_by INT,
    state INT,
    FOREIGN KEY (role_id) REFERENCES Roles(Role_id),
    FOREIGN KEY (departmentid) REFERENCES Department(Department_id),
    FOREIGN KEY (positionId) REFERENCES Position(Position_id)
);

CREATE TABLE Competence_Trainings (
    TrainingId INT PRIMARY KEY IDENTITY(1,1),
    CompetenceLineId INT NOT NULL,
    TrainingName NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX),
    Duration NVARCHAR(50),
    Provider NVARCHAR(100),
    Level NVARCHAR(50),
    state INT,
    FOREIGN KEY (CompetenceLineId) REFERENCES Competence_Lines(CompetenceLineId)
);

-- Ajout de la r�f�rence circulaire pour Users
ALTER TABLE Users ADD CONSTRAINT FK_Users_DeletedBy 
FOREIGN KEY (deleted_by) REFERENCES Users(UserId);

-- ====================================================
-- 4. TABLES AVEC R�F�RENCES DE TROISI�ME NIVEAU
-- ====================================================

CREATE TABLE Evaluations (
    Evaluations_id INT PRIMARY KEY IDENTITY(1,1),
    evaluationType_id INT,
    userId INT,
    startDate DATE,
    endDate DATE,
    overallScore DECIMAL(3,2),
    comments NVARCHAR(MAX),
    actionPlan NVARCHAR(MAX), strengths NVARCHAR(MAX),
    weaknesses NVARCHAR(MAX),
	strenghts NVARCHAR(MAX),
    isServiceApproved BIT DEFAULT 0,
    isDgApproved BIT DEFAULT 0,
    serviceApprovalDate DATE NULL,
    dgApprovalDate DATE NULL,
    state INT DEFAULT 0,
    FOREIGN KEY (evaluationType_id) REFERENCES Evaluation_type(Evaluation_type_id),
    FOREIGN KEY (userId) REFERENCES Users(UserId)
);
CREATE TABLE Evaluation_questions (
    Question_id INT PRIMARY KEY IDENTITY(1,1),
    evaluationTypeId INT NOT NULL,
    positionId INT NOT NULL,
    question NVARCHAR(255) NOT NULL,
	CompetenceLineId int,
    state INT,
    FOREIGN KEY (evaluationTypeId) REFERENCES Evaluation_type(Evaluation_type_id),
    FOREIGN KEY (positionId) REFERENCES Position(Position_id),
	FOREIGN KEY (CompetenceLineId) REFERENCES Competence_Lines(CompetenceLineId)
);

CREATE TABLE Evaluation_questionnaire (
    evaluation_questionnaire_id INT PRIMARY KEY IDENTITY(1,1),
    evaluationId INT,
    questionId INT,
    score DECIMAL(3,2),
    comments NVARCHAR(MAX),
    state INT,
    FOREIGN KEY (evaluationId) REFERENCES Evaluations(Evaluations_id),
    FOREIGN KEY (questionId) REFERENCES Evaluation_questions(Question_id)
);

CREATE TABLE Training_suggestions (
    Training_suggestion_id INT PRIMARY KEY IDENTITY(1,1),
    evaluationTypeId INT,
    questionId INT,
    training NVARCHAR(255) NOT NULL,
    details NVARCHAR(MAX),
    scoreThreshold INT DEFAULT 2,
    state INT,
    FOREIGN KEY (evaluationTypeId) REFERENCES Evaluation_type(Evaluation_type_id),
    FOREIGN KEY (questionId) REFERENCES Evaluation_questions(Question_id)
);

CREATE TABLE Evaluation_interviews (
    InterviewId INT PRIMARY KEY IDENTITY(1,1),
    evaluationId INT NOT NULL,
    scheduled_date DATETIME NOT NULL,
    status INT DEFAULT 0,
    notes NVARCHAR(MAX),
    manager_approval BIT DEFAULT 0,
    manager_comments NVARCHAR(MAX),
    director_approval BIT DEFAULT 0,
    director_comments NVARCHAR(MAX),
    FOREIGN KEY (evaluationId) REFERENCES Evaluations(Evaluations_id)
);

CREATE TABLE InterviewParticipants (
    ParticipantId INT PRIMARY KEY IDENTITY(1,1),
    InterviewId INT NOT NULL,
    UserId INT NOT NULL,
    FOREIGN KEY (InterviewId) REFERENCES Evaluation_interviews(InterviewId),
    FOREIGN KEY (User Id) REFERENCES Users(UserId)
);

CREATE TABLE Evaluation_progress (
    Progress_id INT PRIMARY KEY IDENTITY(1,1),
    evaluationId INT NOT NULL,
    userId INT NOT NULL,
    totalQuestions INT NOT NULL,
    answeredQuestions INT DEFAULT 0,
    progressPercentage DECIMAL(5,2) DEFAULT 0,
    lastUpdate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (evaluationId) REFERENCES Evaluations(Evaluations_id),
    FOREIGN KEY (userId) REFERENCES Users(UserId)
);

CREATE TABLE TemporaryAccounts (
    TempAccountId INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL,
    Evaluations_id INT NOT NULL,
    TempLogin NVARCHAR(255) NOT NULL,
    TempPassword NVARCHAR(255) NOT NULL,
    ExpirationDate DATETIME NOT NULL,
    IsUsed BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (User Id) REFERENCES Users(UserId),
    FOREIGN KEY (Evaluations_id) REFERENCES Evaluations(Evaluations_id)
);
select * from temporaryaccounts
CREATE TABLE LoginAttempts (
    AttemptId INT PRIMARY KEY IDENTITY(1,1),
    TempLogin NVARCHAR(255) NOT NULL,
    AttemptDate DATETIME DEFAULT GETUTCDATE(),
    IPAddress NVARCHAR(45),
    IsSuccess BIT DEFAULT 0
);

CREATE TABLE Evaluation_Selected_Questions (
    SelectedQuestionId INT PRIMARY KEY IDENTITY(1,1),
    EvaluationId INT NOT NULL,
    QuestionId INT NOT NULL,
    CompetenceLineId INT NOT NULL,
    FOREIGN KEY (EvaluationId) REFERENCES Evaluations(Evaluations_id),
    FOREIGN KEY (QuestionId) REFERENCES Evaluation_questions(Question_id),
    FOREIGN KEY (CompetenceLineId) REFERENCES Competence_Lines(CompetenceLineId)
);

CREATE TABLE Evaluation_Responses (
    ResponseId INT PRIMARY KEY IDENTITY(1,1),
    EvaluationId INT NOT NULL,
    QuestionId INT NOT NULL,
    ResponseType NVARCHAR(20) NOT NULL, -- 'QCM', 'TEXT', 'SCORE'
    ResponseValue NVARCHAR(MAX), -- Pour stocker la r�ponse (texte ou JSON pour QCM)
    TimeSpent INT, -- Temps en secondes pour r�pondre
    StartTime DATETIME, -- Heure de d�but de la r�ponse
    EndTime DATETIME, -- Heure de fin de la r�ponse
    IsCorrect BIT, -- Pour les QCM
    State INT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (EvaluationId) REFERENCES Evaluations(Evaluations_id),
    FOREIGN KEY (QuestionId) REFERENCES Evaluation_questions(Question_id)
);

CREATE TABLE Evaluation_Question_Options (
    OptionId INT PRIMARY KEY IDENTITY(1,1),
    QuestionId INT NOT NULL,
    OptionText NVARCHAR(255) NOT NULL,
    IsCorrect BIT DEFAULT 0,
    State INT DEFAULT 1,
    FOREIGN KEY (QuestionId) REFERENCES Evaluation_questions(Question_id)
);
-- ====================================================
-- 5. VUES POUR LES RAPPORTS
-- ====================================================

CREATE VIEW VEmployeeDetails AS
SELECT 
    u.UserId AS EmployeeId,
    u.first_name AS FirstName,
    u.last_name AS LastName,
    p.position_name AS Position,
    p.Position_id AS PositionId,
    r.title AS Role,
    d.Department_name AS Department,
    e.Evaluations_id AS EvaluationId,
    e.startDate AS EvaluationDate,
    e.overallScore AS OverallScore,
    e.comments AS EvaluationComments,
    e.isServiceApproved AS IsServiceApproved,
    e.isDgApproved AS IsDgApproved,
    et.designation AS EvaluationType,
    e.strengths AS strengths,
    e.weaknesses AS weaknesses,
    e.state AS state
FROM Users u
LEFT JOIN Position p ON u.positionId = p.Position_id
LEFT JOIN Roles r ON u.role_id = r.Role_id
LEFT JOIN Department d ON u.departmentid = d.Department_id
LEFT JOIN Evaluations e ON u.UserId = e.userId
LEFT JOIN Evaluation_type et ON e.evaluationType_id = et.Evaluation_type_id 
WHERE e.state = 10;

CREATE VIEW VEmployeesWithoutEvaluation AS
SELECT 
    u.UserId AS EmployeeId,
    u.positionId AS position Id,
    u.first_name AS FirstName,
    u.last_name AS LastName,
    p.position_name AS Position,
    e.startDate AS startDate,
    e.endDate AS endDate,
    e.Evaluations_id AS evaluationId,
    d.Department_name AS Department,
    d.Department_id AS DepartmentId,
    e.state AS state
FROM Users u
LEFT JOIN Position p ON u.positionId = p.Position_id
LEFT JOIN Department d ON u.departmentid = d.Department_id
LEFT JOIN Evaluations e ON u.UserId = e.userId
WHERE e.Evaluations_id IS NULL OR (e.startDate IS NULL AND e.endDate IS NULL AND e.state = 0);

CREATE VIEW VEmployeesFinishedEvaluation AS
SELECT 
    u.UserId AS EmployeeId,
    u.positionId AS positionId,
    u.first_name AS FirstName,
    u.last_name AS LastName,
    p.position_name AS Position,
    e.startDate AS startDate,
    e.endDate AS endDate,
    e.Evaluations_id AS evaluationId,
    d.Department_name AS Department,
    d.Department_id AS DepartmentId,
    e.state AS state,
    e.strengths AS strengths,
    e.weaknesses AS weaknesses,
    e.comments AS comments,
    e.overallScore AS overallScore,
    ei.scheduled_date AS InterviewDate,
    ei.status AS InterviewStatus,
    ei.director_approval AS directorApproval,
    ei.manager_approval AS managerApproval,
    ei.director_comments AS directorComments,
    ei.manager_comments AS managerComments
FROM Users u
LEFT JOIN Position p ON u.positionId = p.Position_id
LEFT JOIN Department d ON u.departmentid = d.Department_id
LEFT JOIN Evaluations e ON u.UserId = e.userId
LEFT JOIN Evaluation_interviews ei ON e.Evaluations_id = ei.evaluationId
WHERE e.state = 20;

CREATE VIEW VEmployeesOngoingEvaluation AS
SELECT 
    u.UserId AS EmployeeId,
    u.first_name AS FirstName,
    u.last_name AS LastName,
    p.position_name AS Position,
    e.startDate AS StartDate,
    e.endDate AS EndDate,
    e.Evaluations_id AS EvaluationId,
    et.designation AS EvaluationType,
    et.Evaluation_type_id AS EvaluationTypeId,
    e.state AS EvaluationState
FROM Users u
LEFT JOIN Position p ON u.positionId = p.Position_id
LEFT JOIN Evaluations e ON u.UserId = e.userId
LEFT JOIN Evaluation_type et ON e.evaluationType_id = et.Evaluation_type_id
WHERE e.state = 15;

CREATE VIEW VEmployeeEvaluationProgress AS
SELECT 
    ep.evaluationId AS EvaluationId,
    ep.userId AS EmployeeId,
    u.first_name AS FirstName,
    u.last_name AS LastName,
    ep.totalQuestions AS TotalQuestions,
    ep.answeredQuestions AS AnsweredQuestions,
    ep.progressPercentage AS Progress,
    ep.lastUpdate AS LastUpdated
FROM Evaluation_progress ep
JOIN Users u ON ep.userId = u.UserId;

CREATE VIEW VTemporaryActiveAccounts AS
SELECT 
    ta.TempAccountId,
    u.UserId,
    u.email AS EmployeeEmail,
    ta.TempLogin,
    ta.ExpirationDate,
    e.Evaluations_id,
    e.startDate AS EvaluationStart,
    e.endDate AS EvaluationEnd
FROM TemporaryAccounts ta
JOIN Users u ON ta.UserId = u.UserId
JOIN Evaluations e ON ta.Evaluations_id = e.Evaluations_id
WHERE ta.ExpirationDate > GETUTCDATE() 
  AND ta.IsUsed = 0;

CREATE VIEW VFailedLoginAttempts AS
SELECT 
    la.AttemptId,
    la.TempLogin,
    la.AttemptDate,
    la.IPAddress,
    ta.Evaluations_id,
    u.UserId
FROM LoginAttempts la
LEFT JOIN TemporaryAccounts ta ON la.TempLogin = ta.TempLogin
LEFT JOIN Users u ON ta.UserId = u.UserId
WHERE la.IsSuccess = 0;

CREATE PROCEDURE CleanExpiredTemporaryAccounts
AS
BEGIN
    DELETE FROM TemporaryAccounts 
    WHERE ExpirationDate < GETUTCDATE();
END;

CREATE VIEW VEvaluationHistory AS
SELECT 
    e.Evaluations_id AS EvaluationId,
    e.userId AS EmployeeId,
    u.first_name AS FirstName,
    u.last_name AS LastName,
    et.designation AS EvaluationType,
    e.startDate AS StartDate,
    e.endDate AS EndDate,
    e.overallScore AS OverallScore,
    e.comments AS EvaluationComments,
    e.strengths AS Strengths,
    e.weaknesses AS Weaknesses,
    e.isServiceApproved AS IsServiceApproved,
    e.isDgApproved AS IsDgApproved,
    ei.scheduled_date AS InterviewDate,
    ei.status AS InterviewStatus,
    p.position_name AS Position,
    d.Department_name AS Department,
    e.state AS Status,
    (SELECT STRING_AGG(training.training, ', ')
     FROM (
         SELECT DISTINCT ts.training
         FROM Evaluation_questionnaire eq
         JOIN Training_suggestions ts 
         ON eq.questionId = ts.questionId 
         AND eq.score < ts.scoreThreshold
         WHERE eq.evaluationId = e.Evaluations_id
     ) AS training
    ) AS Recommendations,
    (SELECT STRING_AGG(participants.full_name, ', ')
     FROM (
         SELECT DISTINCT ip.ParticipantId, up.first_name + ' ' + up.last_name AS full_name
         FROM InterviewParticipants ip
         JOIN Users up ON ip.ParticipantId = up.UserId
         WHERE ip.InterviewId = ei.InterviewId
     ) AS participants
    ) AS ParticipantNames,
    (SELECT STRING_AGG(CAST(participant_ids.UserId AS NVARCHAR), ', ')
     FROM (
         SELECT DISTINCT ip.ParticipantId, up.UserId
         FROM InterviewParticipants ip
         JOIN Users up ON ip.ParticipantId = up.UserId
         WHERE ip.InterviewId = ei.InterviewId
     ) AS participant_ids
    ) AS ParticipantIds,
    (SELECT STRING_AGG(CONCAT('ID:', CAST(eq.Question_id AS NVARCHAR), ', Question:', eq.question, ', Score:', CAST(eqn.score AS NVARCHAR)), '; ')
     FROM Evaluation_questionnaire eqn
     JOIN Evaluation_questions eq ON eqn.questionId = eq.Question_id
     WHERE eqn.evaluationId = e.Evaluations_id
    ) AS QuestionDetails
FROM Evaluations e
LEFT JOIN Users u ON e.userId = u.UserId
LEFT JOIN Evaluation_type et ON e.evaluationType_id = et.Evaluation_type_id
LEFT JOIN Evaluation_interviews ei ON e.Evaluations_id = ei.evaluationId
LEFT JOIN Position p ON u.positionId = p.Position_id
LEFT JOIN Department d ON u.departmentid = d.Department_id
WHERE e.state = 20
GROUP BY 
    e.Evaluations_id, e.userId, u.first_name, u.last_name, et.designation, 
    e.startDate, e.endDate, e.overallScore, e.comments, 
    e.strengths, e.weaknesses, e.isServiceApproved, e.isDgApproved, 
    ei.scheduled_date, ei.status, ei.InterviewId,
    p.position_name, d.Department_name, e.state;





    -- Ce script crée la table Evaluation_Competence_Results pour stocker les résultats des compétences par évaluation
-- Table pour stocker les résultats des compétences par évaluation

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluation_Competence_Results')
BEGIN
    CREATE TABLE Evaluation_Competence_Results (
        ResultId INT PRIMARY KEY IDENTITY(1,1),
        EvaluationId INT NOT NULL,
        UserId INT NOT NULL,
        CompetenceLineId INT NOT NULL,
        Score DECIMAL(3,2) NOT NULL,
        Comments NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETUTCDATE(),
        State INT DEFAULT 1,
        CONSTRAINT FK_EvalCompResults_Evaluations FOREIGN KEY (EvaluationId) REFERENCES Evaluations(EvaluationId),
        CONSTRAINT FK_EvalCompResults_Users FOREIGN KEY (UserId) REFERENCES Users(UserId),
        CONSTRAINT FK_EvalCompResults_CompetenceLines FOREIGN KEY (CompetenceLineId) REFERENCES Competence_Lines(CompetenceLineId)
    );

    PRINT 'Table Evaluation_Competence_Results créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table Evaluation_Competence_Results existe déjà';
END

-- Index pour améliorer les performances des requêtes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EvalCompResults_EvaluationId' AND object_id = OBJECT_ID('Evaluation_Competence_Results'))
BEGIN
    CREATE INDEX IX_EvalCompResults_EvaluationId ON Evaluation_Competence_Results(EvaluationId);
    PRINT 'Index IX_EvalCompResults_EvaluationId créé avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EvalCompResults_UserId' AND object_id = OBJECT_ID('Evaluation_Competence_Results'))
BEGIN
    CREATE INDEX IX_EvalCompResults_UserId ON Evaluation_Competence_Results(UserId);
    PRINT 'Index IX_EvalCompResults_UserId créé avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_EvalCompResults_CompetenceLineId' AND object_id = OBJECT_ID('Evaluation_Competence_Results'))
BEGIN
    CREATE INDEX IX_EvalCompResults_CompetenceLineId ON Evaluation_Competence_Results(CompetenceLineId);
    PRINT 'Index IX_EvalCompResults_CompetenceLineId créé avec succès';
END 

CREATE TABLE ResponseTypes (
    ResponseTypeId INT PRIMARY KEY,
    TypeName NVARCHAR(20) NOT NULL,
    Description NVARCHAR(255)
);

ALTER TABLE Evaluation_questions 
ADD ResponseTypeId INT NOT NULL DEFAULT 1;

INSERT INTO ResponseTypes (ResponseTypeId, TypeName, Description)
VALUES 
(1, 'TEXT', 'Réponse textuelle libre'),
(2, 'QCM', 'Choix multiple avec options prédéfinies'),
(3, 'SCORE', 'Évaluation numérique sur échelle');

-- Script de création de la table EvaluationQuestionConfig
CREATE TABLE EvaluationQuestionConfig (
    Id INT PRIMARY KEY IDENTITY(1,1),
    QuestionId INT NOT NULL,
    MaxTimeInMinutes INT NOT NULL DEFAULT 15,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME DEFAULT GETUTCDATE(),
    CONSTRAINT FK_EvaluationQuestionConfig_Questions FOREIGN KEY (QuestionId) REFERENCES Evaluation_questions(Question_id)
);

-- Index pour optimiser les recherches par QuestionId
CREATE INDEX IX_EvaluationQuestionConfig_QuestionId ON EvaluationQuestionConfig(QuestionId);

PRINT 'Table EvaluationQuestionConfig créée avec succès.';