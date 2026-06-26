-- Drop the database
DROP DATABASE IF EXISTS volunteer_management;
-- Create the database
CREATE DATABASE IF NOT EXISTS volunteer_management;
USE volunteer_management;

CREATE TABLE Country (
    country_id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(255) NOT NULL UNIQUE,
    country_code VARCHAR(2) NOT NULL UNIQUE,
    country_code_phone VARCHAR(5) NOT NULL,
    INDEX (country_code_phone)
);

-- Create State table
CREATE TABLE State (
    state_id INT AUTO_INCREMENT PRIMARY KEY,
    state_name VARCHAR(255) NOT NULL,
    country_id INT NOT NULL,
    FOREIGN KEY (country_id) REFERENCES Country(country_id),
    UNIQUE KEY (state_name, country_id)
    
);

-- Create City table
CREATE TABLE City (
    city_id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(255) NOT NULL,
    state_id INT NOT NULL,
    FOREIGN KEY (state_id) REFERENCES State(state_id),
    UNIQUE KEY (city_name, state_id)
);

-- Create Address table
CREATE TABLE Address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    city_id INT NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    FOREIGN KEY (city_id) REFERENCES City(city_id)
);

-- Create Employee table
CREATE TABLE Employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_pic_url VARCHAR(255),
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    employee_type ENUM('Paid','Not Paid'),
    birth_date DATE NOT NULL,
    linkedin_url VARCHAR(255) UNIQUE,
    personal_email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    phonetype ENUM('Mobile', 'Home', 'Work') NOT NULL,
    address_id INT NOT NULL,
    country_id INT NOT NULL,
    gender ENUM('Male', 'Female', 'Non-binary', 'Prefer not to say') NOT NULL,
    opt_support ENUM('Yes, the OPT period has started','Yes, approved but have not received the EAD card','No') NOT NULL,
    start_date DATE NOT NULL,
    hours_commitment INT NOT NULL,
    why_kworks TEXT NOT NULL,
    time_zone VARCHAR(255),
    visa_status ENUM('Citizen', 'Permanent Resident', 'Student Visa', 'Work Visa', 'Other') NOT NULL,
	application_status ENUM('Pending', 'Reviewing', 'Approved', 'Rejected') NOT NULL,
    application_date DATETIME,
    is_active BOOLEAN,
    additional_websites VARCHAR(255),
    additional_info TEXT,
	FOREIGN KEY (country_id) REFERENCES Country(country_id),
    FOREIGN KEY (address_id) REFERENCES Address(address_id)
);

-- Create Employment table
CREATE TABLE Employment (
    employment_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    responsibilities TEXT,
    location VARCHAR(255),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create Education table
CREATE TABLE Education (
    education_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    major VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create Resume table
CREATE TABLE Resume (
    resume_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE,
    resume_url VARCHAR(255) NOT NULL,
    upload_date DATETIME NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create Role table
CREATE TABLE Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL UNIQUE
);

-- Create DesiredRole junction table
CREATE TABLE DesiredRole (
    employee_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (employee_id, role_id),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id),
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

-- Create Employee Role junction table
CREATE TABLE EmployeeRole (
    employee_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (employee_id, role_id),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id),
    FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

-- Create Availability table
CREATE TABLE Availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create EEO Data table
CREATE TABLE EEOData (
    eeo_data_id INT AUTO_INCREMENT PRIMARY KEY,
    sexual_orientation ENUM('Heterosexual', 'Homosexual', 'Bisexual', 'Asexual', 'Prefer not to say'),
    disability ENUM('Yes', 'No', 'Prefer not to say'),
    submission_date DATETIME NOT NULL
);

-- Create On-Boardong Task
CREATE TABLE OnBoardingTask (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    task_type INT,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Employee On-Boarding Task
CREATE TABLE EmployeeOnboardingTask (
    employee_task_id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    employee_id INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    due_date DATE,
    is_employee_task_active BOOLEAN,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES OnBoardingTask(task_id),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create Resigned Table
CREATE TABLE Resigned (
    resignation_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    resignation_date DATE NOT NULL,
    comments TEXT,
    feedback TEXT,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create Skills Table
CREATE TABLE Skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skills VARCHAR(255)
);

-- Create Employee Skills Table
CREATE TABLE EmployeeSkills (
    employee_skills_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    skill_id INT NOT NULL,
    skill VARCHAR(255),
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id),
    FOREIGN KEY (skill_id) REFERENCES Skills(skill_id)
);

-- Create Projects Tables
CREATE TABLE Projects (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    is_available BOOLEAN,
    required_skills VARCHAR(255),
    start_date DATE,
    created_by VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create Assignments Tables
CREATE TABLE Assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    assignment_date DATE,
    status VARCHAR(255),
    assigned_by VARCHAR(255),
    assigned_role VARCHAR(255),
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES Projects(project_id)
);

-- Create application_status_history table
CREATE TABLE application_status_history (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    status ENUM('Pending', 'Reviewing', 'Approved', 'Rejected') DEFAULT 'Pending',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- Create trigger to add status entry when new employee is added
DELIMITER //
CREATE TRIGGER after_employee_insert
AFTER INSERT ON Employee
FOR EACH ROW
BEGIN
    INSERT INTO application_status_history (employee_id, status)
    VALUES (NEW.employee_id, 'Pending');
END;
//
DELIMITER ;


-- Add trigger to update application_status_history when Employee status changes
DELIMITER //
CREATE TRIGGER after_employee_status_update
AFTER UPDATE ON Employee
FOR EACH ROW
BEGIN
    IF OLD.application_status <> NEW.application_status THEN
        INSERT INTO application_status_history (employee_id, status)
        VALUES (NEW.employee_id, NEW.application_status);
    END IF;
END;
//
DELIMITER ;



-- Insert Countries
INSERT INTO Country (country_name, country_code, country_code_phone) VALUES
('United States', 'US', '+1'),
('Canada', 'CA', '+1'),
('India', 'IN', '+91'),
('United Kingdom', 'GB', '+44'),
('Australia', 'AU', '+61');

-- Insert US States
INSERT INTO State (state_name, country_id) VALUES
('Alabama', 1),
('Alaska', 1),
('Arizona', 1),
('Arkansas', 1),
('California', 1),
('Colorado', 1),
('Connecticut', 1),
('Delaware', 1),
('Florida', 1),
('Georgia', 1),
('Hawaii', 1),
('Idaho', 1),
('Illinois', 1),
('Indiana', 1),
('Iowa', 1),
('Kansas', 1),
('Kentucky', 1),
('Louisiana', 1),
('Maine', 1),
('Maryland', 1),
('Massachusetts', 1),
('Michigan', 1),
('Minnesota', 1),
('Mississippi', 1),
('Missouri', 1),
('Montana', 1),
('Nebraska', 1),
('Nevada', 1),
('New Hampshire', 1),
('New Jersey', 1),
('New Mexico', 1),
('New York', 1),
('North Carolina', 1),
('North Dakota', 1),
('Ohio', 1),
('Oklahoma', 1),
('Oregon', 1),
('Pennsylvania', 1),
('Rhode Island', 1),
('South Carolina', 1),
('South Dakota', 1),
('Tennessee', 1),
('Texas', 1),
('Utah', 1),
('Vermont', 1),
('Virginia', 1),
('Washington', 1),
('West Virginia', 1),
('Wisconsin', 1),
('Wyoming', 1);

-- Insert Canadian Provinces
INSERT INTO State (state_name, country_id) VALUES
('Alberta', 2),
('British Columbia', 2),
('Manitoba', 2),
('New Brunswick', 2),
('Newfoundland and Labrador', 2),
('Northwest Territories', 2),
('Nova Scotia', 2),
('Nunavut', 2),
('Ontario', 2),
('Prince Edward Island', 2),
('Quebec', 2),
('Saskatchewan', 2),
('Yukon', 2);

-- Insert Indian States
INSERT INTO State (state_name, country_id) VALUES
('Andhra Pradesh', 3),
('Arunachal Pradesh', 3),
('Assam', 3),
('Bihar', 3),
('Chhattisgarh', 3),
('Goa', 3),
('Gujarat', 3),
('Haryana', 3),
('Himachal Pradesh', 3),
('Jharkhand', 3),
('Karnataka', 3),
('Kerala', 3),
('Madhya Pradesh', 3),
('Maharashtra', 3),
('Manipur', 3),
('Meghalaya', 3),
('Mizoram', 3),
('Nagaland', 3),
('Odisha', 3),
('Punjab', 3),
('Rajasthan', 3),
('Sikkim', 3),
('Tamil Nadu', 3),
('Telangana', 3),
('Tripura', 3),
('Uttar Pradesh', 3),
('Uttarakhand', 3),
('West Bengal', 3),
('Delhi', 3);

-- Insert United Kingdom Countries/Regions
INSERT INTO State (state_name, country_id) VALUES
('England', 4),
('Scotland', 4),
('Wales', 4),
('Northern Ireland', 4);

-- Insert Australian States and Territories
INSERT INTO State (state_name, country_id) VALUES
('New South Wales', 5),
('Victoria', 5),
('Queensland', 5),
('Western Australia', 5),
('South Australia', 5),
('Tasmania', 5),
('Australian Capital Territory', 5),
('Northern Territory', 5);

-- Insert Major US Cities
INSERT INTO City (city_name, state_id) VALUES
-- California (state_id = 5)
('Los Angeles', 5),
('San Francisco', 5),
('San Diego', 5),
('San Jose', 5),
('Sacramento', 5),

-- New York (state_id = 32)
('New York City', 32),
('Buffalo', 32),
('Rochester', 32),
('Syracuse', 32),
('Albany', 32),

-- Texas (state_id = 43)
('Houston', 43),
('Dallas', 43),
('Austin', 43),
('San Antonio', 43),
('Fort Worth', 43),

-- Florida (state_id = 9)
('Miami', 9),
('Orlando', 9),
('Tampa', 9),
('Jacksonville', 9),
('Tallahassee', 9),

-- Illinois (state_id = 13)
('Chicago', 13),
('Aurora', 13),
('Naperville', 13),
('Springfield', 13),
('Peoria', 13);

-- Insert Major Canadian Cities
INSERT INTO City (city_name, state_id) VALUES
-- Ontario (state_id = 59)
('Toronto', 59),
('Ottawa', 59),
('Mississauga', 59),
('Hamilton', 59),
('London', 59),

-- Quebec (state_id = 61)
('Montreal', 61),
('Quebec City', 61),
('Laval', 61),
('Gatineau', 61),
('Sherbrooke', 61),

-- British Columbia (state_id = 52)
('Vancouver', 52),
('Victoria', 52),
('Surrey', 52),
('Burnaby', 52),
('Richmond', 52),

-- Alberta (state_id = 51)
('Calgary', 51),
('Edmonton', 51),
('Red Deer', 51),
('Lethbridge', 51),
('Fort McMurray', 51);

-- Insert Major Indian Cities
INSERT INTO City (city_name, state_id) VALUES
-- Maharashtra (state_id = 77)
('Mumbai', 77),
('Pune', 77),
('Nagpur', 77),
('Thane', 77),
('Nashik', 77),

-- Delhi (state_id = 92)
('New Delhi', 92),
('North Delhi', 92),
('South Delhi', 92),
('East Delhi', 92),
('West Delhi', 92),

-- Karnataka (state_id = 74)
('Bangalore', 74),
('Mysore', 74),
('Hubli', 74),
('Mangalore', 74),
('Belgaum', 74),

-- Tamil Nadu (state_id = 86)
('Chennai', 86),
('Coimbatore', 86),
('Madurai', 86),
('Tiruchirappalli', 86),
('Salem', 86),

-- Gujarat (state_id = 70)
('Ahmedabad', 70),
('Surat', 70),
('Vadodara', 70),
('Rajkot', 70),
('Gandhinagar', 70);

