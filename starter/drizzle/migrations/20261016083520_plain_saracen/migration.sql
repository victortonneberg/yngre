CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`email` text NOT NULL UNIQUE,
	`role` text DEFAULT 'user' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`category_id` text NOT NULL,
	`user_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_questions_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_questions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `answers` (
	`id` text PRIMARY KEY,
	`question_id` text NOT NULL,
	`admin_id` integer NOT NULL,
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_answers_question_id_questions_id_fk` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_answers_admin_id_users_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE INDEX `idx_questions_user_id` ON `questions` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_questions_category_id` ON `questions` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_answers_question_id` ON `answers` (`question_id`);--> statement-breakpoint
CREATE INDEX `idx_answers_admin_id` ON `answers` (`admin_id`);