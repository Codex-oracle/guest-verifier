import { NextResponse } from 'next/server'
import { getSheet } from '@/lib/googleSheets'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    
    const rowToUpdate = rows.find(row => row.get('Name') === name);
    if (rowToUpdate) {
      rowToUpdate.set('Verified', 'Yes');
      await rowToUpdate.save();
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
  } catch (error) {
    console.error('Error updating verification:', error);
    return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 });
  }
} 