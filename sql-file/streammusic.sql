-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 22, 2026 at 03:39 PM
-- Server version: 8.4.7
-- PHP Version: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `streammusic`
--

-- --------------------------------------------------------

--
-- Table structure for table `albums`
--

DROP TABLE IF EXISTS `albums`;
CREATE TABLE IF NOT EXISTS `albums` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `titre` varchar(200) NOT NULL,
  `dateSortie` date DEFAULT NULL,
  `artist_id` bigint UNSIGNED NOT NULL,
  `cover` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `albums_artist_id_foreign` (`artist_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `artist_profiles`
--

DROP TABLE IF EXISTS `artist_profiles`;
CREATE TABLE IF NOT EXISTS `artist_profiles` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `nomArtiste` varchar(150) NOT NULL,
  `bio` text,
  `photo` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `artist_profiles_user_id_foreign` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `artist_profiles`
--

INSERT INTO `artist_profiles` (`id`, `user_id`, `nomArtiste`, `bio`, `photo`, `created_at`, `updated_at`) VALUES
(2, 3, 'heyyy', 'hello gang', 'images/wVyRVXZAuS7y7vIyGWS55LRN2k84P0wGX6hbKk61.jpg', '2026-05-15 15:42:02', '2026-05-15 15:44:29'),
(3, 4, 'maybe', NULL, 'images/soYD7waDFt0s7tyunVu8jP57QW4P06ehh7GV1uzF.jpg', '2026-05-21 16:11:55', '2026-05-21 16:11:55');

--
-- Triggers `artist_profiles`
--
DROP TRIGGER IF EXISTS `trg_artist_profile_default_photo`;
DELIMITER $$
CREATE TRIGGER `trg_artist_profile_default_photo` BEFORE INSERT ON `artist_profiles` FOR EACH ROW BEGIN

    IF NEW.photo IS NULL THEN

        SET NEW.photo = (
            SELECT photo
            FROM users
            WHERE id = NEW.user_id
        );

    END IF;

END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(191) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(191) NOT NULL,
  `owner` varchar(191) NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chansons`
--

DROP TABLE IF EXISTS `chansons`;
CREATE TABLE IF NOT EXISTS `chansons` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `titre` varchar(200) NOT NULL,
  `duree` varchar(10) DEFAULT NULL,
  `fichier` varchar(191) NOT NULL,
  `nombreEcoutes` bigint UNSIGNED NOT NULL DEFAULT '0',
  `album_id` bigint UNSIGNED DEFAULT NULL,
  `artist_id` bigint UNSIGNED NOT NULL,
  `cover` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `chansons_album_id_foreign` (`album_id`),
  KEY `chansons_artist_id_foreign` (`artist_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chanson_playlist`
--

DROP TABLE IF EXISTS `chanson_playlist`;
CREATE TABLE IF NOT EXISTS `chanson_playlist` (
  `chanson_id` bigint UNSIGNED NOT NULL,
  `playlist_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`chanson_id`,`playlist_id`),
  KEY `chanson_playlist_playlist_id_foreign` (`playlist_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `chanson_playlist`
--

INSERT INTO `chanson_playlist` (`chanson_id`, `playlist_id`, `created_at`, `updated_at`) VALUES
(4, 5, NULL, NULL),
(6, 2, NULL, NULL),
(6, 4, NULL, NULL),
(6, 7, NULL, NULL),
(4, 1, NULL, NULL),
(7, 8, NULL, NULL),
(7, 9, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(191) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(191) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `listener_profiles`
--

DROP TABLE IF EXISTS `listener_profiles`;
CREATE TABLE IF NOT EXISTS `listener_profiles` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `listener_profiles_user_id_foreign` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `listener_profiles`
--

INSERT INTO `listener_profiles` (`id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 3, '2026-05-15 12:35:39', '2026-05-15 12:35:52'),
(6, 5, '2026-05-19 21:23:01', '2026-05-19 21:23:01'),
(3, 4, '2026-05-14 22:18:32', '2026-05-14 22:18:32');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000001_create_cache_table', 1),
(2, '0001_01_01_000002_create_jobs_table', 1),
(3, '2024_01_01_000001_create_users_table', 1),
(4, '2024_01_01_000002_create_artist_profiles_table', 1),
(5, '2024_01_01_000003_create_listener_profiles_table', 1),
(6, '2024_01_01_000004_create_albums_table', 1),
(7, '2024_01_01_000005_create_chansons_table', 1),
(8, '2024_01_01_000006_create_playlists_table', 1),
(9, '2024_01_01_000007_create_chanson_playlist_table', 1),
(10, '2024_01_01_000008_create_notages_table', 1),
(11, '2026_05_10_233014_create_personal_access_tokens_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notages`
--

DROP TABLE IF EXISTS `notages`;
CREATE TABLE IF NOT EXISTS `notages` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `note` tinyint UNSIGNED NOT NULL,
  `listener_id` bigint UNSIGNED NOT NULL,
  `chanson_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `notages_listener_id_chanson_id_unique` (`listener_id`,`chanson_id`),
  KEY `notages_chanson_id_foreign` (`chanson_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notages`
--

INSERT INTO `notages` (`id`, `note`, `listener_id`, `chanson_id`, `created_at`, `updated_at`) VALUES
(1, 5, 1, 6, '2026-05-17 22:26:19', '2026-05-21 13:42:16'),
(6, 2, 3, 3, '2026-05-19 21:16:33', '2026-05-19 21:16:46'),
(3, 5, 1, 3, '2026-05-17 22:33:45', '2026-05-21 13:42:18'),
(5, 5, 1, 4, '2026-05-17 22:44:59', '2026-05-21 13:42:17'),
(7, 5, 3, 4, '2026-05-19 21:16:42', '2026-05-19 21:16:42'),
(8, 3, 3, 6, '2026-05-19 22:46:56', '2026-05-19 22:46:56'),
(9, 3, 3, 7, '2026-05-21 16:24:44', '2026-05-21 16:26:00');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=MyISAM AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'auth_token', '03812d12c53fe8643c319140a40f8cab19b992d63cc303fd9092a82f0a2bd475', '[\"*\"]', NULL, NULL, '2026-05-11 20:58:12', '2026-05-11 20:58:12'),
(2, 'App\\Models\\User', 1, 'auth_token', '9c6fd8baf2bdd341a3c5964cf0052716ef276050ff7d0be6dc533d4c4779d5cd', '[\"*\"]', '2026-05-11 21:07:02', NULL, '2026-05-11 21:00:31', '2026-05-11 21:07:02'),
(3, 'App\\Models\\User', 2, 'auth_token', 'dea1d335f989ca7d79d0adafbe1f5816ff6c56b6d69727e1874d1112cf534962', '[\"*\"]', '2026-05-11 21:26:50', NULL, '2026-05-11 21:18:53', '2026-05-11 21:26:50'),
(4, 'App\\Models\\User', 3, 'auth_token', '0567e0b92449e91832df6b277b5e72a4b008fb863f36e3d4b784d2da502fa703', '[\"*\"]', NULL, NULL, '2026-05-14 14:45:00', '2026-05-14 14:45:00'),
(5, 'App\\Models\\User', 3, 'auth_token', '7dad28f63d8c4c8188b3c7f38abf6430d561c546fd653a6fc40e4a99390fb35f', '[\"*\"]', '2026-05-14 22:07:12', NULL, '2026-05-14 14:48:07', '2026-05-14 22:07:12'),
(6, 'App\\Models\\User', 3, 'auth_token', '8af4152e7ba0150ca261b7cde44f729e485d0dcfeb2f77f483b6dd3d3c11852d', '[\"*\"]', '2026-05-14 22:17:34', NULL, '2026-05-14 22:07:33', '2026-05-14 22:17:34'),
(7, 'App\\Models\\User', 4, 'auth_token', '4c6b426700d5003cd534728788d8ff02079951990050d00096b8428ddb8981e3', '[\"*\"]', '2026-05-14 22:32:06', NULL, '2026-05-14 22:18:32', '2026-05-14 22:32:06'),
(8, 'App\\Models\\User', 3, 'auth_token', '988e4f0f725bcefba22bb7bc6dddf14e92ddcc0a5281069e5ad98b0f0d628f6d', '[\"*\"]', '2026-05-14 22:34:18', NULL, '2026-05-14 22:32:22', '2026-05-14 22:34:18'),
(9, 'App\\Models\\User', 3, 'auth_token', '66a4871d2d224538cfb5ab214692ffa87256bbb034e6d25476c2e9fcdc4654b7', '[\"*\"]', '2026-05-15 11:31:28', NULL, '2026-05-14 22:34:21', '2026-05-15 11:31:28'),
(10, 'App\\Models\\User', 3, 'auth_token', 'ce33dec714cf27b7f1a0a2024d809274038aff11ffc3c51ddc5893a5467b9e5f', '[\"*\"]', '2026-05-15 11:37:40', NULL, '2026-05-15 11:31:31', '2026-05-15 11:37:40'),
(11, 'App\\Models\\User', 4, 'auth_token', '002da80535c30b262f59f4f1bacfb49379510f2c6ce2b31a9e1f95b1f850e284', '[\"*\"]', '2026-05-15 11:39:25', NULL, '2026-05-15 11:38:03', '2026-05-15 11:39:25'),
(12, 'App\\Models\\User', 3, 'auth_token', '5745a4f83ad506eec2dbf11f74bc6ff5cbfddd9413ba46ef1e53c0b1dfaba4e6', '[\"*\"]', '2026-05-15 14:07:33', NULL, '2026-05-15 11:39:30', '2026-05-15 14:07:33'),
(13, 'App\\Models\\User', 3, 'auth_token', '8410d0fb1624ec86c6b573381fc9257434f5720f1e5d964198ccfc5d8a54ff6a', '[\"*\"]', '2026-05-15 16:54:04', NULL, '2026-05-15 14:07:39', '2026-05-15 16:54:04'),
(14, 'App\\Models\\User', 4, 'auth_token', '80dc242bd8a189e236adf638d2975b81e0ad34ed04867eadd7f46af6c5c45c80', '[\"*\"]', '2026-05-15 17:02:57', NULL, '2026-05-15 16:54:29', '2026-05-15 17:02:57'),
(15, 'App\\Models\\User', 3, 'auth_token', '47441e293f81c7b71d5eb2dbca19d11ab1b5684d791f7f13538156f1f0ab50c1', '[\"*\"]', '2026-05-15 18:04:54', NULL, '2026-05-15 17:02:59', '2026-05-15 18:04:54'),
(16, 'App\\Models\\User', 3, 'auth_token', '44e5abfd804b471d4220ac2b8a01457612420a9eee28807d2183544cf02cfd70', '[\"*\"]', '2026-05-15 18:49:49', NULL, '2026-05-15 18:16:42', '2026-05-15 18:49:49'),
(20, 'App\\Models\\User', 3, 'auth_token', '309ced25788332ed730e71a00eff09e90d85a46124b48b04060e6da174d9ac9f', '[\"*\"]', '2026-05-16 23:22:06', NULL, '2026-05-16 22:40:31', '2026-05-16 23:22:06'),
(21, 'App\\Models\\User', 3, 'auth_token', 'b07e48c40037345779e99905f3d19772c2a29f52661aa04b9a4762ddbacb2746', '[\"*\"]', '2026-05-16 23:44:34', NULL, '2026-05-16 23:34:23', '2026-05-16 23:44:34'),
(22, 'App\\Models\\User', 3, 'auth_token', 'd74e018926eb4c1ddf1262e88dafc021e05ec4c9364267e10f5d006da2b89b17', '[\"*\"]', '2026-05-17 00:23:07', NULL, '2026-05-16 23:45:16', '2026-05-17 00:23:07'),
(28, 'App\\Models\\User', 3, 'auth_token', '70a8a5a5e84173f2c2269d7029df6eb058bcaf42eddd476eed39b181031954ca', '[\"*\"]', '2026-05-19 18:25:53', NULL, '2026-05-19 18:09:56', '2026-05-19 18:25:53'),
(29, 'App\\Models\\User', 3, 'auth_token', '83c1d0dd4ac55b831041fa4c51c580a52677fbc438bedab360d9ae8d83f0ee9e', '[\"*\"]', '2026-05-19 19:40:45', NULL, '2026-05-19 19:03:14', '2026-05-19 19:40:45'),
(30, 'App\\Models\\User', 3, 'auth_token', '9db3a843c3e8d3578d56d6145e96bb58f53146be9cb3dffee15ddcc1ec938018', '[\"*\"]', '2026-05-19 20:09:24', NULL, '2026-05-19 19:51:05', '2026-05-19 20:09:24'),
(49, 'App\\Models\\User', 5, 'auth_token', '34fe6da1e5ae1138f28ae4a6aba19b999bef92463a7b4b746a253bf0f8672c5d', '[\"*\"]', '2026-05-22 10:48:57', NULL, '2026-05-22 10:48:33', '2026-05-22 10:48:57');

-- --------------------------------------------------------

--
-- Table structure for table `playlists`
--

DROP TABLE IF EXISTS `playlists`;
CREATE TABLE IF NOT EXISTS `playlists` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `titre` varchar(150) NOT NULL,
  `dateCreation` date DEFAULT NULL,
  `listener_id` bigint UNSIGNED NOT NULL,
  `cover` varchar(191) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `playlists_listener_id_foreign` (`listener_id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `playlists`
--

INSERT INTO `playlists` (`id`, `titre`, `dateCreation`, `listener_id`, `cover`, `created_at`, `updated_at`) VALUES
(1, 'here', '2026-05-15', 3, NULL, '2026-05-15 11:38:46', '2026-05-19 22:45:53'),
(2, 'covers', '2026-05-15', 1, NULL, '2026-05-15 14:07:47', '2026-05-21 13:43:04'),
(3, 'jj', '2026-05-17', 1, NULL, '2026-05-17 22:08:31', '2026-05-17 22:08:31'),
(5, 'fuck youuu', '2026-05-19', 1, NULL, '2026-05-19 19:51:16', '2026-05-19 20:37:06'),
(6, 'tttt', '2026-05-19', 1, NULL, '2026-05-19 19:57:26', '2026-05-19 19:57:26'),
(8, 'New Playlist', '2026-05-21', 3, NULL, '2026-05-21 16:17:17', '2026-05-21 16:17:17'),
(10, 'ghj', '2026-05-21', 3, NULL, '2026-05-21 20:32:38', '2026-05-21 20:32:38');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `photo` varchar(191) DEFAULT NULL,
  `modepass` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `dateN` date DEFAULT NULL,
  `compteActif` tinyint(1) NOT NULL DEFAULT '1',
  `role` enum('listener','artist','admin') NOT NULL DEFAULT 'listener',
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `nom`, `prenom`, `photo`, `modepass`, `email`, `dateN`, `compteActif`, `role`, `remember_token`, `created_at`, `updated_at`) VALUES
(5, 'chiadmin', 'admin', 'chi', NULL, '$2y$12$pQjkYlBWu2..htaAqwMyh..klec89lSlTIhPQKpLByQkLMwuuTQla', 'doulkifl.t843@ucd.ac.ma', '2004-05-04', 1, 'admin', NULL, '2026-05-19 21:23:01', '2026-05-19 21:23:01'),
(3, 'Taha', 'Doulkifl', 'Taha', 'images/wVyRVXZAuS7y7vIyGWS55LRN2k84P0wGX6hbKk61.jpg', '$2y$12$Z9nvig4U2moxGYA5hMZmouX6ITihfy7iuf./DzIvTGgeYYffBD/Q6', 'doulkifltaha@gmail.com', '2004-12-02', 1, 'artist', NULL, '2026-05-14 14:45:00', '2026-05-19 21:45:48'),
(4, 'chi', 'chi', 'chi', 'images/soYD7waDFt0s7tyunVu8jP57QW4P06ehh7GV1uzF.jpg', '$2y$12$hIiwbmFaOrHLsYl1WgLbsepZb9k.kAHLF/KPYpAbVd.7n0a1xO/4S', 'kuroyamihh@gmail.com', '2000-02-03', 1, 'artist', NULL, '2026-05-14 22:18:32', '2026-05-21 16:11:55');

--
-- Triggers `users`
--
DROP TRIGGER IF EXISTS `trg_user_photo_update`;
DELIMITER $$
CREATE TRIGGER `trg_user_photo_update` AFTER UPDATE ON `users` FOR EACH ROW BEGIN

    IF NEW.photo <> OLD.photo
       AND OLD.role = 'artist'
    THEN

        UPDATE artist_profiles
        SET photo = NEW.photo
        WHERE user_id = OLD.id;

    END IF;

END
$$
DELIMITER ;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
