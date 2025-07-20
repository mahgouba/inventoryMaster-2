import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string) {
  switch (status) {
    case "متوفر":
      return "bg-green-100 text-green-800";
    case "في الطريق":
      return "bg-amber-100 text-amber-800";
    case "قيد الصيانة":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: any[], filename: string) {
  if (!data.length) return;
  
  // Import XLSX dynamically
  import('xlsx').then((XLSX) => {
    // Prepare data with comprehensive Arabic headers
    const arabicHeaders = {
      'id': 'المعرف',
      'manufacturer': 'الصانع',
      'category': 'الفئة',
      'trimLevel': 'درجة التجهيز',
      'engineCapacity': 'سعة المحرك',
      'year': 'السنة',
      'exteriorColor': 'اللون الخارجي',
      'interiorColor': 'اللون الداخلي',
      'status': 'الحالة',
      'importType': 'نوع الاستيراد',
      'location': 'الموقع',
      'chassisNumber': 'رقم الهيكل',
      'price': 'السعر',
      'engineer': 'المهندس',
      'arrivalDate': 'تاريخ الوصول',
      'saleDate': 'تاريخ البيع',
      'buyer': 'المشتري',
      'salePrice': 'سعر البيع',
      'profit': 'الربح',
      'images': 'الصور',
      'isSold': 'مباع',
      'notes': 'ملاحظات',
      'createdAt': 'تاريخ الإنشاء',
      'updatedAt': 'تاريخ التحديث'
    };

    // Transform data with Arabic headers
    const transformedData = data.map(item => {
      const transformedItem: any = {};
      Object.entries(item).forEach(([key, value]) => {
        const arabicKey = arabicHeaders[key as keyof typeof arabicHeaders] || key;
        
        // Format dates
        if (key === 'arrivalDate' || key === 'saleDate' || key === 'createdAt' || key === 'updatedAt') {
          transformedItem[arabicKey] = value ? new Date(value as string).toLocaleDateString('ar-SA') : '';
        }
        // Format boolean values
        else if (key === 'isSold') {
          transformedItem[arabicKey] = value ? 'نعم' : 'لا';
        }
        // Format price and profit fields
        else if (key === 'price' || key === 'salePrice' || key === 'profit') {
          const numValue = parseFloat(value as string);
          transformedItem[arabicKey] = !isNaN(numValue) ? numValue.toLocaleString('ar-SA') : value || '';
        }
        // Format arrays (images)
        else if (Array.isArray(value)) {
          transformedItem[arabicKey] = value.length > 0 ? value.join(', ') : '';
        }
        else {
          transformedItem[arabicKey] = value || '';
        }
      });
      return transformedItem;
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(transformedData);

    // Set column widths for better display - comprehensive fields
    const colWidths = [
      { wch: 8 },  // المعرف
      { wch: 12 }, // الصانع
      { wch: 12 }, // الفئة
      { wch: 12 }, // درجة التجهيز
      { wch: 12 }, // سعة المحرك
      { wch: 8 },  // السنة
      { wch: 12 }, // اللون الخارجي
      { wch: 12 }, // اللون الداخلي
      { wch: 10 }, // الحالة
      { wch: 12 }, // نوع الاستيراد
      { wch: 12 }, // الموقع
      { wch: 18 }, // رقم الهيكل
      { wch: 10 }, // السعر
      { wch: 12 }, // المهندس
      { wch: 12 }, // تاريخ الوصول
      { wch: 12 }, // تاريخ البيع
      { wch: 15 }, // المشتري
      { wch: 10 }, // سعر البيع
      { wch: 10 }, // الربح
      { wch: 15 }, // الصور
      { wch: 8 },  // مباع
      { wch: 20 }, // ملاحظات
      { wch: 12 }, // تاريخ الإنشاء
      { wch: 12 }  // تاريخ التحديث
    ];
    ws['!cols'] = colWidths;

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'المخزون');

    // Generate Excel file and download
    XLSX.writeFile(wb, filename.replace('.csv', '.xlsx'));
  }).catch(error => {
    console.error('Error importing XLSX library:', error);
    // Fallback to CSV if XLSX fails
    exportToCSV(data, filename);
  });
}

interface PrintSettings {
  visibleColumns: string[];
  orientation: 'portrait' | 'landscape';
  colorTheme: 'default' | 'grayscale' | 'blue' | 'green';
  fontSize: 'small' | 'medium' | 'large';
  includeHeader: boolean;
  includeDate: boolean;
}

export function printTableWithSettings(settings: PrintSettings) {
  // Get the table element
  const tableElement = document.querySelector('[data-table="inventory-table"]');
  
  if (!tableElement) {
    console.error('Table not found for printing');
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Create print content with simple table styling for landscape
  const printContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>طباعة جدول المخزون</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        @page {
          size: A4 ${settings.orientation};
          margin: 10mm;
        }
        
        body {
          font-family: 'Noto Sans Arabic', sans-serif;
          direction: rtl;
          text-align: right;
          background: white !important;
          color: #000 !important;
          line-height: 1.3;
          font-size: ${settings.fontSize === 'small' ? '8pt' : settings.fontSize === 'large' ? '12pt' : '10pt'};
          margin: 0;
          padding: 10mm;
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 10mm;
          padding-bottom: 5mm;
          border-bottom: 2px solid #000;
        }
        
        .print-header h1 {
          font-size: 16pt;
          font-weight: 700;
          margin-bottom: 3mm;
          color: #000 !important;
        }
        
        .print-date {
          font-size: 10pt;
          color: #666 !important;
          margin-bottom: 5mm;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 5mm;
          background: white !important;
          font-size: ${settings.fontSize === 'small' ? '7pt' : settings.fontSize === 'large' ? '11pt' : '9pt'};
        }
        
        th, td {
          border: 1px solid #000 !important;
          padding: 2pt 4pt;
          text-align: right;
          vertical-align: middle;
          background: white !important;
        }
        
        th {
          background: #f0f0f0 !important;
          font-weight: 700;
          font-size: 9pt;
          color: #000 !important;
          text-align: center;
        }
        
        td {
          font-size: 8pt;
          color: #000 !important;
        }
        
        /* Remove all icons and complex styling */
        svg, .icon, .lucide {
          display: none !important;
        }
        
        /* Simplify status display - no background colors or styling */
        .status-available, 
        .status-transit, 
        .status-maintenance, 
        .status-sold, 
        .status-reserved {
          color: #000 !important;
          font-weight: normal !important;
          background: white !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }
        
        /* Color themes */
        ${settings.colorTheme === 'grayscale' ? `
          th { background: #e5e5e5 !important; color: #333 !important; }
          * { color: #333 !important; }
        ` : ''}
        
        ${settings.colorTheme === 'blue' ? `
          th { background: #dbeafe !important; color: #1e40af !important; }
          .status-available { background: #dbeafe !important; color: #1e40af !important; }
        ` : ''}
        
        ${settings.colorTheme === 'green' ? `
          th { background: #dcfce7 !important; color: #166534 !important; }
          .status-available { background: #dcfce7 !important; color: #166534 !important; }
        ` : ''}
        
        /* Hide columns based on settings */
        ${settings.visibleColumns.length > 0 ? 
          Array.from({length: 20}, (_, i) => i).map(i => 
            !settings.visibleColumns.includes(['manufacturer', 'category', 'trimLevel', 'engineCapacity', 'year', 'exteriorColor', 'interiorColor', 'status', 'importType', 'location', 'chassisNumber', 'price', 'ownershipType', 'engineer', 'entryDate', 'notes'][i] || '') 
              ? `table th:nth-child(${i+1}), table td:nth-child(${i+1}) { display: none !important; }`
              : ''
          ).join('\n')
        : ''}
        
        /* Hide unnecessary elements for simple table */
        .print-footer,
        .summary-section,
        .print-stats {
          display: none !important;
        }
        
        @media print {
          body { 
            margin: 0 !important; 
            padding: 5mm !important;
            background: white !important;
          }
          table { 
            page-break-inside: auto; 
          }
          tr { 
            page-break-inside: avoid; 
            page-break-after: auto; 
          }
          th {
            page-break-after: avoid;
          }
        }
      </style>
    </head>
    <body>
        ${settings.includeHeader ? `
        <div class="print-header">
          <h1>جدول المخزون</h1>
          ${settings.includeDate ? `<div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>` : ''}
        </div>
        ` : ''}
        
        <!-- Simple Table Only -->
        ${tableElement.outerHTML.replace(/<svg[^>]*>.*?<\/svg>/g, '').replace(/class="[^"]*"/g, '').replace(/<button[^>]*>.*?<\/button>/g, '')}
    </body>
    </html>
  `;

  // Write content and print
  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}

// Keep the original function for backward compatibility
export function printTable() {
  const defaultSettings: PrintSettings = {
    visibleColumns: ['manufacturer', 'category', 'trimLevel', 'engineCapacity', 'year', 'exteriorColor', 'interiorColor', 'status', 'importType', 'location', 'chassisNumber', 'price', 'ownershipType', 'engineer', 'entryDate', 'notes'],
    orientation: 'landscape',
    colorTheme: 'default',
    fontSize: 'medium',
    includeHeader: true,
    includeDate: true
  };
  printTableWithSettings(defaultSettings);
}
