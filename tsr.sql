SELECT 
    d.Status, 
    CASE 
        WHEN d.Confidential IS NULL OR d.Confidential = 0 THEN '0'
        WHEN d.Confidential = 1 THEN '1'
    END AS Confidential_Group,
    COUNT(*) AS Count
FROM documents AS d 
INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
INNER JOIN Users AS u ON ds.Id = u.Id
WHERE d.DeletionDate IS NULL
    AND d.Status = 3
    AND d.ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F'
    AND (
        d.CanBeAccessedByAnyone = 1
        OR EXISTS (
            SELECT 1
            FROM UsersDocumentsAccesses AS uda
            WHERE uda.DocumentId = d.Id
                AND uda.UserId = 'B56C266F-B531-49E3-B562-338CAB0FCB82'
                AND uda.DeletionDate IS NULL
        )
    )
GROUP BY d.Status, 
    CASE 
        WHEN d.Confidential IS NULL OR d.Confidential = 0 THEN '0'
        WHEN d.Confidential = 1 THEN '1'
    END
ORDER BY d.Status;















SELECT
    Status AS ' ',
    [FIDFSR] AS FIDFSR,
    ISNULL ([FIDFSR],0) AS TOTAL
FROM
    (
            SELECT 
            Status, 
            CASE 
                WHEN Confidential IS NULL OR Confidential = 0 THEN 'Non confidentiel'
                WHEN Confidential = 1 THEN 'Confidentiel'
            END AS Confidential_Group,
            COUNT(*) AS Count,
            'Tous documents' AS DocumentType
        FROM documents 
        WHERE ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F'
        GROUP BY Status, 
                CASE 
                    WHEN Confidential IS NULL OR Confidential = 0 THEN 'Non confidentiel'
                    WHEN Confidential = 1 THEN 'Confidentiel'
                END

        UNION ALL

        SELECT 
            d.Status, 
            CASE 
                WHEN d.Confidential IS NULL OR d.Confidential = 0 THEN 'Non confidentiel'
                WHEN d.Confidential = 1 THEN 'Confidentiel'
            END AS Confidential_Group,
            COUNT(*) AS Count,
            'Documents accessibles' AS DocumentType
        FROM documents AS d 
        INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
        INNER JOIN Users AS u ON ds.Id = u.Id
        WHERE d.DeletionDate IS NULL
            AND d.Status = 3
            AND d.ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F'
            AND (
                d.CanBeAccessedByAnyone = 1
                OR EXISTS (
                    SELECT 1
                    FROM UsersDocumentsAccesses AS uda
                    WHERE uda.DocumentId = d.Id
                        AND uda.UserId = 'B56C266F-B531-49E3-B562-338CAB0FCB82'
                        AND uda.DeletionDate IS NULL
                )
            )
        GROUP BY d.Status, 
            CASE 
                WHEN d.Confidential IS NULL OR d.Confidential = 0 THEN 'Non confidentiel'
                WHEN d.Confidential = 1 THEN 'Confidentiel'
            END
    ) AS src
    PIVOT
        (
            Count(Id)
            FOR Projet IN ([FIDFSR])
        ) AS pvt
        ORDER BY Status;



-- saika mety 
-- Requête pour les statistiques par statut avec séparation confidentiel/non confidentiel
SELECT
    Status AS 'Statut',
    Confidential_Type AS 'Type',
    [0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F] AS FIDFSR,
    ISNULL([0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F], 0) AS TOTAL
FROM
    (
        -- Tous les documents (confidentiels et non confidentiels)
        SELECT 
            Status, 
            ProjectId,
            CASE 
                WHEN Confidential = 1 THEN 'Confidentiel'
                ELSE 'Non confidentiel'
            END AS Confidential_Type,
            COUNT(*) AS Count
        FROM documents 
        WHERE ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F'
        GROUP BY Status, ProjectId,
            CASE 
                WHEN Confidential = 1 THEN 'Confidentiel'
                ELSE 'Non confidentiel'
            END

        UNION ALL

        -- Documents accessibles (confidentiels et non confidentiels)
        SELECT 
            d.Status, 
            d.ProjectId,
            CASE 
                WHEN d.Confidential = 1 THEN 'Confidentiel'
                ELSE 'Non confidentiel'
            END AS Confidential_Type,
            COUNT(*) AS Count
        FROM documents AS d 
        INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
        INNER JOIN Users AS u ON ds.Id = u.Id
        WHERE d.DeletionDate IS NULL
            AND d.Status = 3
            AND d.ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F'
            AND (
                d.CanBeAccessedByAnyone = 1
                OR EXISTS (
                    SELECT 1
                    FROM UsersDocumentsAccesses AS uda
                    WHERE uda.DocumentId = d.Id
                        AND uda.UserId = 'B56C266F-B531-49E3-B562-338CAB0FCB82'
                        AND uda.DeletionDate IS NULL
                )
            )
        GROUP BY d.Status, d.ProjectId,
            CASE 
                WHEN d.Confidential = 1 THEN 'Confidentiel'
                ELSE 'Non confidentiel'
            END
    ) AS src
    PIVOT
    (
        SUM(Count)
        FOR ProjectId IN ([0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F])
    ) AS pvt
ORDER BY Status, Confidential_Type;

















-- version farany 

DECLARE @projectName NVARCHAR(100) = (SELECT Name FROM Projects WHERE Id = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F');

SELECT
    Status AS 'Statut',
    [ProjectCount] AS FIDFSR,
    ISNULL([ProjectCount], 0) AS TOTAL
FROM
    (
        -- Documents avec statut 1
        SELECT
            d.Status, 
            'ProjectCount' AS ProjectIndicator,
            d.Id
        FROM Documents AS d
        INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
        INNER JOIN USERS AS u ON ds.Id = u.Id
        WHERE d.DeletionDate IS NULL
        AND d.Status = 1
        AND d.ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F'
        AND (u.ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F' OR u.ProjectIdOth LIKE CONCAT('%', '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F', '%'))
        
        UNION ALL
        
        -- Documents avec statut 3
        SELECT
            d.Status, 
            'ProjectCount' AS ProjectIndicator,
            d.Id
        FROM Documents AS d
        INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
        INNER JOIN USERS AS u ON ds.Id = u.Id
        WHERE d.DeletionDate IS NULL
        AND d.Status = 3
        AND d.ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F'
        AND (u.ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F' OR u.ProjectIdOth LIKE CONCAT('%', '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F', '%'))
        AND (
            d.CanBeAccessedByAnyone = 1
            OR EXISTS (
                SELECT 1
                FROM UsersDocumentsAccesses AS uda
                WHERE uda.DocumentId = d.Id
                AND uda.UserId = 'B56C266F-B531-49E3-B562-338CAB0FCB82'
                AND uda.DeletionDate IS NULL
            )
        )
        
        UNION ALL
        
        -- Documents avec statut 2
        SELECT
            d.Status, 
            'ProjectCount' AS ProjectIndicator,
            d.Id
        FROM Documents AS d
        INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
        INNER JOIN USERS AS u ON ds.Id = u.Id
        WHERE d.DeletionDate IS NULL
        AND d.Status = 2
        AND d.ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F'
        AND (u.ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F' OR u.ProjectIdOth LIKE CONCAT('%', '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F', '%'))
    ) AS src
PIVOT
(
    COUNT(Id)
    FOR ProjectIndicator IN ([ProjectCount])
) AS pvt
ORDER BY Status;





















-- Version avec séparation confidentiel/non confidentiel
SELECT
    Status AS 'Statut',
    Confidential_Type AS 'Type',
    [ProjectCount] AS FIDFSR,
    ISNULL([ProjectCount], 0) AS TOTAL
FROM
    (
        SELECT
            d.Status, 
            'ProjectCount' AS ProjectIndicator,
            d.Id,
            CASE WHEN d.Confidential = 1 THEN 'Confidentiel' ELSE 'Non confidentiel' END AS Confidential_Type
        FROM Documents AS d
        INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
        INNER JOIN USERS AS u ON ds.Id = u.Id
        WHERE d.DeletionDate IS NULL
        AND d.Status = 1
        AND d.ProjectId = @projectId
        AND (u.ProjectId = @projectId OR u.ProjectIdOth LIKE CONCAT('%', @projectId, '%'))
        
        UNION ALL
        
        SELECT
            d.Status, 
            'ProjectCount' AS ProjectIndicator,
            d.Id,
            CASE WHEN d.Confidential = 1 THEN 'Confidentiel' ELSE 'Non confidentiel' END AS Confidential_Type
        FROM Documents AS d
        INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
        INNER JOIN USERS AS u ON ds.Id = u.Id
        WHERE d.DeletionDate IS NULL
        AND d.Status = 3
        AND d.ProjectId = @projectId
        AND (u.ProjectId = @projectId OR u.ProjectIdOth LIKE CONCAT('%', @projectId, '%'))
        AND (
            d.CanBeAccessedByAnyone = 1
            OR EXISTS (
                SELECT 1
                FROM UsersDocumentsAccesses AS uda
                WHERE uda.DocumentId = d.Id
                AND uda.UserId = @userId
                AND uda.DeletionDate IS NULL
            )
        )
        
        UNION ALL
        
        SELECT
            d.Status, 
            'ProjectCount' AS ProjectIndicator,
            d.Id,
            CASE WHEN d.Confidential = 1 THEN 'Confidentiel' ELSE 'Non confidentiel' END AS Confidential_Type
        FROM Documents AS d
        INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
        INNER JOIN USERS AS u ON ds.Id = u.Id
        WHERE d.DeletionDate IS NULL
        AND d.Status = 2
        AND d.ProjectId = @projectId
        AND (u.ProjectId = @projectId OR u.ProjectIdOth LIKE CONCAT('%', @projectId, '%'))
    ) AS src
PIVOT
(
    COUNT(Id)
    FOR ProjectIndicator IN ([ProjectCount])
) AS pvt
ORDER BY Status, Confidential_Type;