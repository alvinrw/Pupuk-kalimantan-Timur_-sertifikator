const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const items = await prisma.masterItem.findMany({
    where: {},
    include: {
      notificationSetting: true,
      certificates: {
        include: {
          notificationSetting: true
        }
      }
    }
  });

  const stats = {
    aktif: 0,
    hariIni: 0,
    mingguIni: 0,
    bulanIni: 0,
    expired: 0
  };

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + (6 - today.getDay()));

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  for (const item of items) {
    const certs = item.certificates || [];
    const activeCerts = certs.filter(c => c.status === 'Aktif' || c.status === 'Active' || !c.status);

    const evaluateTarget = (expiryStr, targetSetting) => {
      if (!expiryStr || expiryStr === '-' || expiryStr.trim() === '') return;

      let expiry = new Date(expiryStr);
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(expiryStr)) {
        const parts = expiryStr.split('/');
        expiry = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
      if (isNaN(expiry.getTime())) return;
      expiry.setHours(0, 0, 0, 0);

      const sisaHari = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isEnabled = targetSetting ? targetSetting.isEnabled : (item.notificationSetting ? item.notificationSetting.isEnabled : true);
      if (!isEnabled) return;

      const triggerType = targetSetting ? targetSetting.triggerType : (item.notificationSetting ? item.notificationSetting.triggerType : 'DAYS');
      const triggerDays = targetSetting ? targetSetting.triggerDays : (item.notificationSetting?.triggerDays ?? 30);
      const triggerDate = targetSetting ? targetSetting.triggerDate : item.notificationSetting?.triggerDate;

      let isTriggered = false;
      let activeDate = new Date();

      if (triggerType === 'DATE' && triggerDate) {
        const tDate = new Date(triggerDate);
        tDate.setHours(0, 0, 0, 0);
        isTriggered = today >= tDate;
        activeDate = tDate;
      } else {
        isTriggered = sisaHari <= triggerDays;
        activeDate = new Date(expiry);
        activeDate.setDate(activeDate.getDate() - triggerDays);
        activeDate.setHours(0,0,0,0);
      }

      const isExpired = sisaHari < 0;
      const isMulaiHariIni = isEnabled && activeDate.getTime() === today.getTime();
      const isMingguIni = activeDate >= startOfWeek && activeDate <= endOfWeek;
      const isBulanIni = activeDate >= startOfMonth && activeDate <= endOfMonth;

      if (isEnabled) stats.aktif++;
      if (isExpired) stats.expired++;
      if (isMulaiHariIni) stats.hariIni++;
      if (isMingguIni) stats.mingguIni++;
      if (isBulanIni) stats.bulanIni++;
    };

    if (activeCerts.length > 0) {
      const primaryCert = activeCerts.slice().sort((a, b) => {
        const dA = new Date(a.expired && a.expired !== '-' ? a.expired : '1970-01-01').getTime();
        const dB = new Date(b.expired && b.expired !== '-' ? b.expired : '1970-01-01').getTime();
        if (dA !== dB) return dB - dA;
        const hasPdfA = !!a.fileUrl;
        const hasPdfB = !!b.fileUrl;
        if (hasPdfA !== hasPdfB) return hasPdfB ? 1 : -1;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      })[0];

      evaluateTarget(
        primaryCert.expired && primaryCert.expired !== '-' ? primaryCert.expired : item.expiryDate,
        primaryCert.notificationSetting
      );
    } else {
      evaluateTarget(
        item.expiryDate,
        item.notificationSetting
      );
    }
  }

  console.log("REAL_STATS:", stats);
}

main().catch(console.error).finally(() => prisma.$disconnect());
