import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import { verifyMail } from "../emailVerify/Verifymail.js";
import { Session } from "../models/SessionModel.js";
import { SentOtpMail } from "../emailVerify/SentOtpMail.js";
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check empty fields
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        // Create new user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });
        const token = jwt.sign({ id: newUser._id }, process.env.SECRET_KEY, { expiresIn: "10m" })
        verifyMail(token, email)
        newUser.token = token
        await newUser.save()

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
export const verification = async (req, res) => {
    try {
       
        // // const authHeader = req.headers.authorization;
        // // if((!authHeader) || !authHeader.startsWith("Bearer")){
        // //     return res.status(401).json({
        // //         success: false,
        // //         message: "Authorization is invalid or missing"
        // //     })
        // // }
        
        // // const token = authHeader.split(" ")[1]
       const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Token is missing"
            });
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY)
        }
        catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    message: "The Register token has expired"
                })
            }
            return res.status(400).json({
                success: false,
                message: "Token verification failed"
            })
        }
        //..... veirfication start
        const user = await User.findById(decoded.id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "user not found"
            })
        }
        //if user found id
        user.token = null;
        user.isVerified = true;
        await user.save();
          return res.redirect("http://localhost:5173/login");
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

}

export const loginUser=async(req,res)=>{
try {
    const {email,password}=req.body  //email:mehak@gmailcom; password:7373
    if(!email || !password){
    return res.status(400).json({
        success:false,
        message:"All field are required"
    })
    }
    const user=await User.findOne({email}) //user=mehak@gmail.com password:789
    if(!user){
        return res.status(400).json({
            success:false,
            message:"Unauthorized Aceess"
        })
    }
    const Passwordcheck=await(bcrypt.compare(password,user.password));
    if(!Passwordcheck){
        return res.status(400).json({
            success:false,
            message:"InCorrect Password"
        })
    }
    if(user.isVerified !==true){
        return res.status(403).json({
            success:false,
            message:"verify your account than login"
        })
    }
    const existingsession= await Session.findOne({userId:user._id})
    if(existingsession){
        await Session.deleteOne({userId:user._id})
    }
    await Session.create({userId:user._id});

    const accesstoken=jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:"10d"});
    const refreshtoken=jwt.sign({id:user._id},process.env.SECRET_KEY,{expiresIn:"30d"});
    user.isLoggedIn=true;
    await user.save();
    return res.status(200).json({
        success:true,
        message:`welcome back ${user.username}`,
        accesstoken,
        refreshtoken,
        username:user.username
    })

} catch (error) {
    return res.status(500).json({
        success:false,
        message:error.message
    })
}

}

export const logout=async(req,res)=>{
    try {
        const userId=req.userId;
        await Session.deleteMany({userId});
        await User.findByIdAndUpdate(userId, {isLoggedIn:false})
        return res.status(200).json({
            success:true,
            message:"User Logout Success"
        })

    } catch (error) {
           return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const forgotPassword =async(req,res)=>{
    try {
        const {email}=req.body
        const user=await User.findOne({email});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }
        const otp=Math.floor(1000000+Math.random()*9000000).toString();
        const expiry=new Date(Date.now()+10*60*1000);
        user.otp=otp;
        user.otpExpiry=expiry;
        await user.save();
        await SentOtpMail(email, otp);
        return res.status(200).json({
            success:true,
            message:"OTP sent successfully"
        })
    } catch (error) {
       return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const verifyOTP = async (req, res) => {
    const { otp } = req.body
    const email = req.params.email

    if(!otp){
        return res.status(400).json({
            success: false,
            message: "OTP is required"
        })
    }

    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        if(!user.otp || !user.otpExpiry){
            return res.status(400).json({
                success: false,
                message: "OTP not generated or already veified"
            })
        }
        if(user.otpExpiry < new Date()){
            return res.status(400).json({
                success:false,
                message:"OTP has expired . please generate a new one"
            })
        }
        if(otp !== user.otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }
        user.otp=null;
        user.otpExpiry=null;
        await user.save();
        return res.status(200).json({
            success:true,
            message:"OTP verified Successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
}

export const changePassword =async(req,res)=>{
    const {newPassword, confirmPassword}=req.body
    const email=req.params.email
    if(!newPassword || !confirmPassword){
        return res.status(400).json({
            success:false,
            message:"All fields are required"
        })
    }
    if(newPassword !== confirmPassword){
        return res.status(400).json({
            success:false,
            message:"password do not match"
        })
    }
    try{
        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({
                success:false,
                message:"user not found"
            })
        }
        const hashedPassword= await bcrypt.hash(newPassword,10)
        user.password=hashedPassword
        await user.save();

        return res.status(200).json({
            success:true,
            message:"password changed successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
