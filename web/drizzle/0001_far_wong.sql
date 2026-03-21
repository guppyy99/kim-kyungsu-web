CREATE TABLE `announcements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('공지','보도','일정') NOT NULL DEFAULT '공지',
	`title` varchar(500) NOT NULL,
	`content` text,
	`isNew` boolean NOT NULL DEFAULT true,
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `citizen_proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`region` varchar(50),
	`category` varchar(50),
	`title` varchar(300) NOT NULL,
	`content` text NOT NULL,
	`status` enum('접수','검토중','반영','보류') NOT NULL DEFAULT '접수',
	`attachmentUrl` text,
	`attachmentKey` varchar(512),
	`attachmentName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `citizen_proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `policy_docs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`category` enum('심층리포트','보도자료','카드뉴스') NOT NULL DEFAULT '보도자료',
	`description` text,
	`fileUrl` text,
	`fileKey` varchar(512),
	`fileName` varchar(255),
	`publishedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policy_docs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleDate` varchar(10) NOT NULL,
	`time` varchar(5) NOT NULL,
	`label` enum('이동','행사','현장','내부','회의') NOT NULL DEFAULT '행사',
	`title` varchar(300) NOT NULL,
	`isCurrent` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uploaded_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(128),
	`fileSize` int,
	`category` enum('policy','press','card','pledge','other') NOT NULL DEFAULT 'other',
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uploaded_files_id` PRIMARY KEY(`id`)
);
