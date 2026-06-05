import { Property, Room, Tenant, Transaction, Complaint, PaymentReceipt } from '../types';

export interface ExportData {
  properties: Property[];
  rooms: Room[];
  tenants: Tenant[];
  transactions: Transaction[];
  complaints: Complaint[];
  receipts: PaymentReceipt[];
}

export const createAndExportSpreadsheet = async (
  accessToken: string,
  title: string,
  data: ExportData
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  // Step 1: Create a spreadsheet with custom tabs with explicit sheetId allocation
  const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        { properties: { sheetId: 100, title: 'Overview & Summary' } },
        { properties: { sheetId: 101, title: 'Venue & Rooms Specs' } },
        { properties: { sheetId: 102, title: 'Active Tenants Roster' } },
        { properties: { sheetId: 103, title: 'Financial Ledger' } },
        { properties: { sheetId: 104, title: 'Maintenance & Complaints' } },
      ],
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Failed to create spreadsheet: ${errorText}`);
  }

  const responseJson = await createResponse.json();
  const spreadsheetId = responseJson.spreadsheetId;
  const spreadsheetUrl = responseJson.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // Step 2: Prepare values for each tab

  // 1. Overview & Summary
  const overviewValues = [
    ['MudaKost Management Executive Summary'],
    ['Generated On', new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB (UTC+7)'],
    [],
    ['Key Operational Indicators', 'Value'],
    ['Total Managed Venues', data.properties.length],
    ['Total Managed Rooms', data.rooms.length],
    ['Occupied Rooms', data.rooms.filter(r => r.status === 'occupied').length],
    ['Occupancy Rate', data.rooms.length > 0 ? `${Math.round((data.rooms.filter(r => r.status === 'occupied').length / data.rooms.length) * 100)}%` : '0%'],
    ['Drafted Payment Receipts', data.receipts.length],
    ['Pending Maintenance Grievances', data.complaints.filter(c => c.status !== 'solved').length],
    [],
    ['All-Time Accounting Summary', 'Amount (IDR)'],
    ['Total Rent Income Logs', data.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)],
    ['Total Operational Expenses', data.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)],
    ['Total Staff Wage Payouts', data.transactions.filter(t => t.type === 'wage').reduce((sum, t) => sum + t.amount, 0)],
    ['Net Property Margin (Surplus)', data.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) - data.transactions.filter(t => t.type !== 'income').reduce((sum, t) => sum + t.amount, 0)],
  ];

  // 2. Venue & Room Specs
  const roomHeaders = ['Property Venue', 'Room Number', 'Floor', 'Room Type', 'Monthly Rate (IDR)', 'Status', 'Facilities'];
  const roomRows = data.rooms.map(r => {
    const propertyName = data.properties.find(p => p.id === r.propertyId)?.name || 'Unknown Property';
    return [
      propertyName,
      r.number,
      `Floor ${r.floor}`,
      r.type.toUpperCase(),
      r.price,
      r.status.toUpperCase(),
      r.facilities.join(', '),
    ];
  });
  const roomValues = [roomHeaders, ...roomRows];

  // 3. Active Tenants Roster
  const tenantHeaders = ['Tenant Name', 'Room Number', 'Phone Number', 'Email Address', 'Contract Start Date', 'Contract End/Due Date', 'Status Alerts'];
  const tenantRows = data.tenants.map(t => {
    const room = data.rooms.find(r => r.id === t.roomId);
    const roomNum = room ? room.number : 'N/A';
    
    // contract status alerts
    const today = new Date();
    today.setHours(0,0,0,0);
    const rentUntil = new Date(t.rentUntil);
    rentUntil.setHours(0,0,0,0);
    const daysLeft = Math.ceil((rentUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let statusText = 'Active / OK';
    if (daysLeft < 0) {
      statusText = 'OVERDUE BILLING';
    } else if (daysLeft <= 7) {
      statusText = `Payable due in ${daysLeft} days`;
    }

    return [
      t.name,
      roomNum,
      t.phone,
      t.email,
      t.rentStart,
      t.rentUntil,
      statusText
    ];
  });
  const tenantValues = [tenantHeaders, ...tenantRows];

  // 4. Financial Ledger
  const transactionHeaders = ['Record Type', 'Budget Category', 'Amount (IDR)', 'Date Filed', 'Description / Info', 'Associated Property Venue'];
  const transactionRows = data.transactions.map(t => {
    const propertyName = t.propertyId ? (data.properties.find(p => p.id === t.propertyId)?.name || 'Unknown Property') : 'Global Admin / Wage';
    return [
      t.type.toUpperCase(),
      t.category,
      t.amount,
      t.date,
      t.description,
      propertyName
    ];
  });
  const transactionValues = [transactionHeaders, ...transactionRows];

  // 5. Maintenance & Complaints
  const complaintHeaders = ['Reporting Tenant', 'Room Number', 'Issue Title', 'Priority Rating', 'Current Status', 'Issue Description Detail', 'Reported Date'];
  const complaintRows = data.complaints.map(c => {
    return [
      c.tenantName,
      c.roomNumber,
      c.title,
      c.priority.toUpperCase(),
      c.status.toUpperCase(),
      c.description,
      c.date
    ];
  });
  const complaintValues = [complaintHeaders, ...complaintRows];

  // Step 3: Write data into each sheet via batchUpdate values endpoint
  const writeResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: "'Overview & Summary'!A1",
          values: overviewValues,
        },
        {
          range: "'Venue & Rooms Specs'!A1",
          values: roomValues,
        },
        {
          range: "'Active Tenants Roster'!A1",
          values: tenantValues,
        },
        {
          range: "'Financial Ledger'!A1",
          values: transactionValues,
        },
        {
          range: "'Maintenance & Complaints'!A1",
          values: complaintValues,
        },
      ],
    }),
  });

  if (!writeResponse.ok) {
    const errorText = await writeResponse.text();
    throw new Error(`Failed to write spreadsheet values: ${errorText}`);
  }

  // Step 4: Beautify & style the spreadsheet to create a highly crafted, production-ready document
  // Alternate forest-green accents matching MudaKost's theme in the first sheet and other header bands
  try {
    const stylingResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        requests: [
          // Sheet 100 (Overview): Main Title Header Row Format
          {
            repeatCell: {
              range: { sheetId: 100, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 2 },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, fontSize: 13, color: { red: 1.0, green: 1.0, blue: 1.0 } },
                  backgroundColor: { red: 0.12, green: 0.36, blue: 0.25 }, // MudaKost forest green (#1e5c3f)
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor,horizontalAlignment)'
            }
          },
          // Sheet 100 (Overview): Operational indicators header line
          {
            repeatCell: {
              range: { sheetId: 100, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 0, endColumnIndex: 2 },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, fontSize: 11, color: { red: 0.05, green: 0.23, blue: 0.15 } },
                  backgroundColor: { red: 0.88, green: 0.93, blue: 0.90 } // soft forest green (#e2ede5)
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          },
          // Sheet 100 (Overview): Accounting header line
          {
            repeatCell: {
              range: { sheetId: 100, startRowIndex: 10, endRowIndex: 11, startColumnIndex: 0, endColumnIndex: 2 },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, fontSize: 11, color: { red: 0.05, green: 0.23, blue: 0.15 } },
                  backgroundColor: { red: 0.88, green: 0.93, blue: 0.90 }
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          },
          // Alternate table columns styling headers for Sheet 101, 102, 103, 104
          // 101 Rooms Specs: Row 0 Header
          {
            repeatCell: {
              range: { sheetId: 101, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 7 },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, color: { red: 1.0, green: 1.0, blue: 1.0 } },
                  backgroundColor: { red: 0.12, green: 0.36, blue: 0.25 }
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          },
          // 102 Tenants: Row 0 Header
          {
            repeatCell: {
              range: { sheetId: 102, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 7 },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, color: { red: 1.0, green: 1.0, blue: 1.0 } },
                  backgroundColor: { red: 0.12, green: 0.36, blue: 0.25 }
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          },
          // 103 Transactions: Row 0 Header
          {
            repeatCell: {
              range: { sheetId: 103, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 6 },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, color: { red: 1.0, green: 1.0, blue: 1.0 } },
                  backgroundColor: { red: 0.12, green: 0.36, blue: 0.25 }
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          },
          // 104 Complaints: Row 0 Header
          {
            repeatCell: {
              range: { sheetId: 104, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 7 },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, color: { red: 1.0, green: 1.0, blue: 1.0 } },
                  backgroundColor: { red: 0.12, green: 0.36, blue: 0.25 }
                }
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
          },
          // Autofilter adjustments on all data logs
          {
            setBasicFilter: {
              filter: { range: { sheetId: 101, startRowIndex: 0, endRowIndex: roomValues.length, startColumnIndex: 0, endColumnIndex: 7 } }
            }
          },
          {
            setBasicFilter: {
              filter: { range: { sheetId: 102, startRowIndex: 0, endRowIndex: tenantValues.length, startColumnIndex: 0, endColumnIndex: 7 } }
            }
          },
          {
            setBasicFilter: {
              filter: { range: { sheetId: 103, startRowIndex: 0, endRowIndex: transactionValues.length, startColumnIndex: 0, endColumnIndex: 6 } }
            }
          },
          {
            setBasicFilter: {
              filter: { range: { sheetId: 104, startRowIndex: 0, endRowIndex: complaintValues.length, startColumnIndex: 0, endColumnIndex: 7 } }
            }
          }
        ],
      }),
    });
    
    if (!stylingResponse.ok) {
      console.warn("Spreadsheet styling did not respond fully (e.g., API boundaries limit), but sheet values are fully written.");
    }
  } catch (styleError) {
    console.error("Format batch update failed:", styleError);
  }

  return { spreadsheetId, spreadsheetUrl };
};
