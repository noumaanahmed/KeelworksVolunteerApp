const request = require('supertest');
const app = require('/mnt/c/Users/Nikita/Downloads/API'); // Adjust the path to your main app file

describe('Volunteer API', () => {
  // Test GET all volunteers
  test('GET /api/volunteers', async () => {
    const response = await request(app).get('/api/volunteers');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  // Test POST new volunteer
  test('POST /api/volunteers', async () => {
    const newVolunteer = {
      name: 'John Doe',
      email: 'john@example.com',
      skills: ['coding', 'teaching']
    };
    const response = await request(app)
      .post('/api/volunteers')
      .send(newVolunteer);
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  // Test GET single volunteer
  test('GET /api/volunteers/:id', async () => {
    const volunteer = await request(app)
      .post('/api/volunteers')
      .send({ name: 'Jane Doe', email: 'jane@example.com' });
    const response = await request(app).get(`/api/volunteers/${volunteer.body.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Jane Doe');
  });

  // Test PUT update volunteer
  test('PUT /api/volunteers/:id', async () => {
    const volunteer = await request(app)
      .post('/api/volunteers')
      .send({ name: 'Bob Smith', email: 'bob@example.com' });
    const response = await request(app)
      .put(`/api/volunteers/${volunteer.body.id}`)
      .send({ name: 'Robert Smith' });
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Robert Smith');
  });

  // Test DELETE volunteer
  test('DELETE /api/volunteers/:id', async () => {
    const volunteer = await request(app)
      .post('/api/volunteers')
      .send({ name: 'Alice Johnson', email: 'alice@example.com' });
    const response = await request(app).delete(`/api/volunteers/${volunteer.body.id}`);
    expect(response.statusCode).toBe(204);
  });
});
