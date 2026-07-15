-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MODEL';

-- AlterTable
ALTER TABLE "models" ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "models_user_id_key" ON "models"("user_id");

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

