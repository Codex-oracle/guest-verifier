import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'Updated_guestlist.csv')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Error reading guest list:', error)
    return NextResponse.json({ error: 'Failed to fetch guest list' }, { status: 500 })
  }
} 