-- Étape 1 : Calculer le StepNumber "corrigé"
WITH StepCandidate AS (
    SELECT
        d.Id AS DocumentId,
        ds.StepNumber,
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM DocumentSteps AS checkDst
                WHERE checkDst.DocumentId = d.Id
                AND checkDst.StepNumber = ds.StepNumber + 1
            )
            THEN ds.StepNumber + 1
            ELSE ds.StepNumber
        END AS StepNumberFarany
    FROM Documents AS d
    JOIN DocumentSteps AS ds ON ds.DocumentId = d.Id
    JOIN UsersSteps AS us ON ds.Id = us.DocumentStepId
    WHERE us.ProcessingDate IS NOT NULL
),
-- Étape 2 : Récupérer le max StepNumberFarany par document
StepInfo AS (
    SELECT
        DocumentId,
        MAX(StepNumberFarany) AS StepNumberFarany
    FROM StepCandidate
    GROUP BY DocumentId
),
-- Étape 3 : Filtrer les documents
FilteredDocuments AS (
    SELECT
        d.Id AS DocumentId,
        d.ProjectId,
        u.Username,
        u.Fonction,
        LTRIM(RTRIM(CASE WHEN u.FirstName + ' ' + u.LastName = ' ' THEN u.Username ELSE u.FirstName + ' ' + u.LastName END)) AS ValidatorName
    FROM Documents AS d
    JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
    JOIN DocumentSteps AS dst ON dst.DocumentId = d.Id
    JOIN UsersSteps AS us ON us.DocumentStepId = dst.Id
    JOIN Users AS u ON u.Id = us.UserId
    JOIN StepInfo AS si ON si.DocumentId = d.Id AND dst.StepNumber = si.StepNumberFarany
    WHERE 
        us.ProcessingDate IS NULL
        AND d.Status = 1
        AND d.DeletionDate IS NULL
        AND d.ProjectId IS NOT NULL
        AND us.IsPotential = 1
        {2}
        {3} 
        {4} 
        {5}
)
-- Étape 4 : PIVOT
SELECT
    ValidatorName AS Validator,
    Fonction,
    {0}              
FROM (
    SELECT 
        fd.ValidatorName,
        fd.Fonction,
        p.Name AS Projet,
        fd.DocumentId
    FROM FilteredDocuments AS fd
    JOIN Projects AS p ON p.Id = fd.ProjectId
) AS src
PIVOT (
    COUNT(DocumentId)
    FOR Projet IN {1} 
) AS pvt order by Validator;


SELECT p.Name AS PROJET,
sda.ReferenceInterne as Reference,
d.Title, 
d.CreationDate,
dt.Title as TYPEDOCUMENT,
CASE 
    WHEN s.Type=1 THEN (SELECT Name FROM Suppliers WHERE Id=d.SenderId) 
    WHEN s.Type=0 THEN (SELECT FirstName FROM Users WHERE Id=d.SenderId)
END AS Sender,
CONCAT(ds.StepNumber, ' ', ds.ProcessingDescription) as Step, 
CASE WHEN LTRIM(RTRIM((u.FirstName + ' ' + u.LastName)))='' THEN u.Username ELSE LTRIM(RTRIM((u.FirstName + ' ' + u.LastName))) END
            AS Validator,
DATEADD(DAY, ds.ProcessingDuration, d.CreationDate) AS DATEVALIDATION,
ds.ProcessingDuration, 
0 AS DELAITRAITEMENT,
CASE 
    WHEN DATEDIFF(DAY, ds.CreationDate, GETDATE())>0 THEN DATEDIFF(DAY, ds.CreationDate, GETDATE()) 
    WHEN DATEDIFF(DAY, ds.CreationDate, GETDATE())=0 THEN 0 
END AS RETARD,
CASE 
    WHEN DATEDIFF(DAY, ds.CreationDate, GETDATE())<0 THEN DATEDIFF(DAY, ds.CreationDate, GETDATE()) 
    WHEN DATEDIFF(DAY, ds.CreationDate, GETDATE())=0 THEN 0
END AS AVANCE
FROM UsersSteps AS us
INNER JOIN Users AS u ON us.UserId=u.Id
INNER JOIN DocumentSteps AS ds ON us.DocumentStepId=ds.Id	
INNER JOIN Documents AS d ON ds.DocumentId=d.Id
INNER JOIN DocumentTypeUnion AS ddt ON ddt.DocumentId=d.Id
INNER JOIN DocumentTypes AS dt ON dt.Id=ddt.TypeDocID
INNER JOIN ValidationsHistory AS v ON d.Id=v.DocumentId
INNER JOIN DocumentsSenders s ON d.SenderId=s.Id
INNER JOIN Projects AS p ON d.ProjectId=p.Id
INNER JOIN SuppliersDocumentsAcknowledgements AS sda ON d.Id=sda.Id
WHERE d.DeletionDate IS NULL
AND d.Status=3
AND v.ActionType=3
{0}{1}{2}{3}