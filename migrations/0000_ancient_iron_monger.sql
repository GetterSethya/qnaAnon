CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`body` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`deletedAt` integer,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`bio` text,
	`hashPassword` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `questions_id_unique` ON `questions` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `userId_unique_idx` ON `questions` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_id_unique` ON `users` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `username_unique_idx` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_unique_idx` ON `users` (`email`);