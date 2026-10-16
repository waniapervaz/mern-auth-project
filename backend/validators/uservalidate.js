import yup from "yup"

export const userschema = yup.object({
    username: yup
        .string()
        .trim()
        .min(3, "username must be atleast of 3 characters")
        .required(),
    email: yup
        .string()
        .email("the email is not valid")
        .required(),
    password: yup
    .string()
    .min(4,"password must be atleast 4 character")
    .required()  
})
export const validateUser=(schema)=> async(req,res,next)=>{
    try{
        await schema.validate(req.body)
        next()
    }
    catch(err){
        return res.status(400).json({errors:err.errors})
    }
}