-- ============================================================
-- RUN THIS ENTIRE FILE IN MYSQL WORKBENCH (click Execute ⚡)
-- It safely creates/updates everything without deleting existing data.
-- ============================================================

USE volunteer_management;

-- 1. Users table (for Sign In / Sign Up)
CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'applicant') NOT NULL DEFAULT 'applicant',
  full_name     VARCHAR(100) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Core location/employee tables (safe if already created)
CREATE TABLE IF NOT EXISTS Country (
    country_id INT AUTO_INCREMENT PRIMARY KEY,
    country_name VARCHAR(255) NOT NULL UNIQUE,
    country_code VARCHAR(2) NOT NULL UNIQUE,
    country_code_phone VARCHAR(5) NOT NULL,
    INDEX (country_code_phone)
);

CREATE TABLE IF NOT EXISTS State (
    state_id INT AUTO_INCREMENT PRIMARY KEY,
    state_name VARCHAR(255) NOT NULL,
    country_id INT NOT NULL,
    FOREIGN KEY (country_id) REFERENCES Country(country_id),
    UNIQUE KEY (state_name, country_id)
);

CREATE TABLE IF NOT EXISTS City (
    city_id INT AUTO_INCREMENT PRIMARY KEY,
    city_name VARCHAR(255) NOT NULL,
    state_id INT NOT NULL,
    FOREIGN KEY (state_id) REFERENCES State(state_id),
    UNIQUE KEY (city_name, state_id)
);

CREATE TABLE IF NOT EXISTS Address (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    city_id INT NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    FOREIGN KEY (city_id) REFERENCES City(city_id)
);

CREATE TABLE IF NOT EXISTS Employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    profile_pic_url VARCHAR(255),
    first_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    last_name VARCHAR(50) NOT NULL,
    employee_type ENUM('Paid','Not Paid'),
    birth_date DATE NULL,
    linkedin_url VARCHAR(255) UNIQUE,
    personal_email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    phonetype ENUM('Mobile', 'Home', 'Work') NOT NULL,
    address_id INT,
    country_id INT,
    gender ENUM('Male', 'Female', 'Non-binary', 'Prefer not to say'),
    opt_support ENUM('Yes, the OPT period has started','Yes, approved but have not received the EAD card','No'),
    start_date DATE,
    hours_commitment INT,
    why_kworks TEXT,
    time_zone VARCHAR(255),
    visa_status VARCHAR(100),
    application_status ENUM('Pending', 'Reviewing', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    application_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    additional_websites VARCHAR(255),
    additional_info TEXT,
    FOREIGN KEY (country_id) REFERENCES Country(country_id),
    FOREIGN KEY (address_id) REFERENCES Address(address_id)
);

-- If the Employee table already existed from before, make sure the columns
-- are the right type/nullability (safe to re-run, harmless if already correct)
ALTER TABLE Employee MODIFY COLUMN visa_status VARCHAR(100) NOT NULL;
ALTER TABLE Employee MODIFY COLUMN birth_date DATE NULL;

CREATE TABLE IF NOT EXISTS Employment (
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

CREATE TABLE IF NOT EXISTS Education (
    education_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    institution_name VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    major VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

CREATE TABLE IF NOT EXISTS Resume (
    resume_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE,
    resume_url VARCHAR(255) NOT NULL,
    upload_date DATETIME NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

CREATE TABLE IF NOT EXISTS Role (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS EEOData (
    eeo_data_id INT AUTO_INCREMENT PRIMARY KEY,
    sexual_orientation ENUM('Heterosexual', 'Homosexual', 'Bisexual', 'Asexual', 'Prefer not to say'),
    disability ENUM('Yes', 'No', 'Prefer not to say'),
    submission_date DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS application_status_history (
    status_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    status ENUM('Pending', 'Reviewing', 'Approved', 'Rejected') DEFAULT 'Pending',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id)
);

-- 3. All 195 countries
INSERT IGNORE INTO Country (country_name, country_code, country_code_phone) VALUES
('Afghanistan', 'AF', '+93'),('Albania', 'AL', '+355'),('Algeria', 'DZ', '+213'),
('Andorra', 'AD', '+376'),('Angola', 'AO', '+244'),('Argentina', 'AR', '+54'),
('Armenia', 'AM', '+374'),('Australia', 'AU', '+61'),('Austria', 'AT', '+43'),
('Azerbaijan', 'AZ', '+994'),('Bahamas', 'BS', '+1'),('Bahrain', 'BH', '+973'),
('Bangladesh', 'BD', '+880'),('Belarus', 'BY', '+375'),('Belgium', 'BE', '+32'),
('Belize', 'BZ', '+501'),('Benin', 'BJ', '+229'),('Bhutan', 'BT', '+975'),
('Bolivia', 'BO', '+591'),('Bosnia and Herzegovina', 'BA', '+387'),('Botswana', 'BW', '+267'),
('Brazil', 'BR', '+55'),('Brunei', 'BN', '+673'),('Bulgaria', 'BG', '+359'),
('Burkina Faso', 'BF', '+226'),('Burundi', 'BI', '+257'),('Cambodia', 'KH', '+855'),
('Cameroon', 'CM', '+237'),('Canada', 'CA', '+1'),('Cape Verde', 'CV', '+238'),
('Central African Republic', 'CF', '+236'),('Chad', 'TD', '+235'),('Chile', 'CL', '+56'),
('China', 'CN', '+86'),('Colombia', 'CO', '+57'),('Comoros', 'KM', '+269'),
('Congo', 'CG', '+242'),('Costa Rica', 'CR', '+506'),('Croatia', 'HR', '+385'),
('Cuba', 'CU', '+53'),('Cyprus', 'CY', '+357'),('Czech Republic', 'CZ', '+420'),
('Denmark', 'DK', '+45'),('Djibouti', 'DJ', '+253'),('Dominican Republic', 'DO', '+1'),
('Ecuador', 'EC', '+593'),('Egypt', 'EG', '+20'),('El Salvador', 'SV', '+503'),
('Equatorial Guinea', 'GQ', '+240'),('Eritrea', 'ER', '+291'),('Estonia', 'EE', '+372'),
('Eswatini', 'SZ', '+268'),('Ethiopia', 'ET', '+251'),('Fiji', 'FJ', '+679'),
('Finland', 'FI', '+358'),('France', 'FR', '+33'),('Gabon', 'GA', '+241'),
('Gambia', 'GM', '+220'),('Georgia', 'GE', '+995'),('Germany', 'DE', '+49'),
('Ghana', 'GH', '+233'),('Greece', 'GR', '+30'),('Guatemala', 'GT', '+502'),
('Guinea', 'GN', '+224'),('Guinea-Bissau', 'GW', '+245'),('Guyana', 'GY', '+592'),
('Haiti', 'HT', '+509'),('Honduras', 'HN', '+504'),('Hungary', 'HU', '+36'),
('Iceland', 'IS', '+354'),('India', 'IN', '+91'),('Indonesia', 'ID', '+62'),
('Iran', 'IR', '+98'),('Iraq', 'IQ', '+964'),('Ireland', 'IE', '+353'),
('Israel', 'IL', '+972'),('Italy', 'IT', '+39'),('Jamaica', 'JM', '+1'),
('Japan', 'JP', '+81'),('Jordan', 'JO', '+962'),('Kazakhstan', 'KZ', '+7'),
('Kenya', 'KE', '+254'),('Kuwait', 'KW', '+965'),('Kyrgyzstan', 'KG', '+996'),
('Laos', 'LA', '+856'),('Latvia', 'LV', '+371'),('Lebanon', 'LB', '+961'),
('Lesotho', 'LS', '+266'),('Liberia', 'LR', '+231'),('Libya', 'LY', '+218'),
('Liechtenstein', 'LI', '+423'),('Lithuania', 'LT', '+370'),('Luxembourg', 'LU', '+352'),
('Madagascar', 'MG', '+261'),('Malawi', 'MW', '+265'),('Malaysia', 'MY', '+60'),
('Maldives', 'MV', '+960'),('Mali', 'ML', '+223'),('Malta', 'MT', '+356'),
('Mauritania', 'MR', '+222'),('Mauritius', 'MU', '+230'),('Mexico', 'MX', '+52'),
('Moldova', 'MD', '+373'),('Monaco', 'MC', '+377'),('Mongolia', 'MN', '+976'),
('Montenegro', 'ME', '+382'),('Morocco', 'MA', '+212'),('Mozambique', 'MZ', '+258'),
('Myanmar', 'MM', '+95'),('Namibia', 'NA', '+264'),('Nepal', 'NP', '+977'),
('Netherlands', 'NL', '+31'),('New Zealand', 'NZ', '+64'),('Nicaragua', 'NI', '+505'),
('Niger', 'NE', '+227'),('Nigeria', 'NG', '+234'),('North Korea', 'KP', '+850'),
('North Macedonia', 'MK', '+389'),('Norway', 'NO', '+47'),('Oman', 'OM', '+968'),
('Pakistan', 'PK', '+92'),('Palestine', 'PS', '+970'),('Panama', 'PA', '+507'),
('Papua New Guinea', 'PG', '+675'),('Paraguay', 'PY', '+595'),('Peru', 'PE', '+51'),
('Philippines', 'PH', '+63'),('Poland', 'PL', '+48'),('Portugal', 'PT', '+351'),
('Qatar', 'QA', '+974'),('Romania', 'RO', '+40'),('Russia', 'RU', '+7'),
('Rwanda', 'RW', '+250'),('Saudi Arabia', 'SA', '+966'),('Senegal', 'SN', '+221'),
('Serbia', 'RS', '+381'),('Sierra Leone', 'SL', '+232'),('Singapore', 'SG', '+65'),
('Slovakia', 'SK', '+421'),('Slovenia', 'SI', '+386'),('Somalia', 'SO', '+252'),
('South Africa', 'ZA', '+27'),('South Korea', 'KR', '+82'),('South Sudan', 'SS', '+211'),
('Spain', 'ES', '+34'),('Sri Lanka', 'LK', '+94'),('Sudan', 'SD', '+249'),
('Suriname', 'SR', '+597'),('Sweden', 'SE', '+46'),('Switzerland', 'CH', '+41'),
('Syria', 'SY', '+963'),('Taiwan', 'TW', '+886'),('Tajikistan', 'TJ', '+992'),
('Tanzania', 'TZ', '+255'),('Thailand', 'TH', '+66'),('Timor-Leste', 'TL', '+670'),
('Togo', 'TG', '+228'),('Trinidad and Tobago', 'TT', '+1'),('Tunisia', 'TN', '+216'),
('Turkey', 'TR', '+90'),('Turkmenistan', 'TM', '+993'),('Uganda', 'UG', '+256'),
('Ukraine', 'UA', '+380'),('United Arab Emirates', 'AE', '+971'),('United Kingdom', 'GB', '+44'),
('United States', 'US', '+1'),('Uruguay', 'UY', '+598'),('Uzbekistan', 'UZ', '+998'),
('Venezuela', 'VE', '+58'),('Vietnam', 'VN', '+84'),('Yemen', 'YE', '+967'),
('Zambia', 'ZM', '+260'),('Zimbabwe', 'ZW', '+263');

-- 4. US States
INSERT IGNORE INTO State (state_name, country_id)
SELECT s.name, c.country_id FROM (
  SELECT 'Alabama' name UNION SELECT 'Alaska' UNION SELECT 'Arizona' UNION SELECT 'Arkansas' UNION SELECT 'California'
  UNION SELECT 'Colorado' UNION SELECT 'Connecticut' UNION SELECT 'Delaware' UNION SELECT 'Florida' UNION SELECT 'Georgia'
  UNION SELECT 'Hawaii' UNION SELECT 'Idaho' UNION SELECT 'Illinois' UNION SELECT 'Indiana' UNION SELECT 'Iowa'
  UNION SELECT 'Kansas' UNION SELECT 'Kentucky' UNION SELECT 'Louisiana' UNION SELECT 'Maine' UNION SELECT 'Maryland'
  UNION SELECT 'Massachusetts' UNION SELECT 'Michigan' UNION SELECT 'Minnesota' UNION SELECT 'Mississippi' UNION SELECT 'Missouri'
  UNION SELECT 'Montana' UNION SELECT 'Nebraska' UNION SELECT 'Nevada' UNION SELECT 'New Hampshire' UNION SELECT 'New Jersey'
  UNION SELECT 'New Mexico' UNION SELECT 'New York' UNION SELECT 'North Carolina' UNION SELECT 'North Dakota' UNION SELECT 'Ohio'
  UNION SELECT 'Oklahoma' UNION SELECT 'Oregon' UNION SELECT 'Pennsylvania' UNION SELECT 'Rhode Island' UNION SELECT 'South Carolina'
  UNION SELECT 'South Dakota' UNION SELECT 'Tennessee' UNION SELECT 'Texas' UNION SELECT 'Utah' UNION SELECT 'Vermont'
  UNION SELECT 'Virginia' UNION SELECT 'Washington' UNION SELECT 'West Virginia' UNION SELECT 'Wisconsin' UNION SELECT 'Wyoming'
) s
CROSS JOIN (SELECT country_id FROM Country WHERE country_code = 'US') c;

-- 5. Canadian provinces, Indian states, UK regions, Australian states
INSERT IGNORE INTO State (state_name, country_id)
SELECT s.name, c.country_id FROM (
  SELECT 'Alberta' name UNION SELECT 'British Columbia' UNION SELECT 'Manitoba' UNION SELECT 'New Brunswick'
  UNION SELECT 'Newfoundland and Labrador' UNION SELECT 'Northwest Territories' UNION SELECT 'Nova Scotia'
  UNION SELECT 'Nunavut' UNION SELECT 'Ontario' UNION SELECT 'Prince Edward Island' UNION SELECT 'Quebec'
  UNION SELECT 'Saskatchewan' UNION SELECT 'Yukon'
) s
CROSS JOIN (SELECT country_id FROM Country WHERE country_code = 'CA') c;

INSERT IGNORE INTO State (state_name, country_id)
SELECT s.name, c.country_id FROM (
  SELECT 'Andhra Pradesh' name UNION SELECT 'Arunachal Pradesh' UNION SELECT 'Assam' UNION SELECT 'Bihar'
  UNION SELECT 'Chhattisgarh' UNION SELECT 'Goa' UNION SELECT 'Gujarat' UNION SELECT 'Haryana' UNION SELECT 'Himachal Pradesh'
  UNION SELECT 'Jharkhand' UNION SELECT 'Karnataka' UNION SELECT 'Kerala' UNION SELECT 'Madhya Pradesh' UNION SELECT 'Maharashtra'
  UNION SELECT 'Manipur' UNION SELECT 'Meghalaya' UNION SELECT 'Mizoram' UNION SELECT 'Nagaland' UNION SELECT 'Odisha'
  UNION SELECT 'Punjab' UNION SELECT 'Rajasthan' UNION SELECT 'Sikkim' UNION SELECT 'Tamil Nadu' UNION SELECT 'Telangana'
  UNION SELECT 'Tripura' UNION SELECT 'Uttar Pradesh' UNION SELECT 'Uttarakhand' UNION SELECT 'West Bengal' UNION SELECT 'Delhi'
) s
CROSS JOIN (SELECT country_id FROM Country WHERE country_code = 'IN') c;

INSERT IGNORE INTO State (state_name, country_id)
SELECT s.name, c.country_id FROM (
  SELECT 'England' name UNION SELECT 'Scotland' UNION SELECT 'Wales' UNION SELECT 'Northern Ireland'
) s
CROSS JOIN (SELECT country_id FROM Country WHERE country_code = 'GB') c;

INSERT IGNORE INTO State (state_name, country_id)
SELECT s.name, c.country_id FROM (
  SELECT 'New South Wales' name UNION SELECT 'Victoria' UNION SELECT 'Queensland' UNION SELECT 'Western Australia'
  UNION SELECT 'South Australia' UNION SELECT 'Tasmania' UNION SELECT 'Australian Capital Territory' UNION SELECT 'Northern Territory'
) s
CROSS JOIN (SELECT country_id FROM Country WHERE country_code = 'AU') c;

SELECT CONCAT('Setup complete! Countries: ', (SELECT COUNT(*) FROM Country), ', States: ', (SELECT COUNT(*) FROM State)) AS status;
