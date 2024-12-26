import { NextResponse } from 'next/server'
import { getSheet } from '@/lib/googleSheets'

export async function GET() {
  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    
    const guests = rows.map(row => ({
      Name: row.get('Name'),
      'Email/Phone Number': row.get('Email/Phone Number'),
      Status: row.get('Status'),
      Guest: row.get('Guest'),
      Verified: row.get('Verified') || 'No'
    }));

    return NextResponse.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
  }
} 