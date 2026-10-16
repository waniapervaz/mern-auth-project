
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

const API_URL = "http://localhost:3000/user";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/register`, {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(
        response.data?.message ||
          "Account created successfully! Please check your email for verification."
      );

      setUsername("");
      setEmail("");
      setPassword("");

      // Login page par tabhi navigate karein jab signup successful ho
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            signupSuccess: true,
            message:
              "Account created successfully! Please check your email for verification before logging in.",
          },
        });
      }, 1200);
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data?.message ||
            `Signup failed. Server returned status ${err.response.status}.`
        );
      } else if (err.request) {
        setError(
          "Backend se connection nahi ho raha. Backend server aur API port check karein."
        );
      } else {
        setError(err.message || "Signup failed. Please try again.");
      }
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

          <p className="auth-eyebrow">GET STARTED TODAY</p>

          <CardTitle className="auth-title">
            Create your account
          </CardTitle>

          <CardDescription className="auth-description">
            Join us and get started with your journey.
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
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                minLength={3}
                disabled={loading}
              />
            </div>

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

            <div className="auth-field">
              <Label htmlFor="password">Password</Label>

              <div className="auth-password">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <span aria-hidden="true"> →</span>}
            </Button>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <p className="auth-footer">
        A better experience starts here.
      </p>
    </main>
  );
}

export default Signup;
