-- Smart LED Street Lighting Fault Reporting & Maintenance Database Schema

CREATE DATABASE IF NOT EXISTS smart_light_db;
USE smart_light_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('citizen', 'admin', 'staff') NOT NULL DEFAULT 'citizen',
    phone VARCHAR(20),
    credit_points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. StreetLights Table
CREATE TABLE IF NOT EXISTS StreetLights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pole_number VARCHAR(50) NOT NULL UNIQUE,
    area VARCHAR(100) NOT NULL,
    status ENUM('working', 'faulty', 'under_maintenance') DEFAULT 'working',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Complaints Table
CREATE TABLE IF NOT EXISTS Complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    citizen_id INT NOT NULL,
    pole_number VARCHAR(50) NOT NULL,
    area VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255),
    status ENUM('Pending', 'Accepted', 'Declined', 'In Progress', 'Completed') DEFAULT 'Pending',
    assigned_staff_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_staff_id) REFERENCES Users(id) ON DELETE SET NULL
);

-- 4. Maintenance Table
CREATE TABLE IF NOT EXISTS Maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL,
    staff_id INT NOT NULL,
    repair_notes TEXT,
    repair_image_url VARCHAR(255),
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 5. Credit point history
CREATE TABLE IF NOT EXISTS CreditHistory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id INT NOT NULL UNIQUE,
    staff_id INT NOT NULL,
    points INT NOT NULL DEFAULT 20,
    completed_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 6. Feedback Table
CREATE TABLE IF NOT EXISTS Feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    citizen_id INT NOT NULL,
    subject VARCHAR(150) NOT NULL DEFAULT 'General Feedback',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (citizen_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 7. In-app notifications
CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    complaint_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (complaint_id) REFERENCES Complaints(id) ON DELETE CASCADE
);
