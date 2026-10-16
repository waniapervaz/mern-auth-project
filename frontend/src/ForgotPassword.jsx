import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:3000/user/forgot-password",
        { email }
      );

      localStorage.setItem("email", email);
      localStorage.removeItem("allowChangePassword");

      setSuccess("OTP sent successfully! Please check your email.");

      setTimeout(() => {
        navigate("/verifyotp");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <Card className="auth-card">
        <CardHeader className="auth-header">
          <div className="auth-logo">
            <span>✦</span>
          </div>

          <p className="auth-eyebrow">ACCOUNT RECOVERY</p>

          <CardTitle className="auth-title">
            Forgot password?
          </CardTitle>

          <CardDescription className="auth-description">
            No worries! Enter your registered email and
            we will send you a verification code.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="auth-alert auth-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="auth-alert auth-success" role="status">
                {success}
              </div>
            )}

            <div className="auth-field">
              <Label htmlFor="email">Email address</Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send verification code"}
            </Button>

            <p className="auth-switch">
              Remember your password?{" "}
              <Link to="/login">Back to login</Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <p className="auth-footer">
        We will help you get back into your account.
      </p>
    </main>
  );
}

export default ForgotPassword;