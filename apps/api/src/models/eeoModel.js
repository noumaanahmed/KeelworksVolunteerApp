import { DataTypes } from 'sequelize';
import {dbInstance} from '../config/dbConnect.js'; 

const EEOData = dbInstance.define('EEOData', {
    eeo_data_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sexual_orientation: {
        type: DataTypes.ENUM('Heterosexual', 'Homosexual', 'Bisexual', 'Asexual', 'Prefer not to say'),
        allowNull: false
    },
    disability: {
        type: DataTypes.ENUM('Yes', 'No', 'Prefer not to say'),
        allowNull: false
    },
    submission_date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'EEOData',
    timestamps: false // Disable automatic timestamp fields createdAt and updatedAt
});

export default EEOData;