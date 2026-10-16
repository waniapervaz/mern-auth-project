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

function VerfifyOtp() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const email = localStorage.getItem("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const savedEmail = localStorage.getItem("email");

    if (!savedEmail) {
      setError("Email not found. Please request a new OTP.");
      return;
    }

    if (!/^\d{4,8}$/.test(otp)) {
      setError("Please enter a valid numeric OTP.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `http://localhost:3000/user/verify-otp/${encodeURIComponent(savedEmail)}`,
        { otp }
      );

      localStorage.setItem("allowChangePassword", "true");

      setSuccess("OTP verified successfully!");

      setTimeout(() => {
        navigate("/changepassword");
      }, 900);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <main className="auth-page">
        <Card className="auth-card">
          <CardHeader className="auth-header">
            <div className="auth-logo">✦</div>
            <CardTitle className="auth-title">
              Email not found
            </CardTitle>
            <CardDescription className="auth-description">
              Please request a verification code first.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Button
              className="auth-submit"
              onClick={() => navigate("/forgot-password")}
            >
              Request OTP
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <Card className="auth-card">
        <CardHeader className="auth-header">
          <div className="auth-logo">
            <span>✦</span>
          </div>

          <p className="auth-eyebrow">EMAIL VERIFICATION</p>

          <CardTitle className="auth-title">
            Verify your email
          </CardTitle>

          <CardDescription className="auth-description">
            Enter the verification code sent to your email.
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
              <Label htmlFor="otp">Verification code</Label>

              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))
                }
                maxLength={8}
                required
                disabled={loading}
              />

              <p className="auth-helper">
                Code sent to {email}
              </p>
            </div>

            <Button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify code"}
            </Button>

            <p className="auth-switch">
              Didn't receive a code?{" "}
              <Link to="/forgot-password">Try again</Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <p className="auth-footer">
        Keep your account secure.
      </p>
    </main>
  );
}

export default VerfifyOtp;