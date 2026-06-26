import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateToken = (userd) => {
    return jwt.sign(
        { id: userd },  // Payload (User Data)
        process.env.JWT_SECRET,
        { expiresIn: '5m' } //This token will expire in 5 minute;
    );
};


export const verifyJWT = (token)=>{
     let decoded = undefined
      jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err || data.exp<=Math.floor(Date.now() / 1000)) {
          throw "Please provide valid token"
        }
        decoded = data;
        }
    );
    return decoded
}

