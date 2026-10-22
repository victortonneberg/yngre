PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_answers` (
	`id` text PRIMARY KEY,
	`question_id` text NOT NULL UNIQUE,
	`admin_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_answers_question_id_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_answers_admin_id_users_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
INSERT INTO `__new_answers`(`id`, `question_id`, `admin_id`, `content`, `created_at`) SELECT `id`, `question_id`, `admin_id`, `content`, `created_at` FROM `answers`;--> statement-breakpoint
DROP TABLE `answers`;--> statement-breakpoint
ALTER TABLE `__new_answers` RENAME TO `answers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `idx_answers_question_id`;--> statement-breakpoint
CREATE INDEX `idx_answers_admin_id` ON `answers` (`admin_id`);