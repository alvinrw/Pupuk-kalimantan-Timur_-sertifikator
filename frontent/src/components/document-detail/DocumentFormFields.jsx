import React, { useState } from 'react';
import { Edit3, Save, Trash2, Plus, UploadCloud } from 'lucide-react';
import { updateNotificationSetting } from '../../services/masterItemsService';
import { API_BASE, getFullFileUrl } from '../../config/api';

export default function DocumentFormFields({ hook, item }) {
  const {
    formData, setFormData, handleSave, setIsEditing,
    isHaki, isEquipment, effectiveCategoryKey,
    isEditing,
    reminderEnabled, setReminderEnabled,
    triggerType, setTriggerType,
    reminderDays, setReminderDays,
    triggerDate, setTriggerDate,
  } = hook;

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  if (!isEditing) return null;

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    // Jika format DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('/');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 font-mono-data">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-amber-700 shrink-0" />
          <span>Mode Edit Data {isHaki ? 'Hak Cipta (HAKI)' : isEquipment ? 'Peralatan Pabrik' : 'Dokumen Perizinan'} - Perbarui informasi di bawah ini:</span>
        </div>

        {(() => {
          const showMasterFields = !hook.isMultiCertItem || !hook.isSingleCertScope;
          const showDocFields = !hook.isMultiCertItem || hook.isSingleCertScope;

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              {/* MASTER FIELDS */}
              {showMasterFields && [
                { label: isHaki ? 'Judul Ciptaan' : 'Merek / Nama Item', key: 'merekItem', type: 'text', bold: true },
                { label: isHaki ? 'Jenis Ciptaan' : 'Jenis Peralatan / Kategori', key: 'jenisPeralatan', type: 'text' },
              ].map(({ label, key, type, bold }) => (
                <div key={key}>
                  <label className="font-bold text-slate-800 block mb-1.5">{label}</label>
                  <input
                    type={type} value={formData[key] || ''}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className={`w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs ${bold ? 'font-bold' : ''}`}
                  />
                </div>
              ))}

              {!isHaki && showMasterFields && (
                <>
                  {[
                    { label: 'Tipe / Kode', key: 'tipe' },
                    { label: 'Nomor Seri / Tag', key: 'nomorSeri' },
                    { label: 'Lokasi / Unit Pabrik', key: 'lokasi', bold: true },
                    { label: 'User / Dept Penanggung Jawab', key: 'user' },
                  ].map(({ label, key, bold }) => (
                    <div key={key}>
                      <label className="font-bold text-slate-800 block mb-1.5">{label}</label>
                      <input
                        type="text" value={formData[key] || ''}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                        className={`w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs ${bold ? 'font-bold' : ''}`}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">
                      {effectiveCategoryKey === 'perizinan-proyek' ? 'Status Proyek' : 'Status Fisik Operasional'}
                    </label>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs cursor-pointer"
                    >
                      {effectiveCategoryKey === 'perizinan-proyek' ? (
                        <>
                          <option value="Aktif">Aktif</option>
                          <option value="Spare">Selesai</option>
                          <option value="Rusak">Ditunda</option>
                        </>
                      ) : (
                        <>
                          <option value="Aktif">Aktif (Normal)</option>
                          <option value="Spare">Spare (Cadangan)</option>
                          <option value="Repair">Repair (Overhaul)</option>
                          <option value="Rusak">Rusak (Out of Service)</option>
                        </>
                      )}
                    </select>
                  </div>
                  
                  {showMasterFields && (
                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5">Foto Dokumentasi (Master)</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*"
                          id="equipment-photo-upload"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const uploaderData = new FormData();
                            uploaderData.append('file', file);
                            try {
                              setIsUploadingPhoto(true);
                              const token = sessionStorage.getItem('token');
                              const response = await fetch(`${API_BASE}/document-history/upload`, {
                                method: 'POST',
                                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                                body: uploaderData,
                              });
                              const resJson = await response.json();
                              if (response.ok && resJson.data) {
                                const url = resJson.data.url || resJson.data.fileUrl || (typeof resJson.data === 'string' ? resJson.data : '');
                                setFormData({ ...formData, imageUrl: url });
                              } else {
                                alert('Gagal unggah foto: ' + (resJson.message || 'Error'));
                              }
                            } catch (err) {
                              console.error(err);
                              alert('Gagal unggah foto');
                            } finally {
                              setIsUploadingPhoto(false);
                            }
                          }}
                        />
                        <label
                          htmlFor="equipment-photo-upload"
                          className="px-4 py-2 border border-slate-300 rounded-xl hover:bg-slate-50 cursor-pointer font-bold text-slate-700 inline-flex items-center gap-1.5"
                        >
                          <UploadCloud className="w-4 h-4 text-slate-500" />
                          <span>{isUploadingPhoto ? 'Mengunggah...' : 'Unggah Foto'}</span>
                        </label>
                        {formData.imageUrl && (
                          <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden">
                            <img
                              src={getFullFileUrl(formData.imageUrl)}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, imageUrl: '' })}
                              className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 w-4 h-4 flex items-center justify-center text-[8px]"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* DOCUMENT FIELDS */}
              {!isHaki && showDocFields && (
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">Nama Sertifikat</label>
                  <input
                    type="text" value={formData.namaSertifikat || ''}
                    onChange={(e) => setFormData({ ...formData, namaSertifikat: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
                </div>
              )}

              {isHaki && showDocFields && (
                <>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">Tanggal Ciptaan / Deklarasi</label>
                    <input type="date" value={formatDateForInput(formData.tanggalCiptaan)}
                      onChange={(e) => setFormData({ ...formData, tanggalCiptaan: e.target.value, terbit: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">Masa Berlaku Perlindungan</label>
                    <input type="text" value={formData.masaBerlaku || ''} placeholder="Contoh: 5 Tahun / Seumur Hidup"
                      onChange={(e) => setFormData({ ...formData, masaBerlaku: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                    />
                  </div>
                </>
              )}

              {showDocFields && (
                <>
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5">{isHaki ? 'No. Sertifikat HAKI' : 'No. Sertifikat SK Active'}</label>
                    <input type="text" value={formData.noSertifikat || ''}
                      onChange={(e) => setFormData({ ...formData, noSertifikat: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                    />
                  </div>

                  {!isHaki && (
                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5">Tanggal Terbit / Berlaku</label>
                      <input type="date" value={formatDateForInput(formData.terbit)}
                        onChange={(e) => setFormData({ ...formData, terbit: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs font-mono-data"
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 text-rose-700">{isHaki ? 'Kapan Berakhir' : 'Tanggal Expired'}</label>
                    <input type="text" value={formData.berakhir || ''} placeholder="YYYY-MM-DD atau Seumur Hidup"
                      onChange={(e) => setFormData({ ...formData, berakhir: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] font-bold text-xs"
                    />
                  </div>
                </>
              )}

              {/* COMMON FIELD (Keterangan) */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">{isHaki ? 'Instansi Penerbit / Keterangan HAKI' : 'Keterangan & Catatan'}</label>
                <textarea value={formData.keterangan || ''} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                />
              </div>
            </div>
          );
        })()}

        {/* Spesifikasi Tambahan */}
        {(!hook.isMultiCertItem || !hook.isSingleCertScope) && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <label className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-mono-data flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#005ea4]" /> Entitas Spesifikasi Tambahan
              </label>
              <button type="button" onClick={() => setFormData({ ...formData, additionalEntities: [...(formData.additionalEntities || []), { key: '', value: '' }] })}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1 rounded-lg border border-slate-300 flex items-center gap-1 font-bold transition-colors">
                <Plus className="w-3 h-3" /> Tambah Field
              </button>
            </div>
            <div className="space-y-2">
              {(formData.additionalEntities || []).map((ent, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input type="text" placeholder="Nama Field (cth: Kapasitas Angkat)" value={ent.key}
                    onChange={(e) => {
                      const newEnts = [...formData.additionalEntities];
                      newEnts[idx].key = e.target.value;
                      setFormData({ ...formData, additionalEntities: newEnts });
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs font-bold"
                  />
                  <input type="text" placeholder="Nilai (cth: 20 Ton)" value={ent.value}
                    onChange={(e) => {
                      const newEnts = [...formData.additionalEntities];
                      newEnts[idx].value = e.target.value;
                      setFormData({ ...formData, additionalEntities: newEnts });
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005ea4] text-xs"
                  />
                  <button type="button" onClick={() => {
                      const newEnts = [...formData.additionalEntities];
                      newEnts.splice(idx, 1);
                      setFormData({ ...formData, additionalEntities: newEnts });
                    }}
                    className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg border border-rose-200 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!formData.additionalEntities || formData.additionalEntities.length === 0) && (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded-lg border border-slate-100">Belum ada field spesifikasi tambahan. Klik "Tambah Field" untuk memasukkan data custom.</p>
              )}
            </div>
          </div>
        )}

        {/* Pengaturan Notifikasi (Edit Mode) */}
        {true && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <label className="font-bold text-slate-800 block mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono-data">
              Pengaturan Pengingat & Notifikasi
            </label>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editReminderEnabled"
                  checked={reminderEnabled}
                  onChange={async (e) => {
                    const isChecked = e.target.checked;
                    setReminderEnabled(isChecked);
                    try {
                      const tId = item?.MasterId || item?.id;
                      await updateNotificationSetting(tId, {
                        isEnabled: isChecked,
                        triggerType,
                        triggerDays: parseInt(reminderDays) || 30,
                        triggerDate: triggerType === 'DATE' ? triggerDate : null
                      });
                    } catch(err) {
                      console.error('Auto-save failed:', err);
                    }
                  }}
                  className="rounded border-slate-300 accent-[#005ea4] h-4 w-4 cursor-pointer"
                />
                <label htmlFor="editReminderEnabled" className="text-xs text-slate-700 font-bold select-none cursor-pointer">
                  Aktifkan Pengingat Notifikasi untuk Dokumen ini
                </label>
              </div>
              {reminderEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Tipe Pemicu</label>
                    <select
                      value={triggerType}
                      onChange={(e) => setTriggerType(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4]"
                    >
                      <option value="DAYS">Berdasarkan Sisa Hari (H-)</option>
                      <option value="DATE">Berdasarkan Tanggal Spesifik</option>
                    </select>
                  </div>
                  {triggerType === 'DAYS' ? (
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Pemicu H- (Hari)</label>
                      <input
                        type="number" min="1" value={reminderDays}
                        onChange={(e) => setReminderDays(e.target.value === '' ? '' : parseInt(e.target.value))}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] font-mono-data"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Pilih Tanggal Pemicu</label>
                      <input
                        type="date" value={triggerDate}
                        onChange={(e) => setTriggerDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#005ea4] font-mono-data"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button type="submit" className="px-6 py-2 bg-[#005ea4] hover:bg-[#004881] text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer">
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Data</span>
          </button>
        </div>
      </form>
    </div>
  );
}
