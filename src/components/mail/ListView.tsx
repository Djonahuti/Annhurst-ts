'use client'
import { useState, useEffect, useContext } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// Removed Supabase; use internal API endpoints
import { useAuth } from "@/contexts/AuthContext"
import { MailContext } from "@/contexts/MailContext"
import type { Contact } from "@/types"
// Ensure Contact.message allows string type

/**
 * ListView: a full-screen list of inbox messages for mobile.
 * Fetches contacts from Supabase and calls setSelectedMail on tap.
 */
export default function ListView() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const { setSelectedMail, activeFilter } = useContext(MailContext)
  const { user, role } = useAuth()  

  const handleSelectMail = async (mail: Contact) => {
    setSelectedMail(mail); // This now pushes it to Inbox.tsx

    if (mail.source !== "contact_us") {
      await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mail.id, is_read: true })
      })
    }
  };

  // Fetch messages
  useEffect(() => {
    const fetchContacts = async () => {
      const params = new URLSearchParams();

      // Role-based visibility rules
      if (role === 'driver' || role === 'coordinator') {
        if (activeFilter === 'Sent') {
          params.set('sender_email', user?.email || '')
        } else {
          params.set('receiver_email', user?.email || '')
        }
      } else if (role === 'admin') {
        if (activeFilter === 'Sent') {
          params.set('sender_email', user?.email || '')
        } else {
          params.set('exclude_sender_email', user?.email || '')
        }
      }

      // Additional UI filters
      if (activeFilter === 'Starred') params.set('is_starred', 'true');
      else if (activeFilter === 'Important' && role !== 'admin') params.set('is_read', 'false');

      // fetch normal contacts after all filters
      const res = await fetch(`/api/contacts?${params.toString()}`)
      let mapped: Contact[] = []
      if (res.ok) {
        const data = await res.json()
        mapped = (data as Contact[]).map((c) => {
          let created_at: string = '';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dateValue: any = c.created_at;
          if (typeof dateValue === 'string') {
            created_at = dateValue;
          } else if (dateValue instanceof Date) {
            created_at = dateValue.toISOString();
          } else if (dateValue && typeof dateValue === 'object') {
            // Handle Date-like objects or objects that should be dates
            if ('toISOString' in dateValue && typeof dateValue.toISOString === 'function') {
              created_at = dateValue.toISOString();
            } else if ('getTime' in dateValue && typeof dateValue.getTime === 'function') {
              created_at = new Date(dateValue.getTime()).toISOString();
            } else {
              // Try to extract date info from object properties
              console.warn('Date object detected in contact, attempting conversion:', dateValue);
              // Try JSON serialization to see if it reveals a date string
              try {
                const serialized = JSON.stringify(dateValue);
                const parsed = JSON.parse(serialized);
                if (typeof parsed === 'string' && parsed.length > 0) {
                  created_at = parsed;
                } else {
                  created_at = new Date().toISOString(); // fallback
                }
              } catch {
                created_at = new Date().toISOString(); // fallback
              }
            }
          } else if (dateValue) {
            // Only call String if it's not an object
            const str = String(dateValue);
            if (str === '[object Object]') {
              console.warn('Date value is object, using fallback:', dateValue);
              created_at = new Date().toISOString();
            } else {
              created_at = str;
            }
          } else {
            created_at = new Date().toISOString();
          }
          
          return { 
            ...c, 
            source: 'contact',
            subject: c.subject_rel ? { subject: c.subject_rel.subject } : null,
            created_at
          };
        })
      }

      // Admin: augment Important with external contact_us
      let normalizedContacts: Contact[] = []
      if (role === 'admin' && activeFilter === 'Important') {
        const res2 = await fetch('/api/contact')
        if (res2.ok) {
          const contactUs = await res2.json()
          type ContactUs = {
            id: number;
            name?: string;
            email?: string;
            subject?: string;
            message: string;
            created_at: string;
          };
          normalizedContacts = (contactUs as ContactUs[]).map((c) => {
            let created_at: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dateValue: any = c.created_at;
            if (typeof dateValue === 'string') {
              created_at = dateValue;
            } else if (dateValue instanceof Date) {
              created_at = dateValue.toISOString();
            } else if (dateValue && typeof dateValue === 'object') {
              // Handle Date-like objects or objects that should be dates
              if ('toISOString' in dateValue && typeof dateValue.toISOString === 'function') {
                created_at = dateValue.toISOString();
              } else if ('getTime' in dateValue && typeof dateValue.getTime === 'function') {
                created_at = new Date(dateValue.getTime()).toISOString();
              } else {
                // Try to extract date info from object properties
                console.warn('Date object detected in contact_us, attempting conversion:', dateValue);
                try {
                  const serialized = JSON.stringify(dateValue);
                  const parsed = JSON.parse(serialized);
                  if (typeof parsed === 'string' && parsed.length > 0) {
                    created_at = parsed;
                  } else {
                    created_at = new Date().toISOString(); // fallback
                  }
                } catch {
                  created_at = new Date().toISOString(); // fallback
                }
              }
            } else if (dateValue) {
              // Only call String if it's not an object
              const str = String(dateValue);
              if (str === '[object Object]') {
                console.warn('Date value is object in contact_us, using fallback:', dateValue);
                created_at = new Date().toISOString();
              } else {
                created_at = str;
              }
            } else {
              created_at = new Date().toISOString();
            }
            
            return {
              id: c.id,
              coordinator_id: 0,
              driver_id: 0,
              subject_id: 0,
              message: c.message,
              created_at,
              transaction_date: null,
            is_starred: false,
            is_read: false,
            attachment: null,
            sender: c.name || 'Unknown',
            receiver: 'Admin',
            sender_email: c.email || '',
            receiver_email: '',
            driver: null,
            subject: { subject: c.subject || 'Contact Us' },
            coordinator: null,
            source: 'contact_us',
          };
          })
        }
      }

      setContacts([...mapped, ...normalizedContacts])
    }

    fetchContacts()
  }, [activeFilter, role, user])

  /* --------------------------------------------------------------
     Date formatting – **ISO string only**
     -------------------------------------------------------------- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatSubmittedAt = (iso: string | null | undefined | any): string => {
    // Handle null, undefined, or empty values
    if (!iso) return 'Unknown';
    
    let dateStr: string;
    
    // If it's already a Date object, convert to ISO string
    if (iso instanceof Date) {
      if (isNaN(iso.getTime())) return 'Invalid';
      dateStr = iso.toISOString();
    } else if (typeof iso === 'object' && iso !== null) {
      // Try to extract date from object - could be a Date-like object or serialized date
      if ('toISOString' in iso && typeof iso.toISOString === 'function') {
        try {
          dateStr = iso.toISOString();
        } catch (e) {
          console.error('Failed to convert Date object:', iso);
          return 'Invalid';
        }
      } else if ('$date' in iso || '__type' in iso) {
        // Handle special date formats (e.g., MongoDB date format)
        dateStr = iso.$date || iso.value || String(iso);
      } else {
        // Try to construct date from common date properties
        const dateValue = iso.toString?.() || JSON.stringify(iso);
        // Check if it's the "[object Object]" string - try to parse original
        if (dateValue === '[object Object]') {
          console.error('Date is an object without date methods:', iso);
          // Try to extract timestamp if available
          if ('getTime' in iso && typeof iso.getTime === 'function') {
            dateStr = new Date(iso.getTime()).toISOString();
          } else {
            return 'Invalid';
          }
        } else {
          dateStr = dateValue;
        }
      }
    } else if (typeof iso !== 'string') {
      // If it's not a string, try to convert it
      const str = String(iso);
      // Avoid "[object Object]" by checking the string
      if (str === '[object Object]') {
        console.error('Cannot convert date object:', iso);
        return 'Invalid';
      }
      dateStr = str;
    } else {
      dateStr = iso;
    }

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      console.error('Bad ISO string:', dateStr, 'Original type:', typeof iso, 'Original value:', iso);
      return 'Invalid';
    }

    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    const mins = Math.floor(diffSec / 60);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);

    let rel = '';
    if (diffSec < 60) rel = 'Just now';
    else if (mins < 60) rel = `${mins} min${mins > 1 ? 's' : ''} ago`;
    else if (hrs < 24) rel = `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
    else if (days === 1) rel = 'Yesterday';
    else rel = `${days} days ago`;

    return `${time} · ${rel}`;
  };

  const toggleStar = async (contact: Contact) => {
    const newStarredStatus = !contact.is_starred;
    await fetch('/api/contacts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contact.id, is_starred: newStarredStatus })
    })
    
    // Update local state
    setContacts((prevContacts) =>
      prevContacts.map((c) =>
        c.id === contact.id ? { ...c, is_starred: newStarredStatus } : c
      )
    );
  };  

  return (
    <div className="flex-1 overflow-y-auto">
      {contacts.map((contact) => (
        <div
          key={`${contact.source}-${contact.id}`}
          onClick={() => setSelectedMail(contact)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setSelectedMail(contact);
          }}
          className={`w-full text-left flex flex-col gap-2 border-b p-4 hover:bg-red-50 hover:text-primary hover:border-primary ${
            contact.is_read ? 'myBox' : 'unread'
          }`}
        >
          <div className="flex items-center gap-2">
            <Avatar>
            {contact.driver?.avatar ? (
              <AvatarImage
                src={`https://uffkwmtehzuoivkqtefg.supabase.co/storage/v1/object/public/receipts/${contact.driver?.avatar}`}
                alt={contact.driver?.name}
                className="w-6 h-6 rounded-full object-cover"
              />                     
            ):(
              <AvatarFallback className="rounded-lg">{(activeFilter === 'Sent' ? (contact.receiver || '') : (contact.sender || '')).substring(0, 2).toUpperCase()}</AvatarFallback>
            )}
            </Avatar>
            <span className="font-medium">{activeFilter === 'Sent' ? (contact.receiver || contact.sender) : contact.sender}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {formatSubmittedAt(contact.created_at)}
            </span>
          </div>
          <div className="flex justify-between space-x-8 items-center relative gap-1">
          <span className="text-sm font-semibold">{contact.subject?.subject}</span>
          <a
            href="#"
            key={contact.id}
            onClick={() => handleSelectMail(contact)}
            className="text-lg left-2 text-yellow-500 hover:text-yellow-600"
          >
              <button onClick={() => toggleStar(contact)}>
                {contact.is_starred ? '★' : '☆'} {/* Star icon */}
              </button>
          </a>                      
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {String(contact.message)}
          </p>
        </div>
      ))}
    </div>
  )
}
