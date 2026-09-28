-- Create database

CREATE DATABASE notes_app;
USE notes_app;

-- Users table (optional if single-user, but useful for multi-user later)

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,    -- Unique ID for each user
  name VARCHAR(25) NOT NULL,           -- User's name
  email VARCHAR(50) UNIQUE NOT NULL,   -- User's email (must be unique)
  password_hash VARCHAR(255) NOT NULL   -- Hashed password for security
);

-- Notes table

CREATE TABLE notes (
  id INT AUTO_INCREMENT PRIMARY KEY,                                            -- Unique ID for each note
  user_id INT NOT NULL,                                                         -- Foreign key to users table
  title VARCHAR(100),                                                           -- Title of the note
  content TEXT,                                                                 -- Content of the note
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                               -- Timestamp when the note was created
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,   -- Timestamp when the note was last updated
  FOREIGN KEY (user_id) REFERENCES users(id)                                    -- Foreign key constraint linking to the users table
);
