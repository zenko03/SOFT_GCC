    SELECT
                        Status AS ' ',
                        [FIDFSR] AS FIDFSR,
                        ISNULL ([FIDFSR],0) AS TOTAL
                    FROM
                        (
                                    SELECT 
    Status, 
    CASE 
        WHEN Confidential IS NULL OR Confidential = 0 THEN '0'
        WHEN Confidential = 1 THEN '1'
    END AS Confidential_Group,
    COUNT(*) AS Count,
    'All documents' AS DocumentType
FROM documents 
WHERE ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F'
GROUP BY Status, 
         CASE 
             WHEN Confidential IS NULL OR Confidential = 0 THEN '0'
             WHEN Confidential = 1 THEN '1'
         END

UNION ALL

SELECT 
    d.Status, 
    CASE 
        WHEN d.Confidential IS NULL OR d.Confidential = 0 THEN '0'
        WHEN d.Confidential = 1 THEN '1'
    END AS Confidential_Group,
    COUNT(*) AS Count,
    'Accessible documents' AS DocumentType
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
ORDER BY Status, DocumentType;
                        ) AS src
                    PIVOT
                    (
                        Count(Id)
                        FOR Projet IN ([FIDFSR])
                    ) AS pvt
                    ORDER BY Status;


                    SELECT ProjectId, 1, 2, 3
FROM (
    SELECT ProjectId, Status, Confidential
    FROM documents
    WHERE ProjectId = '0900AF5C-BF92-440A-A3D6-D1DE35D6AA3F'
) AS SourceTable
PIVOT (
    MAX(Confidential) FOR Status IN (1, 2, 3)
) AS PivotTable;












 SELECT
                        Status AS ' ',
                        [FIDFSR] AS FIDFSR,
                        ISNULL ([FIDFSR],0) AS TOTAL
                    FROM
                        (
                                    SELECT
                                    d.Status, d.Confidential, (SELECT Name FROM Projects WHERE Id=d.ProjectId) AS Projet, d.Id
                            FROM Documents AS d
                            INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
                            INNER JOIN USERS AS u ON ds.Id = u.Id
                                    WHERE d.DeletionDate IS NULL
                                    AND d.Status=1



                             AND (u.ProjectId = @projectId OR u.ProjectIdOth LIKE CONCAT('%', @projectId, '%'))
                            GROUP BY d.Status, d.Confidential, d.ProjectId, d.Id
                                            UNION
                            SELECT
                            d.Status, d.Confidential, (SELECT Name FROM Projects WHERE Id=d.ProjectId) AS Projet, d.Id
                            FROM Documents AS d
                            INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
                            INNER JOIN USERS AS u ON ds.Id = u.Id
                            WHERE (
                                    d.DeletionDate IS NULL
                                AND d.Status = 3
                                AND (
                                    d.CanBeAccessedByAnyone = 1
                                    OR (
                                        SELECT TOP 1 uda.CreationDate
                                        FROM UsersDocumentsAccesses AS uda
                                        WHERE uda.DocumentId = d.Id
                                        AND uda.UserId = @userId
                                        AND uda.DeletionDate IS NULL
                                        ORDER BY uda.CreationDate DESC
                                    ) IS NOT NULL
                                )
                            )



                             AND (u.ProjectId = @projectId OR u.ProjectIdOth LIKE CONCAT('%', @projectId, '%'))
                            GROUP BY d.Status, d.Confidential, d.ProjectId, d.Id
                                            UNION
                                    SELECT
                                    d.Status, d.Confidential, (SELECT Name FROM Projects WHERE Id=d.ProjectId) AS Projet, d.Id
                            FROM Documents AS d
                            INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
                                    INNER JOIN USERS AS u ON ds.Id = u.Id
                            WHERE d.DeletionDate IS NULL
                                    AND d.Status=2



                             AND (u.ProjectId = @projectId OR u.ProjectIdOth LIKE CONCAT('%', @projectId, '%'))
                            GROUP BY d.Status, d.Confidential, d.ProjectId, d.Id
                        ) AS src
                    PIVOT
                    (
                        Count(Id)
                        FOR Projet IN ([FIDFSR])
                    ) AS pvt
                    ORDER BY Status;




@"SELECT
    Status AS 'Statut',
    {0},
    {2}
FROM
    (
        SELECT 
            d.Status, 
            p.Name AS Projet,
            CASE 
                WHEN d.Confidential = 1 THEN 'Confidentiel'
                ELSE 'Non confidentiel'
            END AS Confidential_Type,
            COUNT(*) AS Count
        FROM documents as d
        INNER JOIN Projects AS p ON d.ProjectId = p.Id
        WHERE Status != 3
        {3}
        {4}
        {5}
        {6}
        GROUP BY d.Status, p.Name,
            CASE 
                WHEN d.Confidential = 1 THEN 'Confidentiel'
                ELSE 'Non confidentiel'
            END

        UNION ALL

        SELECT 
            d.Status, 
            p.Name AS Projet,
            CASE 
                WHEN d.Confidential = 1 THEN 'Confidentiel'
                ELSE 'Non confidentiel'
            END AS Confidential_Type,
            COUNT(*) AS count,
        FROM documents AS d 
        INNER JOIN DocumentsSenders AS ds ON d.SenderId = ds.Id
        INNER JOIN Users AS u ON ds.Id = u.Id
        INNER JOIN Projects AS p ON d.ProjectId = p.Id
        WHERE d.DeletionDate IS NULL
            AND d.Status = 3
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
            {3} 
            {4}
            {5}
            {6}
        GROUP BY d.Status, p.Name,
            CASE 
                WHEN d.Confidential = 1 THEN 'Confidentiel'
                ELSE 'Non confidentiel'
            END
    ) AS src
    PIVOT
    (
        SUM(Count)
        FOR Projet IN {1}
    ) AS pvt
ORDER BY Status, Confidential_Type;"