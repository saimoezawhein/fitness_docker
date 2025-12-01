"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Page() {
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const apiHost = process.env.NEXT_PUBLIC_API_HOST;

        const [workoutsRes, categoriesRes, statsRes] = await Promise.all([
          fetch(`${apiHost}/workouts/user/${user.id}`, { cache: "no-store" }),
          fetch(`${apiHost}/categories`, { cache: "no-store" }),
          fetch(`${apiHost}/stats/user/${user.id}`, { cache: "no-store" }),
        ]);

        if (!workoutsRes.ok || !categoriesRes.ok || !statsRes.ok) {
          throw new Error("Failed to fetch");
        }

        const workoutsData = await workoutsRes.json();
        const categoriesData = await categoriesRes.json();
        const statsData = await statsRes.json();

        setWorkouts(workoutsData);
        setCategories(categoriesData);
        setStats(statsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("user");
    router.push("/login");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
  };

  if (!user || loading) {
    return (
      <main className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <div className="empty">Error: {error}</div>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header">
        <div className="header-content">
          <div>
            <h1 className="title">Fitness Tracker</h1>
            <p className="subtitle">Welcome back, {user.first_name}!</p>
          </div>

          <div className="menu-wrapper" ref={menuRef}>
            <button
              className="menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="User menu"
            >
              <span className="dots">⋮</span>
            </button>

            {menuOpen && (
              <div className="dropdown-menu-large">
                {/* User Profile Section */}
                <div className="menu-profile">
                  <div className="menu-avatar">
                    {user.profile_image ? (
                      <Image
                        src={user.profile_image}
                        alt={user.first_name}
                        width={50}
                        height={50}
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <span>{getInitials(user.first_name, user.last_name)}</span>
                    )}
                  </div>
                  <div className="menu-user-info">
                    <h4>{user.first_name} {user.last_name}</h4>
                    <p>{user.email}</p>
                  </div>
                </div>

                <div className="menu-divider"></div>

                {/* Navigation Links */}
                <Link href="/profile" className="menu-item-large">
                  <span className="profile-link-icon">
                    <i className="fa-solid fa-user"></i>
                  </span>
                  <div className="menu-item-content">
                    <span className="menu-item-title">Profile</span>
                    <span className="menu-item-desc">View and edit your profile</span>
                  </div>
                </Link>

                <Link href="/history" className="menu-item-large">
                  <span className="profile-link-icon">
                    <i className="fa-solid fa-clock-rotate-left"></i>
                  </span>
                  <div className="menu-item-content">
                    <span className="menu-item-title">History</span>
                    <span className="menu-item-desc">View all your workouts</span>
                  </div>
                </Link>

                <div className="menu-divider"></div>

                {/* Logout */}
                <button className="menu-item-large logout" onClick={handleLogout}>
                  <span className="profile-link-icon">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  </span>
                  <div className="menu-item-content">
                    <span className="menu-item-title">Logout</span>
                    <span className="menu-item-desc">Sign out of your account</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Stats Section */}
      {stats && (
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.total_workouts}</span>
              <span className="stat-label">Total Workouts</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{Math.round(stats.total_calories_burned)}</span>
              <span className="stat-label">Calories Burned</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.total_duration_minutes}</span>
              <span className="stat-label">Minutes Active</span>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="categories-section">
        <h2 className="section-title">Categories</h2>
        <div className="categories-grid">
          {categories.map((cat) => (
            <div key={cat.id} className="category-chip">
              {cat.name}
            </div>
          ))}
        </div>
      </section>

      {/* Recent Workouts Section */}
      <section className="workouts-section">
        <div className="section-header">
          <h2 className="section-title">Recent Workouts</h2>
          <Link href="/history" className="view-all-link">View All →</Link>
        </div>

        {!workouts || workouts.length === 0 ? (
          <div className="empty-home">
            <div className="empty-home-icon">
              <i className="fa-solid fa-dumbbell"></i>
            </div>
            <h3>No workouts yet</h3>
            <p>Start your fitness journey by recording your first workout!</p>
          </div>
        ) : (
          <div className="grid">
            {workouts.slice(0, 6).map((workout) => (
              <article key={workout.id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{workout.name || "Workout"}</h3>
                  <span className="card-date">{formatDate(workout.workout_date)}</span>
                </div>
                <div className="body">
                  <div className="stats">
                    <div className="stat">
                      <span className="stat-value">{workout.duration_minutes || 0}</span>
                      <span className="stat-label">minutes</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{workout.total_calories || 0}</span>
                      <span className="stat-label">calories</span>
                    </div>
                  </div>
                  {workout.notes && <p className="notes">{workout.notes}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Floating Add Workout Button */}
      <Link href="/workouts/new" className="fab">
        <span className="profile-link-icon">
          <i className="fa-solid fa-plus"></i>
        </span>
        <span className="fab-text">&nbsp;Add Workout</span>
      </Link>
    </main>
  );
}