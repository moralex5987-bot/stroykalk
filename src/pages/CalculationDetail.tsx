import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, FileText } from 'lucide-react';
import { useStore } from '../store';
import { calcItemBreakdown, calcTotals, formatCurrency } from '../utils';
import { SECTIONS } from '../constants';
import { CalculationItem, CompanySettings, Calculation } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─── Helper: load image URL → base64 (for PDF logo) ──────────────────────────
const loadImageBase64 = (url: string): Promise<string | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.drawImage(img, 0, 0); resolve(canvas.toDataURL('image/png')); }
        else resolve(null);
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

// ─── XLSX Export ──────────────────────────────────────────────────────────────
const exportToXlsx = (calc: Calculation, settings: CompanySettings) => {
  const enabledItems = calc.items.filter((i) => i.is_enabled);

  // Header rows
  const meta = [
    ['Коммерческое предложение'],
    [settings.company_name],
    [settings.phone, settings.email],
    [settings.address],
    [],
    ['Клиент:', calc.client_name],
    ['Телефон:', calc.client_phone],
    ['Email:', calc.client_email],
    ['Адрес объекта:', calc.client_address],
    [],
    ['Площадь:', `${calc.area} м²`, 'Этажей:', calc.floors, 'Пакет:', calc.package],
    [],
  ];

  const colHeaders = [
    'Раздел',
    'Наименование',
    'Вариант',
    'Ед.',
    'Кол-во',
    'Материалы',
    'Работы',
    'Доставка',
    'База',
    `Накл. (${settings.overhead_percent}%)`,
    `Резерв (${settings.contingency_percent}%)`,
    `УСН (${settings.usn_percent}%)`,
    'Себестоимость',
    `Цена клиента (+${settings.margin_percent}%)`,
  ];

  const dataRows = enabledItems.map((item) => {
    const bd = calcItemBreakdown(item, settings);
    const sectionName = SECTIONS.find((s) => s.id === item.section_id)?.name ?? item.section_id;
    return [
      sectionName,
      item.name,
      item.variant_name,
      item.unit,
      item.quantity,
      Math.round(bd.materials),
      Math.round(bd.work),
      Math.round(bd.delivery),
      Math.round(bd.base),
      Math.round(bd.overhead),
      Math.round(bd.contingency),
      Math.round(bd.usn),
      Math.round(bd.total_cost),
      Math.round(bd.total_client_price),
    ];
  });

  const { total_cost, total_client_price } = calcTotals(calc.items, settings);
  const totalsRow = [
    '', 'ИТОГО', '', '', '',
    enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).materials, 0),
    enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).work, 0),
    enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).delivery, 0),
    enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).base, 0),
    enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).overhead, 0),
    enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).contingency, 0),
    enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).usn, 0),
    Math.round(total_cost),
    Math.round(total_client_price),
  ].map((v, idx) => (idx >= 5 ? Math.round(v as number) : v));

  const aoa = [
    ...meta,
    colHeaders,
    ...dataRows,
    [],
    totalsRow,
    [],
    ['Реквизиты:', settings.requisites],
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Column widths
  ws['!cols'] = [
    { wch: 20 }, { wch: 30 }, { wch: 20 }, { wch: 6 }, { wch: 8 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 16 }, { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Смета');
  XLSX.writeFile(wb, `smeta_${calc.client_name.replace(/[^a-zа-яё0-9]/gi, '_')}.xlsx`);
};

// ─── PDF Export ───────────────────────────────────────────────────────────────
const exportToPdf = async (calc: Calculation, settings: CompanySettings) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;

  // ── Company logo ─────────────────────────────────────────────────────────────
  let logoY = margin;
  if (settings.logo_url) {
    const b64 = await loadImageBase64(settings.logo_url);
    if (b64) {
      doc.addImage(b64, 'PNG', margin, margin, 40, 12);
      logoY = margin;
    }
  }

  // ── Header block ─────────────────────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(settings.company_name, margin + 44, logoY + 5);
  doc.setFontSize(8);
  doc.text(`Тел: ${settings.phone}  |  Email: ${settings.email}`, margin + 44, logoY + 10);
  doc.text(settings.address, margin + 44, logoY + 15);

  // Date (top right)
  const dateStr = new Date(calc.created_at).toLocaleDateString('ru-RU');
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Дата: ${dateStr}`, pageW - margin, logoY + 5, { align: 'right' });

  // ── Title ─────────────────────────────────────────────────────────────────────
  let y = logoY + 24;
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ', pageW / 2, y, { align: 'center' });
  y += 8;

  // ── Client info block ─────────────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const clientLines = [
    `Клиент: ${calc.client_name}`,
    calc.client_phone ? `Телефон: ${calc.client_phone}` : '',
    calc.client_email ? `Email: ${calc.client_email}` : '',
    calc.client_address ? `Адрес: ${calc.client_address}` : '',
  ].filter(Boolean);
  clientLines.forEach((line) => { doc.text(line, margin, y); y += 5; });

  // House params (right side)
  const pkgMap: Record<string, string> = { economy: 'Эконом', standard: 'Стандарт', comfort: 'Комфорт' };
  const paramLines = [
    `Площадь: ${calc.area} м²`,
    `Этажей: ${calc.floors}`,
    `Фундамент: ${calc.foundation_type}`,
    `Пакет: ${pkgMap[calc.package] ?? calc.package}`,
  ];
  let paramY = logoY + 32;
  doc.setFontSize(9);
  paramLines.forEach((line) => { doc.text(line, pageW - margin, paramY, { align: 'right' }); paramY += 5; });

  y += 4;

  // ── Items table ───────────────────────────────────────────────────────────────
  const enabledItems = calc.items.filter((i) => i.is_enabled);
  const { total_cost, total_client_price } = calcTotals(calc.items, settings);

  const tableBody = enabledItems.map((item) => {
    const bd = calcItemBreakdown(item, settings);
    const sectionName = SECTIONS.find((s) => s.id === item.section_id)?.name ?? '';
    return [
      sectionName,
      item.name + (item.variant_name ? `\n(${item.variant_name})` : ''),
      item.unit,
      String(item.quantity),
      Math.round(bd.materials).toLocaleString('ru-RU'),
      Math.round(bd.work).toLocaleString('ru-RU'),
      Math.round(bd.delivery).toLocaleString('ru-RU'),
      Math.round(bd.overhead).toLocaleString('ru-RU'),
      Math.round(bd.contingency).toLocaleString('ru-RU'),
      Math.round(bd.usn).toLocaleString('ru-RU'),
      Math.round(bd.total_cost).toLocaleString('ru-RU'),
      Math.round(bd.total_client_price).toLocaleString('ru-RU'),
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [[
      'Раздел', 'Наименование', 'Ед.', 'Кол.',
      'Матер.', 'Работы', 'Достав.',
      `Накл.\n${settings.overhead_percent}%`,
      `Резерв\n${settings.contingency_percent}%`,
      `УСН\n${settings.usn_percent}%`,
      'Себест.', 'Цена клиента',
    ]],
    body: tableBody,
    foot: [[
      '', 'ИТОГО', '', '',
      Math.round(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).materials, 0)).toLocaleString('ru-RU'),
      Math.round(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).work, 0)).toLocaleString('ru-RU'),
      Math.round(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).delivery, 0)).toLocaleString('ru-RU'),
      Math.round(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).overhead, 0)).toLocaleString('ru-RU'),
      Math.round(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).contingency, 0)).toLocaleString('ru-RU'),
      Math.round(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, settings).usn, 0)).toLocaleString('ru-RU'),
      Math.round(total_cost).toLocaleString('ru-RU'),
      Math.round(total_client_price).toLocaleString('ru-RU'),
    ]],
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [34, 139, 34], textColor: 255, fontStyle: 'bold', halign: 'center' },
    footStyles: { fillColor: [240, 240, 240], textColor: [30, 30, 30], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 38 },
      2: { cellWidth: 10, halign: 'center' },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' },
      6: { cellWidth: 20, halign: 'right' },
      7: { cellWidth: 20, halign: 'right' },
      8: { cellWidth: 20, halign: 'right' },
      9: { cellWidth: 20, halign: 'right' },
      10: { cellWidth: 24, halign: 'right' },
      11: { cellWidth: 26, halign: 'right' },
    },
    alternateRowStyles: { fillColor: [248, 252, 248] },
    showFoot: 'lastPage',
  });

  // ── Totals summary box ────────────────────────────────────────────────────────
  const finalY: number = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(`Себестоимость: ${formatCurrency(total_cost)}`, pageW - margin - 90, finalY);
  doc.setTextColor(22, 101, 52);
  doc.text(`Цена для клиента: ${formatCurrency(total_client_price)}`, pageW - margin, finalY + 7, { align: 'right' });

  // ── Manager comment ────────────────────────────────────────────────────────────
  if (calc.manager_comment) {
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text(`Примечание: ${calc.manager_comment}`, margin, finalY + 6);
  }

  // ── Footer with requisites ─────────────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text(settings.requisites, pageW / 2, pageH - 8, { align: 'center' });
  doc.line(margin, pageH - 12, pageW - margin, pageH - 12);

  // ── Page numbers ──────────────────────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`${p} / ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
  }

  doc.save(`KP_${calc.client_name.replace(/[^a-zа-яё0-9]/gi, '_')}.pdf`);
};

// ─── Component ────────────────────────────────────────────────────────────────
export const CalculationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { calculations, companySettings } = useStore();

  const calculation = calculations.find((c) => c.id === id);

  if (!calculation) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate('/calculations')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к расчётам
        </button>
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-600">Расчёт не найден</p>
        </div>
      </div>
    );
  }

  const { total_cost, total_client_price } = calcTotals(calculation.items, companySettings);
  const enabledItems = calculation.items.filter((i) => i.is_enabled);

  // Group items by section
  const grouped = SECTIONS.map((section) => ({
    section,
    items: enabledItems.filter((i) => i.section_id === section.id),
  })).filter((g) => g.items.length > 0);

  const pkgLabel: Record<string, string> = {
    economy: 'Эконом', standard: 'Стандарт', comfort: 'Комфорт',
  };

  return (
    <div className="p-8">
      {/* ── Back button ───────────────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/calculations')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад к расчётам
      </button>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* ── Header row ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{calculation.client_name}</h1>
            <div className="mt-4 space-y-1 text-gray-600 text-sm">
              {calculation.client_phone && <p>📞 {calculation.client_phone}</p>}
              {calculation.client_email && <p>✉️ {calculation.client_email}</p>}
              {calculation.client_address && <p>📍 {calculation.client_address}</p>}
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Цена для клиента</div>
            <div className="text-4xl font-extrabold text-green-600">
              {formatCurrency(total_client_price)}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              Себестоимость: <span className="font-semibold text-gray-700">{formatCurrency(total_cost)}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Маржа: {companySettings.margin_percent}% · УСН: {companySettings.usn_percent}%
            </div>
          </div>
        </div>

        {/* ── Export buttons ──────────────────────────────────────────────────── */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => exportToXlsx(calculation, companySettings)}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium text-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Скачать Excel
          </button>
          <button
            onClick={() => exportToPdf(calculation, companySettings)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
          >
            <FileText className="w-4 h-4" />
            Скачать PDF
          </button>
        </div>

        {/* ── House params ────────────────────────────────────────────────────── */}
        <div className="border-t pt-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Параметры дома</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Площадь', value: `${calculation.area} м²` },
              { label: 'Этажи', value: String(calculation.floors) },
              { label: 'Фундамент', value: calculation.foundation_type },
              { label: 'Пакет', value: pkgLabel[calculation.package] ?? calculation.package },
            ].map((p) => (
              <div key={p.label} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500 uppercase tracking-wide">{p.label}</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">{p.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Comment ─────────────────────────────────────────────────────────── */}
        {calculation.manager_comment && (
          <div className="border-t pt-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Комментарий менеджера</h2>
            <p className="text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              {calculation.manager_comment}
            </p>
          </div>
        )}

        {/* ── Cost breakdown table ─────────────────────────────────────────────── */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Детализация сметы</h2>
          <p className="text-xs text-gray-500 mb-4">
            Накл. {companySettings.overhead_percent}% · Резерв {companySettings.contingency_percent}% ·
            УСН {companySettings.usn_percent}% · Маржа {companySettings.margin_percent}%
          </p>

          {enabledItems.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">Нет включённых позиций</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs whitespace-nowrap">
                <thead className="bg-green-700 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Наименование</th>
                    <th className="px-3 py-2 text-center font-semibold">Ед.</th>
                    <th className="px-3 py-2 text-right font-semibold">Кол-во</th>
                    <th className="px-3 py-2 text-right font-semibold">Материалы</th>
                    <th className="px-3 py-2 text-right font-semibold">Работы</th>
                    <th className="px-3 py-2 text-right font-semibold">Доставка</th>
                    <th className="px-3 py-2 text-right font-semibold">
                      Накл. ({companySettings.overhead_percent}%)
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">
                      Резерв ({companySettings.contingency_percent}%)
                    </th>
                    <th className="px-3 py-2 text-right font-semibold">
                      УСН ({companySettings.usn_percent}%)
                    </th>
                    <th className="px-3 py-2 text-right font-semibold bg-green-900">Себест.</th>
                    <th className="px-3 py-2 text-right font-semibold bg-green-900">
                      Цена клиента
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grouped.map(({ section, items: sectionItems }) => (
                    <>
                      {/* Section header row */}
                      <tr key={`section-${section.id}`} className="bg-gray-100">
                        <td
                          colSpan={11}
                          className="px-3 py-1.5 font-semibold text-gray-700 text-xs uppercase tracking-wide"
                        >
                          {section.name}
                        </td>
                      </tr>

                      {/* Item rows */}
                      {sectionItems.map((item: CalculationItem) => {
                        const bd = calcItemBreakdown(item, companySettings);
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-green-50 transition-colors"
                          >
                            <td className="px-3 py-2">
                              <div className="font-medium text-gray-900">{item.name}</div>
                              <div className="text-gray-400">{item.variant_name}</div>
                              {item.is_custom && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
                                  custom
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-600">{item.unit}</td>
                            <td className="px-3 py-2 text-right text-gray-700">{item.quantity}</td>
                            <td className="px-3 py-2 text-right text-gray-700">
                              {formatCurrency(bd.materials)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-700">
                              {formatCurrency(bd.work)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-700">
                              {formatCurrency(bd.delivery)}
                            </td>
                            <td className="px-3 py-2 text-right text-amber-700">
                              {formatCurrency(bd.overhead)}
                            </td>
                            <td className="px-3 py-2 text-right text-amber-700">
                              {formatCurrency(bd.contingency)}
                            </td>
                            <td className="px-3 py-2 text-right text-amber-700">
                              {formatCurrency(bd.usn)}
                            </td>
                            <td className="px-3 py-2 text-right font-semibold text-gray-900 bg-gray-50">
                              {formatCurrency(bd.total_cost)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-green-700 bg-gray-50">
                              {formatCurrency(bd.total_client_price)}
                            </td>
                          </tr>
                        );
                      })}
                    </>
                  ))}
                </tbody>

                {/* Totals footer */}
                <tfoot className="bg-gray-800 text-white">
                  <tr>
                    <td colSpan={3} className="px-3 py-3 font-bold text-sm">ИТОГО</td>
                    <td className="px-3 py-3 text-right font-semibold text-xs">
                      {formatCurrency(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, companySettings).materials, 0))}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-xs">
                      {formatCurrency(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, companySettings).work, 0))}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-xs">
                      {formatCurrency(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, companySettings).delivery, 0))}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-xs">
                      {formatCurrency(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, companySettings).overhead, 0))}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-xs">
                      {formatCurrency(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, companySettings).contingency, 0))}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-xs">
                      {formatCurrency(enabledItems.reduce((s, i) => s + calcItemBreakdown(i, companySettings).usn, 0))}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-base bg-gray-700">
                      {formatCurrency(total_cost)}
                    </td>
                    <td className="px-3 py-3 text-right font-extrabold text-lg text-green-300 bg-gray-700">
                      {formatCurrency(total_client_price)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
