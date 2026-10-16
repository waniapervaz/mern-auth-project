import express from "express";
import { changePassword, forgotPassword, loginUser, logout, registerUser ,verification, verifyOTP} from "../controllers/userController.js";
import { User } from "../models/userModel.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { userschema, validateUser } from "../validators/uservalidate.js";
const router = express.Router();

router.post("/register",validateUser(userschema) ,registerUser);
// // // router.post("/verify", verification);
router.get("/verify/:token", verification);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp/:email", verifyOTP);
router.post("/logout",isAuthenticated,logout)
// router.post("/verify-otp/:email",verifyotp)
router.post("/change-password/:email",changePassword)
router.get("/register", async (req, res) => {
    const users = await User.find();
    res.json(users);
});

export default router;