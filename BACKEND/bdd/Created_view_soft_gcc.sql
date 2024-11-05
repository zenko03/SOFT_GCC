-- Créer la vue v_employee
CREATE VIEW v_employee AS
SELECT 
    e.Employee_id, 
    e.Registration_number, 
    e.Name, 
    e.FirstName, 
    e.Birthday, 
    d.Department_id, 
    d.Department_name, 
    e.hiring_date
FROM 
    Employee e 
JOIN 
    Department d 
ON 
    d.Department_id = e.department_id;

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
	COUNT(employee_skill_id) AS skill_number 
FROM 
	Employee_skill 
GROUP BY 
	Employee_id;

-- Creation de la vue v_employee_education_number
CREATE VIEW v_employee_education_number AS 
SELECT 
	employee_id, 
	COUNT(employee_education_id) AS education_number 
FROM 
	Employee_education 
GROUP BY 
	Employee_id;

-- Creation de la vue v_employe_language_number
CREATE VIEW v_employee_language_number AS 
SELECT 
	employee_id, 
	COUNT(employee_language_id) AS language_number 
FROM 
	Employee_language 
GROUP BY 
	Employee_id;

-- Creation de la vue v_employee_other_formation_number
CREATE VIEW v_employee_other_formation_number AS
SELECT 
	employee_id, 
	COUNT(employee_other_formation_id) as other_formation_number 
from 
	Employee_other_formation 
group by 
	Employee_id;

-- Creation  de la vue v_employee_skills pour afficher la liste des competences employes
CREATE VIEW v_skills AS SELECT e.Employee_id, e.Registration_number, e.Name, e.FirstName, e.Department_name, e.Birthday, e.Hiring_date,
COALESCE(ofn.other_formation_number, 0) AS other_formation_number, COALESCE( ee.education_number, 0) AS education_number, 
COALESCE(es.skill_number, 0) AS skill_number, COALESCE(el.language_number, 0) AS language_number
FROM v_employee e 
LEFT join v_employee_other_formation_number ofn ON ofn.employee_id=e.employee_id
LEFT join v_employee_education_number ee ON ee.Employee_id=e.Employee_id
LEFT join v_employee_skill_number es ON es.employee_id=e.Employee_id
LEFT join v_employee_language_number el ON el.employee_id=e.Employee_id;