-- phpMyAdmin SQL Dump
-- version 4.9.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 30, 2020 at 10:14 AM
-- Server version: 5.7.30
-- PHP Version: 7.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `afv_otribot`
--

-- --------------------------------------------------------

--
-- Table structure for table `last_result`
--

CREATE TABLE `last_result` (
  `chat_id` varchar(30) NOT NULL,
  `result` text NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Dumping data for table `last_result`
--

INSERT INTO `last_result` (`chat_id`, `result`) VALUES
('281023381', '[1481317168264,1481317168266,1481317168267,1481317168268,1481317168269,1481317168270,1481317168271,1481317168272,1481317168274,1481317168275,1481317168276,1481317168277,1481317168278,1481317168279,1481317168280,1481317168282,1481317168283,1481317168284,1481317168285,1481317168286,1481317168287,1481317168289,1481317168290,1481317168291,1481317168292,1481317168293,1481317168295,1481317168296,1481317168297,1481317168298,1481317168299]'),
('37427128', '[1481317168266,1481317168269,1481317168272,1481317168276,1481317168279,1481317168293]');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `chat_id` varchar(30) NOT NULL,
  `message` varchar(130) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `last_result`
--
ALTER TABLE `last_result`
  ADD PRIMARY KEY (`chat_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
