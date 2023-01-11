import ENV from "../config.js";
import jwt from "jsonwebtoken";

//auth middleware
export default async function Auth(req,res,next){
    try{
        //access autherize header to validate request
        const token=req.header.authorization.split(" ")[1];

        //retrieve the user details for the logged in user
        const decodedToken=await jwt.verify(token,ENV.JWT_SECRET);

        req.user=decodedToken;
        //req.json(decodedToken);
        next();          
    }catch(error){
        res.status(401).json({error:"Autherization Failed"});
    }
}

export function localVariables(req,res,next){

    req.app.locals={
        OTP:null,
        resetSession:false
    }

    next()
}
