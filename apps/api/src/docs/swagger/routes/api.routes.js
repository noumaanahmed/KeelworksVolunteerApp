// src/docs/swagger/routes/api.routes.js
/**
* @swagger
* /countries:
*   get:
*     summary: Get all countries
*     tags: [Location]
*     responses:
*       200:
*         description: List of all countries
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 status:
*                   type: string
*                   example: Success
*                 statusCode:
*                   type: number
*                   example: 200
*                 data:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       country_id:
*                         type: number
*                       country_name:
*                         type: string
*                       country_code:
*                         type: string
* 
* /states/{countryCode}:
*   get:
*     summary: Get states by country code
*     tags: [Location]
*     parameters:
*       - in: path
*         name: countryCode
*         required: true
*         schema:
*           type: string
*         example: US
*     responses:
*       200:
*         description: List of states for given country
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 status:
*                   type: string
*                 statusCode:
*                   type: number
*                 data:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       state_id:
*                         type: number
*                       state_name:
*                         type: string
*                       state_code:
*                         type: string
*                       country_code:
*                         type: string
* 
* /cities/{stateCode}:
*   get:
*     summary: Get cities by state code
*     tags: [Location]
*     parameters:
*       - in: path
*         name: stateCode
*         required: true
*         schema:
*           type: string
*         example: CA
*     responses:
*       200:
*         description: List of cities in state
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 status:
*                   type: string
*                 statusCode:
*                   type: number
*                 data:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       city_id:
*                         type: number
*                       city_name:
*                         type: string
*                       state_code:
*                         type: string
* 
* /countryPhoneCodes:
*   get:
*     summary: Get all country phone codes
*     tags: [Location]
*     responses:
*       200:
*         description: List of country phone codes
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 status:
*                   type: string
*                 statusCode:
*                   type: number
*                 data:
*                   type: array
*                   items:
*                     type: object
*                     properties:
*                       country_id:
*                         type: number
*                       country_name:
*                         type: string
*                       country_code_phone:
*                         type: string
* 
* /employees:
*   post:
*     summary: Create a new employee
*     tags: [Employee]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - first_name
*               - last_name
*               - birth_date
*               - personal_email
*             properties:
*               first_name:
*                 type: string
*               middle_name:
*                 type: string
*               last_name:
*                 type: string
*               birth_date:
*                 type: string
*                 format: date
*               linkedin_url:
*                 type: string
*               personal_email:
*                 type: string
*                 format: email
*               educations:
*                 type: array
*                 items:
*                   type: object
*                   properties:
*                     institution_name:
*                       type: string
*                     degree:
*                       type: string
*                     major:
*                       type: string
*                     start_date:
*                       type: string
*                       format: date
*                     end_date:
*                       type: string
*                       format: date
*               employments:
*                 type: array
*                 items:
*                   type: object
*                   properties:
*                     company_name:
*                       type: string
*                     job_title:
*                       type: string
*                     location:
*                       type: string
*                     start_date:
*                       type: string
*                       format: date
*                     end_date:
*                       type: string
*                       format: date
*                     responsibilities:
*                       type: string
*     responses:
*       201:
*         description: Employee created successfully
*       400:
*         description: Bad request
* 
* /upload:
*   post:
*     summary: Upload documents
*     tags: [Documents]
*     requestBody:
*       content:
*         multipart/form-data:
*           schema:
*             type: object
*             properties:
*               documents:
*                 type: array
*                 items:
*                   type: string
*                   format: binary
*     responses:
*       200:
*         description: Files uploaded successfully
*       400:
*         description: Upload failed
*/