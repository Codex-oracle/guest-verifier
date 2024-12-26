import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import csv from 'csv-parse/sync'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    // Read the CSV file
    const filePath = path.join(process.cwd(), 'data', 'Updated_guestlist.csv')
    const fileContent = await fs.readFile(filePath, 'utf-8')
    
    // Parse CSV content
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    // Search for guest (case-insensitive)
    const guest = records.find((record: any) => 
      record.Name.toLowerCase().includes(name.toLowerCase())
    )

    if (guest) {
      return NextResponse.json({
        found: true,
        details: guest
      })
    }

    return NextResponse.json({ found: false })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 