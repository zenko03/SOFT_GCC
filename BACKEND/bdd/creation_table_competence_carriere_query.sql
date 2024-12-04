/*
	Auteur : Inssa Chalman
	Date : 25 septembre 2024
	Description : Script de cr�ation base de donnees et des tables pour Soft_carriere_competences
	dans la module competences salaries et suivi carriere
	Version : 1.0


	Regle de clean code : 
		- Le nom des tables et colonnes commenceront par une lettre majuscule et utiliser le 
		camelcase pour les conventions de nommage
		- Le nom des tables et colonnes seront ecrit en anglais
		- Ajouter des commentaires en francais en haut de chaque script important
*/

USE Base_soft_gcc;

----------------------------------------- TABLES POUR COMPETENCES SALARIES -----------------------------------------------------------------------
-- Civilite
CREATE TABLE Civilite (
	Civilite_id INT PRIMARY KEY IDENTITY(1,1),
	Civilite_name NVARCHAR(50)
);

INSERT INTO Civilite(Civilite_name) VALUES ('Monsieur'), ('Madame');

-- Creation de la table departement(id, designation)
CREATE TABLE Department (
	Department_id INT PRIMARY KEY IDENTITY(1,1),
	Department_name NVARCHAR(50)
);

-- Creation de la table employe(id, matricule, nom, prenom, date_embauche) simule
CREATE TABLE Employee (
	Employee_id INT PRIMARY KEY IDENTITY(1,1),
	Registration_number NVARCHAR(100) NOT NULL UNIQUE,
	Name NVARCHAR(100) NOT NULL,
	FirstName NVARCHAR(100) NOT NULL,
	Birthday DATE NOT NULL,
	Hiring_date DATE NOT NULL,
	Department_id INT NOT NULL REFERENCES Department(Department_id),
	Civilite_id INT NOT NULL REFERENCES Civilite(Civilite_id)
);

-- Creation de la table filiere(id, designation)
CREATE TABLE Study_path (
	Study_path_id INT PRIMARY KEY IDENTITY(1,1),
	Study_path_name NVARCHAR(100) NOT NULL
);

-- Creation de la table diplome(id, designation)
CREATE TABLE Degree (
	Degree_id INT PRIMARY KEY IDENTITY(1,1),
	Degree_name NVARCHAR(100) NOT NULL
);

-- Creation de la table ecole(id, designation, adresse)
CREATE TABLE School (
	School_id INT PRIMARY KEY IDENTITY(1,1),
	School_name NVARCHAR(100) NOT NULL
);

-- Creation de la table education_employee(id, id_filiere, id_diplome, id_ecole, annee, etat)
CREATE TABLE Employee_education (
	Employee_education_id INT PRIMARY KEY IDENTITY(1,1),
	Study_path_id INT NOT NULL REFERENCES Study_path(Study_path_id),
	Degree_id INT NOT NULL REFERENCES Degree(Degree_id),
	School_ID INT NOT NULL REFERENCES School(School_id),
	Year INT,
	State INT,
	Creation_date DATE,
	Updated_date DATE,
	Employee_id INT NOT NULL REFERENCES Employee(Employee_id)
);


-- Creation de la table language(id, designation)
CREATE TABLE Language (
	Language_id INT PRIMARY KEY IDENTITY(1,1),
	Language_name NVARCHAR(100) NOT NULL
);

-- Creation de la table language_employe(id, id_language, id_nivreau_language, etat)
CREATE TABLE Employee_language(
	Employee_language_id INT PRIMARY KEY IDENTITY(1,1),
	Language_id INT NOT NULL REFERENCES Language(Language_id),
	Level DOUBLE PRECISION NOT NULL,
	State INT,
	creation_date DATE,
	Updated_date DATE,
	Employee_id INT NOT NULL REFERENCES Employee(Employee_id)
);

-- Creation de la table domaine(id, designation)
CREATE TABLE Domain_skill (
	Domain_skill_id INT PRIMARY KEY IDENTITY(1,1),
	Domain_skill_name NVARCHAR(100) NOT NULL
);

-- Creation de la table competence(id, designation)
CREATE TABLE Skill (
	Skill_id INT PRIMARY KEY IDENTITY(1,1),
	Skill_name NVARCHAR(100) NOT NULL
);

-- Creation de la table competence_employe(id, id_domaine, id_competence, etat)
CREATE TABLE Employee_skill (
	Employee_skill_id INT PRIMARY KEY IDENTITY(1,1),
	Domain_skill_id INT NOT NULL REFERENCES Domain_skill(Domain_skill_id),
	Skill_id INT NOT NULL REFERENCES Skill(Skill_id),
	Level DOUBLE PRECISION NOT NULL,
	State INT,
	Creation_date DATE,
	Updated_date DATE,
	Employee_id INT NOT NULL REFERENCES Employee(Employee_id)
);

-- Creation de la table autre_formation_employe(id, formation, etat)
CREATE TABLE Employee_other_formation (
	Employee_other_formation_id INT PRIMARY KEY IDENTITY(1,1),
	Description NVARCHAR(250),
	Start_date DATE NOT NULL,
	End_date DATE NOT NULL,
	Comment TEXT,
	State INT,
	Creation_date DATE,
	Updated_date DATE,
	Employee_id INT NOT NULL REFERENCES Employee(Employee_id)
);

----------------------------------- TABLES POUR CARRIERE  -------------------------------------------------------------------------

-- Creation de la table poste(id, designation)
CREATE TABLE Position (
	Position_id INT PRIMARY KEY IDENTITY(1,1),
	position_name NVARCHAR(100) NOT NULL,
);

-- Creation de la table type_affectation(id, designation)
CREATE TABLE Assignment_type (
	Assignment_type_id INT PRIMARY KEY IDENTITY(1,1),
	Assignment_type_name NVARCHAR(50)
);

-- Creation de la table etablissement(id, designation)
CREATE TABLE Establishment (
	Establishment_id INT PRIMARY KEY IDENTITY(1,1),
	Establishment_name NVARCHAR(50)
);

-- Creation de la table fonction(id, designation)
CREATE TABLE Fonction (
	Fonction_id INT PRIMARY KEY IDENTITY(1,1),
	Fonction_name NVARCHAR(50)
);

-- Creation de la table type_employee(id, designation)
CREATE TABLE Employee_type (
	Employee_type_id INT PRIMARY KEY IDENTITY(1,1),
	Employee_type_name NVARCHAR(50)
);

-- Creation de la table categorie_socio_professionnelle(id, designation)
CREATE TABLE Socio_category_professional (
	Socio_category_professional_id INT PRIMARY KEY IDENTITY(1,1),
	Socio_category_professional_name NVARCHAR(50)
);

-- Creation de la table indice(id, designation)
CREATE TABLE Indication (
	Indication_id INT PRIMARY KEY IDENTITY(1,1),
	Indication_name NVARCHAR(50)
);

-- Creation de la table category_professionnel(id, designation)
CREATE TABLE Professional_category (
	Professional_category_id INT PRIMARY KEY IDENTITY(1,1),
	Professional_category_name NVARCHAR(50)
);

-- Creation de la table classe_legale(id, designation)
CREATE TABLE legal_class (
	Legal_class_id INT PRIMARY KEY IDENTITY(1,1),
	Legal_class_name NVARCHAR(50)
);

-- Creation de la table Modele_bulletin(id, designation)
CREATE TABLE Newsletter_template (
	Newsletter_template_id INT PRIMARY KEY IDENTITY(1,1),
	Newsletter_template_name NVARCHAR(50)
);

-- Creation de la table method_paiement(id, designation)
CREATE TABLE Payment_method (
	Payment_method_id INT PRIMARY KEY IDENTITY(1,1),
	Payment_method_name NVARCHAR(50)
);

-- Creation de la table Echelon(id, designation)
CREATE TABLE Echelon (
	Echelon_id INT PRIMARY KEY IDENTITY(1,1),
	Echelon_name NVARCHAR(50)
);

-- Creation de la table type_attestation(id, designation)
CREATE TABLE Certificate_type (
	Certificate_type_id INT PRIMARY KEY IDENTITY(1,1),
	Certificate_type_name NVARCHAR(50)
);

-- Creation de la table carriere_plan
CREATE TABLE career_plan (
	Career_plan_id INT PRIMARY KEY IDENTITY(1,1),
	Assignment_type_id INT NOT NULL REFERENCES Assignment_type(Assignment_type_id),
	Registration_number NVARCHAR(50) NULL,
	Decision_number NVARCHAR(50) NULL,
	Decision_date DATE NULL,
	Assignment_date DATE NULL,
	Description TEXT NULL,
	Establishment_id INT NULL  REFERENCES Establishment(Establishment_id),
	Department_id INT NULL REFERENCES Department(Department_id),
	Position_id INT NULL REFERENCES Position(Position_id),
	Fonction_id INT NULL REFERENCES Fonction(Fonction_id),
	employee_type_id INT NULL REFERENCES Employee_type(Employee_type_id),
	Socio_category_professional_id INT NULL REFERENCES Socio_category_professional(Socio_category_professional_id),
	Indication_id INT NULL REFERENCES Indication(Indication_id),
	Base_salary DOUBLE PRECISION NULL,
	Net_salary DOUBLE PRECISION NULL,
	Professional_category_id INT NULL REFERENCES Professional_category(Professional_category_id),
	Legal_class_id INT NULL REFERENCES Legal_class(Legal_class_id),
	Newsletter_template_id INT NULL REFERENCES Newsletter_template(Newsletter_template_id),
	Payment_method_id INT NULL REFERENCES Payment_method(Payment_method_id),
	Ending_contract DATE NULL,
	Reason NVARCHAR(50) NULL,
	Assigning_institution NVARCHAR(100) NULL,
	Start_date DATE NULL,
	End_date DATE NULL,
	Echelon_id INT NULL REFERENCES Echelon(Echelon_id),
	State INT,
	Creation_date Date,
	Updated_date Date
);

-------------------------------------------- TABLE POUR GERER LES HISTORIQUES ------------------------------------------------------
-- Creation de la table module(id, designation)
CREATE TABLE Module (
	Module_id INT PRIMARY KEY IDENTITY(1,1),
	Module_name NVARCHAR(50)
);

-- Creation de la table historique(id, type, description, date, etat)
CREATE TABLE History (
	History_id INT PRIMARY KEY IDENTITY(1,1),
	Module_id INT NOT NULL REFERENCES Module(Module_id),
	Description NVARCHAR(250),
	Registration_number NVARCHAR(50) NOT NULL,
	State INT,
	Creation_date DATETIME DEFAULT GETDATE()
);

-- Creation de la table souhait_evolution_poste(id, id_poste, reason, date, description, etat)
CREATE TABLE Wish_evolution_position (
	Wish_evolution_position_id INT PRIMARY KEY IDENTITY(1,1),
	Position_id INT NOT NULL REFERENCES Position(Position_id),
	Reason NVARCHAR(50) NOT NULL,
	Date DATE NOT NULL,
	Description TEXT,
	State INT,
	Creation_date Date,
	Updated_date Date
);

-- Donne d'insertion
INSERT INTO Module(Module_name) VALUES ('Competences');
INSERT INTO Module(Module_name) VALUES ('Carrieres');

-------------------------------------------------- DEPART A LA RETRAITE --------------------------------------------------------------------
CREATE TABLE Retirement_parameter (
	Retirement_parameter_id INT PRIMARY KEY IDENTITY(1,1),
	Woman_age INT NOT NULL,
	Man_age INT NOT NULL
);

INSERT INTO Retirement_parameter (Woman_age, Man_age) VALUES (60, 60);