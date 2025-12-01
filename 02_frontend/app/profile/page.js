"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    profile_image: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setFormData({
      first_name: userData.first_name || "",
      last_name: userData.last_name || "",
      profile_image: userData.profile_image || "",
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      try {
        const apiHost = process.env.NEXT_PUBLIC_API_HOST;
        const res = await fetch(`${apiHost}/stats/user/${user.id}`);
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST;
      const res = await fetch(`${apiHost}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updatedUser = { ...user, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditing(false);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  if (!user || loading) {
    return (
      <main className="container">
        <div className="empty">Loading...</div>
      </main>
    );
  }

  return (
    <main className="container profile-container">
      <Link href="/" className="back-button">
        ← Back to Home
      </Link>

      <h1 className="title">Profile</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-header-large">
          <div className="profile-avatar-large">
            {user.profile_image ? (
              <Image
                src={user.profile_image}
                alt={user.first_name}
                width={100}
                height={100}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span>{getInitials(user.first_name, user.last_name)}</span>
            )}
          </div>
          <div className="profile-info-large">
            <h2>{user.first_name} {user.last_name}</h2>
            <p className="profile-email">{user.email}</p>
            <p className="profile-username">@{user.username}</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">{stats.total_workouts}</span>
              <span className="profile-stat-label">Workouts</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{Math.round(stats.total_calories_burned)}</span>
              <span className="profile-stat-label">Calories</span>
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">{stats.total_duration_minutes}</span>
              <span className="profile-stat-label">Minutes</span>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h3>Edit Profile</h3>
          {!editing && (
            <button className="btn btn-secondary" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="profile_image">Profile Image URL</label>
              <input
                id="profile_image"
                name="profile_image"
                type="text"
                value={formData.profile_image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="profile-form-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-details">
            <div className="profile-detail-row">
              <span className="profile-detail-label">First Name</span>
              <span className="profile-detail-value">{user.first_name}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Last Name</span>
              <span className="profile-detail-value">{user.last_name}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Email</span>
              <span className="profile-detail-value">{user.email}</span>
            </div>
            <div className="profile-detail-row">
              <span className="profile-detail-label">Username</span>
              <span className="profile-detail-value">@{user.username}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="profile-card">
        <h3 className="profile-card-title">Quick Links</h3>
        <div className="profile-links">
          <Link href="/history" className="profile-link">
            <span className="profile-link-icon">
                <i className="fa-solid fa-clock-rotate-left"></i>
            </span>
            <span>View Workout History</span>
          </Link>
          <Link href="/workouts/new" className="profile-link">
            <span className="profile-link-icon">
                <i className="fa-solid fa-plus"></i>
            </span>
            <span>Record New Workout</span>
          </Link>
        </div>
      </div>

      {/* Logout */}
      <button className="btn btn-danger btn-full" onClick={handleLogout}>
        <span className="profile-link-icon">
            <i className="fa-solid fa-arrow-right-from-bracket">  </i>
        </span>
        &nbsp;Logout
      </button>
    </main>
  );
}