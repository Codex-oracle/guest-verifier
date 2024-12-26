'use client'

import { useState, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

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
  const [showScanner, setShowScanner] = useState(false)
  const [result, setResult] = useState<{found: boolean, details?: Guest} | null>(null)

  useEffect(() => {
    const fetchGuests = async () => {
      const response = await fetch('/api/get-guests')
      const data = await response.json()
      setGuests(data)
    }
    fetchGuests()
  }, [])

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner("reader", {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      }, false);

      scanner.render(onScanSuccess, onScanError);

      function onScanSuccess(decodedText: string) {
        console.log('Scanned text:', decodedText); // Debug log

        try {
          // Check if the text contains 'email=' parameter
          const emailParam = decodedText.split('email=')[1];
          if (emailParam) {
            const contact = emailParam.split('&')[0]; // Get the value before any other parameters
            console.log('Extracted contact:', contact); // Debug log
            
            // Convert phone number format if needed and update search
            const formattedContact = contact.replace(/^234|^44|^1/, '');
            setSearchTerm(formattedContact);
            setShowScanner(false);
            scanner.clear();
          } else {
            console.log('No email parameter found in QR code');
          }
        } catch (error) {
          console.error('Error processing QR code:', error);
          console.error('Scanned content:', decodedText);
        }
      }

      function onScanError(error: any) {
        // Only log actual errors, not timeouts or empty scans
        if (error?.message?.includes('NotFound')) {
          return;
        }
        console.warn('Scan error:', error);
      }

      return () => {
        scanner.clear().catch(console.error);
      };
    }
  }, [showScanner]);

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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-2xl font-bold text-center mb-8">Guest Verification</h1>
          
          {/* Search and Scan Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                placeholder="Search guests..."
              />
              <button
                onClick={() => setShowScanner(!showScanner)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                {showScanner ? 'Hide Scanner' : 'Scan QR'}
              </button>
            </div>

            {/* QR Scanner */}
            {showScanner && (
              <div className="max-w-sm mx-auto">
                <div id="reader"></div>
              </div>
            )}
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
                  <tr key={index} className={guest.Verified === 'Yes' ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 text-black whitespace-nowrap">{guest.Name}</td>
                    <td className="px-6 py-4 text-black whitespace-nowrap">{guest['Email/Phone Number']}</td>
                    <td className="px-6 py-4 text-black whitespace-nowrap">{guest.Status}</td>
                    <td className="px-6 py-4 text-black whitespace-nowrap">{guest.Guest}</td>
                    <td className="px-6 py-4 text-black whitespace-nowrap">{guest.Verified}</td>
                    <td className="px-6 py-4 text-black whitespace-nowrap">
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