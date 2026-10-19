PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_questions` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_questions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_questions`(`id`, `title`, `content`, `user_id`, `created_at`) SELECT `id`, `title`, `content`, `user_id`, `created_at` FROM `questions`;--> statement-breakpoint
DROP TABLE `questions`;--> statement-breakpoint
ALTER TABLE `__new_questions` RENAME TO `questions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_questions_category_id`;--> statement-breakpoint
CREATE INDEX `idx_questions_user_id` ON `questions` (`user_id`);--> statement-breakpoint
DROP TABLE `categories`;