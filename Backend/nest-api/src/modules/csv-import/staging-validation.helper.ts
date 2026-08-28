import { PrismaService } from '../../database/prisma.service';

export function validateItem(item: {
  title: string;
  code: string;
  unitLocation: string;
  categoryKey: string;
  keterangan: string;
  issueDate?: string;
  expiryDate?: string;
}): string[] {
  const errors: string[] = [];
  const clean = (val: any) => (val || '').trim();
  const isEmpty = (val: any) => {
    const v = clean(val);
    return v === '' || v === '-';
  };

  const category = clean(item.categoryKey);

  // Parse keterangan
  let meta: any = {};
  try {
    if (item.keterangan && item.keterangan.startsWith('{')) {
      meta = JSON.parse(item.keterangan);
    }
  } catch {}

  if (category === 'peralatan-pabrik') {
    if (isEmpty(item.title)) {
      errors.push('Merek / Nama Peralatan wajib diisi');
    }
    if (isEmpty(item.code)) {
      errors.push('Nomor Seri wajib diisi');
    }
    if (isEmpty(meta.tipe)) {
      errors.push('Jenis Peralatan / Tipe wajib diisi');
    }
  } else {
    // Generic validation
    if (isEmpty(item.title)) {
      errors.push('Nama Aset/Proyek/Produk wajib diisi');
    }
    if (isEmpty(item.code)) {
      errors.push('Kode / Registrasi wajib diisi');
    }
  }

  return errors;
}

export async function recalculateStagingStatuses(prisma: PrismaService, categoryKey: string) {
  // 1. Ambil semua item di categoryKey tersebut
  const allItems = await prisma.masterItem.findMany({
    where: { categoryKey },
    orderBy: { createdAt: 'asc' }, // Dari yang terlama ke terbaru
    select: {
      id: true,
      title: true,
      code: true,
      unitLocation: true,
      categoryKey: true,
      keterangan: true,
      documentStatus: true,
      issueDate: true,
      expiryDate: true,
      createdAt: true
    }
  });

  // Staging items yang aktif
  const stagingItems = allItems.filter(i => i.documentStatus === 'PENDING_DOC');
  // Data utama yang sudah dirampungkan
  const dataUtamaItems = allItems.filter(i => i.documentStatus !== 'PENDING_DOC');

  const norm = (val: string) => {
    return (val || '').trim().toLowerCase().replace(/^-$/, '');
  };

  const getCompareKey = (item: any) => {
    return `${norm(item.code)}|${norm(item.title)}`;
  };

  // Build a map of keys for Data Utama
  const dataUtamaKeys = new Set(dataUtamaItems.map(i => getCompareKey(i)));

  // Process staging items
  const processedKeysInStaging = new Set<string>();

  for (const item of stagingItems) {
    // A. Jalankan validasi mandatory
    const errors = validateItem(item);
    const hasErrors = errors.length > 0;

    let finalStatus = 'NEW';
    let finalErrorsJson = null;

    if (hasErrors) {
      finalStatus = 'FAILED';
      finalErrorsJson = JSON.stringify(errors);
    } else {
      const compareKey = getCompareKey(item);
      
      // B. Cek apakah ada duplikat:
      // - Ada di Data Utama
      // - Atau ada kecocokan sebelum dirinya di Staging
      const isDuplicate = dataUtamaKeys.has(compareKey) || processedKeysInStaging.has(compareKey);
      
      if (isDuplicate) {
        finalStatus = 'DUPLICATE';
      } else {
        finalStatus = 'NEW';
      }
      processedKeysInStaging.add(compareKey);
    }

    // Update status validasi di DB
    await prisma.masterItem.update({
      where: { id: item.id },
      data: {
        validationStatus: finalStatus,
        validationErrors: finalErrorsJson
      }
    });
  }
}
