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