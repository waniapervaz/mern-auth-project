import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

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

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [notice, setNotice] = useState(
    location.state?.signupSuccess
      ? location.state.message ||
          "Signup successful! Please check your email for verification."
      : ""
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/user/login",
        {
          email,
          password,
        }
      );

      if (response.data.username) {
        localStorage.setItem("username", response.data.username);
      }

      setEmail("");
      setPassword("");

      // Successful login ke baad Home par jao.
      navigate("/home", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Please try again."
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

          <p className="auth-eyebrow">WELCOME BACK</p>

          <CardTitle className="auth-title">
            Sign in to your account
          </CardTitle>

          <CardDescription className="auth-description">
            Enter your details to continue.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="auth-form">
            {notice && (
              <div className="auth-alert auth-success" role="status">
                {notice}
              </div>
            )}

            {error && (
              <div className="auth-alert auth-error" role="alert">
                {error}
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

            <div className="auth-field">
              <div className="auth-label-row">
                <Label htmlFor="password">Password</Label>

                <Link
                  to="/forgot-password"
                  className="auth-small-link"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="auth-password">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
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
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span aria-hidden="true"> →</span>}
            </Button>

            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/signup">Create account</Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <p className="auth-footer">
        Welcome back. Let's get things done.
      </p>
    </main>
  );
}

export default Login;