-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "idType" TEXT NOT NULL DEFAULT 'SA_ID',
    "idNumber" TEXT NOT NULL,
    "permitType" TEXT,
    "permitNumber" TEXT,
    "permitExpiryDate" DATETIME,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("addressLine", "city", "dateOfBirth", "firstName", "gender", "id", "idNumber", "lastName", "postalCode", "province", "updatedAt", "userId") SELECT "addressLine", "city", "dateOfBirth", "firstName", "gender", "id", "idNumber", "lastName", "postalCode", "province", "updatedAt", "userId" FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE UNIQUE INDEX "Profile_idNumber_key" ON "Profile"("idNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
