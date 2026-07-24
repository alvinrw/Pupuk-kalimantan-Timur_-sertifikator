const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetAndSeed() {
  console.log('Menghapus semua data lama...');
  await prisma.documentHistory.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.permit.deleteMany();
  await prisma.monitoringLog.deleteMany();
  await prisma.masterItem.deleteMany();

  console.log('Mengisi data awal per kategori...');

  // 1. Peralatan Pabrik
  await prisma.masterItem.create({
    data: {
      code: 'B-201-P2',
      title: 'Primary Reformer Boiler B-201-P2',
      categoryKey: 'peralatan-pabrik',
      unitLocation: 'Pabrik 2 (Area Reformer)',
      status: 'Aktif',
      keterangan: 'Bejana Tekan Utama',
      certificates: {
        create: [
          {
            jenisSertifikat: 'Bejana Tekan / Boiler',
            noSertifikat: 'CERT-7734/DISNAKER-KT/2023',
            instansi: 'Disnaker Kaltim / Sucofindo',
            terbit: '2023-04-15',
            expired: '2026-08-15',
            status: 'Aktif'
          }
        ]
      }
    }
  });

  await prisma.masterItem.create({
    data: {
      code: 'CR-402-P3',
      title: 'Overhead Crane 50 Ton SWL',
      categoryKey: 'peralatan-pabrik',
      unitLocation: 'Pabrik 3',
      status: 'Aktif',
      keterangan: 'Pesawat Angkat & Angkut',
      certificates: {
        create: [
          {
            jenisSertifikat: 'Pesawat Angkat & Angkut',
            noSertifikat: 'SUCO-PAA-88219-2024',
            instansi: 'Sucofindo Inspeksi',
            terbit: '2024-01-10',
            expired: '2027-01-10',
            status: 'Aktif'
          }
        ]
      }
    }
  });

  // 2. Perizinan Aset
  await prisma.masterItem.create({
    data: {
      code: 'HGB-PKT-001',
      title: 'Sertifikat Hak Guna Bangunan (HGB) Lahan Pabrik 1A',
      categoryKey: 'perizinan-aset',
      unitLocation: 'Kawasan Industri Bontang',
      status: 'Aktif',
      luasM2: '50000',
      luasHa: '5.0',
      peruntukan: 'Area Pabrik Amonia',
      keterangan: 'Aset Tanah Utama',
      certificates: {
        create: [
          {
            jenisSertifikat: 'HGB / Sertifikat Tanah',
            noSertifikat: 'BPN-BTG-2020-0091',
            instansi: 'BPN Kota Bontang',
            terbit: '2020-01-01',
            expired: '2040-01-01',
            status: 'Aktif'
          }
        ]
      }
    }
  });

  // 3. Perizinan Proyek
  await prisma.masterItem.create({
    data: {
      code: 'PRJ-AMMONIA-2025',
      title: 'Izin Amdal & Pembangunan Pabrik NPK Cluster 2',
      categoryKey: 'perizinan-proyek',
      unitLocation: 'Pabrik NPK',
      status: 'Aktif',
      keterangan: 'Proyek Strategis',
      permits: {
        create: [
          {
            jenisIzin: 'Izin Lingkungan (AMDAL)',
            noIzin: 'KLHK-AMDAL-88192-2024',
            instansi: 'Kementerian LHK',
            terbit: '2024-03-01',
            expired: '2029-03-01',
            status: 'Aktif'
          }
        ]
      }
    }
  });

  // 4. Sertifikat Ciptaan
  await prisma.masterItem.create({
    data: {
      code: 'EC-001-2026',
      title: 'Hak Cipta Sistem Monitoring Sertifikasi K3 (Sertifikator)',
      categoryKey: 'sertifikat-ciptaan',
      unitLocation: 'Direksi & TI',
      status: 'Aktif',
      keterangan: 'Hak Cipta Software',
      certificates: {
        create: [
          {
            jenisSertifikat: 'Sertifikat Hak Cipta',
            noSertifikat: 'EC00202601928',
            instansi: 'DJKI Kemenkumham RI',
            terbit: '2026-01-15',
            expired: '2076-01-15',
            status: 'Aktif'
          }
        ]
      }
    }
  });

  console.log('Database berhasil dibersihkan dan diisi data contoh per kategori!');
}

resetAndSeed()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
