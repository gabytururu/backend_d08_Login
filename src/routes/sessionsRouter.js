import { Router } from 'express';
export const router=Router();
import { SessionsManagerMONGO as SessionsManager } from '../dao/sessionsManagerMONGO.js';
import { hashPassword } from '../utils.js';

const sessionsManager = new SessionsManager()

router.post('/registro',async(req,res)=>{
    let {nombre,email,password} = req.body
    res.setHeader('Content-type', 'application/json');

    // for (let property in req.body){
    // }

    if(!nombre || !email || !password){        
        return res.status(400).json({
            error:`Error: Failed to complete signup due to missing information`,
            message: `Please make sure all mandatory fields(*)are completed to proceed with signup.`
        })
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({
            error:`Failed to complete registration due to invalid email`,
            message: ` The email ${email} does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again`
        })
    }

    try {
        const emailAlreadyExists = await sessionsManager.getUserByFilter({email})
        if(emailAlreadyExists){
            return res.status(400).json({
                error:`Failed to complete Signup due to duplicated email`,
                message: `The email you are trying to register (email:${email}) already exists in our database and cannot be duplicated. Please try again using a diferent email.`
            })
        }
    } catch (error) {
        return res.status(500).json({
            error:`Error 500 Server failed unexpectedly, please try again later`,
            message: `${error.message}`
        })
    }

    password = hashPassword(password)

    try{
        let newUser = await sessionsManager.createUser({nombre,email,password})

        newUser = {...newUser}
        delete newUser.password

        res.status(200).json({
            status:"success",
            message:"Signup process was completed successfully",
            payload:{
                nombre:newUser.nombre,
                email: newUser.email,
                rol: newUser.rol
            }
        })
    }catch(error){
        return res.status(500).json({
            error:`Server failed unexpectedly, please try again later`,
            message: `${error.message}`
        })
    }
})

router.post('/login', async(req,res)=>{
    let {email,password}=req.body
    res.setHeader('Content-type', 'application/json');

    if(!email || !password){        
        return res.status(400).json({
            error:`Error: Failed to complete login due to missing information`,
            message: `Please make sure all mandatory fields(*)are completed to proceed with signup.`
        })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return res.status(400).json({
            error:`Failed to complete login due to invalid email`,
            message: ` The email ${email} does not match a valid email format. Other types of data structures are not accepted as an email address. Please verify and try again`
        })
    }

    try {
        const emailIsValid = await sessionsManager.getUserByFilter({email})
        if(!emailIsValid){
            return res.status(404).json({
                error:`Error: email not found`,
                message: `Failed to complete login. The email provided (email:${email} was not found in our database. Please verify and try again`
            })
        }

        let userIsValid = await sessionsManager.getUserByFilter({email, password: hashPassword(password)})
        if(!userIsValid){
            return res.status(401).json({
                error:`Failed to complete login: Invalid credentials`,
                message: `The password you provided does not match our records. Please verify and try again.`
            })
        }

        userIsValid = {...userIsValid}
        delete userIsValid.password

        req.session.user=userIsValid

        return res.status(200).json({
            status: 'success',
            message: 'User login was completed successfully',
            payload: {
                nombre: userIsValid.nombre,
                email: userIsValid.email,
                rol:userIsValid.rol

            }
        })      

    } catch (error) {
        return res.status(500).json({
            error:`Error 500 Server failed unexpectedly, please try again later`,
            message: `${error.message}`
        })
    }
})
