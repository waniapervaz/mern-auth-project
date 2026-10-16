import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Index() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  const [showLogout, setShowLogout] = useState(false);

  if (!username) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("allowChangePassword");
    localStorage.removeItem("email");
    setShowLogout(false);
    navigate("/login", { replace: true });
  };

  const displayName =
    username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <main className="dashboard">
      <aside className="dashboard-sidebar">
        <Link to="/home" className="dashboard-brand">
          <span className="dashboard-brand-icon">✦</span>
          <span>Nova<span className="dashboard-brand-light">Space</span></span>
        </Link>

        <p className="dashboard-nav-label">WORKSPACE</p>

        <nav className="dashboard-nav">
          <Link to="/home" className="dashboard-nav-item active">
            <span>▦</span> Overview
          </Link>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-help">
            <div className="dashboard-help-icon">✧</div>
            <h3>Need a fresh start?</h3>
            <p>Your workspace is ready for you.</p>
          </div>

          <button
            className="dashboard-logout"
            onClick={() => setShowLogout(true)}
          >
            <span>↪</span> Log out
          </button>
        </div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-breadcrumb">Workspace / Overview</p>
          </div>

          <div className="dashboard-user">
            <div className="dashboard-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="dashboard-user-info">
              <strong>{displayName}</strong>
              <span>Member</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-welcome">
            <div>
              <p className="dashboard-eyebrow">YOUR WORKSPACE</p>
              <h1>Welcome back, {displayName}! <span>✦</span></h1>
              <p>
                Great to have you here. Here's your personal overview.
              </p>
            </div>

            <div className="dashboard-welcome-icon">✧</div>
          </section>

          <div className="dashboard-section-heading">
            <div>
              <h2>Your overview</h2>
              <p>A quick look at your workspace.</p>
            </div>
          </div>

          <section className="dashboard-stats">
            <article className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <span className="dashboard-stat-icon purple">◈</span>
                <span className="dashboard-stat-tag">ACCOUNT</span>
              </div>
              <p className="dashboard-stat-label">Account status</p>
              <h3>Active session</h3>
              <p className="dashboard-stat-note">
                You're signed in successfully.
              </p>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <span className="dashboard-stat-icon blue">◎</span>
                <span className="dashboard-stat-tag">PROFILE</span>
              </div>
              <p className="dashboard-stat-label">Your username</p>
              <h3 className="dashboard-username">{displayName}</h3>
              <p className="dashboard-stat-note">
                Your personal workspace identity.
              </p>
            </article>

            <article className="dashboard-stat-card">
              <div className="dashboard-stat-top">
                <span className="dashboard-stat-icon teal">✓</span>
                <span className="dashboard-stat-tag">SECURITY</span>
              </div>
              <p className="dashboard-stat-label">Session</p>
              <h3>Connected</h3>
              <p className="dashboard-stat-note">
                You can safely continue browsing.
              </p>
            </article>
          </section>

          <section className="dashboard-bottom-grid">
            <article className="dashboard-panel">
              <div className="dashboard-panel-heading">
                <div>
                  <h2>Quick actions</h2>
                  <p>Manage your account.</p>
                </div>
              </div>

              <div className="dashboard-action-list">
                <button
                  className="dashboard-action"
                  onClick={() => navigate("/forgot-password")}
                >
                  <span className="dashboard-action-icon">⌑</span>
                  <span>
                    <strong>Change password</strong>
                    <small>Secure your account with a new password.</small>
                  </span>
                  <span className="dashboard-action-arrow">→</span>
                </button>

                <button
                  className="dashboard-action"
                  onClick={() => setShowLogout(true)}
                >
                  <span className="dashboard-action-icon logout-icon">↪</span>
                  <span>
                    <strong>Sign out</strong>
                    <small>Log out of your current session.</small>
                  </span>
                  <span className="dashboard-action-arrow">→</span>
                </button>
              </div>
            </article>

            <article className="dashboard-panel dashboard-profile-panel">
              <div className="dashboard-profile-art">✦</div>
              <h2>Your space, your way.</h2>
              <p>
                Welcome to your personal dashboard. Everything starts here.
              </p>
              <div className="dashboard-profile-divider" />
              <div className="dashboard-profile-row">
                <span className="dashboard-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </span>
                <span>
                  <strong>{displayName}</strong>
                  <small>Signed in user</small>
                </span>
                <span className="dashboard-online-dot" />
              </div>
            </article>
          </section>

          <footer className="dashboard-footer">
            <span>NovaSpace · Personal workspace</span>
            <span>Made for your productivity ✦</span>
          </footer>
        </div>
      </section>

      {showLogout && (
        <div
          className="dashboard-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowLogout(false);
            }
          }}
        >
          <section
            className="dashboard-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
            <div className="dashboard-modal-icon">↪</div>
            <h2 id="logout-title">Log out?</h2>
            <p>
              Are you sure you want to leave your dashboard?
            </p>

            <div className="dashboard-modal-actions">
              <Button
                variant="outline"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </Button>

              <Button onClick={handleLogout}>
                Yes, log out
              </Button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Index;