"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HistoryPage() {
  const [user, setUser] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [workoutExercises, setWorkoutExercises] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [expandedWorkout, setExpandedWorkout] = useState(null);
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

    async function fetchWorkouts() {
      try {
        const apiHost = process.env.NEXT_PUBLIC_API_HOST;
        const res = await fetch(`${apiHost}/workouts/user/${user.id}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch workouts");

        const data = await res.json();
        setWorkouts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkouts();
  }, [user]);

  const fetchWorkoutExercises = async (workoutId) => {
    if (workoutExercises[workoutId]) return;

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST;
      const res = await fetch(`${apiHost}/workout-exercises/${workoutId}`);
      if (res.ok) {
        const data = await res.json();
        setWorkoutExercises((prev) => ({ ...prev, [workoutId]: data }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExpand = (workoutId) => {
    if (expandedWorkout === workoutId) {
      setExpandedWorkout(null);
    } else {
      setExpandedWorkout(workoutId);
      fetchWorkoutExercises(workoutId);
    }
  };

  const handleDelete = async (workoutId) => {
    if (!confirm("Are you sure you want to delete this workout?")) return;

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST;
      const res = await fetch(`${apiHost}/workouts/${workoutId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (res.ok) {
        setWorkouts(workouts.filter((w) => w.id !== workoutId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getFilteredWorkouts = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (filter) {
      case "week":
        return workouts.filter((w) => new Date(w.workout_date) >= startOfWeek);
      case "month":
        return workouts.filter((w) => new Date(w.workout_date) >= startOfMonth);
      default:
        return workouts;
    }
  };

  const filteredWorkouts = getFilteredWorkouts();

  const totalWorkouts = filteredWorkouts.length;
  const totalCalories = filteredWorkouts.reduce(
    (sum, w) => sum + (w.total_calories || 0),
    0
  );
  const totalDuration = filteredWorkouts.reduce(
    (sum, w) => sum + (w.duration_minutes || 0),
    0
  );

  const groupWorkoutsByMonth = (workouts) => {
    const groups = {};
    workouts.forEach((workout) => {
      const date = new Date(workout.workout_date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });

      if (!groups[key]) {
        groups[key] = { label, workouts: [] };
      }
      groups[key].workouts.push(workout);
    });
    return Object.values(groups);
  };

  const groupedWorkouts = groupWorkoutsByMonth(filteredWorkouts);

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
      <Link href="/" className="back-button">
        ← Back to Home
      </Link>

      <div className="history-header">
        <div>
          <h1 className="title">📊 Workout History</h1>
          <p className="subtitle">Track your fitness journey over time</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Time
        </button>
        <button
          className={`filter-tab ${filter === "month" ? "active" : ""}`}
          onClick={() => setFilter("month")}
        >
          This Month
        </button>
        <button
          className={`filter-tab ${filter === "week" ? "active" : ""}`}
          onClick={() => setFilter("week")}
        >
          This Week
        </button>
      </div>

      {/* Summary Stats */}
      <div className="history-stats">
        <div className="history-stat">
          <span className="history-stat-icon">🏋️</span>
          <span className="history-stat-value">{totalWorkouts}</span>
          <span className="history-stat-label">Workouts</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-icon">🔥</span>
          <span className="history-stat-value">{Math.round(totalCalories)}</span>
          <span className="history-stat-label">Calories Burned</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-icon">⏱️</span>
          <span className="history-stat-value">{totalDuration}</span>
          <span className="history-stat-label">Minutes Active</span>
        </div>
        <div className="history-stat">
          <span className="history-stat-icon">📈</span>
          <span className="history-stat-value">
            {totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0}
          </span>
          <span className="history-stat-label">Avg Cal/Workout</span>
        </div>
      </div>

      {/* Workout List */}
      {filteredWorkouts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No workouts found</h3>
          <p>Your workout history will appear here</p>
          <Link href="/" className="btn btn-primary">
            Go to Home
          </Link>
        </div>
      ) : (
        <div className="history-list">
          {groupedWorkouts.map((group) => (
            <div key={group.label} className="history-group">
              <div className="history-group-header">
                <h3 className="history-group-title">{group.label}</h3>
                <span className="history-group-count">
                  {group.workouts.length} workout{group.workouts.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="history-items">
                {group.workouts.map((workout) => (
                  <div
                    key={workout.id}
                    className={`history-card ${expandedWorkout === workout.id ? "expanded" : ""}`}
                  >
                    <div
                      className="history-card-main"
                      onClick={() => handleExpand(workout.id)}
                    >
                      <div className="history-card-date">
                        <span className="history-day">
                          {new Date(workout.workout_date).getDate()}
                        </span>
                        <span className="history-month">
                          {new Date(workout.workout_date).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </span>
                        <span className="history-weekday">
                          {new Date(workout.workout_date).toLocaleDateString("en-US", {
                            weekday: "short",
                          })}
                        </span>
                      </div>

                      <div className="history-card-content">
                        <h4 className="history-card-title">
                          {workout.name || "Workout Session"}
                        </h4>
                        <div className="history-card-stats">
                          <span className="history-card-stat">
                            <span className="stat-icon">⏱️</span>
                            {workout.duration_minutes} min
                          </span>
                          <span className="history-card-stat">
                            <span className="stat-icon">🔥</span>
                            {workout.total_calories || 0} cal
                          </span>
                        </div>
                        {workout.notes && (
                          <p className="history-card-notes">{workout.notes}</p>
                        )}
                      </div>

                      <div className="history-card-arrow">
                        {expandedWorkout === workout.id ? "▲" : "▼"}
                      </div>
                    </div>

                    {expandedWorkout === workout.id && (
                      <div className="history-card-details">
                        <div className="history-exercises">
                          <h5 className="history-exercises-title">Exercises</h5>
                          {workoutExercises[workout.id] ? (
                            workoutExercises[workout.id].length > 0 ? (
                              <div className="history-exercises-list">
                                {workoutExercises[workout.id].map((ex) => (
                                  <div key={ex.id} className="history-exercise-item">
                                    <div className="history-exercise-info">
                                      <span className="history-exercise-name">
                                        {ex.exercise_name}
                                      </span>
                                      <span className="history-exercise-category">
                                        {ex.category_name}
                                      </span>
                                    </div>
                                    <div className="history-exercise-details">
                                      {ex.duration_seconds > 0 && (
                                        <span>{ex.duration_seconds / 60} min</span>
                                      )}
                                      {ex.sets && <span>{ex.sets} sets</span>}
                                      {ex.reps && <span>{ex.reps} reps</span>}
                                      {ex.weight_kg && <span>{ex.weight_kg} kg</span>}
                                      {ex.calories_burned > 0 && (
                                        <span className="exercise-calories">
                                          {ex.calories_burned} cal
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="no-exercises">No exercises recorded</p>
                            )
                          ) : (
                            <p className="loading-exercises">Loading exercises...</p>
                          )}
                        </div>

                        <div className="history-card-actions">
                          <button
                            className="btn btn-danger btn-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(workout.id);
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}