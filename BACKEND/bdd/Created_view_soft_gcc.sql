-- Cr�er la vue v_employee
CREATE VIEW v_employee AS
SELECT 
    e.Employee_id, 
    e.Registration_number, 
    e.Name, 
    e.FirstName, 
    e.Birthday, 
    d.Department_id, 
    d.Department_name, 
	d.photo AS department_photo,
    e.hiring_date,
	e.civilite_id,
	c.civilite_name,
	e.manager_id,
	(select name from employee where employee_id=e.manager_id) as Manager_name,
	(select FirstName from employee where employee_id=e.manager_id) as Manager_firstName,
	e.photo AS employee_photo
FROM 
    Employee e 
JOIN 
    Department d 
ON 
    d.Department_id = e.department_id
JOIN 
	Civilite c
ON c.civilite_id=e.civilite_id

-- Creation de la vue v_employee_skill (Competence de l'employe)
CREATE VIEW v_employee_skill AS 
SELECT 
	es.Employee_skill_id, 
	es.Domain_skill_id, 
	ds.Domain_skill_name, 
	es.Skill_id, 
	s.Skill_name, 
	es.Level, 
	es.State, 
	es.Employee_id,
	es.Creation_date,
	es.Updated_date,
	e.Registration_number, 
	e.Name, 
	e.FirstName, 
	e.Birthday,
	e.Department_name,
	e.Department_id,
	e.hiring_date
FROM
	Employee_skill es
JOIN
	Domain_skill ds
ON 
	es.Domain_skill_id = ds.Domain_skill_id
JOIN
	skill s
ON
	es.Skill_id = s.Skill_id
JOIN 
	v_employee e
ON
	e.Employee_id = es.Employee_id;

-- Vue pour avoir le nombre de status de compétences
CREATE VIEW v_state_number AS
SELECT
	employee_id, 
	state, 
	count(*) as number,
	CASE
		WHEN state = 1 THEN 'Non validé'
		WHEN state = 5 THEN 'Validé par evaluation' 
	END AS State_letter
FROM v_employee_skill 
GROUP BY state, employee_id;

-- Creation de la vue v_employee_education (diplomes et formations de l'employe)
CREATE VIEW v_employee_education AS 
SELECT 
	ed.Employee_education_id, 
	ed.Study_path_id,
	sp.Study_path_name,
	ed.Degree_id, 
	d.Degree_name, 
	ed.School_id,
	s.School_name,
	ed.Year, 
	ed.State, 
	ed.Employee_id,
	e.Registration_number, 
	e.Name, 
	e.FirstName, 
	e.Birthday,
	e.Department_name,
	e.hiring_date,
	ed.Creation_date,
	ed.Updated_date
FROM
	Employee_education ed
JOIN
	Study_path sp
ON 
	ed.Study_path_id = sp.Study_path_id
JOIN
	Degree d
ON
	ed.Degree_id = d.Degree_id
JOIN 
	School s
ON
	ed.School_ID = s.School_id 
JOIN 
	v_employee e
ON
	e.Employee_id = ed.Employee_id;

-- Creation de la vue v_employee_language (Competence linguistique de l'employe)
CREATE VIEW v_employee_language AS 
SELECT 
	el.Employee_language_id, 
	el.Language_id,
	l.Language_name,
	el.Level,
	el.State,
	el.Employee_id,
	e.Registration_number, 
	e.Name, 
	e.FirstName, 
	e.Birthday,
	e.Department_name,
	e.hiring_date,
	el.Creation_date,
	el.Updated_date
FROM
	Employee_language el
JOIN
	Language l
ON 
	el.Language_id = l.Language_id
JOIN
	v_employee e
ON
	el.Employee_id = e.Employee_id;

	
-- Creation de la vue v_employee_other_skill (Autres competences de l'employe)
CREATE VIEW v_employee_other_formation AS 
SELECT 
	eof.Employee_other_formation_id,
	eof.Description,
	eof.Comment,
	eof.Start_date,
	eof.End_date,
	eof.State,
	eof.Creation_date,
	eof.Updated_date,
	e.Registration_number, 
	e.Name, 
	e.FirstName, 
	e.Birthday,
	e.Department_name,
	e.hiring_date,
	e.Employee_id
FROM
	Employee_other_formation eof
JOIN
	v_employee e
ON
	eof.Employee_id = e.Employee_id;

-- Creation de la vue v_employee_skill_number
CREATE VIEW v_employee_skill_number AS 
SELECT 
	employee_id, 
	MAX(updated_date) As updated_date,
	COUNT(employee_skill_id) AS skill_number 
FROM 
	Employee_skill 
GROUP BY 
	Employee_id;

-- Creation de la vue v_employee_education_number
CREATE VIEW v_employee_education_number AS 
SELECT 
	employee_id, 
	MAX(updated_date) AS updated_date,
	COUNT(employee_education_id) AS education_number 
FROM 
	Employee_education 
GROUP BY 
	Employee_id;

-- Creation de la vue v_employe_language_number
CREATE VIEW v_employee_language_number AS 
SELECT 
	employee_id, 
	MAX(updated_date) AS updated_date,
	COUNT(employee_language_id) AS language_number 
FROM 
	Employee_language 
GROUP BY 
	Employee_id;

-- Creation de la vue v_employee_other_formation_number
CREATE VIEW v_employee_other_formation_number AS
SELECT 
	employee_id, 
	MAX(updated_date) AS  updated_date,
	COUNT(employee_other_formation_id) as other_formation_number 
from 
	Employee_other_formation 
group by 
	Employee_id;

-- Creation  de la vue v_employee_skills pour afficher la liste des competences employes
CREATE VIEW v_skills AS 
SELECT 
    e.Employee_id, 
    e.Registration_number, 
    e.Name, 
    e.FirstName, 
    e.Department_name, 
    e.Birthday, 
    e.Hiring_date,
	e.employee_photo,
    COALESCE(ofn.other_formation_number, 0) AS other_formation_number, 
    COALESCE(ee.education_number, 0) AS education_number, 
    COALESCE(es.skill_number, 0) AS skill_number, 
    COALESCE(el.language_number, 0) AS language_number,
    -- Calcul de la date maximale pour chaque employ�
    CASE
        WHEN COALESCE(ofn.updated_date, '1970-01-01') >= COALESCE(ee.updated_date, '1970-01-01')
         AND COALESCE(ofn.updated_date, '1970-01-01') >= COALESCE(es.updated_date, '1970-01-01')
         AND COALESCE(ofn.updated_date, '1970-01-01') >= COALESCE(el.updated_date, '1970-01-01') THEN COALESCE(ofn.updated_date, NULL)
        WHEN COALESCE(ee.updated_date, '1970-01-01') >= COALESCE(ofn.updated_date, '1970-01-01')
         AND COALESCE(ee.updated_date, '1970-01-01') >= COALESCE(es.updated_date, '1970-01-01')
         AND COALESCE(ee.updated_date, '1970-01-01') >= COALESCE(el.updated_date, '1970-01-01') THEN COALESCE(ee.updated_date, NULL)
        WHEN COALESCE(es.updated_date, '1970-01-01') >= COALESCE(ofn.updated_date, '1970-01-01')
         AND COALESCE(es.updated_date, '1970-01-01') >= COALESCE(ee.updated_date, '1970-01-01')
         AND COALESCE(es.updated_date, '1970-01-01') >= COALESCE(el.updated_date, '1970-01-01') THEN COALESCE(es.updated_date, NULL)
        ELSE COALESCE(el.updated_date, '1970-01-01')
    END AS Updated_date
FROM 
    v_employee e
LEFT JOIN 
    v_employee_other_formation_number ofn 
    ON ofn.employee_id = e.employee_id
LEFT JOIN 
    v_employee_education_number ee 
    ON ee.Employee_id = e.Employee_id
LEFT JOIN 
    v_employee_skill_number es 
    ON es.employee_id = e.Employee_id
LEFT JOIN 
    v_employee_language_number el 
    ON el.employee_id = e.Employee_id;

-- Creation de la vue v_assignment_appointment pour afficher la liste des affectations nominations
CREATE VIEW v_assignment_appointment AS 
SELECT
	c.Career_plan_id,
	c.Assignment_type_id,
	a.Assignment_type_name,
	c.Registration_number,
	c.Decision_number,
	c.Decision_date,
	c.Description,
	c.Establishment_id,
	e.Establishment_name,
	c.Department_id,
	d.Department_name,
	c.Position_id,
	p.position_name,
	c.Employee_type_id,
	et.Employee_type_name,
	c.Assignment_date,
	c.Ending_contract,
	c.Net_salary,
	c.state,
	CASE
		WHEN GETDATE() BETWEEN c.Assignment_date AND c.Ending_contract THEN 'en cours'
		WHEN GETDATE() >= c.Ending_contract THEN 'terminé'
        WHEN GETDATE() < c.Assignment_date THEN 'en attente'  
    END AS career_state,
	c.creation_date,
	c.updated_date
FROM career_plan c
LEFT JOIN Assignment_type a
ON c.Assignment_type_id = a.Assignment_type_id
LEFT JOIN Establishment e
ON c.Establishment_id = e.Establishment_id
LEFT JOIN Department d
ON c.Department_id = d.Department_id
LEFT JOIN Position p
ON c.Position_id = p.Position_id
LEFT JOIN Employee_type et
ON c.employee_type_id = et.Employee_type_id
WHERE c.Assignment_type_id=1;

-- Creation de la vue pour afficher la liste des affectaions avancements
CREATE VIEW v_assignment_advancement AS 
SELECT
	c.Career_plan_id,
	c.Assignment_type_id,
	a.Assignment_type_name,
	c.Registration_number,
	c.Decision_number,
	c.Decision_date,
	c.Assignment_date,
	c.Description,
	c.Department_id,
	d.Department_name,
	c.Socio_category_professional_id,
	scp.Socio_category_professional_name,
	c.Indication_id,
	i.Indication_name,
	c.Echelon_id,
	e.Echelon_name,
	c.state,
	c.creation_date,
	c.updated_date
FROM career_plan c
LEFT JOIN Assignment_type a
ON c.Assignment_type_id = a.Assignment_type_id
LEFT JOIN Department d
ON c.Department_id = d.Department_id
LEFT JOIN Indication i
ON c.Indication_id = i.Indication_id
LEFT JOIN Echelon e
ON c.Echelon_id = e.Echelon_id
LEFT JOIN Socio_category_professional scp
ON c.Socio_category_professional_id = scp.Socio_category_professional_id
WHERE c.Assignment_type_id = 3;

-- Creation de la vue v_assignment_availability pour afficher l'affectation de mise en disponibilte
CREATE VIEW v_assignment_availability AS 
SELECT
    c.Career_plan_id,
    c.Assignment_type_id,
    a.Assignment_type_name,
    c.Registration_number,
    c.Decision_number,
    c.Decision_date,
    c.Assignment_date,
    c.Description,
	c.Assigning_institution,
    c.Start_date,
    c.End_date,
    c.Reason,
	c.state,
    CASE
		WHEN GETDATE() BETWEEN c.Start_date AND c.End_date THEN 'en cours'
		WHEN GETDATE() >= c.End_date THEN 'terminé'
        WHEN GETDATE() < c.Start_date THEN 'en attente'  
    END AS career_state,
	c.creation_date,
	c.updated_date
FROM career_plan c
LEFT JOIN Assignment_type a
ON c.Assignment_type_id = a.Assignment_type_id
WHERE c.Assignment_type_id = 2;

-- Creation de la vue v_career_plan_employee_number pour le nombre de plan carriere des employes
CREATE VIEW v_career_plan_employee_number AS
SELECT 
	e.Registration_number, 
	e.Name, 
	e.FirstName, 
	e.Birthday, 
	e.hiring_date, 
	e.civilite_id,
	e.civilite_name,
	COALESCE(count(*), 0) as career_plan_number 
FROM v_employee e
LEFT join career_plan c 
ON c.Registration_number = e.Registration_number 
WHERE c.state > 0
GROUP BY 
  e.Registration_number, 
  e.Name, 
  e.FirstName, 
  e.Birthday, 
  e.hiring_date,
  e.civilite_name,
  e.civilite_id;

-- Creation de la vue v_employee_position pour le dernier poste de chaque employe
CREATE VIEW v_employee_get_last_position AS
WITH Ranked_posts AS (
    SELECT 
        Registration_number, 
        Assignment_type_id, 
        Decision_number,
        Assignment_date,
        decision_date, 
        Description,
        Department_id,
        Position_id,
        Base_salary,
        Net_salary,
        ROW_NUMBER() OVER (
            PARTITION BY Registration_number 
            ORDER BY Assignment_date DESC
        ) AS rn
    FROM career_plan where Assignment_type_id=1 AND state > 0
)
SELECT 
    rp.Registration_number, 
    rp.Assignment_type_id, 
    rp.Decision_number,
    rp.Assignment_date,
    rp.decision_date, 
    rp.Description,
    rp.Department_id,
    d.Department_name,
    rp.Position_id,
    p.Position_name,
    rp.Base_salary,
    rp.Net_salary
FROM Ranked_posts rp
-- Jointure avec la table Department
LEFT JOIN Department d 
ON d.Department_id = rp.Department_id
-- Jointure avec la table Position
LEFT JOIN Position p
ON p.Position_id = rp.Position_id
WHERE rp.rn = 1;

-- Creation de la vue v_employee_career pour la description des carriere de l'employe
CREATE VIEW v_employee_career AS
SELECT 
	ep.Registration_number, 
	cpen.civilite_id,
	cpen.civilite_name,
	cpen.Name,
	cpen.FirstName,
	cpen.Birthday,
	cpen.hiring_date,
    ep.Assignment_type_id, 
    ep.Decision_number,
    ep.Assignment_date,
    ep.decision_date, 
    ep.Description,
    ep.Department_id,
    ep.Department_name,
    ep.Position_id,
    ep.Position_name,
    ep.Base_salary,
    ep.Net_salary,
	cpen.career_plan_number
FROM v_employee_get_last_position ep
JOIN v_career_plan_employee_number cpen
ON ep.Registration_number = cpen.Registration_number;

-- Trigger pour les historiques d'insertion d'un plan de carriere
CREATE TRIGGER trg_AfterInsert_CareerPlan
ON Career_plan
AFTER INSERT
AS
BEGIN
    -- Ins�rer les nouvelles lignes dans la table d'historique avec une description adapt�e
    INSERT INTO History (Module_id, Description, Registration_number, State)
    SELECT 
        2, -- Module_id fixe
        CASE 
            WHEN Assignment_type_id = 1 THEN 
                'L''utilisateur Rasoa a crée un plan de carrière de type Nomination pour l''employé ' + Registration_number
            WHEN Assignment_type_id = 2 THEN 
                'L''utilisateur Rasoa a crée un plan de carrière de type mise en disponibilite pour l''employé ' + Registration_number
			WHEN Assignment_type_id = 3 THEN 
                'L''utilisateur Rasoa a crée un plan de carrière de type avancement pour l''employé ' + Registration_number
            ELSE 
                'L''utilisateur Rasoa a crée un plan de carrière d''un type inconnu pour l''employé ' + Registration_number
        END AS Description,
        Registration_number,
        1 -- �tat fixe
    FROM INSERTED;
END;


-- Trigger pour les historiques de modification d'un plan de carriere
CREATE TRIGGER trg_AfterUpdate_CareerPlan
ON Career_plan
AFTER UPDATE
AS
BEGIN
    -- Ins�rer les nouvelles lignes dans la table d'historique avec une description adapt�e
    INSERT INTO History (Module_id, Description, Registration_number, State)
    SELECT 
        2, -- Module_id fixe
        CASE 
            WHEN DELETED.Assignment_type_id = 1 AND State > 0 THEN 
                'L''utilisateur Rasoa a modifié un plan de carrière de type Nomination pour l''employé ' + DELETED.Registration_number
            WHEN DELETED.Assignment_type_id = 2 AND State > 0 THEN 
                'L''utilisateur Rasoa a modifié un plan de carrière de type mise en disponibilite pour l''employé ' + DELETED.Registration_number
			WHEN DELETED.Assignment_type_id = 3 AND State > 0 THEN 
                'L''utilisateur Rasoa a modifié un plan de carrière de type avancement pour l''employé ' + DELETED.Registration_number
			WHEN DELETED.Assignment_type_id = 1 AND State = 0 THEN 
                'L''utilisateur Rasoa a supprimé un plan de carrière de type Nomination pour l''employé ' + DELETED.Registration_number
            WHEN DELETED.Assignment_type_id = 2 AND State = 0 THEN 
                'L''utilisateur Rasoa a supprimé un plan de carrière de type mise en disponibilite pour l''employé ' + DELETED.Registration_number
			WHEN DELETED.Assignment_type_id = 3 AND State = 0 THEN 
                'L''utilisateur Rasoa a supprimé un plan de carrière de type avancement pour l''employé ' + DELETED.Registration_number
            ELSE 
                'L''utilisateur Rasoa a modifié ou modifié un plan de carrière d''un type inconnu pour l''employé ' + DELETED.Registration_number
        END AS Description,
        DELETED.Registration_number,
        1 -- �tat fixe
    FROM DELETED;
END;

-- Trigger pour les historiques de supression d'un plan de carriere
CREATE TRIGGER trg_AfterDelete_CareerPlan
ON Career_plan
AFTER DELETE
AS
BEGIN
    -- Ins�rer les nouvelles lignes dans la table d'historique avec une description adapt�e
    INSERT INTO History (Module_id, Description, Registration_number, State)
    SELECT 
        2, -- Module_id fixe
        CASE 
            WHEN DELETED.Assignment_type_id = 1 THEN 
                'L''utilisateur Rasoa a supprimé definitivement un plan de carrière de type Nomination pour l''employé ' + DELETED.Registration_number
            WHEN DELETED.Assignment_type_id = 2 THEN 
                'L''utilisateur Rasoa a supprimé definitivement un plan de carrière de type mise en disponibilite pour l''employé ' + DELETED.Registration_number
			WHEN DELETED.Assignment_type_id = 3 THEN 
                'L''utilisateur Rasoa a supprimé definitivement un plan de carrière de type avancement pour l''employé ' + DELETED.Registration_number
            ELSE 
                'L''utilisateur Rasoa a supprimé definitivement un plan de carrière d''un type inconnu pour l''employé ' + DELETED.Registration_number
        END AS Description,
        DELETED.Registration_number,
        1 -- �tat fixe
    FROM DELETED;
END;

-- Vue pour afficher les departs a la retraite
CREATE VIEW v_retirement AS
SELECT 
    e.Registration_number, 
    e.civilite_id,
    e.civilite_name,
    e.Name,
    e.FirstName,
    e.Birthday,
    e.hiring_date,
    e.Department_id,
    e.Department_name,
    e.Position_id,
    e.Position_name,
    e.Base_salary,
    e.Net_salary,
    DATEDIFF(YEAR, e.Birthday, GETDATE()) AS Age,
    CASE 
        WHEN e.Civilite_id = 1 THEN DATEADD(YEAR, rp.Man_age, e.Birthday)
        WHEN e.Civilite_id = 2 THEN DATEADD(YEAR, rp.Woman_age, e.Birthday) 
        ELSE NULL
    END AS Date_retirement,
    YEAR(
        CASE 
            WHEN e.Civilite_id = 1 THEN DATEADD(YEAR, rp.Man_age, e.Birthday)
            WHEN e.Civilite_id = 2 THEN DATEADD(YEAR, rp.Woman_age, e.Birthday) 
            ELSE NULL
        END
    ) AS Year_retirement
FROM 
    v_employee_career e
CROSS JOIN 
    Retirement_parameter rp;

-- Vue pour les competences des postes
CREATE VIEW v_skill_position AS 
SELECT 
	cp.Skill_position_id,
	cp.Position_id,
	p.position_name,
	cp.Skill_id,
	s.Skill_name,
	cp.State,
	cp.Creation_date,
	cp.Updated_date
FROM Skill_position cp
INNER JOIN Position p
ON p.Position_id = cp.Position_id
INNER JOIN Skill s
ON s.Skill_id = cp.Skill_id;


-- Creation d'une procedure stockee pour les suggestions des postes d'un employe
CREATE PROCEDURE pcd_GetSuggestionPosition
    @IdEmployee INT
AS 
BEGIN TRY

	SELECT
		position_id, 
		position_name 
	FROM 
		v_skill_position 
	WHERE 
		skill_id in (select skill_id from employee_skill where employee_id=@idEmployee)
	GROUP BY 
		position_id, position_name

END TRY
BEGIN CATCH
	-- Gestion des erreurs
    SELECT ERROR_MESSAGE() AS MessageErreur;
END CATCH;

-- Appel

-- Creation de la vue des demandes souhait evolution
CREATE VIEW v_wish_evolution AS
SELECT
	w.Wish_evolution_career_id, 
	w.Employee_id,
	e.Registration_number,
	e.Name,
	e.FirstName,
	e.Hiring_date,
	e.Birthday,
	w.Position_id AS Wish_position_id,
	p.Position_name AS Wish_position_name,
	w.Wish_type_id,
	wt.Designation AS Wish_type_name, 
	w.Motivation,
	w.Disponibility,
	w.Priority,
	CASE 
        WHEN w.Priority >= 0 AND w.Priority < 5 THEN 'Bas'
        WHEN w.Priority >= 5 AND w.Priority < 10 THEN 'Moyen'
        ELSE 'Elevé'
    END AS priority_letter,
	w.request_date,
	w.State,
	CASE 
		WHEN w.State <= 0 THEN 'Refusé'
        WHEN w.State > 0 AND w.State < 5 THEN 'En atente'
        WHEN w.State >= 5 AND w.State < 10 THEN 'En cours'
		WHEN w.State >= 10 THEN 'Validé'
        ELSE NULL
    END AS state_letter,
	ec.Department_id AS Actual_department_id,
	ec.Department_name AS Actual_department_name,
	ec.Position_id AS Actual_position_id,
	ec.Position_name AS Actual_position_name,
	w.Creation_date,
	w.Updated_date
FROM Wish_evolution_career w 
JOIN position p
ON p.Position_id = w.position_id
JOIN employee e
ON e.employee_id = w.employee_id
JOIN wish_type wt
ON wt.wish_type_id = w.wish_type_id
JOIN v_employee_career ec
ON ec.Registration_number = e.Registration_number

-- Creation de la vue pour analyse statistique des demandes de souhait evolution par mois dans une annee
CREATE VIEW v_stat_wish_evolution AS
SELECT 
    YEAR(Request_date) AS Year,
    MONTH(Request_date) AS Month,
    COUNT(*) AS Total_requests,
    AVG(Priority) AS Average_priority
FROM 
    Wish_evolution_career
GROUP BY 
    YEAR(Request_date), 
    MONTH(Request_date);

-- Competences des employes par department
CREATE VIEW v_n_employee_skill_by_department AS
SELECT 
	Skill_name, 
	Skill_id, 
	Department_name, 
	Department_id, 
	state,
	count(*) as n_employee 
FROM v_employee_skill 
GROUP BY 
	Skill_name, 
	Skill_id, 
	Department_name, 
	Department_id,
	state

-- NOmbre des employes dans une poste par department
CREATE VIEW v_n_employee_career_by_department AS
SELECT
	Department_id, 
	Department_name, 
	Position_id, 
	position_name, 
	count(*) AS n_employee 
FROM v_employee_career 
GROUP BY 
	Department_id, 
	Department_name, 
	Position_id, 
	Position_name

-- Effectif des employes par departement
CREATE VIEW v_department_effective AS
SELECT 
	department_id, 
	department_name, 
	department_photo,
	COALESCE(count(*), 0) AS n_employee
FROM v_employee 
GROUP BY department_id, department_name, department_photo

-- Vue pour les details des employes
CREATE VIEW v_employee_position AS
select 
	e.employee_id, 
	e.registration_number, 
	e.name, 
	e.firstName, 
	e.Department_id,
	e.Department_name,
	e.civilite_id,
	e.civilite_name,
	e.manager_id,
	ec.position_id,
	ec.Position_name,
	e.hiring_date,
	e.Birthday,
	e.employee_photo,
    DATEDIFF(YEAR, e.hiring_date, GETDATE()) AS Seniority
from v_employee e
left join v_employee_career ec
on e.Registration_number = ec.Registration_number