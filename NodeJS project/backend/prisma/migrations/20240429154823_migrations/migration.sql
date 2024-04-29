-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "Users" (
    "userID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Roles" NOT NULL DEFAULT 'USER',

    CONSTRAINT "Users_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Servics" (
    "serviceID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0.00,

    CONSTRAINT "Servics_pkey" PRIMARY KEY ("serviceID")
);

-- CreateTable
CREATE TABLE "Employees" (
    "employeeID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "positions" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("employeeID")
);

-- CreateTable
CREATE TABLE "EmployeesServices" (
    "employeeID" INTEGER NOT NULL,
    "serviceID" INTEGER NOT NULL,

    CONSTRAINT "EmployeesServices_pkey" PRIMARY KEY ("employeeID","serviceID")
);

-- CreateTable
CREATE TABLE "Registration" (
    "registrationID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "employeeID" INTEGER NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("registrationID")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "reviewID" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "employeeID" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comm" TEXT,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("reviewID")
);

-- CreateTable
CREATE TABLE "Schedule" (
    "scheduleID" SERIAL NOT NULL,
    "employeeID" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("scheduleID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Servics_name_key" ON "Servics"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Employees_email_key" ON "Employees"("email");

-- AddForeignKey
ALTER TABLE "EmployeesServices" ADD CONSTRAINT "EmployeesServices_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "Employees"("employeeID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeesServices" ADD CONSTRAINT "EmployeesServices_serviceID_fkey" FOREIGN KEY ("serviceID") REFERENCES "Servics"("serviceID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "Employees"("employeeID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("userID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "Employees"("employeeID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_employeeID_fkey" FOREIGN KEY ("employeeID") REFERENCES "Employees"("employeeID") ON DELETE CASCADE ON UPDATE CASCADE;
