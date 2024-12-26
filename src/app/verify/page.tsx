'use client'

import { useState, useEffect } from 'react'

interface Guest {
  Name: string
  Status: string
  Guest: string
  Verified: string
  'Email/Phone Number': string
}

export default function VerifyGuest() {
  const [name, setName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [guests, setGuests] = useState<Guest[]>([])
  const [result, setResult] = useState<{found: boolean, details?: Guest} | null>(null)

  // Fetch guest list on component mount
  useEffect(() => {
    const fetchGuests = async () => {
      const response = await fetch('/api/get-guests')
      const data = await response.json()
      setGuests(data)
    }
    fetchGuests()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/verify-guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Error:', error)
      setResult({ found: false })
    }
  }

  const handleVerify = async (guestName: string) => {
    try {
      const response = await fetch('/api/update-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: guestName }),
      })
      
      if (response.ok) {
        // Update local state to reflect verification
        setGuests(guests.map(guest => 
          guest.Name === guestName ? {...guest, Verified: 'Yes'} : guest
        ))
      }
    } catch (error) {
      console.error('Error updating verification:', error)
    }
  }

  const filteredGuests = guests.filter(guest =>
    guest.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest['Email/Phone Number'].toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-2xl font-bold text-center mb-8">Guest Verification</h1>
          
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Search guests..."
            />
          </div>

          {/* Guest List */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Of</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{guest.Name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{guest['Email/Phone Number']}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{guest.Status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{guest.Guest}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{guest.Verified}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guest.Verified === 'No' && (
                        <button
                          onClick={() => handleVerify(guest.Name)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 