
-- ====================================================
-- 1. TABLES INDÉPENDANTES (sans clés étrangères)
-- ====================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        Role_id INT PRIMARY KEY IDENTITY(1,1),
        title NVARCHAR(255) NOT NULL,
        state INT
    );
    PRINT 'Table Roles créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Department')
BEGIN
    CREATE TABLE Department (
        Department_id INT PRIMARY KEY IDENTITY(1,1),
        Department_name NVARCHAR(255) NOT NULL,
        state INT
    );
    PRINT 'Table Department créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Position')
BEGIN
    CREATE TABLE Position (
        Position_id INT PRIMARY KEY IDENTITY(1,1),
        position_name NVARCHAR(255) NOT NULL, 
        state INT
    );
    PRINT 'Table Position créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Permissions')
BEGIN
    CREATE TABLE Permissions (
        Permission_id INT PRIMARY KEY IDENTITY(1,1),
        name NVARCHAR(100) NOT NULL,
        description NVARCHAR(255),
        state INT DEFAULT 1
    );
    PRINT 'Table Permissions créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluation_type')
BEGIN
    CREATE TABLE Evaluation_type (
        Evaluation_type_id INT PRIMARY KEY IDENTITY(1,1),
        designation NVARCHAR(100),
        state INT
    );
    PRINT 'Table Evaluation_type créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ResponseTypes')
BEGIN
    CREATE TABLE ResponseTypes (
        ResponseTypeId INT PRIMARY KEY,
        TypeName NVARCHAR(20) NOT NULL,
        Description NVARCHAR(255)
    );
    
    -- Insérer les types de réponse de base
    INSERT INTO ResponseTypes (ResponseTypeId, TypeName, Description)
    VALUES 
        (1, 'TEXT', 'Réponse textuelle libre'),
        (2, 'QCM', 'Choix multiple avec options prédéfinies'),
        (3, 'SCORE', 'Évaluation numérique sur échelle');
        
    PRINT 'Table ResponseTypes créée avec succès';
END

-- ====================================================
-- 2. TABLES AVEC RÉFÉRENCES DE PREMIER NIVEAU
-- ====================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Competence_Lines')
BEGIN
    CREATE TABLE Competence_Lines (
        CompetenceLineId INT PRIMARY KEY IDENTITY(1,1),
        PositionId INT NOT NULL,
        CompetenceName NVARCHAR(100) NOT NULL, 
        Description NVARCHAR(255),
        SkillPositionId INT, -- Ajouté suite à update_competence_lines.sql
        state INT,
        FOREIGN KEY (PositionId) REFERENCES Position(Position_id)
    );
    PRINT 'Table Competence_Lines créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Role_Permissions')
BEGIN
    CREATE TABLE Role_Permissions (
        Role_Permission_id INT PRIMARY KEY IDENTITY(1,1),
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        FOREIGN KEY (role_id) REFERENCES Roles(Role_id),
        FOREIGN KEY (permission_id) REFERENCES Permissions(Permission_id)
    );
    PRINT 'Table Role_Permissions créée avec succès';
END

-- ====================================================
-- 3. TABLES AVEC RÉFÉRENCES DE DEUXIÈME NIVEAU
-- ====================================================

-- Création de la table Users (sans colonne EmployeeId incorrecte)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
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
    PRINT 'Table Users créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Competence_Trainings')
BEGIN
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
    PRINT 'Table Competence_Trainings créée avec succès';
END

-- Ajout d'une référence circulaire pour Users
ALTER TABLE Users 
ADD CONSTRAINT FK_Users_DeletedBy 
FOREIGN KEY (deleted_by) REFERENCES Users(UserId);

-- ====================================================
-- 4. TABLES AVEC RÉFÉRENCES DE TROISIÈME NIVEAU
-- ====================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluations')
BEGIN
    CREATE TABLE Evaluations (
        Evaluations_id INT PRIMARY KEY IDENTITY(1,1),
        evaluationType_id INT,
        userId INT, -- Pour compatibilité avec l'ancien modèle
        employeeId INT, -- Nouveau champ pour la refactorisation
        startDate DATE,
        start_date DATE, -- Nouvelle colonne conforme au nommage
        endDate DATE,
        end_date DATE, -- Nouvelle colonne conforme au nommage
        overallScore DECIMAL(3,2),
        comments NVARCHAR(MAX),
        actionPlan NVARCHAR(MAX), 
        strengths NVARCHAR(MAX),
        weaknesses NVARCHAR(MAX),
        isServiceApproved BIT DEFAULT 0,
        isDgApproved BIT DEFAULT 0,
        serviceApprovalDate DATE NULL,
        dgApprovalDate DATE NULL,
        state INT DEFAULT 0,
        FOREIGN KEY (evaluationType_id) REFERENCES Evaluation_type(Evaluation_type_id),
        FOREIGN KEY (userId) REFERENCES Users(UserId)
        -- La FK vers Employee sera ajoutée après sa création
    );
    PRINT 'Table Evaluations créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluation_questions')
BEGIN
    CREATE TABLE Evaluation_questions (
        Question_id INT PRIMARY KEY IDENTITY(1,1),
        evaluationTypeId INT NOT NULL,
        positionId INT NOT NULL,
        question NVARCHAR(255) NOT NULL,
        CompetenceLineId INT,
        ResponseTypeId INT NOT NULL DEFAULT 1, -- Ajouté suite à UPDATE_RESPONSE_TYPE.sql
        state INT,
        FOREIGN KEY (evaluationTypeId) REFERENCES Evaluation_type(Evaluation_type_id),
        FOREIGN KEY (positionId) REFERENCES Position(Position_id),
        FOREIGN KEY (CompetenceLineId) REFERENCES Competence_Lines(CompetenceLineId),
        FOREIGN KEY (ResponseTypeId) REFERENCES ResponseTypes(ResponseTypeId)
    );
    PRINT 'Table Evaluation_questions créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluation_questionnaire')
BEGIN
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
    PRINT 'Table Evaluation_questionnaire créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Training_suggestions')
BEGIN
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
    PRINT 'Table Training_suggestions créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluation_interviews')
BEGIN
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
    PRINT 'Table Evaluation_interviews créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InterviewParticipants')
BEGIN
    CREATE TABLE InterviewParticipants (
        ParticipantId INT PRIMARY KEY IDENTITY(1,1),
        InterviewId INT NOT NULL,
        UserId INT, -- Pour compatibilité avec l'ancien modèle
        EmployeeId INT, -- Ajouté suite à la refactorisation
        FOREIGN KEY (InterviewId) REFERENCES Evaluation_interviews(InterviewId),
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
        -- La FK vers Employee sera ajoutée après sa création
    );
    PRINT 'Table InterviewParticipants créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluation_progress')
BEGIN
    CREATE TABLE Evaluation_progress (
        Progress_id INT PRIMARY KEY IDENTITY(1,1),
        evaluationId INT NOT NULL,
        userId INT, -- Pour compatibilité avec l'ancien modèle
        employeeId INT, -- Ajouté suite à la refactorisation
        totalQuestions INT NOT NULL,
        answeredQuestions INT DEFAULT 0,
        progressPercentage DECIMAL(5,2) DEFAULT 0,
        lastUpdate DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (evaluationId) REFERENCES Evaluations(Evaluations_id),
        FOREIGN KEY (userId) REFERENCES Users(UserId)
        -- La FK vers Employee sera ajoutée après sa création
    );
    PRINT 'Table Evaluation_progress créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TemporaryAccounts')
BEGIN
    CREATE TABLE TemporaryAccounts (
        TempAccountId INT PRIMARY KEY IDENTITY(1,1),
        UserId INT, -- Pour compatibilité avec l'ancien modèle
        EmployeeId INT, -- Ajouté suite à la refactorisation
        Evaluations_id INT NOT NULL,
        TempLogin NVARCHAR(255) NOT NULL,
        TempPassword NVARCHAR(255) NOT NULL,
        ExpirationDate DATETIME NOT NULL,
        IsUsed BIT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETUTCDATE(),
        FOREIGN KEY (UserId) REFERENCES Users(UserId),
        FOREIGN KEY (Evaluations_id) REFERENCES Evaluations(Evaluations_id)
        -- La FK vers Employee sera ajoutée après sa création
    );
    PRINT 'Table TemporaryAccounts créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LoginAttempts')
BEGIN
    CREATE TABLE LoginAttempts (
        AttemptId INT PRIMARY KEY IDENTITY(1,1),
        TempLogin NVARCHAR(255) NOT NULL,
        AttemptDate DATETIME DEFAULT GETUTCDATE(),
        IPAddress NVARCHAR(45),
        IsSuccess BIT DEFAULT 0
    );
    PRINT 'Table LoginAttempts créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluation_Selected_Questions')
BEGIN
    CREATE TABLE Evaluation_Selected_Questions (
        SelectedQuestionId INT PRIMARY KEY IDENTITY(1,1),
        EvaluationId INT NOT NULL,
        QuestionId INT NOT NULL,
        CompetenceLineId INT NOT NULL,
        FOREIGN KEY (EvaluationId) REFERENCES Evaluations(Evaluations_id),
        FOREIGN KEY (QuestionId) REFERENCES Evaluation_questions(Question_id),
        FOREIGN KEY (CompetenceLineId) REFERENCES Competence_Lines(CompetenceLineId)
    );
    PRINT 'Table Evaluation_Selected_Questions créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluation_Responses')
BEGIN
    CREATE TABLE Evaluation_Responses (
        ResponseId INT PRIMARY KEY IDENTITY(1,1),
        EvaluationId INT NOT NULL,
        QuestionId INT NOT NULL,
        ResponseType NVARCHAR(20) NOT NULL, -- 'QCM', 'TEXT', 'SCORE'
        ResponseValue NVARCHAR(MAX), -- Pour stocker la réponse (texte ou JSON pour QCM)
        TimeSpent INT, -- Temps en secondes pour répondre
        StartTime DATETIME, -- Heure de début de la réponse
        EndTime DATETIME, -- Heure de fin de la réponse
        IsCorrect BIT, -- Pour les QCM
        State INT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETUTCDATE(),
        FOREIGN KEY (EvaluationId) REFERENCES Evaluations(Evaluations_id),
        FOREIGN KEY (QuestionId) REFERENCES Evaluation_questions(Question_id)
    );
    PRINT 'Table Evaluation_Responses créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluation_Question_Options')
BEGIN
    CREATE TABLE Evaluation_Question_Options (
        OptionId INT PRIMARY KEY IDENTITY(1,1),
        QuestionId INT NOT NULL,
        OptionText NVARCHAR(255) NOT NULL,
        IsCorrect BIT DEFAULT 0,
        State INT DEFAULT 1,
        FOREIGN KEY (QuestionId) REFERENCES Evaluation_questions(Question_id)
    );
    PRINT 'Table Evaluation_Question_Options créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EvaluationQuestionConfig')
BEGIN
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
    
    PRINT 'Table EvaluationQuestionConfig créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Evaluation_Competence_Results')
BEGIN
    CREATE TABLE Evaluation_Competence_Results (
        ResultId INT PRIMARY KEY IDENTITY(1,1),
        EvaluationId INT NOT NULL,
        UserId INT, -- Pour compatibilité avec l'ancien modèle
        EmployeeId INT, -- Ajouté suite à la refactorisation
        CompetenceLineId INT NOT NULL,
        Score DECIMAL(3,2) NOT NULL,
        Comments NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETUTCDATE(),
        State INT DEFAULT 1,
        CONSTRAINT FK_EvalCompResults_Evaluations FOREIGN KEY (EvaluationId) REFERENCES Evaluations(Evaluations_id),
        CONSTRAINT FK_EvalCompResults_Users FOREIGN KEY (UserId) REFERENCES Users(UserId),
        CONSTRAINT FK_EvalCompResults_CompetenceLines FOREIGN KEY (CompetenceLineId) REFERENCES Competence_Lines(CompetenceLineId)
        -- La FK vers Employee sera ajoutée après sa création
    );

    -- Index pour améliorer les performances des requêtes
    CREATE INDEX IX_EvalCompResults_EvaluationId ON Evaluation_Competence_Results(EvaluationId);
    CREATE INDEX IX_EvalCompResults_UserId ON Evaluation_Competence_Results(UserId);
    CREATE INDEX IX_EvalCompResults_CompetenceLineId ON Evaluation_Competence_Results(CompetenceLineId);
    
    PRINT 'Table Evaluation_Competence_Results créée avec succès';
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EvaluationSupervisors')
BEGIN
    CREATE TABLE EvaluationSupervisors (
        EvaluationId INT NOT NULL,
        SupervisorId INT NOT NULL,
        PRIMARY KEY (EvaluationId, SupervisorId),
        FOREIGN KEY (EvaluationId) REFERENCES Evaluations(Evaluations_id),
        FOREIGN KEY (SupervisorId) REFERENCES Users(UserId)
    );
    PRINT 'Table EvaluationSupervisors créée avec succès';
END

-- ====================================================
-- 5. MODIFICATION DES CONTRAINTES POUR UTILISER EMPLOYEE
-- ====================================================

-- Cette partie suppose que la table Employee existe déjà dans le schéma
-- Vérifier si la table Employee existe
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Employee')
BEGIN
    -- Ajouter les contraintes de clés étrangères vers Employee
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Evaluations_Employee')
    BEGIN
        ALTER TABLE Evaluations 
        ADD CONSTRAINT FK_Evaluations_Employee
        FOREIGN KEY (employeeId) REFERENCES Employee(Employee_id);
        PRINT 'Contrainte FK_Evaluations_Employee ajoutée avec succès';
    END

    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_InterviewParticipants_Employee')
    BEGIN
        ALTER TABLE InterviewParticipants 
        ADD CONSTRAINT FK_InterviewParticipants_Employee
        FOREIGN KEY (EmployeeId) REFERENCES Employee(Employee_id);
        PRINT 'Contrainte FK_InterviewParticipants_Employee ajoutée avec succès';
    END

    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EvaluationProgress_Employee')
    BEGIN
        ALTER TABLE Evaluation_progress 
        ADD CONSTRAINT FK_EvaluationProgress_Employee
        FOREIGN KEY (employeeId) REFERENCES Employee(Employee_id);
        PRINT 'Contrainte FK_EvaluationProgress_Employee ajoutée avec succès';
    END

    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_TemporaryAccounts_Employee')
    BEGIN
        ALTER TABLE TemporaryAccounts 
        ADD CONSTRAINT FK_TemporaryAccounts_Employee
        FOREIGN KEY (EmployeeId) REFERENCES Employee(Employee_id);
        PRINT 'Contrainte FK_TemporaryAccounts_Employee ajoutée avec succès';
    END

    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_EvalCompResults_Employee')
    BEGIN
        ALTER TABLE Evaluation_Competence_Results 
        ADD CONSTRAINT FK_EvalCompResults_Employee
        FOREIGN KEY (EmployeeId) REFERENCES Employee(Employee_id);
        PRINT 'Contrainte FK_EvalCompResults_Employee ajoutée avec succès';
    END
END
ELSE
BEGIN
    PRINT 'ATTENTION: La table Employee n''existe pas dans la base de données';
    PRINT 'Les contraintes de clés étrangères vers Employee n''ont pas été créées';
END

-- ====================================================
-- 6. VUES POUR LES RAPPORTS (VERSION EMPLOYEE)
-- ====================================================

-- Supprimer les vues existantes pour les recréer
DROP VIEW IF EXISTS VEmployeeDetails;
DROP VIEW IF EXISTS VEmployeesWithoutEvaluation;
DROP VIEW IF EXISTS VEmployeesFinishedEvaluation;
DROP VIEW IF EXISTS VEmployeesOngoingEvaluation;
DROP VIEW IF EXISTS VEmployeeEvaluationProgress;
DROP VIEW IF EXISTS VTemporaryActiveAccounts;
DROP VIEW IF EXISTS VFailedLoginAttempts;
DROP VIEW IF EXISTS VEvaluationHistory;

-- Créer la vue VEmployeeDetails
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'VEmployeeDetails')
BEGIN
    EXEC('
    CREATE VIEW VEmployeeDetails AS
    SELECT 
        e.Employee_id AS EmployeeId,
        e.FirstName AS FirstName,
        e.Name AS LastName,
        ISNULL(ep.Position_name, ''Non défini'') AS Position,
        ISNULL(ep.Position_id, 0) AS PositionId,
        NULL AS Role,
        d.Department_name AS Department,
        ev.Evaluations_id AS EvaluationId,
        ev.start_date AS EvaluationDate,
        ev.overallScore AS OverallScore,
        ev.comments AS EvaluationComments,
        ev.isServiceApproved AS IsServiceApproved,
        ev.isDgApproved AS IsDgApproved,
        et.designation AS EvaluationType,
        ev.strengths AS strengths,
        ev.weaknesses AS weaknesses,
        ev.state AS state
    FROM Employee e
    LEFT JOIN Department d ON e.Department_id = d.Department_id
    LEFT JOIN v_employee_position ep ON e.Employee_id = ep.Employee_id
    LEFT JOIN Evaluations ev ON e.Employee_id = ev.employeeId
    LEFT JOIN Evaluation_type et ON ev.evaluationType_id = et.Evaluation_type_id 
    WHERE ev.state = 10
    ');
    PRINT 'Vue VEmployeeDetails créée avec succès';
END

-- Créer la vue VEmployeesWithoutEvaluation
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'VEmployeesWithoutEvaluation')
BEGIN
    EXEC('
    CREATE VIEW VEmployeesWithoutEvaluation AS
    SELECT 
        e.Employee_id AS EmployeeId,
        ISNULL(ep.Position_id, 0) AS positionId,
        e.FirstName AS FirstName,
        e.Name AS LastName,
        ISNULL(ep.Position_name, ''Non défini'') AS Position,
        e.Department_id AS DepartmentId,
        d.Department_name AS Department,
        ev.start_date AS startDate,
        ev.end_date AS endDate,
        ev.state AS state
    FROM Employee e
    LEFT JOIN Department d ON e.Department_id = d.Department_id
    LEFT JOIN v_employee_position ep ON e.Employee_id = ep.Employee_id
    LEFT JOIN Evaluations ev ON e.Employee_id = ev.employeeId
    WHERE NOT EXISTS (
        SELECT 1 
        FROM Evaluations eval
        WHERE eval.employeeId = e.Employee_id 
        AND eval.state IN (10, 15, 20)
    )
    AND (
        NOT EXISTS (SELECT 1 FROM Evaluations WHERE employeeId = e.Employee_id)
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
    )
    ');
    PRINT 'Vue VEmployeesWithoutEvaluation créée avec succès';
END

-- Créer la vue VEmployeesFinishedEvaluation
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'VEmployeesFinishedEvaluation')
BEGIN
    EXEC('
    CREATE VIEW VEmployeesFinishedEvaluation AS
    SELECT 
        e.Employee_id AS EmployeeId,
        ISNULL(ep.Position_id, 0) AS positionId,
        e.FirstName AS FirstName,
        e.Name AS LastName,
        ISNULL(ep.Position_name, ''Non défini'') AS Position,
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
    LEFT JOIN v_employee_position ep ON e.Employee_id = ep.Employee_id
    LEFT JOIN Evaluations ev ON e.Employee_id = ev.employeeId
    LEFT JOIN Evaluation_interviews ei ON ev.Evaluations_id = ei.evaluationId
    WHERE ev.state = 20
    ');
    PRINT 'Vue VEmployeesFinishedEvaluation créée avec succès';
END

-- Créer la vue VEmployeesOngoingEvaluation
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'VEmployeesOngoingEvaluation')
BEGIN
    EXEC('
    CREATE VIEW VEmployeesOngoingEvaluation AS
    SELECT 
        e.Employee_id AS EmployeeId,
        e.FirstName AS FirstName,
        e.Name AS LastName,
        ISNULL(ep.Position_name, ''Non défini'') AS Position,
        ev.start_date AS StartDate,
        ev.end_date AS EndDate,
        ev.Evaluations_id AS EvaluationId,
        et.designation AS EvaluationType,
        et.Evaluation_type_id AS EvaluationTypeId,
        ev.state AS EvaluationState
    FROM Employee e
    LEFT JOIN v_employee_position ep ON e.Employee_id = ep.Employee_id
    LEFT JOIN Evaluations ev ON e.Employee_id = ev.employeeId
    LEFT JOIN Evaluation_type et ON ev.evaluationType_id = et.Evaluation_type_id
    WHERE ev.state = 15
    ');
    PRINT 'Vue VEmployeesOngoingEvaluation créée avec succès';
END

-- Créer la vue VEmployeeEvaluationProgress
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'VEmployeeEvaluationProgress')
BEGIN
    EXEC('
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
    JOIN Employee e ON ep.employeeId = e.Employee_id
    ');
    PRINT 'Vue VEmployeeEvaluationProgress créée avec succès';
END

-- Créer la vue VTemporaryActiveAccounts
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'VTemporaryActiveAccounts')
BEGIN
    EXEC('
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
      AND ta.IsUsed = 0
    ');
    PRINT 'Vue VTemporaryActiveAccounts créée avec succès';
END

-- Créer la vue VFailedLoginAttempts
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'VFailedLoginAttempts')
BEGIN
    EXEC('
    CREATE VIEW VFailedLoginAttempts AS
    SELECT 
        la.AttemptId,
        la.TempLogin,
        la.AttemptDate,
        la.IPAddress,
        ta.Evaluations_id,
        ta.EmployeeId
    FROM LoginAttempts la
    LEFT JOIN TemporaryAccounts ta ON la.TempLogin = ta.TempLogin
    WHERE la.IsSuccess = 0
    ');
    PRINT 'Vue VFailedLoginAttempts créée avec succès';
END

-- Créer la vue VEvaluationHistory
IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'VEvaluationHistory')
BEGIN
    EXEC('
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
        ISNULL(ep.Position_name, ''Non défini'') AS Position,
        d.Department_name AS Department,
        ev.state AS Status,
        (SELECT STRING_AGG(training.training, '', '')
         FROM (
             SELECT DISTINCT ts.training
             FROM Evaluation_questionnaire eq
             JOIN Training_suggestions ts 
             ON eq.questionId = ts.questionId 
             AND eq.score < ts.scoreThreshold
             WHERE eq.evaluationId = ev.Evaluations_id
         ) AS training
        ) AS Recommendations,
        (SELECT STRING_AGG(participants.full_name, '', '')
         FROM (
             SELECT DISTINCT ip.ParticipantId, e_part.FirstName + '' '' + e_part.Name AS full_name
             FROM InterviewParticipants ip
             JOIN Employee e_part ON ip.EmployeeId = e_part.Employee_id
             WHERE ip.InterviewId = ei.InterviewId
         ) AS participants
        ) AS ParticipantNames,
        (SELECT STRING_AGG(CAST(participant_ids.EmployeeId AS NVARCHAR), '', '')
         FROM (
             SELECT DISTINCT ip.ParticipantId, e_part.Employee_id AS EmployeeId
             FROM InterviewParticipants ip
             JOIN Employee e_part ON ip.EmployeeId = e_part.Employee_id
             WHERE ip.InterviewId = ei.InterviewId
         ) AS participant_ids
        ) AS ParticipantIds,
        (SELECT STRING_AGG(CONCAT(''ID:'', CAST(eq.Question_id AS NVARCHAR), '', Question:'', eq.question, '', Score:'', CAST(eqn.score AS NVARCHAR)), ''; '')
         FROM Evaluation_questionnaire eqn
         JOIN Evaluation_questions eq ON eqn.questionId = eq.Question_id
         WHERE eqn.evaluationId = ev.Evaluations_id
        ) AS QuestionDetails
    FROM Evaluations ev
    JOIN Employee e ON ev.employeeId = e.Employee_id
    LEFT JOIN Department d ON e.Department_id = d.Department_id
    LEFT JOIN v_employee_position ep ON e.Employee_id = ep.Employee_id
    LEFT JOIN Evaluation_type et ON ev.evaluationType_id = et.Evaluation_type_id
    LEFT JOIN Evaluation_interviews ei ON ev.Evaluations_id = ei.evaluationId
    WHERE ev.state = 20
    GROUP BY 
        ev.Evaluations_id, ev.employeeId, e.FirstName, e.Name, et.designation, 
        ev.start_date, ev.end_date, ev.overallScore, ev.comments, 
        ev.strengths, ev.weaknesses, ev.isServiceApproved, ev.isDgApproved, 
        ei.scheduled_date, ei.status, ei.InterviewId,
        ep.Position_name, d.Department_name, ev.state
    ');
    PRINT 'Vue VEvaluationHistory créée avec succès';
END

-- ====================================================
-- 7. PROCÉDURES STOCKÉES
-- ====================================================

IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'CleanExpiredTemporaryAccounts')
BEGIN
    EXEC('
    CREATE PROCEDURE CleanExpiredTemporaryAccounts
    AS
    BEGIN
        DELETE FROM TemporaryAccounts 
        WHERE ExpirationDate < GETUTCDATE();
    END
    ');
    PRINT 'Procédure CleanExpiredTemporaryAccounts créée avec succès';
END
