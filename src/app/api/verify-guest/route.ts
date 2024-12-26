import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const filePath = path.join(process.cwd(), 'Updated_guestlist.csv')
    
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    const guest = records.find((record: any) => 
      record.Name.toLowerCase() === name.toLowerCase()
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
    return NextResponse.json({ found: false }, { status: 500 })
  }
} 