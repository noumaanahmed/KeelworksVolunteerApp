import "dotenv/config";
import { Sequelize } from 'sequelize';

const dbInstance = new Sequelize(process.env.MYSQL_DB_NAME, process.env.MYSQL_USERNAME , process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  dialect: 'mysql',
});


const testConnection = async () => {
      await dbInstance.authenticate();
      console.log('Database connection has been established successfully.');
};
  
  
export { dbInstance, testConnection};