import { User } from "../models/index.js";

export const findUserByEmail = (email) => User.findOne({ where: { email } });

export const findActiveUserByEmail = (email) => User.findOne({ where: { email, is_active: true } });

export const findUserById = (userId, options = {}) => User.findByPk(userId, options);

export const createUser = (userData) => User.create(userData);
