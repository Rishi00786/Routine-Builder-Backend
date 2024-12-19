-- CreateTable
CREATE TABLE `Routines` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `milestones` VARCHAR(191) NOT NULL,
    `imagePreview` VARCHAR(191) NOT NULL,
    `steps` JSON NOT NULL,
    `benefits` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Routines_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
