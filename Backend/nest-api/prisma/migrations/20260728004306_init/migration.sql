-- CreateTable
CREATE TABLE "master_items" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "title" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "unitLocation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "luasM2" TEXT,
    "luasHa" TEXT,
    "peruntukan" TEXT,
    "issueDate" TEXT,
    "expiryDate" TEXT,
    "keterangan" TEXT,
    "documentStatus" TEXT NOT NULL DEFAULT 'PENDING_DOC',
    "exemptionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "jenisSertifikat" TEXT NOT NULL,
    "noSertifikat" TEXT,
    "instansi" TEXT,
    "terbit" TEXT,
    "expired" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permits" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "jenisIzin" TEXT NOT NULL,
    "noIzin" TEXT,
    "instansi" TEXT,
    "terbit" TEXT,
    "expired" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Aktif',
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_history" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitoring_logs" (
    "id" TEXT NOT NULL,
    "certificateId" TEXT,
    "action" TEXT,
    "logType" TEXT,
    "message" TEXT,
    "status" TEXT,
    "detail" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "monitoring_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "master_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permits" ADD CONSTRAINT "permits_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "master_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_history" ADD CONSTRAINT "document_history_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "master_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monitoring_logs" ADD CONSTRAINT "monitoring_logs_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
