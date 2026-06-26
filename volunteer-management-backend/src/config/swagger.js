import swaggerJSDoc from 'swagger-jsdoc';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Volunteer Application API',
      version: '1.0.0',
      description: 'API documentation for Volunteer Management System'
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1/apply',
        description: 'Development server'
      }
    ]
  },
  apis: [
    join(__dirname, '../routes/*.js'),         // Main route files
    join(__dirname, '../models/*.js'),         // Model files
    join(__dirname, '../controllers/*.js'),    // Controller files
    join(__dirname, '../docs/**/*.js')         // Swagger docs
  ]
};

const swaggerSpec = swaggerJSDoc(options);


export default swaggerSpec;