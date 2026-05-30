/*
  Warnings:

  - You are about to drop the `Board` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Column` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BoardMembers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TaskAssignees` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Column" DROP CONSTRAINT "Column_boardId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_columnId_fkey";

-- DropForeignKey
ALTER TABLE "_BoardMembers" DROP CONSTRAINT "_BoardMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_BoardMembers" DROP CONSTRAINT "_BoardMembers_B_fkey";

-- DropForeignKey
ALTER TABLE "_TaskAssignees" DROP CONSTRAINT "_TaskAssignees_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskAssignees" DROP CONSTRAINT "_TaskAssignees_B_fkey";

-- DropTable
DROP TABLE "Board";

-- DropTable
DROP TABLE "Column";

-- DropTable
DROP TABLE "Profile";

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "_BoardMembers";

-- DropTable
DROP TABLE "_TaskAssignees";

-- DropEnum
DROP TYPE "Priority";

-- DropEnum
DROP TYPE "Role";

-- DropEnum
DROP TYPE "TaskType";
