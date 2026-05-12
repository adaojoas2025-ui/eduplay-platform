-- IRP Master Automação — License tables
-- Migration: add_irp_license

CREATE TABLE "IrpLicense" (
    "id" TEXT NOT NULL,
    "licenseKey" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "activeDeviceId" TEXT,
    "lastSeenAt" TIMESTAMP(3),
    "extensionVersion" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IrpLicense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IrpLicenseEvent" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "deviceId" TEXT,
    "extensionVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IrpLicenseEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IrpLicense_licenseKey_key" ON "IrpLicense"("licenseKey");
CREATE INDEX "IrpLicense_licenseKey_idx" ON "IrpLicense"("licenseKey");
CREATE INDEX "IrpLicense_email_idx" ON "IrpLicense"("email");
CREATE INDEX "IrpLicense_status_idx" ON "IrpLicense"("status");
CREATE INDEX "IrpLicenseEvent_licenseId_idx" ON "IrpLicenseEvent"("licenseId");

ALTER TABLE "IrpLicenseEvent" ADD CONSTRAINT "IrpLicenseEvent_licenseId_fkey"
    FOREIGN KEY ("licenseId") REFERENCES "IrpLicense"("id") ON DELETE CASCADE ON UPDATE CASCADE;
