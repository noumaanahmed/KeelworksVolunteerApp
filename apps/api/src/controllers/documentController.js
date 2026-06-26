import { authorize } from '../config/googleDrive.js';
import { google } from 'googleapis';
import multer from 'multer';
import Employee from '../models/employeeModel.js';
import { Readable } from 'stream';
import validations from '../validators/legacy.validation.js';
import Resume from '../models/resumeModel.js';

const memoryStorage = multer.memoryStorage();
const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: async(req, file, cb) => {
         //Check if file extension is just pdf
         if (file.fieldname ==='resume' && file.mimetype !== 'application/pdf') {
             return cb(new Error(`Only PDF file are allowed for resume`), false);
         }
         if(file.fieldname ==='profileImage'){
            if(file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg'){
              return cb(new Error(`Only JPG, and JPEG file are allowed for profileImage`), false);
            }
         }
     cb(null, true);
 }
 }).fields([
    { name: 'profileImage', maxCount: 1 },  // OPTIONAL (Multer won't throw an error if missing)
    { name: 'resume', maxCount: 1 },   
]);

export const uploadDocument = async (req, res) => {

   let userId = req.user.id;
   try {
    validations.validatePrimaryId(userId, "User id");
   } catch (error) {
        return res.status(400).json({status:'Bad request',
            statusCode:400,
            message: null,
            data:null,
            error
        })
   }

   try {
       const auth = await authorize();
       const drive = google.drive({ version: 'v3', auth });
    
       const employee = await Employee.findByPk(userId);
       if (!employee) {
           return res.status(404).json({ status: 'error', message: 'Employee not found' });
       }

       upload(req, res, async (err) => {
           if (err?.code === 'LIMIT_FILE_SIZE') {
               return res.status(400).json({ status: 'error', message: 'File size exceeds 5MB' });
           }
           if (err?.code ==='LIMIT_UNEXPECTED_FILE') {
               return res.status(400).json({ status: 'error', message: `Field name for files can only be 'resume' or 'profileImage'` });
           }
           if(!req.files){
                return res.status(400).json({ status: 'error', message: 'No files selcted' });
            }
           if (!req.files?.resume) {
               return res.status(400).json({ status: 'error', message: 'Please upload resume' });
           }
           if (err?.message === 'Only PDF file are allowed for resume') {
            return res.status(400).json({ status: 'error', message: err.message });
            }
            
            if (err?.message === 'Only JPG, and JPEG file are allowed for profileImage') {
                return res.status(400).json({ status: 'error', message: err.message });
            }

            try {
               const folderName = `${userId}-${employee.first_name}-${employee.last_name}`;
               console.log("foldername" , folderName)
               
 // Check if folder exists
                const folderResponse = await drive.files.list({
                    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
                    fields: 'files(id, name)'
                });

                let folderId;
                if (folderResponse.data.files.length > 0) {
                    // Use existing folder
                    folderId = folderResponse.data.files[0].id;
                } else {
                    // Create new folder
                    const newFolder = await drive.files.create({
                        resource: {
                            name: folderName,
                            mimeType: 'application/vnd.google-apps.folder'
                        },
                        fields: 'id'
                    });
                 folderId = newFolder.data.id;
                }

               const uploadResults = [];
               const errors = [];
            //    console.log(req.files.resume);
               const files = []
               const {resume, profileImage } = req.files;

               files.push(resume[0]);
               if(profileImage){
                    files.push(profileImage[0]);
               }
               for (const file of files) {
                   try {
                    const bufferStream = new Readable();
                    bufferStream.push(file.buffer);
                    bufferStream.push(null);
                       const response = await drive.files.create({
                           resource: {
                               name: file.originalname,
                               parents: [folder.data.id]
                           },
                           media: {
                               mimeType: file.mimetype,
                               body: bufferStream
                           },
                           fields: 'id,name,webViewLink,size'
                       });

                       uploadResults.push({
                           fileId: response.data.id,
                           fileName: response.data.name,
                           viewLink: response.data.webViewLink,
                           size: response.data.size
                       });
                   } catch (error) {
                       errors.push({ fileName: file.originalname, error: error.message });
                   }
               }
               if(errors.length >0){
                    throw {message: 'Error while uploading file'};
               }
               const folderUrl = `https://drive.google.com/drive/folders/${folder.data.id}`;
               if(profileImage){
                await Employee.update(
                    { profile_pic_url:folderUrl},
                    { where: { employee_id: userId }}
                );
               }
               
               await Resume.create({
                employee_id: userId,
                resume_url: folderUrl
               });
               res.status(200).json({
                   status: 'success',
                   statusCode:'200',
                   message:'Documents successfully uploaded',
                   error:null,
                   data:null,
                //    data: {
                //        folderUrl,
                //        successfulUploads: uploadResults,
                //        failedUploads: errors
                //    }
               });
           } catch (error) {
               res.status(500).json({ status: 'error', message: 'Drive upload failed', error: error.message });
           }
       });
   } catch (error) {
       res.status(500).json({ status: 'error', message: error.message });
   }
};