import { useState, useEffect } from 'react';
import { updateNotificationSetting } from '../../services/masterItemsService';

export function useNotificationSettings({ item, targetCert }) {
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    if (item && item.notificationSetting) return item.notificationSetting.isEnabled !== false;
    if (item && item.reminderEnabled !== undefined) return !!item.reminderEnabled;
    return true;
  });
  const [triggerType, setTriggerType] = useState(() => {
    if (item && item.notificationSetting) return item.notificationSetting.triggerType || 'DAYS';
    return 'DAYS';
  });
  const [reminderDays, setReminderDays] = useState(() => {
    if (item && item.notificationSetting) return item.notificationSetting.triggerDays ?? 30;
    return 30;
  });
  const [triggerDate, setTriggerDate] = useState(() => {
    if (item && item.notificationSetting && item.notificationSetting.triggerDate) {
      return item.notificationSetting.triggerDate.substring(0, 10);
    }
    return '';
  });

  useEffect(() => {
    let hasLoadedSetting = false;

    if (targetCert) {
      const setting = targetCert.notificationSetting || targetCert.rawCert?.notificationSetting;
      if (setting) {
        setReminderEnabled(setting.isEnabled !== false);
        setTriggerType(setting.triggerType || 'DAYS');
        setReminderDays(setting.triggerDays ?? 30);
        setTriggerDate(setting.triggerDate ? setting.triggerDate.substring(0, 10) : '');
        hasLoadedSetting = true;
      }
    }

    if (!hasLoadedSetting && item) {
      if (item.notificationSetting) {
        setReminderEnabled(item.notificationSetting.isEnabled !== false);
        setTriggerType(item.notificationSetting.triggerType || 'DAYS');
        setReminderDays(item.notificationSetting.triggerDays ?? 30);
        setTriggerDate(item.notificationSetting.triggerDate ? item.notificationSetting.triggerDate.substring(0, 10) : '');
      } else if (item.reminderEnabled !== undefined) {
        setReminderEnabled(!!item.reminderEnabled);
      } else {
        setReminderEnabled(true);
        setTriggerType('DAYS');
        setReminderDays(30);
        setTriggerDate('');
      }
    }
  }, [item, targetCert]);

  const handleToggleReminder = async (newVal) => {
    const isChecked = typeof newVal === 'boolean' ? newVal : !reminderEnabled;
    setReminderEnabled(isChecked);
    
    try {
      const targetId = item?.MasterId || item?.id;
      if (targetId) {
        await updateNotificationSetting(targetId, {
          isEnabled: isChecked,
          triggerType: triggerType,
          triggerDays: parseInt(reminderDays) || 30,
          triggerDate: triggerType === 'DATE' ? triggerDate : null
        });
      }
    } catch (err) {
      console.error('Failed to save reminder setting:', err);
      alert('Gagal menyimpan pengaturan pengingat: ' + err.message);
      setReminderEnabled(!isChecked);
    }
  };

  return {
    reminderEnabled, setReminderEnabled,
    triggerType, setTriggerType,
    reminderDays, setReminderDays,
    triggerDate, setTriggerDate,
    handleToggleReminder
  };
}
