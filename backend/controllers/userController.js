
import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifyMail } from "../emailVerify/Verifymail.js";
import { Session } from "../models/SessionModel.js";
import { SentOtpMail } from "../emailVerify/SentOtpMail.js";

// ==================== REGISTER USER ====================
export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body || {};

        if (!username?.trim() || !email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!process.env.SECRET_KEY) {
            throw new Error("SECRET_KEY is missing in .env");
        }

        const normalizedEmail = email.trim().toLowerCase();

        let user = await User.findOne({ email: normalizedEmail });

        if (user && user.isVerified === true) {
            return res.status(409).json({
                success: false,
                message: "User already exists. Please login."
            });
        }

        // Create a new user, or resend verification for an
        // existing account that has not yet been verified.
        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);

            user = await User.create({
                username: username.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                isVerified: false
            });
        }

        // Generate a fresh verification token.
        const token = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "10m" }
        );

        user.token = token;
        await user.save();

        // Wait for email sending to finish so errors can be caught.
        await verifyMail(token, normalizedEmail);

        return res.status(200).json({
            success: true,
            message: "Verification email sent. Please check your inbox."
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Registration failed"
        });
    }
};


// ==================== VERIFY EMAIL ====================
export const verification = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).send("Verification token is missing.");
        }

        if (!process.env.SECRET_KEY) {
            throw new Error("SECRET_KEY is missing in .env");
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.SECRET_KEY);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).send(
                    "Verification link expired. Please sign up again to request a new link."
                );
            }

            return res.status(400).send("Invalid verification link.");
        }

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).send("User not found.");
        }

        // Only the latest verification link should work.
        if (user.token !== token) {
            return res.status(401).send(
                "This link is no longer valid. Please use the latest email."
            );
        }

        user.isVerified = true;
        user.token = null;

        await user.save();

        return res.redirect("http://localhost:5173/login");

    } catch (error) {
        console.error("Verification error:", error);

        return res.status(500).send("Email verification failed.");
    }
};


// ==================== LOGIN USER ====================
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email?.trim() || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!process.env.SECRET_KEY) {
            throw new Error("SECRET_KEY is missing in .env");
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordCheck = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCheck) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        if (user.isVerified !== true) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email before logging in."
            });
        }

        // Replace any existing session for this user.
        await Session.deleteMany({ userId: user._id });
        await Session.create({ userId: user._id });

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "10d" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.SECRET_KEY,
            { expiresIn: "30d" }
        );

        user.isLoggedIn = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: `Welcome back ${user.username}`,
            accessToken,
            refreshToken,
            username: user.username
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Login failed"
        });
    }
};


// ==================== LOGOUT USER ====================
export const logout = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        await Session.deleteMany({ userId });

        await User.findByIdAndUpdate(userId, {
            isLoggedIn: false
        });

        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });

    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Logout failed"
        });
    }
};


// ==================== FORGOT PASSWORD ====================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body || {};

        if (!email?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const otp = Math.floor(
            1000000 + Math.random() * 9000000
        ).toString();

        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = expiry;

        await user.save();

        await SentOtpMail(normalizedEmail, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error("Forgot password error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Could not send OTP"
        });
    }
};


// ==================== VERIFY OTP ====================
export const verifyOTP = async (req, res) => {
    try {
        const { otp } = req.body || {};
        const email = req.params.email;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            });
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.otp || !user.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: "OTP not generated or already verified"
            });
        }

        if (new Date(user.otpExpiry).getTime() < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one."
            });
        }

        if (String(otp).trim() !== String(user.otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        user.otp = null;
        user.otpExpiry = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.error("OTP verification error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "OTP verification failed"
        });
    }
};


// ==================== CHANGE PASSWORD ====================
export const changePassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body || {};
        const email = req.params.email;

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        // Clear any old OTP values after password change.
        user.otp = null;
        user.otpExpiry = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Password change failed"
        });
    }
};

