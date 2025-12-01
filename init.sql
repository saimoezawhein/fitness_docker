-- Create database
CREATE DATABASE IF NOT EXISTS fitness_tracker;
USE fitness_tracker;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  profile_image VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Exercise categories table
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises table
CREATE TABLE exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_id INT NOT NULL,
  muscle_group VARCHAR(50),
  difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  calories_per_minute DECIMAL(5,2),
  image_url VARCHAR(255),
  video_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Workouts table (user's workout sessions)
CREATE TABLE workouts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100),
  workout_date DATE NOT NULL,
  duration_minutes INT,
  total_calories DECIMAL(7,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Workout exercises (exercises performed in a workout)
CREATE TABLE workout_exercises (
  id INT AUTO_INCREMENT PRIMARY KEY,
  workout_id INT NOT NULL,
  exercise_id INT NOT NULL,
  sets INT,
  reps INT,
  weight_kg DECIMAL(5,2),
  duration_seconds INT,
  calories_burned DECIMAL(6,2),
  notes TEXT,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(workout_date);
CREATE INDEX idx_exercises_category ON exercises(category_id);
CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);

-- =====================
-- SEED DATA
-- =====================

-- Insert categories
INSERT INTO categories (name, description, icon) VALUES
('Cardio', 'Cardiovascular exercises to improve heart health and endurance', 'heart'),
('Strength', 'Weight training and resistance exercises for building muscle', 'dumbbell'),
('Flexibility', 'Stretching and mobility exercises for better range of motion', 'stretch'),
('HIIT', 'High-Intensity Interval Training for maximum calorie burn', 'fire'),
('Yoga', 'Yoga poses and flows for mind-body connection', 'lotus'),
('Sports', 'Sport-specific exercises and drills', 'trophy');

-- Insert exercises
INSERT INTO exercises (name, description, category_id, muscle_group, difficulty, calories_per_minute) VALUES
-- Cardio (category_id = 1)
('Running', 'Outdoor or treadmill running at moderate pace', 1, 'Full Body', 'beginner', 10.00),
('Cycling', 'Stationary bike or outdoor cycling', 1, 'Legs', 'beginner', 8.00),
('Jump Rope', 'Skipping rope for cardio and coordination', 1, 'Full Body', 'intermediate', 12.00),
('Swimming', 'Freestyle or any stroke swimming', 1, 'Full Body', 'intermediate', 9.00),
('Walking', 'Brisk walking for low-impact cardio', 1, 'Legs', 'beginner', 4.00),
('Rowing', 'Rowing machine for full body cardio', 1, 'Full Body', 'intermediate', 8.50),
('Stair Climbing', 'Climbing stairs or using stair machine', 1, 'Legs', 'intermediate', 9.00),

-- Strength (category_id = 2)
('Bench Press', 'Barbell or dumbbell chest press', 2, 'Chest', 'intermediate', 5.00),
('Squat', 'Barbell back squat for leg strength', 2, 'Legs', 'intermediate', 6.00),
('Deadlift', 'Conventional or sumo deadlift', 2, 'Back', 'advanced', 7.00),
('Pull-ups', 'Bodyweight pull-ups for back and biceps', 2, 'Back', 'advanced', 5.00),
('Push-ups', 'Bodyweight push-ups for chest and triceps', 2, 'Chest', 'beginner', 4.00),
('Lunges', 'Walking or stationary lunges', 2, 'Legs', 'beginner', 5.00),
('Shoulder Press', 'Overhead press with barbell or dumbbells', 2, 'Shoulders', 'intermediate', 4.50),
('Bicep Curls', 'Dumbbell or barbell bicep curls', 2, 'Arms', 'beginner', 3.00),
('Tricep Dips', 'Bodyweight tricep dips on bench or bars', 2, 'Arms', 'intermediate', 4.00),
('Plank', 'Core stabilization exercise', 2, 'Core', 'beginner', 3.50),
('Leg Press', 'Machine-based leg press', 2, 'Legs', 'beginner', 5.00),
('Lat Pulldown', 'Cable machine lat pulldown', 2, 'Back', 'beginner', 4.00),

-- Flexibility (category_id = 3)
('Hamstring Stretch', 'Seated or standing hamstring stretch', 3, 'Legs', 'beginner', 2.00),
('Shoulder Stretch', 'Cross-body shoulder stretch', 3, 'Shoulders', 'beginner', 2.00),
('Quad Stretch', 'Standing quadriceps stretch', 3, 'Legs', 'beginner', 2.00),
('Hip Flexor Stretch', 'Kneeling hip flexor stretch', 3, 'Hips', 'beginner', 2.00),
('Cat-Cow Stretch', 'Spinal mobility exercise', 3, 'Back', 'beginner', 2.50),
('Pigeon Pose', 'Deep hip opener stretch', 3, 'Hips', 'intermediate', 2.50),

-- HIIT (category_id = 4)
('Burpees', 'Full body explosive exercise', 4, 'Full Body', 'advanced', 14.00),
('Mountain Climbers', 'Dynamic plank with knee drives', 4, 'Core', 'intermediate', 11.00),
('Box Jumps', 'Explosive jumping onto elevated platform', 4, 'Legs', 'intermediate', 10.00),
('Kettlebell Swings', 'Hip hinge explosive movement', 4, 'Full Body', 'intermediate', 12.00),
('Battle Ropes', 'Wave patterns with heavy ropes', 4, 'Arms', 'intermediate', 13.00),
('Sprint Intervals', 'Short burst sprints with rest periods', 4, 'Full Body', 'advanced', 15.00),
('Jumping Jacks', 'Full body cardio exercise', 4, 'Full Body', 'beginner', 8.00),
('High Knees', 'Running in place with high knee lifts', 4, 'Legs', 'beginner', 9.00),

-- Yoga (category_id = 5)
('Sun Salutation', 'Classic yoga flow sequence', 5, 'Full Body', 'beginner', 3.00),
('Downward Dog', 'Adho Mukha Svanasana pose', 5, 'Full Body', 'beginner', 2.50),
('Warrior I', 'Virabhadrasana I standing pose', 5, 'Legs', 'beginner', 3.00),
('Warrior II', 'Virabhadrasana II standing pose', 5, 'Legs', 'beginner', 3.00),
('Tree Pose', 'Vrksasana balance pose', 5, 'Legs', 'beginner', 2.00),
('Child Pose', 'Balasana resting pose', 5, 'Back', 'beginner', 1.50),
('Cobra Pose', 'Bhujangasana backbend', 5, 'Back', 'beginner', 2.50),
('Triangle Pose', 'Trikonasana side stretch', 5, 'Full Body', 'intermediate', 3.00),

-- Sports (category_id = 6)
('Basketball Drills', 'Dribbling and shooting practice', 6, 'Full Body', 'intermediate', 8.00),
('Soccer Drills', 'Ball control and agility drills', 6, 'Legs', 'intermediate', 9.00),
('Tennis Practice', 'Rallying and serve practice', 6, 'Full Body', 'intermediate', 7.00),
('Boxing Workout', 'Punching combinations and footwork', 6, 'Full Body', 'advanced', 11.00),
('Golf Swing Practice', 'Driving range or swing drills', 6, 'Core', 'beginner', 3.50);

-- Insert sample users (password is 'password123')
INSERT INTO users (username, email, password, first_name, last_name) VALUES
('john_doe', 'john@example.com', 'password123', 'John', 'Doe'),
('jane_smith', 'jane@example.com', 'password123', 'Jane', 'Smith'),
('mike_fit', 'mike@example.com', 'password123', 'Mike', 'Johnson'),
('demo', 'demo@example.com', 'demo123', 'Demo', 'User');

-- Insert sample workouts for John (user_id = 1)
INSERT INTO workouts (user_id, name, workout_date, duration_minutes, total_calories, notes) VALUES
(1, 'Morning Cardio', '2024-01-15', 45, 380.00, 'Great morning run, felt energized!'),
(1, 'Strength Training', '2024-01-16', 60, 320.00, 'Increased bench press weight to 70kg'),
(1, 'HIIT Session', '2024-01-18', 30, 350.00, 'Intense but effective'),
(1, 'Yoga Flow', '2024-01-20', 45, 135.00, 'Relaxing recovery session'),
(1, 'Full Body Workout', '2024-01-22', 75, 480.00, 'Personal best on deadlift!');

-- Insert sample workouts for Jane (user_id = 2)
INSERT INTO workouts (user_id, name, workout_date, duration_minutes, total_calories, notes) VALUES
(2, 'Spin Class', '2024-01-15', 50, 400.00, 'High energy class'),
(2, 'Upper Body', '2024-01-17', 45, 250.00, 'Focus on shoulders and arms'),
(2, 'Morning Yoga', '2024-01-19', 60, 180.00, 'Peaceful start to the day'),
(2, 'Leg Day', '2024-01-21', 55, 330.00, 'Squats and lunges');

-- Insert sample workouts for Mike (user_id = 3)
INSERT INTO workouts (user_id, name, workout_date, duration_minutes, total_calories, notes) VALUES
(3, 'Basketball Practice', '2024-01-16', 90, 720.00, 'Full court games'),
(3, 'Weight Training', '2024-01-18', 60, 360.00, 'Heavy lifting day'),
(3, 'Recovery Run', '2024-01-20', 30, 300.00, 'Easy pace recovery');

-- Insert workout exercises for John's workouts
-- Morning Cardio (workout_id = 1)
INSERT INTO workout_exercises (workout_id, exercise_id, duration_seconds, calories_burned) VALUES
(1, 1, 1800, 300.00),  -- Running 30 min
(1, 3, 600, 120.00);   -- Jump Rope 10 min

-- Strength Training (workout_id = 2)
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight_kg, calories_burned) VALUES
(2, 8, 4, 10, 70.00, 80.00),   -- Bench Press
(2, 9, 4, 8, 80.00, 100.00),   -- Squat
(2, 11, 3, 10, NULL, 60.00),   -- Pull-ups
(2, 17, 3, 30, NULL, 80.00);   -- Plank

-- HIIT Session (workout_id = 3)
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, calories_burned) VALUES
(3, 27, 4, 15, 180.00),  -- Burpees
(3, 28, 3, 30, 100.00),  -- Mountain Climbers
(3, 33, 4, 20, 70.00);   -- Jumping Jacks

-- Yoga Flow (workout_id = 4)
INSERT INTO workout_exercises (workout_id, exercise_id, duration_seconds, calories_burned) VALUES
(4, 35, 1200, 60.00),  -- Sun Salutation
(4, 36, 600, 25.00),   -- Downward Dog
(4, 41, 900, 50.00);   -- Child Pose

-- Full Body Workout (workout_id = 5)
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight_kg, calories_burned) VALUES
(5, 9, 5, 5, 100.00, 150.00),   -- Squat
(5, 10, 5, 5, 120.00, 175.00),  -- Deadlift
(5, 8, 4, 8, 75.00, 80.00),    -- Bench Press
(5, 13, 3, 12, 20.00, 75.00);  -- Lunges

-- Insert workout exercises for Jane's workouts
-- Spin Class (workout_id = 6)
INSERT INTO workout_exercises (workout_id, exercise_id, duration_seconds, calories_burned) VALUES
(6, 2, 3000, 400.00);  -- Cycling 50 min

-- Upper Body (workout_id = 7)
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight_kg, calories_burned) VALUES
(7, 14, 4, 10, 15.00, 70.00),  -- Shoulder Press
(7, 15, 3, 12, 8.00, 50.00),   -- Bicep Curls
(7, 16, 3, 12, NULL, 60.00),   -- Tricep Dips
(7, 12, 3, 15, NULL, 70.00);   -- Push-ups

-- Morning Yoga (workout_id = 8)
INSERT INTO workout_exercises (workout_id, exercise_id, duration_seconds, calories_burned) VALUES
(8, 35, 1800, 90.00),   -- Sun Salutation
(8, 37, 600, 30.00),    -- Warrior I
(8, 38, 600, 30.00),    -- Warrior II
(8, 41, 600, 30.00);    -- Child Pose

-- Leg Day (workout_id = 9)
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight_kg, calories_burned) VALUES
(9, 9, 4, 10, 50.00, 120.00),   -- Squat
(9, 13, 3, 12, 15.00, 90.00),   -- Lunges
(9, 18, 4, 12, 80.00, 80.00),   -- Leg Press
(9, 22, 2, 60, NULL, 40.00);    -- Quad Stretch

-- Insert workout exercises for Mike's workouts
-- Basketball Practice (workout_id = 10)
INSERT INTO workout_exercises (workout_id, exercise_id, duration_seconds, calories_burned) VALUES
(10, 44, 5400, 720.00);  -- Basketball Drills 90 min

-- Weight Training (workout_id = 11)
INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight_kg, calories_burned) VALUES
(11, 8, 5, 5, 90.00, 100.00),   -- Bench Press
(11, 10, 5, 5, 140.00, 175.00), -- Deadlift
(11, 14, 4, 8, 30.00, 85.00);   -- Shoulder Press

-- Recovery Run (workout_id = 12)
INSERT INTO workout_exercises (workout_id, exercise_id, duration_seconds, calories_burned) VALUES
(12, 1, 1800, 300.00);  -- Running 30 min