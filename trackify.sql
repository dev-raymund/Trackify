-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 27, 2025 at 04:19 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `trackify`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity`
--

CREATE TABLE `activity` (
  `id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `user_id` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity`
--

INSERT INTO `activity` (`id`, `description`, `amount`, `category`, `type`, `user_id`, `timestamp`) VALUES
(60, 'Salary of January', '20000', 'Salary', 'income', 6, '2025-02-10 07:12:18'),
(61, 'Pay Parcel', '300', 'Shopping', 'expense', 6, '2025-02-10 07:12:39'),
(62, 'Savings Transfer', '1000', 'Savings', 'expense', 6, '2025-02-10 07:25:26'),
(63, 'Pay Parcel', '300', 'Shopping', 'expense', 6, '2025-02-10 08:41:00'),
(64, 'Savings Transfer', '500000', 'Savings', 'expense', 6, '2025-02-10 08:44:04'),
(65, 'Savings Transfer', '1000', 'Savings', 'expense', 6, '2025-02-10 08:48:38'),
(66, 'Savings Transfer', '30000', 'Savings', 'expense', 6, '2025-02-10 08:48:51'),
(67, 'Buy Grocery', '2500', 'Food', 'expense', 6, '2025-02-11 11:23:12'),
(68, 'Pay Bills', '1000', 'Bills', 'expense', 6, '2025-02-15 00:45:31'),
(69, 'Pay Parcel', '500', 'Shopping', 'expense', 6, '2025-02-15 01:02:41'),
(70, 'Pay Parcel', '100', 'Shopping', 'expense', 6, '2025-02-15 01:05:59'),
(71, 'Pay Food', '100', 'Food', 'expense', 6, '2025-02-17 23:25:52'),
(77, 'Samgyup', '199', 'Food', 'expense', 8, '2025-02-20 00:19:54'),
(78, 'Savings Transfer', '10000', 'Savings', 'expense', 6, '2025-02-25 01:40:35');

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `category` varchar(50) NOT NULL,
  `budget_limit` varchar(255) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`id`, `user_id`, `category`, `budget_limit`, `timestamp`) VALUES
(13, 6, 'Food', '10500', '2025-02-25 01:31:42'),
(14, 6, 'Shopping', '5000', '2025-02-25 01:31:49');

-- --------------------------------------------------------

--
-- Table structure for table `savings_goals`
--

CREATE TABLE `savings_goals` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `goal_name` varchar(255) NOT NULL,
  `target_amount` varchar(255) NOT NULL,
  `saved_amount` varchar(255) DEFAULT NULL,
  `end_date` date NOT NULL,
  `status` enum('in-progress','completed') DEFAULT 'in-progress',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `savings_goals`
--

INSERT INTO `savings_goals` (`id`, `user_id`, `goal_name`, `target_amount`, `saved_amount`, `end_date`, `status`, `created_at`) VALUES
(15, 6, 'Buy a car', '1500000', '10000', '2025-12-25', 'in-progress', '2025-02-25 01:39:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` int(11) NOT NULL,
  `reset_token` varchar(255) NOT NULL,
  `reset_expires` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `reset_token`, `reset_expires`) VALUES
(6, 'Raymund', 'Hermoso', 'raymundhermoso.dev@gmail.com', '$2y$10$FoX.sr.skl4DwILmJNuYJevNzJfHg0wklYkcoypxZ1Wc.quPkLbeS', 0, '', ''),
(7, 'Aireen', 'Deocampo', 'aireen@mail.com', '$2y$10$4yT9UH.uvE8RadQxUtnXm.HY9QKN0iw.DnBohcOtNjrHNys.pbCwi', 1, '', ''),
(8, 'Mark', 'Doe', 'mark@mail.com', '$2y$10$uWQoqb/R/Nr/M/c.lD.PSeE/NPcCNmelBH2v//W18q6vjAiLTF4w6', 0, '', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity`
--
ALTER TABLE `activity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `savings_goals`
--
ALTER TABLE `savings_goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity`
--
ALTER TABLE `activity`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `savings_goals`
--
ALTER TABLE `savings_goals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity`
--
ALTER TABLE `activity`
  ADD CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `savings_goals`
--
ALTER TABLE `savings_goals`
  ADD CONSTRAINT `savings_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
