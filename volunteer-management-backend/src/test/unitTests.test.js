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

// Mock Response Object
const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};

// Mock Next Function (for middleware/error handling)
const mockNext = jest.fn();

describe('Unit Tests for ApplyController', () => {
  it('should return a list of countries', async () => {
    const mockReq = {};
    await getCountries(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ countries: expect.any(Array) }));
  });

  it('should return a list of states for a valid country code', async () => {
    const mockReq = { params: { countryCode: 'US' } };
    await getStates(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ states: expect.any(Array) }));
  });

  it('should return a list of cities for a valid state code', async () => {
    const mockReq = { params: { stateCode: 'CA' } };
    await getCities(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ cities: expect.any(Array) }));
  });

  it('should return a list of visa types', async () => {
    const mockReq = {};
    await getVisaType(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ visaTypes: expect.any(Array) }));
  });

  it('should return a list of country phone codes', async () => {
    const mockReq = {};
    await getCountryCodes(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ countryPhoneCodes: expect.any(Array) }));
  });

  it('should process and submit an application form', async () => {
    const mockReq = {
      body: { name: 'John Doe', email: 'john.doe@example.com' },
    };
    await postApplicationForm(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Application submitted successfully' }));
  });

  it('should upload a resume', async () => {
    const mockReq = { body: { file: 'resume.pdf' } };
    await postResume(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Resume uploaded successfully' }));
  });

  it('should upload a profile picture', async () => {
    const mockReq = { body: { file: 'profile_pic.jpg' } };
    await postProfilPic(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Profile picture uploaded successfully' }));
  });
});

describe('Unit Tests for EmployeeController', () => {
  it('should create a new employee', async () => {
    const mockReq = {
      body: { name: 'Jane Doe', role: 'Developer' },
    };
    await createEmployee(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee created successfully' }));
  });

  it('should return a list of all employees', async () => {
    const mockReq = {};
    await getAllEmployees(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ employees: expect.any(Array) }));
  });

  it('should return an employee by ID', async () => {
    const mockReq = { params: { id: '1' } };
    await getEmployeeById(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ employee: expect.any(Object) }));
  });

  it('should update an employee by ID', async () => {
    const mockReq = {
      params: { id: '1' },
      body: { role: 'Manager' },
    };
    await updateEmployee(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee updated successfully' }));
  });

  it('should delete an employee by ID', async () => {
    const mockReq = { params: { id: '1' } };
    await deleteEmployee(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee deleted successfully' }));
  });
});
