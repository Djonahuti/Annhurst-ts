'use client'
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string | string[];
  address: string | string[];
  kyc: boolean;
  banned: boolean;
}

interface Coordinator {
  id: number;
  name: string;
  email: string;
  phone: string | string[];
  banned: boolean;
}

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  banned: boolean;
}

export default function ViewUsers() {
  const { user, role } = useAuth();
  const { adminRole } = useAuth();
  const router = useRouter();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [banLoading, setBanLoading] = useState<string | null>(null);

  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [driversRes, coordinatorsRes, adminsRes] = await Promise.all([
        fetch('/api/drivers'),
        fetch('/api/coordinators'),
        fetch('/api/admins'),
      ]);

      const [driversJson, coordinatorsJson, adminsJson] = await Promise.all([
        driversRes.json(),
        coordinatorsRes.json(),
        adminsRes.json(),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDrivers((driversJson || []).map((d: any) => ({
        id: Number(d.id),
        name: d.name,
        email: d.email,
        phone: Array.isArray(d.phone) ? d.phone : (d.phone ? [d.phone] : []),
        address: Array.isArray(d.address) ? d.address : (d.address ? [d.address] : []),
        kyc: Boolean(d.kyc),
        banned: Boolean(d.banned),
      })));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCoordinators((coordinatorsJson || []).map((c: any) => ({
        id: Number(c.id),
        name: c.name,
        email: c.email,
        phone: Array.isArray(c.phone) ? c.phone : (c.phone ? [c.phone] : []),
        banned: Boolean(c.banned),
      })));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setAdmins((adminsJson || []).map((a: any) => ({
        id: Number(a.id),
        name: a.name,
        email: a.email,
        role: a.role,
        banned: Boolean(a.banned),
      })));
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || role !== "admin") {
      router.push("/login");
      return;
    }
    fetchAllUsers();
  }, [user, role, router, fetchAllUsers]);

  const handleBanToggle = async (table: string, id: string | number, banned: boolean) => {
    setBanLoading(`${table}-${id}`);
    try {
      const endpoint = `/api/${table}`;
      await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, banned: !banned }),
      });
      await fetchAllUsers();
    } catch (e) {
      console.error('Failed to toggle ban:', e);
    } finally {
      setBanLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10">
      <Accordion type="multiple" defaultValue={["drivers", "coordinators", "admins"]}>
        <AccordionItem value="drivers">
          <AccordionTrigger className="text-2xl">Drivers</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Ban</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((d) => {
                  return (
                    <TableRow key={d.id} className="hover:bg-red-50 hover:text-primary">
                      <TableCell>{d.name}</TableCell>
                      <TableCell>{d.email}</TableCell>
                      <TableCell>{Array.isArray(d.phone) ? d.phone.join(", ") : d.phone}</TableCell>
                      <TableCell>{Array.isArray(d.address) ? d.address.join(", ") : d.address}</TableCell>
                      <TableCell>{d.kyc ? "Verified" : "Not Verified"}</TableCell>
                      <TableCell>
                       {adminRole !== "viewer" ? (
                        <button
                          className={`px-3 py-1 rounded ${d.banned ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                          disabled={banLoading === `driver-${d.id}`}
                          onClick={() => handleBanToggle('driver', d.id, d.banned)}
                        >
                          {banLoading === `driver-${d.id}` ? '...' : d.banned ? 'Unban' : 'Ban'}
                        </button>
                        ):(
                          <span className="text-gray-400 italic"><Ban /></span>
                        )} 
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="coordinators">
          <AccordionTrigger className="text-2xl">Coordinators</AccordionTrigger>
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Ban</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coordinators.map((c) => {
                  return (
                    <TableRow key={c.id} className="hover:bg-red-50 hover:text-primary">
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.email}</TableCell>
                      <TableCell>{Array.isArray(c.phone) ? c.phone.join(", ") : c.phone}</TableCell>
                      <TableCell>
                       {adminRole !== "viewer" ? (
                        <button
                          className={`px-3 py-1 rounded ${c.banned ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                          disabled={banLoading === `coordinators-${c.id}`}
                          onClick={() => handleBanToggle('coordinators', c.id, c.banned)}
                        >
                          {banLoading === `coordinators-${c.id}` ? '...' : c.banned ? 'Unban' : 'Ban'}
                        </button>
                        ):(
                          <span className="text-gray-400 italic"><Ban /></span>
                        )} 
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="admins">
          <AccordionTrigger className="text-2xl">Admins</AccordionTrigger>
          {adminRole !== "viewer" ? (
          <AccordionContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Ban</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.map((a) => {
                  return (
                    <TableRow key={a.id} className="hover:bg-red-50 hover:text-primary">
                      <TableCell>{a.name}</TableCell>
                      <TableCell>{a.email}</TableCell>
                      <TableCell>{a.role}</TableCell>
                      <TableCell>
                        <button
                          className={`px-3 py-1 rounded ${a.banned ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
                          disabled={banLoading === `admins-${a.id}`}
                          onClick={() => handleBanToggle('admins', a.id, a.banned)}
                        >
                          {banLoading === `admins-${a.id}` ? '...' : a.banned ? 'Unban' : 'Ban'}
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AccordionContent>
          ):(
            <span className="text-gray-400 italic">You only have Read Access, You can&apos;t View Admins</span>
          )}
        </AccordionItem>
      </Accordion>
    </div>
  );
}
