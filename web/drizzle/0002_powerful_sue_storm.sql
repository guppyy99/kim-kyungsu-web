CREATE TABLE `pledges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`region` varchar(50) NOT NULL,
	`category` varchar(50) NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`progress` int NOT NULL DEFAULT 0,
	`status` enum('공약','추진중','완료','보류') NOT NULL DEFAULT '공약',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pledges_id` PRIMARY KEY(`id`)
);
