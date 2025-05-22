/*
    Titre : Script essentiel du module d'évaluation
    Date : 27 septembre 2024
    Description : Script SQL contenant uniquement les éléments essentiels
                 du module d'évaluation de la gestion de carrières et compétences.
    
    Ce script inclut:
    - Les tables fondamentales uniquement
    - Les données de test pour les permissions et rôles
    - Structure minimale nécessaire pour le fonctionnement du module
*/

-- ====================================================
-- 1. TABLES INDÉPENDANTES ESSENTIELLES
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
    PRINT 'Table ResponseTypes créée avec succès';
END

-- ====================================================
-- 2. TABLES AVEC RÉFÉRENCES ESSENTIELLES
-- ====================================================

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
-- 3. DONNÉES ESSENTIELLES
-- ====================================================

-- Vérifier si les données de permission existent déjà
IF NOT EXISTS (SELECT 1 FROM Permissions WHERE name = 'VIEW_USERS')
BEGIN
    -- Insertion des permissions de base
    INSERT INTO Permissions (name, description, state)
    VALUES
        -- Permissions liées aux utilisateurs
        ('VIEW_USERS', 'Voir la liste des utilisateurs', 1),
        ('CREATE_USERS', 'Créer de nouveaux utilisateurs', 1),
        ('EDIT_USERS', 'Modifier les utilisateurs existants', 1),
        ('DELETE_USERS', 'Supprimer des utilisateurs', 1),
        
        -- Permissions liées aux rôles
        ('VIEW_ROLES', 'Voir la liste des rôles', 1),
        ('CREATE_ROLES', 'Créer de nouveaux rôles', 1),
        ('EDIT_ROLES', 'Modifier les rôles existants', 1),
        ('DELETE_ROLES', 'Supprimer des rôles', 1),
        
        -- Permissions liées aux permissions
        ('VIEW_PERMISSIONS', 'Voir la liste des permissions', 1),
        ('MANAGE_PERMISSIONS', 'Gérer les permissions des rôles', 1),
        
        -- Permissions liées aux évaluations
        ('VIEW_EVALUATIONS', 'Voir les évaluations', 1),
        ('CREATE_EVALUATIONS', 'Créer des évaluations', 1),
        ('EDIT_EVALUATIONS', 'Modifier les évaluations', 1),
        ('DELETE_EVALUATIONS', 'Supprimer des évaluations', 1),
        ('APPROVE_EVALUATIONS', 'Approuver les évaluations', 1),
        
        -- Permissions liées aux départements
        ('VIEW_DEPARTMENTS', 'Voir la liste des départements', 1),
        ('MANAGE_DEPARTMENTS', 'Gérer les départements', 1),
        
        -- Permissions liées aux postes
        ('VIEW_POSITIONS', 'Voir la liste des postes', 1),
        ('MANAGE_POSITIONS', 'Gérer les postes', 1),
        
        -- Permissions liées aux rapports
        ('VIEW_REPORTS', 'Voir les rapports', 1),
        ('EXPORT_REPORTS', 'Exporter les rapports', 1),
        
        -- Permissions supplémentaires
        ('MANAGE_CAREER', 'Gérer les carrières', 1),
        ('MANAGE_RETIREMENT', 'Gérer les retraites', 1);
        
    PRINT 'Permissions insérées avec succès';
END

-- Vérifier si les rôles existent déjà
IF NOT EXISTS (SELECT 1 FROM Roles WHERE title = 'Administrator')
BEGIN
    -- Insertion des rôles de base
    INSERT INTO Roles (title, state)
    VALUES 
        ('Administrator', 1), -- Role_id = 1 
        ('Manager', 1),       -- Role_id = 2 
        ('Employee', 1),      -- Role_id = 3 
        ('Director', 1);      -- Role_id = 4
        
    PRINT 'Rôles insérés avec succès';
END

-- Vérifier si les types de réponse existent déjà
IF NOT EXISTS (SELECT 1 FROM ResponseTypes WHERE TypeName = 'TEXT')
BEGIN
    -- Insérer les types de réponse de base
    INSERT INTO ResponseTypes (ResponseTypeId, TypeName, Description)
    VALUES 
        (1, 'TEXT', 'Réponse textuelle libre'),
        (2, 'QCM', 'Choix multiple avec options prédéfinies'),
        (3, 'SCORE', 'Évaluation numérique sur échelle');
        
    PRINT 'Types de réponse insérés avec succès';
END

-- Vérifier si les attributions de permissions aux rôles existent déjà
IF NOT EXISTS (SELECT 1 FROM Role_Permissions WHERE role_id = 1)
BEGIN
    -- Attribution des permissions aux rôles
    -- Administrator (Role_id = 1) : Toutes les permissions
    INSERT INTO Role_Permissions (role_id, permission_id)
    SELECT 1, Permission_id FROM Permissions;

    -- Manager (Role_id = 2) : Permissions limitées
    INSERT INTO Role_Permissions (role_id, permission_id)
    SELECT 2, Permission_id 
    FROM Permissions 
    WHERE name IN (
        'VIEW_USERS',
        'VIEW_EVALUATIONS',
        'CREATE_EVALUATIONS',
        'EDIT_EVALUATIONS',
        'APPROVE_EVALUATIONS',
        'VIEW_DEPARTMENTS',
        'VIEW_POSITIONS',
        'VIEW_REPORTS'
    );

    -- Employee (Role_id = 3) : Permissions minimales
    INSERT INTO Role_Permissions (role_id, permission_id)
    SELECT 3, Permission_id 
    FROM Permissions 
    WHERE name IN (
        'VIEW_EVALUATIONS',
        'VIEW_DEPARTMENTS',
        'VIEW_POSITIONS'
    );

    -- Director (Role_id = 4) : Permissions étendues
    INSERT INTO Role_Permissions (role_id, permission_id)
    SELECT 4, Permission_id 
    FROM Permissions 
    WHERE name IN (
        'VIEW_USERS',
        'VIEW_EVALUATIONS',
        'CREATE_EVALUATIONS',
        'EDIT_EVALUATIONS',
        'APPROVE_EVALUATIONS',
        'VIEW_DEPARTMENTS',
        'VIEW_POSITIONS',
        'VIEW_REPORTS',
        'EXPORT_REPORTS'
    );
    
    PRINT 'Permissions attribuées aux rôles avec succès';
END

-- Vérifier si les départements existent déjà
IF NOT EXISTS (SELECT 1 FROM Department WHERE Department_name = 'Informatique')
BEGIN
    -- Insertion des départements de base
    INSERT INTO Department (Department_name, state)
    VALUES
        ('Informatique', 1),
        ('Marketing', 1),
        ('Direction', 1),
        ('Vente et commerce', 1),
        ('Reseaux et techniques', 1);
        
    PRINT 'Départements insérés avec succès';
END

-- Vérifier si les postes existent déjà
IF NOT EXISTS (SELECT 1 FROM Position WHERE position_name = 'Developpeur')
BEGIN
    -- Insertion des postes de base
    INSERT INTO Position (position_name, state)
    VALUES
        ('Developpeur', 1),
        ('Technicien', 1),
        ('Responsable Marketing', 1),
        ('Testeur', 1);
        
    PRINT 'Postes insérés avec succès';
END

-- Vérifier si les types d'évaluation existent déjà
IF NOT EXISTS (SELECT 1 FROM Evaluation_type WHERE designation = 'Évaluation annuelle')
BEGIN
    -- Insertion des types d'évaluation de base
    INSERT INTO Evaluation_type (designation, state)
    VALUES
        ('Évaluation annuelle', 1),
        ('Évaluation de période d''essai', 1),
        ('Évaluation de projet', 1);
        
    PRINT 'Types d''évaluation insérés avec succès';
END

-- ====================================================
-- 4. VALIDATION
-- ====================================================

-- Afficher les permissions de l'administrateur
SELECT 'Permissions de l''administrateur:' AS Information;
SELECT p.name, p.description
FROM Permissions p
JOIN Role_Permissions rp ON p.Permission_id = rp.permission_id
WHERE rp.role_id = 1;

PRINT '======================================================================';
PRINT 'SCRIPT ESSENTIEL DU MODULE D''ÉVALUATION EXÉCUTÉ AVEC SUCCÈS';
PRINT '';
PRINT 'NOTES:';
PRINT '1. Ce script contient uniquement les tables et données essentielles';
PRINT '2. Les autres éléments peuvent être créés via l''interface utilisateur';
PRINT '======================================================================'; 