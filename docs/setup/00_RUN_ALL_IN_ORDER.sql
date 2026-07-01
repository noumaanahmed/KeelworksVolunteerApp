-- ============================================================
-- KeelWorks Volunteer Application - Professional MVP
-- FIRST-TIME / FULL RESET SETUP SCRIPT
--
-- WARNING:
--   This script wipes the KeelWorks tables in the volunteer_management
--   database and recreates the clean MVP schema from scratch.
--
-- What this includes:
--   - Current backend-compatible schema
--   - Employee.user_id for applicant dashboard ownership
--   - EEOData.employee_id for EEO-to-application linkage
--   - Countries seeded for the location dropdown
--   - States/provinces for US, Canada, India, UK, Australia
--   - "Not Applicable / Other" state for every other country so the
--     required State/Province field always has a selectable value
--   - ApplicationStatusHistory table for admin workflow audit trail
--   - Admin workflow statuses supported from day one
--   - application_status stored as VARCHAR(50) for future workflow flexibility
--   - No old/future tables: Resume, Role
--
-- Run this whole file in MySQL Workbench or mysql CLI.
-- ============================================================

CREATE DATABASE IF NOT EXISTS volunteer_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE volunteer_management;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS ApplicationStatusHistory;
DROP TABLE IF EXISTS application_status_history;
DROP TABLE IF EXISTS Resume;
DROP TABLE IF EXISTS Role;
DROP TABLE IF EXISTS EEOData;
DROP TABLE IF EXISTS Education;
DROP TABLE IF EXISTS Employment;
DROP TABLE IF EXISTS Employee;
DROP TABLE IF EXISTS Address;
DROP TABLE IF EXISTS City;
DROP TABLE IF EXISTS State;
DROP TABLE IF EXISTS Country;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS SequelizeMeta;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Auth
-- ============================================================

CREATE TABLE users (
  user_id        INT AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(255) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('admin', 'applicant') NOT NULL DEFAULT 'applicant',
  first_name     VARCHAR(50) NOT NULL,
  middle_name    VARCHAR(50) NULL,
  last_name      VARCHAR(50) NOT NULL,
  full_name      VARCHAR(150) NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Location reference data
-- ============================================================

CREATE TABLE Country (
  country_id         INT AUTO_INCREMENT PRIMARY KEY,
  country_name       VARCHAR(255) NOT NULL UNIQUE,
  country_code       CHAR(2) NOT NULL UNIQUE,
  country_code_phone VARCHAR(10) NOT NULL,
  INDEX idx_country_name (country_name),
  INDEX idx_country_code (country_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE State (
  state_id   INT AUTO_INCREMENT PRIMARY KEY,
  state_name VARCHAR(255) NOT NULL,
  country_id INT NOT NULL,
  CONSTRAINT fk_state_country
    FOREIGN KEY (country_id) REFERENCES Country(country_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY uq_state_country (state_name, country_id),
  INDEX idx_state_country (country_id),
  INDEX idx_state_name (state_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE City (
  city_id   INT AUTO_INCREMENT PRIMARY KEY,
  city_name VARCHAR(255) NOT NULL,
  state_id  INT NOT NULL,
  CONSTRAINT fk_city_state
    FOREIGN KEY (state_id) REFERENCES State(state_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE KEY uq_city_state (city_name, state_id),
  INDEX idx_city_state (state_id),
  INDEX idx_city_name (city_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Address (
  address_id INT AUTO_INCREMENT PRIMARY KEY,
  address1   VARCHAR(255) NOT NULL,
  address2   VARCHAR(255) NULL,
  city_id    INT NOT NULL,
  zip_code   VARCHAR(20) NOT NULL,
  CONSTRAINT fk_address_city
    FOREIGN KEY (city_id) REFERENCES City(city_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_address_city (city_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Volunteer applications
-- ============================================================

CREATE TABLE Employee (
  employee_id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NULL,
  first_name          VARCHAR(50) NOT NULL,
  middle_name         VARCHAR(50) NULL,
  last_name           VARCHAR(50) NOT NULL,
  employee_type       ENUM('Paid','Not Paid') NULL,
  birth_date          DATE NULL,
  linkedin_url        VARCHAR(255) NULL UNIQUE,
  personal_email      VARCHAR(255) NOT NULL UNIQUE,
  phone               VARCHAR(20) NOT NULL UNIQUE,
  phonetype           ENUM('Mobile', 'Home', 'Work') NOT NULL,
  address_id          INT NOT NULL,
  country_id          INT NOT NULL,
  gender              ENUM('Male', 'Female', 'Non-binary', 'Prefer not to say') NOT NULL,
  opt_support         ENUM(
                        'Yes, the OPT period has started',
                        'Yes, approved but have not received the EAD card',
                        'No'
                      ) NOT NULL,
  start_date          DATE NOT NULL,
  hours_commitment    INT NOT NULL,
  why_kworks          TEXT NOT NULL,
  interested_role     VARCHAR(255) NULL,
  time_zone           VARCHAR(255) NULL,
  visa_status         VARCHAR(100) NOT NULL,
  application_status  VARCHAR(50) NOT NULL DEFAULT 'submitted',
  application_date    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  additional_websites VARCHAR(255) NULL,
  additional_info     TEXT NULL,
  CONSTRAINT fk_employee_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_employee_country
    FOREIGN KEY (country_id) REFERENCES Country(country_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_employee_address
    FOREIGN KEY (address_id) REFERENCES Address(address_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_employee_user (user_id),
  INDEX idx_employee_country (country_id),
  INDEX idx_employee_status (application_status),
  INDEX idx_employee_application_date (application_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Education (
  education_id     INT AUTO_INCREMENT PRIMARY KEY,
  employee_id      INT NOT NULL,
  institution_name VARCHAR(255) NOT NULL,
  degree           VARCHAR(255) NOT NULL,
  major            VARCHAR(255) NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NULL,
  CONSTRAINT fk_education_employee
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_education_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE Employment (
  employment_id    INT AUTO_INCREMENT PRIMARY KEY,
  employee_id      INT NOT NULL,
  company_name     VARCHAR(255) NOT NULL,
  job_title        VARCHAR(255) NOT NULL,
  location         VARCHAR(255) NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NULL,
  responsibilities TEXT NULL,
  CONSTRAINT fk_employment_employee
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_employment_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE EEOData (
  eeo_data_id        INT AUTO_INCREMENT PRIMARY KEY,
  employee_id        INT NOT NULL UNIQUE,
  sexual_orientation ENUM(
                        'Heterosexual',
                        'Homosexual',
                        'Bisexual',
                        'Asexual',
                        'Prefer not to say'
                      ) NOT NULL,
  disability         ENUM('Yes', 'No', 'Prefer not to say') NOT NULL,
  submission_date    DATETIME NOT NULL,
  CONSTRAINT fk_eeo_employee
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_eeo_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ApplicationStatusHistory (
  history_id          INT AUTO_INCREMENT PRIMARY KEY,
  employee_id         INT NOT NULL,
  previous_status     VARCHAR(50) NULL,
  new_status          VARCHAR(50) NOT NULL,
  note                TEXT NULL,
  forwarded_to        VARCHAR(255) NULL,
  action_label        VARCHAR(100) NULL,
  changed_by_user_id  INT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_status_history_employee
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_status_history_user
    FOREIGN KEY (changed_by_user_id) REFERENCES users(user_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_status_history_employee (employee_id),
  INDEX idx_status_history_status (new_status),
  INDEX idx_status_history_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Supported admin application workflow statuses
-- ============================================================
-- The backend controls valid transitions. The DB uses VARCHAR(50)
-- instead of ENUM so future workflow steps can be added without
-- risky ALTER TABLE enum migrations.
--
-- Current supported statuses:
--   submitted
--   under_review
--   forwarded
--   accepted
--   on_hold
--   declined
--   acceptance_email_sent
--   awaiting_intro_response

-- ============================================================
-- Seed countries for the applicant Home Country dropdown
-- ============================================================

INSERT INTO Country (country_name, country_code, country_code_phone) VALUES
('Afghanistan', 'AF', '+93'),
('Albania', 'AL', '+355'),
('Algeria', 'DZ', '+213'),
('American Samoa', 'AS', '+1684'),
('Angola', 'AO', '+244'),
('Anguilla', 'AI', '+1264'),
('Antigua and Barbuda', 'AG', '+1268'),
('Argentina', 'AR', '+54'),
('Armenia', 'AM', '+374'),
('Aruba', 'AW', '+297'),
('Australia', 'AU', '+61'),
('Austria', 'AT', '+43'),
('Azerbaijan', 'AZ', '+994'),
('Bahrain', 'BH', '+973'),
('Bangladesh', 'BD', '+880'),
('Barbados', 'BB', '+1246'),
('Belarus', 'BY', '+375'),
('Belgium', 'BE', '+32'),
('Belize', 'BZ', '+501'),
('Benin', 'BJ', '+229'),
('Bermuda', 'BM', '+1441'),
('Bhutan', 'BT', '+975'),
('Bolivia', 'BO', '+591'),
('Bosnia and Herzegovina', 'BA', '+387'),
('Botswana', 'BW', '+267'),
('Brazil', 'BR', '+55'),
('British Indian Ocean Territory', 'IO', '+246'),
('Brunei', 'BN', '+673'),
('Bulgaria', 'BG', '+359'),
('Burkina Faso', 'BF', '+226'),
('Burundi', 'BI', '+257'),
('Cambodia', 'KH', '+855'),
('Cameroon', 'CM', '+237'),
('Canada', 'CA', '+1'),
('Cape Verde', 'CV', '+238'),
('Cayman Islands', 'KY', '+1345'),
('Central African Republic', 'CF', '+236'),
('Chad', 'TD', '+235'),
('Chile', 'CL', '+56'),
('China', 'CN', '+86'),
('Christmas Island', 'CX', '+61'),
('Cocos (Keeling) Islands', 'CC', '+61'),
('Colombia', 'CO', '+57'),
('Comoros', 'KM', '+269'),
('Cook Islands', 'CK', '+682'),
('Costa Rica', 'CR', '+506'),
('Croatia', 'HR', '+385'),
('Cuba', 'CU', '+53'),
('Cyprus', 'CY', '+357'),
('Czech Republic', 'CZ', '+420'),
('Democratic Republic of the Congo', 'CD', '+243'),
('Denmark', 'DK', '+45'),
('Djibouti', 'DJ', '+253'),
('Dominica', 'DM', '+1767'),
('Dominican Republic', 'DO', '+1809'),
('East Timor', 'TL', '+670'),
('Ecuador', 'EC', '+593'),
('Egypt', 'EG', '+20'),
('El Salvador', 'SV', '+503'),
('Equatorial Guinea', 'GQ', '+240'),
('Eritrea', 'ER', '+291'),
('Estonia', 'EE', '+372'),
('Ethiopia', 'ET', '+251'),
('Falkland Islands', 'FK', '+500'),
('Faroe Islands', 'FO', '+298'),
('Federated States of Micronesia', 'FM', '+691'),
('Fiji', 'FJ', '+679'),
('Finland', 'FI', '+358'),
('France', 'FR', '+33'),
('French Guiana', 'GF', '+594'),
('French Polynesia', 'PF', '+689'),
('French Southern and Antarctic Lands', 'TF', '+'),
('Gabon', 'GA', '+241'),
('Georgia', 'GE', '+995'),
('Germany', 'DE', '+49'),
('Ghana', 'GH', '+233'),
('Gibraltar', 'GI', '+350'),
('Greece', 'GR', '+30'),
('Greenland', 'GL', '+299'),
('Grenada', 'GD', '+1473'),
('Guadeloupe', 'GP', '+590'),
('Guam', 'GU', '+1671'),
('Guatemala', 'GT', '+502'),
('Guernsey', 'GG', '+44'),
('Guinea', 'GN', '+224'),
('Guinea-Bissau', 'GW', '+245'),
('Guyana', 'GY', '+592'),
('Haiti', 'HT', '+509'),
('Heard Island and McDonald Islands', 'HM', '+'),
('Honduras', 'HN', '+504'),
('Hong Kong', 'HK', '+852'),
('Hungary', 'HU', '+36'),
('Iceland', 'IS', '+354'),
('India', 'IN', '+91'),
('Indonesia', 'ID', '+62'),
('Iran', 'IR', '+98'),
('Iraq', 'IQ', '+964'),
('Ireland', 'IE', '+353'),
('Isle of Man', 'IM', '+44'),
('Israel', 'IL', '+972'),
('Italy', 'IT', '+39'),
('Ivory Coast', 'CI', '+225'),
('Jamaica', 'JM', '+1876'),
('Japan', 'JP', '+81'),
('Jersey', 'JE', '+44'),
('Jordan', 'JO', '+962'),
('Kazakhstan', 'KZ', '+76'),
('Kenya', 'KE', '+254'),
('Kiribati', 'KI', '+686'),
('Kuwait', 'KW', '+965'),
('Kyrgyzstan', 'KG', '+996'),
('Laos', 'LA', '+856'),
('Latvia', 'LV', '+371'),
('Lebanon', 'LB', '+961'),
('Lesotho', 'LS', '+266'),
('Liberia', 'LR', '+231'),
('Libya', 'LY', '+218'),
('Liechtenstein', 'LI', '+423'),
('Lithuania', 'LT', '+370'),
('Luxembourg', 'LU', '+352'),
('Macau', 'MO', '+853'),
('Madagascar', 'MG', '+261'),
('Malawi', 'MW', '+265'),
('Malaysia', 'MY', '+60'),
('Maldives', 'MV', '+960'),
('Mali', 'ML', '+223'),
('Malta', 'MT', '+356'),
('Marshall Islands', 'MH', '+692'),
('Martinique', 'MQ', '+596'),
('Mauritania', 'MR', '+222'),
('Mauritius', 'MU', '+230'),
('Mayotte', 'YT', '+262'),
('Mexico', 'MX', '+52'),
('Moldova', 'MD', '+373'),
('Monaco', 'MC', '+377'),
('Mongolia', 'MN', '+976'),
('Montserrat', 'MS', '+1664'),
('Morocco', 'MA', '+212'),
('Mozambique', 'MZ', '+258'),
('Namibia', 'NA', '+264'),
('Nauru', 'NR', '+674'),
('Nepal', 'NP', '+977'),
('Netherlands', 'NL', '+31'),
('New Caledonia', 'NC', '+687'),
('New Zealand', 'NZ', '+64'),
('Nicaragua', 'NI', '+505'),
('Niger', 'NE', '+227'),
('Nigeria', 'NG', '+234'),
('Niue', 'NU', '+683'),
('Norfolk Island', 'NF', '+672'),
('North Korea', 'KP', '+850'),
('Northern Mariana Islands', 'MP', '+1670'),
('Norway', 'NO', '+47'),
('Oman', 'OM', '+968'),
('Pakistan', 'PK', '+92'),
('Palau', 'PW', '+680'),
('Panama', 'PA', '+507'),
('Papua New Guinea', 'PG', '+675'),
('Paraguay', 'PY', '+595'),
('Peru', 'PE', '+51'),
('Philippines', 'PH', '+63'),
('Pitcairn Islands', 'PN', '+64'),
('Poland', 'PL', '+48'),
('Portugal', 'PT', '+351'),
('Puerto Rico', 'PR', '+1787'),
('Qatar', 'QA', '+974'),
('Republic of Macedonia', 'MK', '+389'),
('Republic of the Congo', 'CG', '+242'),
('Romania', 'RO', '+40'),
('Russia', 'RU', '+7'),
('Rwanda', 'RW', '+250'),
('Réunion', 'RE', '+262'),
('Saint Helena', 'SH', '+290'),
('Saint Kitts and Nevis', 'KN', '+1869'),
('Saint Lucia', 'LC', '+1758'),
('Saint Pierre and Miquelon', 'PM', '+508'),
('Saint Vincent and the Grenadines', 'VC', '+1784'),
('Samoa', 'WS', '+685'),
('San Marino', 'SM', '+378'),
('Saudi Arabia', 'SA', '+966'),
('Senegal', 'SN', '+221'),
('Serbia', 'RS', '+381'),
('Seychelles', 'SC', '+248'),
('Sierra Leone', 'SL', '+232'),
('Singapore', 'SG', '+65'),
('Slovakia', 'SK', '+421'),
('Slovenia', 'SI', '+386'),
('Solomon Islands', 'SB', '+677'),
('Somalia', 'SO', '+252'),
('South Africa', 'ZA', '+27'),
('South Georgia', 'GS', '+500'),
('South Korea', 'KR', '+82'),
('South Sudan', 'SS', '+211'),
('Spain', 'ES', '+34'),
('Sri Lanka', 'LK', '+94'),
('Sudan', 'SD', '+249'),
('Suriname', 'SR', '+597'),
('Svalbard and Jan Mayen', 'SJ', '+4779'),
('Swaziland', 'SZ', '+268'),
('Sweden', 'SE', '+46'),
('Switzerland', 'CH', '+41'),
('Syria', 'SY', '+963'),
('São Tomé and Príncipe', 'ST', '+239'),
('Taiwan', 'TW', '+886'),
('Tajikistan', 'TJ', '+992'),
('Tanzania', 'TZ', '+255'),
('Thailand', 'TH', '+66'),
('The Bahamas', 'BS', '+1242'),
('The Gambia', 'GM', '+220'),
('Togo', 'TG', '+228'),
('Tokelau', 'TK', '+690'),
('Tonga', 'TO', '+676'),
('Trinidad and Tobago', 'TT', '+1868'),
('Tunisia', 'TN', '+216'),
('Turkey', 'TR', '+90'),
('Turkmenistan', 'TM', '+993'),
('Tuvalu', 'TV', '+688'),
('Uganda', 'UG', '+256'),
('Ukraine', 'UA', '+380'),
('United Arab Emirates', 'AE', '+971'),
('United Kingdom', 'GB', '+44'),
('United States', 'US', '+1'),
('Uruguay', 'UY', '+598'),
('Uzbekistan', 'UZ', '+998'),
('Vanuatu', 'VU', '+678'),
('Venezuela', 'VE', '+58'),
('Vietnam', 'VN', '+84'),
('Wallis and Futuna', 'WF', '+681'),
('Western Sahara', 'EH', '+212'),
('Yemen', 'YE', '+967'),
('Zambia', 'ZM', '+260'),
('Zimbabwe', 'ZW', '+263');

-- ============================================================
-- Seed states/provinces/regions for common applicant countries
-- ============================================================

INSERT INTO State (state_name, country_id)
SELECT src.state_name, c.country_id
FROM (
  SELECT 'Alabama' AS state_name
  UNION ALL SELECT 'Alaska'
  UNION ALL SELECT 'Arizona'
  UNION ALL SELECT 'Arkansas'
  UNION ALL SELECT 'California'
  UNION ALL SELECT 'Colorado'
  UNION ALL SELECT 'Connecticut'
  UNION ALL SELECT 'Delaware'
  UNION ALL SELECT 'District of Columbia'
  UNION ALL SELECT 'Florida'
  UNION ALL SELECT 'Georgia'
  UNION ALL SELECT 'Hawaii'
  UNION ALL SELECT 'Idaho'
  UNION ALL SELECT 'Illinois'
  UNION ALL SELECT 'Indiana'
  UNION ALL SELECT 'Iowa'
  UNION ALL SELECT 'Kansas'
  UNION ALL SELECT 'Kentucky'
  UNION ALL SELECT 'Louisiana'
  UNION ALL SELECT 'Maine'
  UNION ALL SELECT 'Maryland'
  UNION ALL SELECT 'Massachusetts'
  UNION ALL SELECT 'Michigan'
  UNION ALL SELECT 'Minnesota'
  UNION ALL SELECT 'Mississippi'
  UNION ALL SELECT 'Missouri'
  UNION ALL SELECT 'Montana'
  UNION ALL SELECT 'Nebraska'
  UNION ALL SELECT 'Nevada'
  UNION ALL SELECT 'New Hampshire'
  UNION ALL SELECT 'New Jersey'
  UNION ALL SELECT 'New Mexico'
  UNION ALL SELECT 'New York'
  UNION ALL SELECT 'North Carolina'
  UNION ALL SELECT 'North Dakota'
  UNION ALL SELECT 'Ohio'
  UNION ALL SELECT 'Oklahoma'
  UNION ALL SELECT 'Oregon'
  UNION ALL SELECT 'Pennsylvania'
  UNION ALL SELECT 'Rhode Island'
  UNION ALL SELECT 'South Carolina'
  UNION ALL SELECT 'South Dakota'
  UNION ALL SELECT 'Tennessee'
  UNION ALL SELECT 'Texas'
  UNION ALL SELECT 'Utah'
  UNION ALL SELECT 'Vermont'
  UNION ALL SELECT 'Virginia'
  UNION ALL SELECT 'Washington'
  UNION ALL SELECT 'West Virginia'
  UNION ALL SELECT 'Wisconsin'
  UNION ALL SELECT 'Wyoming'
) AS src
JOIN Country c ON c.country_code = 'US';

INSERT INTO State (state_name, country_id)
SELECT src.state_name, c.country_id
FROM (
  SELECT 'Alberta' AS state_name
  UNION ALL SELECT 'British Columbia'
  UNION ALL SELECT 'Manitoba'
  UNION ALL SELECT 'New Brunswick'
  UNION ALL SELECT 'Newfoundland and Labrador'
  UNION ALL SELECT 'Northwest Territories'
  UNION ALL SELECT 'Nova Scotia'
  UNION ALL SELECT 'Nunavut'
  UNION ALL SELECT 'Ontario'
  UNION ALL SELECT 'Prince Edward Island'
  UNION ALL SELECT 'Quebec'
  UNION ALL SELECT 'Saskatchewan'
  UNION ALL SELECT 'Yukon'
) AS src
JOIN Country c ON c.country_code = 'CA';

INSERT INTO State (state_name, country_id)
SELECT src.state_name, c.country_id
FROM (
  SELECT 'Andhra Pradesh' AS state_name
  UNION ALL SELECT 'Arunachal Pradesh'
  UNION ALL SELECT 'Assam'
  UNION ALL SELECT 'Bihar'
  UNION ALL SELECT 'Chhattisgarh'
  UNION ALL SELECT 'Goa'
  UNION ALL SELECT 'Gujarat'
  UNION ALL SELECT 'Haryana'
  UNION ALL SELECT 'Himachal Pradesh'
  UNION ALL SELECT 'Jharkhand'
  UNION ALL SELECT 'Karnataka'
  UNION ALL SELECT 'Kerala'
  UNION ALL SELECT 'Madhya Pradesh'
  UNION ALL SELECT 'Maharashtra'
  UNION ALL SELECT 'Manipur'
  UNION ALL SELECT 'Meghalaya'
  UNION ALL SELECT 'Mizoram'
  UNION ALL SELECT 'Nagaland'
  UNION ALL SELECT 'Odisha'
  UNION ALL SELECT 'Punjab'
  UNION ALL SELECT 'Rajasthan'
  UNION ALL SELECT 'Sikkim'
  UNION ALL SELECT 'Tamil Nadu'
  UNION ALL SELECT 'Telangana'
  UNION ALL SELECT 'Tripura'
  UNION ALL SELECT 'Uttar Pradesh'
  UNION ALL SELECT 'Uttarakhand'
  UNION ALL SELECT 'West Bengal'
  UNION ALL SELECT 'Andaman and Nicobar Islands'
  UNION ALL SELECT 'Chandigarh'
  UNION ALL SELECT 'Dadra and Nagar Haveli and Daman and Diu'
  UNION ALL SELECT 'Delhi'
  UNION ALL SELECT 'Jammu and Kashmir'
  UNION ALL SELECT 'Ladakh'
  UNION ALL SELECT 'Lakshadweep'
  UNION ALL SELECT 'Puducherry'
) AS src
JOIN Country c ON c.country_code = 'IN';

INSERT INTO State (state_name, country_id)
SELECT src.state_name, c.country_id
FROM (
  SELECT 'England' AS state_name
  UNION ALL SELECT 'Scotland'
  UNION ALL SELECT 'Wales'
  UNION ALL SELECT 'Northern Ireland'
) AS src
JOIN Country c ON c.country_code = 'GB';

INSERT INTO State (state_name, country_id)
SELECT src.state_name, c.country_id
FROM (
  SELECT 'Australian Capital Territory' AS state_name
  UNION ALL SELECT 'New South Wales'
  UNION ALL SELECT 'Northern Territory'
  UNION ALL SELECT 'Queensland'
  UNION ALL SELECT 'South Australia'
  UNION ALL SELECT 'Tasmania'
  UNION ALL SELECT 'Victoria'
  UNION ALL SELECT 'Western Australia'
) AS src
JOIN Country c ON c.country_code = 'AU';

-- For countries where we do not maintain a state/province list yet,
-- add one fallback state so the required State/Province dropdown works.
INSERT INTO State (state_name, country_id)
SELECT 'Not Applicable / Other', c.country_id
FROM Country c
WHERE NOT EXISTS (
  SELECT 1
  FROM State s
  WHERE s.country_id = c.country_id
);

-- Cities are intentionally not pre-seeded.
-- The frontend lets applicants type a city name, and the backend resolves
-- or creates the City row through POST /api/v1/locations/cities/resolve.

-- ============================================================
-- Setup verification output
-- ============================================================

SELECT
  (SELECT COUNT(*) FROM Country) AS countries_seeded,
  (SELECT COUNT(*) FROM State) AS states_seeded,
  (SELECT COUNT(*) FROM City) AS cities_seeded_initially,
  (SELECT COUNT(*) FROM users) AS users_after_reset,
  (SELECT COUNT(*) FROM Employee) AS applications_after_reset,
  (SELECT COUNT(*) FROM ApplicationStatusHistory) AS status_history_rows_after_reset;

SELECT 'Country dropdown check' AS check_name, country_id, country_name, country_code
FROM Country
WHERE country_code IN ('US', 'CA', 'IN', 'GB', 'AU')
ORDER BY country_name;

SELECT 'State dropdown check - US' AS check_name, COUNT(*) AS us_states_available
FROM State s
JOIN Country c ON c.country_id = s.country_id
WHERE c.country_code = 'US';

SELECT 'Fallback state check' AS check_name, COUNT(*) AS countries_with_fallback_state
FROM State
WHERE state_name = 'Not Applicable / Other';

SELECT 'KeelWorks professional MVP database reset complete.' AS status;
