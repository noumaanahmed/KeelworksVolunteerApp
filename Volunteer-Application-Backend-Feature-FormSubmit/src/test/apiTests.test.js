// Import necessary modules
import request from 'supertest';
import app from '../index.js'; // Import the Express app
import {
  getCountries,
  getStates,
  getCities,
  getVisaType,
  getCountryCodes,
  postApplicationForm,
  postResume,
  postProfilPic,
} from '../controllers/applyController.js';

import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employeeController.js';

// API Tests
describe('API Endpoints Tests', () => {
  // Test GET /countries
  it('should fetch the list of countries', async () => {
    const response = await request(app).get('/api/v1/apply/countries');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('countries');
  });

  // Test GET /states/:countryCode
  it('should fetch states for a given country code', async () => {
    const response = await request(app).get('/api/v1/apply/states/US');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('states');
  });

  // Test GET /cities/:stateCode
  it('should fetch cities for a given state code', async () => {
    const response = await request(app).get('/api/v1/apply/cities/CA');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('cities');
  });

  // Test GET /visatype
  it('should fetch visa types', async () => {
    const response = await request(app).get('/api/v1/apply/visatype');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('visaTypes');
  });

  // Test GET /countryPhoneCodes
  it('should fetch country phone codes', async () => {
    const response = await request(app).get('/api/v1/apply/countryPhoneCodes');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('countryPhoneCodes');
  });

  // Test POST /applicationForm
  it('should submit an application form', async () => {
    const applicationData = { name: 'John Doe', email: 'john.doe@example.com' };
    const response = await request(app).post('/api/v1/apply/applicationForm').send(applicationData);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Application submitted successfully');
  });

  // Test POST /resume
  it('should upload a resume', async () => {
    const resumeData = { file: 'sample_resume.pdf' };
    const response = await request(app).post('/api/v1/apply/resume').send(resumeData);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Resume uploaded successfully');
  });

  // Test POST /profilePic
  it('should upload a profile picture', async () => {
    const profilePicData = { file: 'profile_pic.jpg' };
    const response = await request(app).post('/api/v1/apply/profilePic').send(profilePicData);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Profile picture uploaded successfully');
  });

  // Employee Management Tests
  it('should create an employee', async () => {
    const employeeData = { name: 'Jane Doe', role: 'Engineer' };
    const response = await request(app).post('/api/v1/apply/employees').send(employeeData);
    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Employee created successfully');
  });

  it('should fetch all employees', async () => {
    const response = await request(app).get('/api/v1/apply/employees');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('employees');
  });

  it('should fetch an employee by ID', async () => {
    const response = await request(app).get('/api/v1/apply/employees/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('employee');
  });

  it('should update an employee by ID', async () => {
    const updateData = { role: 'Senior Engineer' };
    const response = await request(app).put('/api/v1/apply/employees/1').send(updateData);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Employee updated successfully');
  });

  it('should delete an employee by ID', async () => {
    const response = await request(app).delete('/api/v1/apply/employees/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Employee deleted successfully');
  });
});

// Unit Tests for Controllers
describe('Unit Tests for Controllers', () => {
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  it('should return a list of countries', async () => {
    const mockReq = {};
    await getCountries(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ countries: expect.any(Array) }));
  });

  it('should return a list of states', async () => {
    const mockReq = { params: { countryCode: 'US' } };
    await getStates(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ states: expect.any(Array) }));
  });

  
});
