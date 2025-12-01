"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewWorkoutPage() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Workout form
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  // Selected exercises for this workout
  const [selectedExercises, setSelectedExercises] = useState([]);

  // For adding new exercise
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [duration, setDuration] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const apiHost = process.env.NEXT_PUBLIC_API_HOST;
        const [catRes, exRes] = await Promise.all([
          fetch(`${apiHost}/categories`),
          fetch(`${apiHost}/exercises`),
        ]);

        if (!catRes.ok || !exRes.ok) throw new Error("Failed to fetch");

        setCategories(await catRes.json());
        setExercises(await exRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter exercises by category
  const filteredExercises = selectedCategory
    ? exercises.filter((e) => e.category_id === parseInt(selectedCategory))
    : exercises;

  // Get exercise details
  const getExerciseById = (id) => exercises.find((e) => e.id === parseInt(id));

  // Add exercise to workout
  const handleAddExercise = () => {
    if (!selectedExercise) {
      setError("Please select an exercise");
      return;
    }

    const exercise = getExerciseById(selectedExercise);
    const durationMin = parseInt(duration) || 0;
    const caloriesBurned = durationMin * (exercise?.calories_per_minute || 0);

    const newExercise = {
      id: Date.now(),
      exercise_id: parseInt(selectedExercise),
      exercise_name: exercise?.name,
      category_name: exercise?.category_name,
      duration_seconds: durationMin * 60,
      sets: parseInt(sets) || null,
      reps: parseInt(reps) || null,
      weight_kg: parseFloat(weight) || null,
      calories_burned: Math.round(caloriesBurned),
    };

    setSelectedExercises([...selectedExercises, newExercise]);

    // Reset form
    setSelectedExercise("");
    setDuration("");
    setSets("");
    setReps("");
    setWeight("");
    setError("");
  };

  // Remove exercise from list
  const handleRemoveExercise = (id) => {
    setSelectedExercises(selectedExercises.filter((e) => e.id !== id));
  };

  // Calculate totals
  const totalDuration = selectedExercises.reduce(
    (sum, e) => sum + (e.duration_seconds || 0) / 60,
    0
  );
  const totalCalories = selectedExercises.reduce(
    (sum, e) => sum + (e.calories_burned || 0),
    0
  );

  // Submit workout
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedExercises.length === 0) {
      setError("Please add at least one exercise");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_HOST;

      // Create workout
      const workoutRes = await fetch(`${apiHost}/workouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          name: workoutName || "Workout",
          workout_date: workoutDate,
          duration_minutes: Math.round(totalDuration),
          total_calories: totalCalories,
          notes: notes,
        }),
      });

      if (!workoutRes.ok) throw new Error("Failed to create workout");

      const workoutData = await workoutRes.json();
      const workoutId = workoutData.workout.id;

      // Add exercises to workout
      for (const exercise of selectedExercises) {
        await fetch(`${apiHost}/workout-exercises`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workout_id: workoutId,
            exercise_id: exercise.exercise_id,
            sets: exercise.sets,
            reps: exercise.reps,
            weight_kg: exercise.weight_kg,
            duration_seconds: exercise.duration_seconds,
            calories_burned: exercise.calories_burned,
          }),
        });
      }

      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || loading) {
    return (
      <main className="container">
        <div className="empty">Loading...</div>
      </main>
    );
  }

  return (
    <main className="container">
      <Link href="/" className="back-button">
        ← Back to Home
      </Link>

      <h1 className="title">Record Workout</h1>
      <p className="subtitle">Add exercises to your workout session</p>

      {error && <div className="error-message">{error}</div>}

      <div className="workout-form-container">
        {/* Workout Details */}
        <div className="form-card">
          <h2 className="form-card-title">Workout Details</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="workoutName">Workout Name</label>
              <input
                id="workoutName"
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="e.g. Morning Cardio"
              />
            </div>
            <div className="form-group">
              <label htmlFor="workoutDate">Date</label>
              <input
                id="workoutDate"
                type="date"
                value={workoutDate}
                onChange={(e) => setWorkoutDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel?"
              rows={3}
            />
          </div>
        </div>

        {/* Add Exercise */}
        <div className="form-card">
          <h2 className="form-card-title">Add Exercise</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedExercise("");
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="exercise">Exercise</label>
              <select
                id="exercise"
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
              >
                <option value="">Select Exercise</option>
                {filteredExercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.calories_per_minute} cal/min)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row-4">
            <div className="form-group">
              <label htmlFor="duration">Duration (min)</label>
              <input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="sets">Sets</label>
              <input
                id="sets"
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                placeholder="3"
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="reps">Reps</label>
              <input
                id="reps"
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="10"
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="20"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          <button type="button" className="btn btn-secondary" onClick={handleAddExercise}>
            + Add Exercise
          </button>
        </div>

        {/* Selected Exercises List */}
        <div className="form-card">
          <h2 className="form-card-title">
            Exercises ({selectedExercises.length})
          </h2>

          {selectedExercises.length === 0 ? (
            <p className="empty-text">No exercises added yet</p>
          ) : (
            <div className="exercise-list">
              {selectedExercises.map((ex) => (
                <div key={ex.id} className="exercise-item">
                  <div className="exercise-info">
                    <h4>{ex.exercise_name}</h4>
                    <p className="exercise-meta">
                      {ex.category_name}
                      {ex.duration_seconds > 0 && ` • ${ex.duration_seconds / 60} min`}
                      {ex.sets && ` • ${ex.sets} sets`}
                      {ex.reps && ` • ${ex.reps} reps`}
                      {ex.weight_kg && ` • ${ex.weight_kg} kg`}
                    </p>
                  </div>
                  <div className="exercise-calories">
                    <span className="calories-value">{ex.calories_burned}</span>
                    <span className="calories-label">cal</span>
                  </div>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveExercise(ex.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Totals */}
          {selectedExercises.length > 0 && (
            <div className="workout-totals">
              <div className="total-item">
                <span className="total-label">Total Duration</span>
                <span className="total-value">{Math.round(totalDuration)} min</span>
              </div>
              <div className="total-item">
                <span className="total-label">Total Calories</span>
                <span className="total-value">{totalCalories} cal</span>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmit}
          disabled={submitting || selectedExercises.length === 0}
        >
          {submitting ? "Saving..." : "Save Workout"}
        </button>
      </div>
    </main>
  );
}