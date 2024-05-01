SELECT "employeeID", name, surname, positions, email
	FROM public."Employees";
	
	
SELECT "scheduleID", "employeeID", date, "startTime", "endTime"
	FROM public."Schedule";
	
	
SELECT "employeeID", "serviceID"
	FROM public."EmployeesServices";
	
	
SELECT "userID", name, phone, email, password, role
	FROM public."Users";
	
	
SELECT "serviceID", name, description, price
	FROM public."Servics";
	
	