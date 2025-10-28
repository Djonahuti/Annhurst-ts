'use client'
import { useEffect, useState } from 'react'
import Link from "next/link";
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Modal from '@/components/Modal'
import { Mail } from 'lucide-react'
import Contact from '@/components/Shared/Contact'
import { useRouter } from 'next/navigation';

interface Driver {
  id: number
  name: string
  email: string
  avatar: string
  dob: string
  nin: string
  phone: string[]
  address: string[]
  kyc: boolean
}


interface Bus {
  id: number
  bus_code: string | null
  plate_no: string | null
  contract_date: string | null
  start_date: string | null
  date_collected: string | null
  agreed_date: string | null
  t_income: string | null
  initial_owe: string | null
  coordinator_name: string | null
  coordinator_email: string | null
  coordinator_phone: string[]
  coordinator_id?: number | null
}

interface Payment {
  id: number;
  created_at: string;
  week: string | null;
  coordinator: string | null;
  bus: number | null;
  p_week: string | null;
  receipt: string | null;
  amount: number | null;
  sender: string | null;
  payment_day: string | null;
  payment_date: string | null;
  pay_type: string | null;
  pay_complete: boolean | null;
  issue: string | null;
  inspection: boolean | null;
}

// Format number as Naira
const formatAsNaira = (value: string | null): string => {
  if (!value || isNaN(Number(value))) return '₦0'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(value))
}

// Calculate amount left
const calculateAmountLeft = (initialOwe: string | null, tIncome: string | null): string => {
  const initial = Number(initialOwe) || 0
  const income = Number(tIncome) || 0
  return formatAsNaira((initial - income).toString())
}

export default function DriverProfile() {
  const { user, role, loading: authLoading, signOut } = useAuth()
  const router = useRouter();

  const [driver, setDriver] = useState<Driver | null>(null)
  const [buses, setBuses] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [busLoading, setBusLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([]);  
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [isContactModalOpen, setContactModalOpen] = useState(false);  

  useEffect(() => {
    const fetchDriver = async () => {
      if (!authLoading && (!user || role !== 'driver')) {
        return router.push('/login')
      }

      if (authLoading) {
        return // Wait for auth to finish loading
      }

      try {
        // Fetch driver info
        const driverRes = await fetch(`/api/drivers?email=${encodeURIComponent(user!.email)}`);
        const driverData = await driverRes.json();
        if (!driverRes.ok) {
          alert(`Failed to fetch driver data: ${driverData.error || 'Unknown error'}`);
          return router.push('/login');
        }
        setDriver(driverData);

        // Fetch buses assigned to driver
        const busesRes = await fetch(`/api/buses?driverId=${driverData.id}`);
        const busesData = await busesRes.json();
        if (busesRes.ok) {
          setBuses(busesData);
        } else {
          alert(`Failed to fetch bus data: ${busesData.error || 'Unknown error'}`);
        }
        setBusLoading(false);
      } catch (error) {
        console.error('Error fetching driver data:', error);
        alert('An unexpected error occurred while fetching driver data.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    const fetchPayments = async () => {
      setPaymentsLoading(true);
      const busId = buses.length > 0 ? buses[0].id : null;
      if (!busId) {
        setPayments([]);
        setPaymentsLoading(false);
        return;
      }
      try {
        const paymentsRes = await fetch(`/api/payments?busId=${busId}`);
        const paymentsData = await paymentsRes.json();
        if (paymentsRes.ok) {
          setPayments(paymentsData);
        } else {
          console.error('Error fetching payments:', paymentsData.error);
          setPayments([]);
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        setPayments([]);
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchDriver();
    if (buses.length > 0) {
      fetchPayments();
    }
  }, [user, role, authLoading, buses, router]);

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!driver) return null

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome, {driver.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Due Amount: <span>₦0</span></p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/my-inbox" className="mr-auto">
            <Button className="bg-gradient-to-r from-gray-600 to-primary-light text-gray-200 hover:from-primary-dark hover:to-primary-dark transform transition duration-300 ease-in-out hover:scale-105">
              <Mail />Inbox
            </Button>
          </Link>
          <Button onClick={handleLogout} className='text-gray-200'>
            Logout
          </Button>
        </CardFooter>         
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Higher Purchase Plan</CardTitle>
          </CardHeader>
          <CardContent>
           {busLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
           ) : buses.length === 0 ? (
            <p className="text-gray-500">No buses assigned to this driver.</p>
           ) : (
            buses.map((bus) => (
              <div key={bus.id} className="border-t pt-2 mt-2">
                <div><span className="font-semibold">Bus Code:</span> {bus.bus_code || 'N/A'}</div>
                <div><span className="font-semibold">Plate Number:</span> {bus.plate_no || 'N/A'}</div>
                <div><span className="font-semibold">Coordinator:</span> {bus.coordinator_name}</div>
                <div><span className="font-semibold">Contract Date:</span> {bus.contract_date || 'N/A'}</div>
                <div><span className="font-semibold">Agreed Completion Date:</span> {bus.agreed_date || 'N/A'}</div>
                <div><span className="font-semibold">Start Date:</span> {bus.start_date || 'N/A'}</div>
                <div><span className="font-semibold">Date Collected:</span> {bus.date_collected || 'N/A'}</div>
                <div><span className="font-semibold">Bus Price:</span> {formatAsNaira(bus.initial_owe)}</div>
                <div><span className="font-semibold">Amount Paid:</span> {formatAsNaira(bus.t_income)}</div>
                <div><span className="font-semibold">Amount Left:</span> {calculateAmountLeft(bus.initial_owe, bus.t_income)}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/payment/${bus.id}/history`)}
                  className='mt-2 ml-auto block'
                >
                  View Payments
                </Button>
              </div>
        ))
           )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div><span className="font-semibold">Name:</span> {driver.name}</div>
            <div><span className="font-semibold">Email:</span> {driver.email}</div>
            <div><span className="font-semibold">Date of Birth:</span> {driver.dob}</div>
            <div><span className="font-semibold">NIN:</span> {driver.nin}</div>
            <div><span className="font-semibold">Phone:</span> {driver.phone.join(', ')}</div>
            <div><span className="font-semibold">Address:</span> {driver.address.join(', ')}</div>
            <div><span className="font-semibold">KYC:</span> {driver.kyc ? 'Verified' : 'Not Verified'}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Relax! You currently do not have Upcoming Payments</p>
            
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : payments.length === 0 ? (
              <p>No payments recorded yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sender</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Inspection</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        {p.payment_date || p.created_at.split("T")[0]}
                      </TableCell>
                      <TableCell>{p.amount ?? 0}</TableCell>
                      <TableCell>{p.pay_type ?? "-"}</TableCell>
                      <TableCell>{p.sender ?? "-"}</TableCell>
                      <TableCell>{p.receipt ?? "-"}</TableCell>
                      <TableCell>
                        {p.pay_complete ? (
                          <span className="text-green-600 font-medium">Complete</span>
                        ) : (
                          <span className="text-red-600 font-medium">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>{p.inspection ? "✔️" : "❌"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Coordinator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
           {busLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
           ) : buses.length === 0 ? (
            <p className="text-gray-500">No Coordinator Assigned to you.</p>
           ) : (
            buses.map((bus) => (
              <div key={bus.id} className="border-t pt-2 mt-2">
                <div><span className="font-semibold">Name:</span> {bus.coordinator_name}</div>
                <div><span className="font-semibold">Email:</span> {bus.coordinator_email}</div>
                <div><span className="font-semibold">Phone:</span> {bus.coordinator_phone}</div>
              </div>
        ))
           )}
           <Button
            className='mt-2 ml-auto block text-gray-200'
            onClick={() => setContactModalOpen(true)}
           >
            Contact
           </Button>
          </CardContent>
        </Card>
      </div>

      {/* Contact Modal */}
      <Modal isOpen2={isContactModalOpen} onClose={() => setContactModalOpen(false)}>
        <Contact
          coordinatorId={buses[0]?.coordinator_id ?? null}
        />
      </Modal>

    </div>
  )
}
