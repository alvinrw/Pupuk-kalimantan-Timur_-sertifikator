-- AlterTable
ALTER TABLE "certificates" ADD COLUMN     "namaSertifikat" TEXT;

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "itemId" TEXT,
    "certificateId" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "triggerType" TEXT NOT NULL DEFAULT 'DAYS',
    "triggerDays" INTEGER NOT NULL DEFAULT 30,
    "triggerDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_notifications" (
    "id" TEXT NOT NULL,
    "itemId" TEXT,
    "certificateId" TEXT,
    "reminderType" TEXT,
    "message" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "reminder_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iuran_keanggotaan" (
    "id" TEXT NOT NULL,
    "nomer" TEXT,
    "kompartemen" TEXT,
    "unitKerja" TEXT,
    "asosiasi" TEXT,
    "periode" TEXT,
    "nominal" DOUBLE PRECISION,
    "status" TEXT DEFAULT 'Belum Lunas',
    "statusPembayaran" TEXT DEFAULT 'Belum Lunas',
    "nama" TEXT,
    "npk" TEXT,
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "iuran_keanggotaan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_itemId_key" ON "notification_settings"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_certificateId_key" ON "notification_settings"("certificateId");

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "master_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_notifications" ADD CONSTRAINT "reminder_notifications_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "master_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_notifications" ADD CONSTRAINT "reminder_notifications_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
