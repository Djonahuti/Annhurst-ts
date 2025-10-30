'use client';

import EventCalendar from '@/components/EventCalender';
import Modal from '@/components/Modal';
import Contact from '@/components/Shared/Contact';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { LocateFixed, Mail, RadioTower, SendHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Bus {
  id: number;
  bus_code: string | null;
  plate_no: string | null;
  driver_name: string | null;
  driver_id: number | null;
}

interface Coordinator {
  id: number;
  name: string;
  email: string;
  phone: string[] | null;
}

export default function UserProfile() {
  const router = useRouter();
  const { user, role, loading: authLoading, signOut } = useAuth();

  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [coordinator, setCoordinator] = useState<Coordinator | null>(null);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!authLoading && (!user || role !== 'coordinator')) {
        router.push('/login');
        return;
      }

      if (authLoading || !user?.email) return;

      try {
        const res = await fetch(`/api/coordinator/buses?email=${encodeURIComponent(user.email)}`);
        if (!res.ok) throw new Error('Failed to fetch');

        const data = await res.json();
        setCoordinator(data.coordinator);
        setBuses(data.buses);
      } catch (err) {
        console.error(err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, role, authLoading, router]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h2 className="text-2xl font-bold mb-6">Coordinator Profile</h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Welcome, {coordinator?.name || user?.email}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-between">
          <div className="mr-auto">
            <p>Role: Coordinator</p>
            <p>Email: {coordinator?.email}</p>
            {coordinator?.phone && <p>Phone: {coordinator.phone.join(', ')}</p>}
          </div>
          <div className="space-y-2 space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="border-2 flex-1 border-primary dark:border-primary-light text-primary dark:text-primary-light hover:bg-primary-dark dark:hover:bg-primary-light hover:text-gray-200 dark:hover:text-gray-100">
                  <LocateFixed className="mr-2 h-4 w-4" />
                  Tracker
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link href="https://monitor.concept-nova.com/objects" target="_blank" rel="noopener noreferrer">
                    Tracker
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="https://monitor.autotrack.ng/objects" target="_blank" rel="noopener noreferrer">
                    New Tracker
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="https://sites.google.com/annhurst-gsl.com/portal/home" target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-primary text-gray-200 hover:bg-red-50 hover:text-primary">
                <RadioTower className="mr-2 h-4 w-4" />
                Intranet
              </Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/my-inbox" className="mr-auto">
            <Button className="bg-gradient-to-r from-gray-600 to-primary-light text-gray-200 hover:from-primary-dark hover:to-primary-dark transform transition duration-300 ease-in-out hover:scale-105">
              <Mail className="mr-2 h-4 w-4" />
              Inbox
            </Button>
          </Link>
          <Button onClick={handleLogout} className="text-gray-200">
            Logout
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Buses Under Your Coordination</CardTitle>
        </CardHeader>
        <CardContent>
          {buses.length === 0 ? (
            <p>No buses assigned to you.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus Code</TableHead>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buses.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell>{bus.bus_code || 'N/A'}</TableCell>
                    <TableCell>{bus.plate_no || 'N/A'}</TableCell>
                    <TableCell>{bus.driver_name || 'N/A'}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/payment/${bus.id}`)}
                      >
                        Post Payment
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/payment/${bus.id}/history`)}
                      >
                        View Payments
                      </Button>
                      <Button
                        className="mt-2 ml-auto block text-gray-200"
                        onClick={() => {
                          setSelectedDriverId(bus.driver_id);
                          setContactModalOpen(true);
                        }}
                      >
                        <SendHorizontal className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-2xl">Next End of the Month Meeting Date</div>
          <EventCalendar />
        </CardFooter>
      </Card>

      <Modal isOpen2={isContactModalOpen} onClose={() => setContactModalOpen(false)}>
        <Contact driverId={selectedDriverId} />
      </Modal>
    </div>
  );
}