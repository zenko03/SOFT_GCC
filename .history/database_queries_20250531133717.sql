-- Requêtes SQL pour interagir avec la base de données soft_GCC
-- Utilisez ces requêtes comme référence pour interagir avec la base

-- Liste des tables
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE';

-- Exemple: Sélectionner tous les enregistrements d'une table
-- SELECT * FROM NomDeVotreTable;

-- Exemple: Insérer un enregistrement
-- INSERT INTO NomDeVotreTable (Colonne1, Colonne2) VALUES ('Valeur1', 'Valeur2');

-- Exemple: Mettre à jour des enregistrements
-- UPDATE NomDeVotreTable SET Colonne1 = 'NouvelleValeur' WHERE Condition;

-- Exemple: Supprimer des enregistrements
-- DELETE FROM NomDeVotreTable WHERE Condition; 