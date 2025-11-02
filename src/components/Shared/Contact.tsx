'use client'
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ContactProps {
  coordinatorId?: number | null;
  driverId?: number | null;
  onSuccess?: () => void;
}

interface Subject {
  id: number;
  subject: string;
}

export default function Contact({ coordinatorId, driverId, onSuccess }: ContactProps) {
  const { user, role } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [currentName, setCurrentName] = useState<string>("");
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [receiverType, setReceiverType] = useState<'coordinator' | 'driver' | null>(null);
  type Receiver = { id: number; name: string; email: string };
  const [coordinatorsList, setCoordinatorsList] = useState<Receiver[]>([]);
  const [driversList, setDriversList] = useState<Receiver[]>([]);
  const [selectedReceiverId, setSelectedReceiverId] = useState<number | null>(null);

  // Load subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects');
        if (response.ok) {
          const data = await response.json();
          setSubjects(data);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch current user name depending on role
  useEffect(() => {
    const fetchName = async () => {
      if (!user) return;
      
      try {
        if (role === "driver") {
          const response = await fetch(`/api/drivers?email=${encodeURIComponent(user.email || '')}`);
          if (response.ok) {
            const data = await response.json();
            if (data?.name) setCurrentName(data.name);
            if (data?.email) setCurrentEmail(data.email);
          }
        } else if (role === "coordinator") {
          const response = await fetch(`/api/coordinators?email=${encodeURIComponent(user.email || '')}`);
          if (response.ok) {
            const data = await response.json();
            if (data?.name) setCurrentName(data.name);
            if (data?.email) setCurrentEmail(data.email);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchName();
  }, [user, role]);

  // If admin, fetch lists of potential receivers
  useEffect(() => {
    const fetchLists = async () => {
      if (role !== 'admin') return;
      
      try {
        const [coordsResponse, driversResponse] = await Promise.all([
          fetch('/api/coordinators'),
          fetch('/api/drivers')
        ]);
        
        if (coordsResponse.ok) {
          const coords = await coordsResponse.json();
          setCoordinatorsList(coords);
        }
        
        if (driversResponse.ok) {
          const drivers = await driversResponse.json();
          setDriversList(drivers);
        }
      } catch (error) {
        console.error('Error fetching lists:', error);
      }
    };
    fetchLists();
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !message.trim()) {
      alert("Please select subject and enter message.");
      return;
    }

    setLoading(true);

    let attachmentUrl: string | null = null;

    // Upload file if present
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          attachmentUrl = uploadData.url;
        } else {
          console.error("File upload failed");
          alert("Attachment upload failed.");
        }
      } catch (error) {
        console.error("File upload error:", error);
        alert("Attachment upload failed.");
      }
    }

    type ContactPayload = {
      subject: number | null;
      message: string;
      sender: string | undefined;
      sender_email: string | undefined;
      attachment: string | null;
      driver?: number | null;
      coordinator?: number | null;
      receiver?: string;
      receiver_email?: string;
    };
    
    const payload: ContactPayload = {
      subject: selectedSubject,
      message,
      sender: currentName || user?.email,
      sender_email: currentEmail || user?.email,
      attachment: attachmentUrl,
    };

    if (role === "driver") {
      // get sender (driver)
      try {
        const driverResponse = await fetch(`/api/drivers?email=${encodeURIComponent(user?.email || '')}`);
        if (driverResponse.ok) {
          const driver = await driverResponse.json();

          // resolve coordinator: prefer provided prop, else derive from buses by driver
          let resolvedCoordinatorId: number | null = coordinatorId ?? null;
          if (!resolvedCoordinatorId && driver?.id) {
            const busesResponse = await fetch(`/api/buses?driverId=${driver.id}`);
            if (busesResponse.ok) {
              const buses = await busesResponse.json();
              if (buses.length > 0) {
                resolvedCoordinatorId = buses[0].coordinator_id;
              }
            }
          }

          payload.coordinator = resolvedCoordinatorId;
          payload.driver = driver?.id || null;

          // get coordinator details for receiver info
          if (resolvedCoordinatorId) {
            const coordResponse = await fetch(`/api/coordinators?email=${encodeURIComponent(user?.email || '')}`);
            if (coordResponse.ok) {
              const coordinator = await coordResponse.json();
              payload.receiver = coordinator?.name || "Unknown";
              payload.receiver_email = coordinator?.email || "";
            }
          }
        }
      } catch (error) {
        console.error('Error fetching driver data:', error);
      }
    } else if (role === "coordinator") {
      // get sender (coordinator)
      try {
        const coordResponse = await fetch(`/api/coordinators?email=${encodeURIComponent(user?.email || '')}`);
        if (coordResponse.ok) {
          const coordinator = await coordResponse.json();

          payload.coordinator = coordinator?.id || null;
          payload.driver = driverId || null;

          // get driver details for receiver info
          if (driverId) {
            const driverResponse = await fetch(`/api/drivers?id=${driverId}`);
            if (driverResponse.ok) {
              const driver = await driverResponse.json();
              payload.receiver = driver?.name || "Unknown";
              payload.receiver_email = driver?.email || "";
            }
          }
        }
      } catch (error) {
        console.error('Error fetching coordinator data:', error);
      }
    }

    // If admin, allow selecting receiver type and specific receiver
    if (role === 'admin') {
      // fetch admin sender details
      try {
        const adminResponse = await fetch(`/api/admins?email=${encodeURIComponent(user?.email || '')}`);
        if (adminResponse.ok) {
          const admin = await adminResponse.json();
          payload.sender = admin?.name || user?.email;
          payload.sender_email = admin?.email || user?.email;
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }

      if (!receiverType || !selectedReceiverId) {
        alert('Please select receiver type and receiver.');
        setLoading(false);
        return;
      }

      if (receiverType === 'coordinator') {
        const receiver = coordinatorsList.find(c => c.id === selectedReceiverId);
        payload.coordinator = receiver?.id || null;
        payload.receiver = receiver?.name || 'Unknown';
        payload.receiver_email = receiver?.email || '';
        payload.driver = null;
      } else {
        const receiver = driversList.find(d => d.id === selectedReceiverId);
        payload.driver = receiver?.id || null;
        payload.receiver = receiver?.name || 'Unknown';
        payload.receiver_email = receiver?.email || '';
        payload.coordinator = null;
      }
    }

    // Debug: log payload and context so we can see why coordinator/receiver fields may be empty
    console.log("Contact submit", { role, coordinatorId, driverId, payload });

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success("Message sent!");
        setMessage("");
        setSelectedSubject(null);
        setFile(null);
        if (onSuccess) onSuccess();
      } else {
        const errorData = await response.json();
        console.error("Failed to send message:", errorData);
        toast.error("Failed to send message.");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message.");
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md space-y-8 p-4 bg-gray-50 dark:bg-gray-900/90">
      <CardContent>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Admin receiver selection */}
        {role === 'admin' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="receiverType" className="block text-sm font-medium mb-1">Send to</Label>
              <Select
                value={receiverType || ""}
                onValueChange={(value) => {
                  setReceiverType(value as 'coordinator' | 'driver');
                  setSelectedReceiverId(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select receiver type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-50 dark:bg-gray-900/90">
                  <SelectItem value="coordinator"
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-gray-200 data-[highlighted]:bg-primary-light data-[highlighted]:text-gray-200"
                  >Coordinator</SelectItem>
                  <SelectItem value="driver"
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-gray-200 data-[highlighted]:bg-primary-light data-[highlighted]:text-gray-200"
                  >Driver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {receiverType && (
              <div className="space-y-2">
                <Label htmlFor="receiver">Receiver</Label>
                <Select
                  value={selectedReceiverId?.toString() || ""}
                  onValueChange={(value) => setSelectedReceiverId(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coordinator" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-50 dark:bg-gray-900/90">
                    {receiverType === 'coordinator'
                      ? coordinatorsList.map((coord) => (
                          <SelectItem key={coord.id} value={coord.id.toString()}
                          className="data-[state=checked]:bg-primary data-[state=checked]:text-gray-200 data-[highlighted]:bg-primary-light data-[highlighted]:text-gray-200"
                          >
                            {coord.name} ({coord.email})
                          </SelectItem>
                        ))
                      : driversList.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id.toString()}>
                            {driver.name} ({driver.email})
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</Label>
          <Select
            value={selectedSubject?.toString() || ""}
            onValueChange={(value) => setSelectedSubject(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent className="bg-gray-50 dark:bg-gray-900/90">
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}
                className="data-[state=checked]:bg-primary data-[state=checked]:text-gray-200 data-[highlighted]:bg-primary-light data-[highlighted]:text-gray-200"
                >
                  {subject.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Enter your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div>
          <Label className="block text-sm font-medium mb-1">Sender</Label>
          <div className="flex gap-2">
          <Input
            type="text"
            value={currentName}
            readOnly
            className="border rounded px-3 py-2"
          />
          <Input
            type="text"
            value={currentEmail}
            readOnly
            className="border rounded px-3 py-2"
          />    
          </div>    
        </div>        

        <div className="space-y-2">
          <Label htmlFor="attachment">Attachment (Optional)</Label>
          <Input
            id="attachment"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept="image/*,.pdf,.doc,.docx"
          />
        </div>

        <Button type="submit" className="w-full text-gray-200" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </form>
      </CardContent>
    </Card>
  );
}