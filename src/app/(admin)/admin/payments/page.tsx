'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'

interface Payment {
  id: number;
  amount: number | null;
  pay_type: string | null;
  pay_complete: string | null;
  bus: {
    id: number;
    bus_code: string;
    plate_no: string;
    e_payment: number | null;  // ← allow null
  } | null;
  coordinator: string | null;
  created_at: string;
}

export default function ViewPayments() {
  const { adminRole } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([])
  const canEdit = adminRole === 'admin' || adminRole === 'editor';
  const [loading, setLoading] = useState(true)

  // -------------------------------------------------
  // FETCH PAYMENTS
  // -------------------------------------------------
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/payments');
        if (!res.ok) throw new Error('Failed to fetch payments');
        const data = await res.json();
        setPayments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // -------------------------------------------------
  // UPDATE EXPECTED PAYMENT
  // -------------------------------------------------
  const updateExpectedPayment = async (busId: number | null, value: number) => {
    if (!busId) return;
    try {
      await fetch(`/api/buses/${busId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ e_payment: value }),
      });
      // Optimistically update UI
      setPayments((prev) =>
        prev.map((p) =>
          p.bus?.id === busId
            ? { ...p, bus: { ...p.bus!, e_payment: value } }
            : p
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  // -------------------------------------------------
  // UPDATE PAYMENT STATUS
  // -------------------------------------------------
  const updatePaymentStatus = async (paymentId: number, status: string) => {
    try {
      await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pay_complete: status }),
      });
      // Optimistically update UI
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, pay_complete: status } : p))
      );
    } catch (e) {
      console.error(e);
    }
  };

  // -------------------------------------------------
  // UI
  // -------------------------------------------------
  if (loading) {
    return (
      <Card className="max-w-5xl mx-auto bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="max-w-5xl mx-auto bg-white dark:bg-gray-900">
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No payments found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-5xl mx-auto bg-white dark:bg-gray-900">
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : payments.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Coordinator</TableHead>
                <TableHead>Expected Amount</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.bus?.bus_code} ({p.bus?.plate_no})</TableCell>
                  <TableCell>{p.coordinator || 'N/A'}</TableCell>

                  {/* ✅ Editable Expected Payment */}
                  <TableCell>
                    <Input
                      type="number"
                      disabled={!canEdit}
                      defaultValue={p.bus?.e_payment ?? 0}
                      onBlur={(e) => {
                        const val = Number(e.target.value);
                        if (!isNaN(val) && p.bus?.id != null) {
                          updateExpectedPayment(p.bus.id, val);
                        }
                      }}
                      className="border rounded px-2 py-1 w-24"
                    />
                  </TableCell>

                  <TableCell>₦{p.amount?.toLocaleString() || 0}</TableCell>
                  <TableCell>{p.pay_type || 'N/A'}</TableCell>

                  {/* ✅ Editable Pay Status */}
                  <TableCell>
                   {adminRole !== "viewer" ? ( 
                    <Select
                    defaultValue={p.pay_complete || 'Pending'}
                    onValueChange={(status) => updatePaymentStatus(p.id, status)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={p.pay_complete} />
                      </SelectTrigger>
                      <SelectContent className="border rounded px-2 py-1">
                        <SelectItem
                         value="YES"
                         className='data-[state=checked]:bg-primary data-[state=checked]:text-gray-200 data-[highlighted]:bg-primary-light data-[highlighted]:text-gray-200'
                        >
                          YES
                        </SelectItem>
                        <SelectItem
                         value="INCOMPLETE"
                         className='data-[state=checked]:bg-primary data-[state=checked]:text-gray-200 data-[highlighted]:bg-primary-light data-[highlighted]:text-gray-200'
                        >
                          INCOMPLETE
                        </SelectItem>
                        <SelectItem
                         value="Pending"
                         className='data-[state=checked]:bg-primary data-[state=checked]:text-gray-200 data-[highlighted]:bg-primary-light data-[highlighted]:text-gray-200'
                        >
                          Pending
                        </SelectItem>
                        <SelectItem
                         value="NO"
                         className='data-[state=checked]:bg-primary data-[state=checked]:text-gray-200 data-[highlighted]:bg-primary-light data-[highlighted]:text-gray-200'
                        >
                          NO
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    ) : (
                      <Input
                        disabled
                        type="text"
                        placeholder={p.pay_complete ?? undefined}
                        className='border rounded px-2 py-1 w-20'
                      />
                    )}
                  </TableCell>

                  <TableCell>{new Date(p.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
