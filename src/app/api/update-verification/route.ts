import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const filePath = path.join(process.cwd(), 'Updated_guestlist.csv')
    
    // Read current CSV
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    // Update verification status
    const updatedRecords = records.map((record: any) => {
      if (record.Name === name) {
        return { ...record, Verified: 'Yes' }
      }
      return record
    })

    // Write back to CSV
    const updatedCsv = stringify(updatedRecords, { header: true })
    await fs.writeFile(filePath, updatedCsv)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating verification:', error)
    return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 })
  }
} 