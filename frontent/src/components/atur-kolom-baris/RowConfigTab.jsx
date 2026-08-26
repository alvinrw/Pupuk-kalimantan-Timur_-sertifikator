import React from 'react';
import { Trash2, GripVertical, Save, Rows } from 'lucide-react';

export default function RowConfigTab({
  barisMode, setBarisMode,
  rows, childRows, columns,
  dragOverRowIndex,
  handleRowDragStart, handleRowDragOver, handleRowDrop,
  setDragOverRowIndex, setDraggedRowIndex,
  handleCellChange, handleChildCellChange,
  handleDeleteRow, handleDeleteCert, handleSaveRowsSpreadsheet, handleSaveCertsSpreadsheet,
  isSaving, convertToYYYYMMDD
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Rows className="w-4 h-4 text-slate-500" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Susunan & Manajemen Baris Data ({barisMode === 'master' ? rows.length : childRows.length})
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={barisMode === 'master' ? handleSaveRowsSpreadsheet : handleSaveCertsSpreadsheet}
                    disabled={isSaving}
                    className="px-3 py-1.5 bg-[#00a368] hover:bg-[#008f5a] disabled:opacity-50 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
                  </button>
                </div>
              </div>


              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                {barisMode === 'master' ? (
                  <>* Gunakan handle <GripVertical className="inline w-3.5 h-3.5 text-slate-400" /> di sebelah kiri untuk menyeret baris ke atas/bawah guna mengatur urutan prioritas atau visual data. Anda juga dapat langsung mengklik dan mengedit isi sel di bawah ini layaknya tabel Excel/Spreadsheet. Urutan dan perubahan nilai akan disimpan permanen ketika tombol hijau di atas diklik.</>
                ) : (
                  <>* Di bawah ini adalah daftar semua sertifikat terhubung (data child) yang dapat diedit langsung dalam format spreadsheet. Klik pada sel data sertifikat untuk mengubah nilainya, lalu simpan dengan tombol hijau di atas.</>
                )}
              </p>

              {/* Data Table with Draggable Rows & Inline Inputs */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono-data uppercase tracking-wider font-bold">
                        {barisMode === 'master' ? (
                          <>
                            <th className="p-3 w-10 text-center"></th>
                            {columns.filter(c => c.isVisible).map(col => (
                              <th key={col.fieldKey} className={`p-3 ${col.fieldKey === 'status' || col.fieldKey === 'no' ? 'text-center' : ''}`}>
                                {col.label}
                              </th>
                            ))}
                          </>
                        ) : (
                          <>
                            <th className="p-3 w-12 text-center">No</th>
                            <th className="p-3 min-w-[150px]">Nama Sertifikat</th>
                            <th className="p-3 min-w-[150px]">Nomor Sertifikat</th>
                            <th className="p-3 min-w-[150px]">Instansi Penerbit</th>
                            <th className="p-3 min-w-[150px] text-center">Tanggal Terbit</th>
                            <th className="p-3 min-w-[150px] text-center">Tanggal Expired</th>
                            <th className="p-3 min-w-[200px]">Keterangan / Catatan</th>
                          </>
                        )}
                        <th className="p-3 text-right w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {barisMode === 'master' ? (
                        rows.map((row, idx) => (
                          <tr 
                            key={row.id}
                            draggable
                            onDragStart={(e) => handleRowDragStart(e, idx)}
                            onDragOver={(e) => handleRowDragOver(e, idx)}
                            onDrop={(e) => handleRowDrop(e, idx)}
                            onDragEnd={() => {
                              setDragOverRowIndex(null);
                              setDraggedRowIndex(null);
                            }}
                            className={`transition-all group border-l-4 ${
                              dragOverRowIndex === idx
                                ? 'border-l-[#005ea4] bg-blue-50/40'
                                : 'border-l-transparent bg-white hover:bg-slate-50'
                            }`}
                          >
                            <td className="p-3 text-center cursor-grab active:cursor-grabbing w-10 pointer-events-none">
                              <GripVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600 mx-auto transition-colors" />
                            </td>
                            {columns.filter(c => c.isVisible).map(col => {
                              if (col.fieldKey === 'no') {
                                return (
                                  <td key={col.fieldKey} className="p-3 text-center font-mono-data text-slate-400 font-bold w-12">
                                    {idx + 1}
                                  </td>
                                );
                              }

                              if (col.fieldKey === 'status') {
                                return (
                                  <td key={col.fieldKey} className="p-3 text-center w-36">
                                    <select
                                      value={row.status || 'Aktif'}
                                      onChange={(e) => handleCellChange(row.id, col.fieldKey, col.isCustom, e.target.value)}
                                      className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1 outline-none text-xs font-bold text-center w-full cursor-pointer transition-colors"
                                    >
                                      <option value="Aktif">Aktif</option>
                                      <option value="Expired">Expired</option>
                                      <option value="Perpanjang">Perpanjang</option>
                                      <option value="Afkir">Afkir</option>
                                      <option value="Spare">Spare</option>
                                      <option value="Rusak">Rusak</option>
                                    </select>
                                  </td>
                                );
                              }

                              if (col.fieldKey === 'certCount') {
                                return (
                                  <td key={col.fieldKey} className="p-3 text-center text-slate-600 font-mono-data font-bold w-36">
                                    {row.certificates?.length || 0}
                                  </td>
                                );
                              }

                              if (col.fieldKey === 'user') {
                                const val = row.rawMeta?.penanggungJawab || row.user || '';
                                return (
                                  <td key={col.fieldKey} className="p-1 min-w-[150px]">
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={(e) => handleCellChange(row.id, col.fieldKey, col.isCustom, e.target.value)}
                                      placeholder="Ketik..."
                                      className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-semibold"
                                    />
                                  </td>
                                );
                              }

                              if (!col.isCustom && col.fieldKey !== 'jenisPeralatan') {
                                const val = col.fieldKey === 'title' ? (row.title || '') :
                                            col.fieldKey === 'code' ? (row.code || '') :
                                            col.fieldKey === 'unitLocation' ? (row.unitLocation || '') :
                                            col.fieldKey === 'jenisItem' ? (row.rawMeta?.tipe || row.rawMeta?.jenisAset || row.rawMeta?.jenisProyek || row.rawMeta?.kategori || row.rawMeta?.jenisProduk || row.rawMeta?.kategoriProyek || row.tipe || '') :
                                            col.fieldKey === 'terbit' ? (row.issueDate || '') :
                                            col.fieldKey === 'berakhir' ? (row.expiryDate || '') :
                                            (row.keteranganAsli || '');
                                
                                if (col.fieldKey === 'terbit' || col.fieldKey === 'berakhir') {
                                  return (
                                    <td key={col.fieldKey} className="p-1 min-w-[150px]">
                                      <input
                                        type="date"
                                        value={convertToYYYYMMDD(val)}
                                        onChange={(e) => handleCellChange(row.id, col.fieldKey, col.isCustom, e.target.value)}
                                        onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }}
                                        className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-mono font-bold"
                                      />
                                    </td>
                                  );
                                }

                                return (
                                  <td key={col.fieldKey} className="p-1 min-w-[150px]">
                                    <input
                                      type="text"
                                      value={val}
                                      onChange={(e) => handleCellChange(row.id, col.fieldKey, col.isCustom, e.target.value)}
                                      placeholder="Ketik..."
                                      className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-semibold"
                                    />
                                  </td>
                                );
                              }

                              // Custom Column Cells (or jenisPeralatan which is stored in additionalEntities)
                              const ent = row.additionalEntities?.find(e => e.key === col.label);
                              const val = ent ? ent.value : (col.fieldKey === 'jenisPeralatan' ? (row.title || '') : '');

                              if (col.type === 'date') {
                                return (
                                  <td key={col.fieldKey} className="p-1 min-w-[150px]">
                                    <input
                                      type="date"
                                      value={convertToYYYYMMDD(val)}
                                      onChange={(e) => handleCellChange(row.id, col.fieldKey, col.isCustom, e.target.value)}
                                      onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }}
                                      className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-mono font-bold"
                                    />
                                  </td>
                                );
                              }

                              if (col.type === 'nominal') {
                                return (
                                  <td key={col.fieldKey} className="p-1 min-w-[150px]">
                                    <input
                                      type="text"
                                      placeholder="Angka saja..."
                                      value={val ? Number(val.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                                      onChange={(e) => {
                                        const rawNum = e.target.value.replace(/\D/g, '');
                                        handleCellChange(row.id, col.fieldKey, col.isCustom, rawNum);
                                      }}
                                      className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full text-right transition-colors font-mono font-bold text-slate-800"
                                    />
                                  </td>
                                );
                              }

                              return (
                                <td key={col.fieldKey} className="p-1 min-w-[150px]">
                                  <input
                                    type="text"
                                    placeholder="Ketik..."
                                    value={val}
                                    onChange={(e) => handleCellChange(row.id, col.fieldKey, col.isCustom, e.target.value)}
                                    className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors text-slate-800 font-medium"
                                  />
                                </td>
                              );
                            })}
                            <td className="p-3 text-right whitespace-nowrap w-16">
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className="p-1.5 hover:bg-rose-50 border border-rose-200 rounded-lg text-rose-600 transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[10px]"
                                title="Hapus Baris"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        childRows.map((c, idx) => (
                          <tr key={c.id} className="hover:bg-slate-50/50 bg-white transition-colors">
                            <td className="p-3 text-center text-slate-400 font-mono-data font-bold w-12">
                              {idx + 1}
                            </td>
                            <td className="p-1 min-w-[150px]">
                              <input
                                type="text"
                                value={c.namaSertifikat || ''}
                                onChange={(e) => handleChildCellChange(c.id, 'namaSertifikat', e.target.value)}
                                placeholder="Ketik..."
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-semibold"
                              />
                            </td>
                            <td className="p-1 min-w-[150px]">
                              <input
                                type="text"
                                value={c.noSertifikat || ''}
                                onChange={(e) => handleChildCellChange(c.id, 'noSertifikat', e.target.value)}
                                placeholder="Ketik..."
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-mono font-bold text-slate-800"
                              />
                            </td>
                            <td className="p-1 min-w-[150px]">
                              <input
                                type="text"
                                value={c.instansi || ''}
                                onChange={(e) => handleChildCellChange(c.id, 'instansi', e.target.value)}
                                placeholder="Ketik..."
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-semibold"
                              />
                            </td>
                            <td className="p-1 min-w-[150px]">
                              <input
                                type="date"
                                value={convertToYYYYMMDD(c.terbit)}
                                onChange={(e) => handleChildCellChange(c.id, 'terbit', e.target.value)}
                                onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }}
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-mono font-bold text-center"
                              />
                            </td>
                            <td className="p-1 min-w-[150px]">
                              <input
                                type="date"
                                value={convertToYYYYMMDD(c.expired)}
                                onChange={(e) => handleChildCellChange(c.id, 'expired', e.target.value)}
                                onClick={(e) => { try { e.target.showPicker(); } catch(_) {} }}
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors font-mono font-bold text-center"
                              />
                            </td>
                            <td className="p-1 min-w-[150px]">
                              <input
                                type="text"
                                value={c.keterangan || ''}
                                onChange={(e) => handleChildCellChange(c.id, 'keterangan', e.target.value)}
                                placeholder="Ketik..."
                                className="bg-transparent hover:bg-slate-50 focus:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 rounded px-2 py-1.5 outline-none text-xs w-full transition-colors text-slate-800 font-medium"
                              />
                            </td>
                            <td className="p-3 text-right whitespace-nowrap w-16">
                              <button
                                onClick={() => handleDeleteCert && handleDeleteCert(c.id)}
                                className="p-1.5 hover:bg-rose-50 border border-rose-200 rounded-lg text-rose-600 transition-colors cursor-pointer inline-flex items-center gap-1 font-bold text-[10px]"
                                title="Hapus Sertifikat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
  );
}
