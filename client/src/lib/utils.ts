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

export function printTable() {
  // Get the table element
  const tableElement = document.querySelector('[data-table="inventory-table"]');
  
  if (!tableElement) {
    console.error('Table not found for printing');
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Create print content with enhanced Arabic RTL styling
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
          size: A4;
          margin: 15mm;
        }
        
        body {
          font-family: 'Noto Sans Arabic', sans-serif;
          direction: rtl;
          text-align: right;
          background: white !important;
          color: #000 !important;
          line-height: 1.4;
          font-size: 12pt;
        }
        
        .print-container {
          width: 100%;
          max-width: 210mm;
          margin: 0 auto;
          background: white !important;
          padding: 10mm;
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 20mm;
          padding-bottom: 15mm;
          border-bottom: 3px solid #000;
          background: white !important;
        }
        
        .print-header h1 {
          font-size: 28pt;
          font-weight: 700;
          margin-bottom: 8mm;
          color: #000 !important;
          text-shadow: none;
        }
        
        .print-header .company-info {
          font-size: 14pt;
          color: #333 !important;
          margin-bottom: 5mm;
          font-weight: 500;
        }
        
        .print-date {
          font-size: 12pt;
          color: #555 !important;
          margin-bottom: 10mm;
          text-align: center;
          font-weight: 400;
        }
        
        .print-stats {
          display: flex;
          justify-content: space-around;
          margin-bottom: 15mm;
          padding: 8mm;
          background: #f8f9fa !important;
          border: 2px solid #000;
          border-radius: 8px;
        }
        
        .stat-box {
          text-align: center;
          padding: 5mm;
          background: white !important;
          border: 1px solid #ccc;
          border-radius: 4px;
          min-width: 30mm;
        }
        
        .stat-box .stat-number {
          font-size: 18pt;
          font-weight: 700;
          color: #000 !important;
          display: block;
          margin-bottom: 2mm;
        }
        
        .stat-box .stat-label {
          font-size: 10pt;
          color: #333 !important;
          font-weight: 500;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15mm;
          background: white !important;
          font-size: 10pt;
        }
        
        th, td {
          border: 1px solid #000 !important;
          padding: 6pt 8pt;
          text-align: right;
          vertical-align: middle;
          background: white !important;
        }
        
        th {
          background: #e9ecef !important;
          font-weight: 700;
          font-size: 11pt;
          color: #000 !important;
          text-align: center;
        }
        
        td {
          font-size: 9pt;
          color: #000 !important;
        }
        
        tr:nth-child(even) {
          background: #f8f9fa !important;
        }
        
        .status-available { 
          color: #155724 !important; 
          font-weight: 600;
          background: #d4edda !important;
          padding: 2pt 4pt;
          border-radius: 3px;
        }
        
        .status-transit { 
          color: #856404 !important; 
          font-weight: 600;
          background: #fff3cd !important;
          padding: 2pt 4pt;
          border-radius: 3px;
        }
        
        .status-maintenance { 
          color: #721c24 !important; 
          font-weight: 600;
          background: #f8d7da !important;
          padding: 2pt 4pt;
          border-radius: 3px;
        }
        
        .status-sold { 
          color: #721c24 !important; 
          font-weight: 600;
          background: #f5c6cb !important;
          padding: 2pt 4pt;
          border-radius: 3px;
        }
        
        .status-reserved {
          color: #004085 !important;
          font-weight: 600;
          background: #cce7ff !important;
          padding: 2pt 4pt;
          border-radius: 3px;
        }
        
        .print-footer {
          margin-top: 15mm;
          padding-top: 8mm;
          border-top: 2px solid #000;
          text-align: center;
          font-size: 10pt;
          color: #666 !important;
        }
        
        .summary-section {
          margin-top: 10mm;
          padding: 8mm;
          background: #f8f9fa !important;
          border: 2px solid #000;
          border-radius: 8px;
        }
        
        .summary-title {
          font-size: 14pt;
          font-weight: 700;
          color: #000 !important;
          margin-bottom: 5mm;
          text-align: center;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5mm;
        }
        
        .summary-item {
          background: white !important;
          padding: 4mm;
          border: 1px solid #ccc;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
        }
        
        .summary-label {
          font-weight: 600;
          color: #333 !important;
        }
        
        .summary-value {
          font-weight: 700;
          color: #000 !important;
        }
        
        @media print {
          body { 
            margin: 0 !important; 
            padding: 0 !important;
            background: white !important;
          }
          .print-container {
            max-width: none;
            margin: 0;
            padding: 0;
          }
          .print-header { 
            page-break-after: avoid; 
          }
          table { 
            page-break-inside: auto; 
          }
          tr { 
            page-break-inside: avoid; 
            page-break-after: auto; 
          }
          .print-stats {
            page-break-after: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        <div class="print-header">
          <h1>تقرير جدول المخزون</h1>
          <div class="company-info">نظام إدارة المخزون</div>
          <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}</div>
        </div>
        
        <!-- Statistics Section -->
        <div class="print-stats">
          <div class="stat-box">
            <span class="stat-number" id="total-count">0</span>
            <span class="stat-label">إجمالي العناصر</span>
          </div>
          <div class="stat-box">
            <span class="stat-number" id="available-count">0</span>
            <span class="stat-label">متوفر</span>
          </div>
          <div class="stat-box">
            <span class="stat-number" id="transit-count">0</span>
            <span class="stat-label">في الطريق</span>
          </div>
          <div class="stat-box">
            <span class="stat-number" id="maintenance-count">0</span>
            <span class="stat-label">قيد الصيانة</span>
          </div>
          <div class="stat-box">
            <span class="stat-number" id="reserved-count">0</span>
            <span class="stat-label">محجوز</span>
          </div>
        </div>
        
        <!-- Table Section -->
        <div class="table-container">
          ${tableElement.outerHTML.replace(/class="[^"]*"/g, (match) => {
            if (match.includes('status-available')) return 'class="status-available"';
            if (match.includes('status-transit')) return 'class="status-transit"';
            if (match.includes('status-maintenance')) return 'class="status-maintenance"';
            if (match.includes('status-sold')) return 'class="status-sold"';
            if (match.includes('status-reserved')) return 'class="status-reserved"';
            return match;
          })}
        </div>
        
        <!-- Summary Section -->
        <div class="summary-section">
          <div class="summary-title">ملخص المخزون</div>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">إجمالي القيمة المقدرة:</span>
              <span class="summary-value" id="total-value">0 ريال</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">متوسط سعر السيارة:</span>
              <span class="summary-value" id="avg-price">0 ريال</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">أحدث إضافة:</span>
              <span class="summary-value" id="latest-addition">غير محدد</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">أقدم سيارة:</span>
              <span class="summary-value" id="oldest-car">غير محدد</span>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="print-footer">
          <p>تم إنشاء هذا التقرير بواسطة نظام إدارة المخزون</p>
          <p>وقت الإنشاء: ${new Date().toLocaleString('ar-SA')}</p>
        </div>
      </div>
      
      <script>
        // Calculate and update statistics
        function updatePrintStats() {
          const rows = document.querySelectorAll('tbody tr');
          let totalCount = 0;
          let availableCount = 0;
          let transitCount = 0;
          let maintenanceCount = 0;
          let reservedCount = 0;
          let totalValue = 0;
          let prices = [];
          let dates = [];
          
          rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
              totalCount++;
              
              // Count by status (assuming status is in a specific column)
              const statusCell = Array.from(cells).find(cell => 
                cell.textContent.includes('متوفر') || 
                cell.textContent.includes('في الطريق') || 
                cell.textContent.includes('قيد الصيانة') || 
                cell.textContent.includes('محجوز')
              );
              
              if (statusCell) {
                if (statusCell.textContent.includes('متوفر')) availableCount++;
                else if (statusCell.textContent.includes('في الطريق')) transitCount++;
                else if (statusCell.textContent.includes('قيد الصيانة')) maintenanceCount++;
                else if (statusCell.textContent.includes('محجوز')) reservedCount++;
              }
              
              // Extract price if available
              const priceCell = Array.from(cells).find(cell => 
                cell.textContent.match(/\\d+.*ريال/) || cell.textContent.match(/\\d+,\\d+/)
              );
              if (priceCell) {
                const priceMatch = priceCell.textContent.match(/([\\d,]+)/);
                if (priceMatch) {
                  const price = parseFloat(priceMatch[1].replace(/,/g, ''));
                  if (!isNaN(price)) {
                    prices.push(price);
                    totalValue += price;
                  }
                }
              }
            }
          });
          
          // Update counts
          document.getElementById('total-count').textContent = totalCount;
          document.getElementById('available-count').textContent = availableCount;
          document.getElementById('transit-count').textContent = transitCount;
          document.getElementById('maintenance-count').textContent = maintenanceCount;
          document.getElementById('reserved-count').textContent = reservedCount;
          
          // Update summary
          document.getElementById('total-value').textContent = totalValue.toLocaleString('ar-SA') + ' ريال';
          const avgPrice = prices.length > 0 ? totalValue / prices.length : 0;
          document.getElementById('avg-price').textContent = Math.round(avgPrice).toLocaleString('ar-SA') + ' ريال';
        }
        
        // Run calculations when page loads
        setTimeout(updatePrintStats, 100);
      </script>
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
