-- Script pour ajouter la table ResponseTypes et modifier la table Evaluation_questions
-- 1. Vérifier si la table ResponseTypes existe déjà
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ResponseTypes')
BEGIN
    -- Créer la table ResponseTypes
    CREATE TABLE ResponseTypes (
        ResponseTypeId INT PRIMARY KEY,
        TypeName NVARCHAR(20) NOT NULL,
        Description NVARCHAR(255)
    );

    -- Insérer les types de réponse
    INSERT INTO ResponseTypes (ResponseTypeId, TypeName, Description)
    VALUES 
        (1, 'TEXT', 'Réponse textuelle libre'),
        (2, 'QCM', 'Choix multiple avec options prédéfinies');

    PRINT 'Table ResponseTypes créée avec succès';
END
ELSE
BEGIN
    PRINT 'Table ResponseTypes existe déjà';
END

-- 2. Vérifier si la colonne ResponseTypeId existe déjà dans la table Evaluation_questions
IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'ResponseTypeId' AND object_id = OBJECT_ID('Evaluation_questions'))
BEGIN
    -- Ajouter la colonne ResponseTypeId à la table Evaluation_questions
    ALTER TABLE Evaluation_questions
    ADD ResponseTypeId INT NOT NULL DEFAULT 1;
    
    PRINT 'Colonne ResponseTypeId ajoutée à la table Evaluation_questions';
    
    -- Mettre à jour les types pour les questions existantes
    -- Définir les questions avec des options comme QCM (type 2)
    UPDATE q
    SET q.ResponseTypeId = 2 -- QCM
    FROM Evaluation_questions q
    WHERE EXISTS (
        SELECT 1
        FROM Evaluation_Question_Options o
        WHERE o.QuestionId = q.Question_id
    );
    
    PRINT 'Types de questions mis à jour';
    
    -- Ajouter une contrainte de clé étrangère
    ALTER TABLE Evaluation_questions
    ADD CONSTRAINT FK_Evaluation_questions_ResponseTypes
    FOREIGN KEY (ResponseTypeId) REFERENCES ResponseTypes(ResponseTypeId);
    
    PRINT 'Contrainte de clé étrangère ajoutée';
END
ELSE
BEGIN
    PRINT 'Colonne ResponseTypeId existe déjà dans la table Evaluation_questions';
END 