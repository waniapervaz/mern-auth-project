import { useEffect, useState } from "react";
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

function ChangePassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const email = localStorage.getItem("email");
  const verified =
    localStorage.getItem("allowChangePassword") === "true";

  useEffect(() => {
    if (!email || !verified) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, verified, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const savedEmail = localStorage.getItem("email");

    if (
      !savedEmail ||
      localStorage.getItem("allowChangePassword") !== "true"
    ) {
      navigate("/forgot-password", { replace: true });
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `http://localhost:3000/user/change-password/${encodeURIComponent(savedEmail)}`,
        {
          newPassword: password,
          confirmPassword,
        }
      );

      setSuccess("Password changed successfully! Redirecting to login...");

      setPassword("");
      setConfirmPassword("");

      localStorage.removeItem("email");
      localStorage.removeItem("allowChangePassword");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to change password. Please try again."
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

          <p className="auth-eyebrow">SECURE YOUR ACCOUNT</p>

          <CardTitle className="auth-title">
            Create new password
          </CardTitle>

          <CardDescription className="auth-description">
            Choose a strong password to protect your account.
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
              <Label htmlFor="password">New password</Label>

              <div className="auth-password">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <Label htmlFor="confirmPassword">
                Confirm new password
              </Label>

              <div className="auth-password">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <p className="auth-helper">
              Use at least 8 characters for your password.
            </p>

            <Button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Updating password..." : "Update password"}
            </Button>

            <p className="auth-switch">
              Remembered your password?{" "}
              <Link to="/login">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <p className="auth-footer">
        Your security matters.
      </p>
    </main>
  );
}

export default ChangePassword;