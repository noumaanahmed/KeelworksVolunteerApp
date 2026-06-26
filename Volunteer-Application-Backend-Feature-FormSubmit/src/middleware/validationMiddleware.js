// validationMiddleware.js
import { body, param, query } from 'express-validator';

export const validateRequestBody = (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Request body is required',
            error: 'BAD_REQUEST'
        });
    }
    next();
};

export const employeeValidationRules = [
    // Personal Information
    body('first_name')
        .exists().withMessage('First name is required')
        .notEmpty().withMessage('First name cannot be empty')
        .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
        .matches(/^[A-Za-z\s]+$/).withMessage('First name can only contain letters and spaces')
        .trim(),

    body('middle_name')
        .optional()
        .isLength({ max: 50 }).withMessage('Middle name cannot exceed 50 characters')
        .matches(/^[A-Za-z\s]*$/).withMessage('Middle name can only contain letters and spaces')
        .trim(),

    body('last_name')
        .exists().withMessage('Last name is required')
        .notEmpty().withMessage('Last name cannot be empty')
        .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters')
        .matches(/^[A-Za-z\s]+$/).withMessage('Last name can only contain letters and spaces')
        .trim(),

    // Contact Information
    body('personal_email')
        .exists().withMessage('Email is required')
        .notEmpty().withMessage('Email cannot be empty')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
        .isLength({ max: 255 }).withMessage('Email cannot exceed 255 characters'),

    body('country_code')
        .exists().withMessage('Country code is required')
        .matches(/^\+\d{1,3}$/).withMessage('Country code must be in format +XX (e.g., +1, +91)'),

    body('phone')
        .exists().withMessage('Phone number is required')
        .matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),

    body('phonetype')
        .exists().withMessage('Phone type is required')
        .isIn(['Mobile', 'Home', 'Work']).withMessage('Phone type must be Mobile, Home, or Work'),
    body('visa_status')
    .exists().withMessage('Phone type is required')
    .isIn(['Citizen', 'Permanent Resident', 'Student Visa', 'Work Visa', 'Other'])
    .withMessage('Vista status must be Citizen, Permanent Resident, Student Visa,Work Visa or Other'),
    // Address Information
    body('address_line_1')
        .exists().withMessage('Address line 1 is required')
        .notEmpty().withMessage('Address line 1 cannot be empty')
        .isLength({ max: 255 }).withMessage('Address line 1 cannot exceed 255 characters')
        .matches(/^[a-zA-Z0-9\s,.-]+$/).withMessage('Address can only contain letters, numbers, and basic punctuation'),

    body('address_line_2')
        .optional()
        .isLength({ max: 255 }).withMessage('Address line 2 cannot exceed 255 characters')
        .matches(/^[a-zA-Z0-9\s,.-]*$/).withMessage('Address can only contain letters, numbers, and basic punctuation'),

    body('city_id')
        .exists().withMessage('City is required')
        .isInt().withMessage('City ID must be an integer'),

    body('state_id')
        .exists().withMessage('State is required')
        .isInt().withMessage('State ID must be an integer'),

    body('zipcode')
        .exists().withMessage('Zipcode is required')
        .matches(/^\d{5}(-\d{4})?$/).withMessage('Invalid zipcode format (must be 12345 or 12345-6789)'),

    body('country_id')
        .exists().withMessage('Country is required')
        .isInt().withMessage('Country ID must be an integer'),

    body('homecountry_id')
        .exists().withMessage('Home country is required')
        .isLength({ min: 2, max: 2 }).withMessage('Home country code must be exactly 2 characters')
        .isAlpha().withMessage('Home country code must contain only letters')
        .isUppercase().withMessage('Home country code must be uppercase'),

    body('time_zone')
        .exists().withMessage('Time zone is required')
        .matches(/^[A-Za-z_/+-]+$/).withMessage('Invalid time zone format'),

    // Education Information
    body('educations')
        .exists().withMessage('Education information is required')
        .isArray({ min: 1, max: 3 }).withMessage('Must provide between 1 and 3 education entries'),

    body('educations.*.institution_name')
        .exists().withMessage('Institution name is required')
        .notEmpty().withMessage('Institution name cannot be empty')
        .isLength({ max: 255 }).withMessage('Institution name cannot exceed 255 characters'),

    body('educations.*.degree')
        .exists().withMessage('Degree is required')
        .notEmpty().withMessage('Degree cannot be empty')
        .isLength({ max: 255 }).withMessage('Degree cannot exceed 255 characters'),

    body('educations.*.major')
        .exists().withMessage('Major is required')
        .notEmpty().withMessage('Major cannot be empty')
        .isLength({ max: 255 }).withMessage('Major cannot exceed 255 characters'),

    body('educations.*.start_date')
        .exists().withMessage('Education start date is required')
        .isISO8601().withMessage('Invalid start date format')
        .custom((value) => {
            if (new Date(value) > new Date()) {
                throw new Error('Start date cannot be in the future');
            }
            return true;
        }),

    body('educations.*.end_date')
        .optional()
        .isISO8601().withMessage('Invalid end date format')
        .custom((value, { req }) => {
            if (value && new Date(value) < new Date(req.body.start_date)) {
                throw new Error('End date cannot be before start date');
            }
            return true;
        }),

    // EEO Information
    body('sexual_orientation')
        .exists().withMessage('Sexual orientation is required')
        .isIn(['Heterosexual', 'Homosexual', 'Bisexual', 'Asexual', 'Prefer not to say'])
        .withMessage('Invalid sexual orientation option'),

    body('disability')
        .exists().withMessage('Disability information is required')
        .isIn(['Yes', 'No', 'Prefer not to say'])
        .withMessage('Invalid disability option'),

    body('gender')
        .exists().withMessage('Gender is required')
        .isIn(['Male', 'Female', 'Non-binary', 'Prefer not to say'])
        .withMessage('Invalid gender option')
];

// Pagination validation for GET requests
export const paginationValidationRules = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// ID parameter validation
export const idValidationRules = [
    param('id')
        .exists().withMessage('ID parameter is required')
        .isInt({ min: 1 }).withMessage('Invalid ID format')
];

// Validation result middleware
export const validate = validations => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Validation failed',
            errors: errors.array()
        });
    };
};