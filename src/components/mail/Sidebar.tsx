'use client';

import * as React from 'react';
import {
  ArchiveX,
  Clock5,
  File,
  Inbox,
  Milestone,
  AlertOctagon,
  SendHorizontal,
  Star,
  Trash2,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MailContext } from '@/contexts/MailContext';
import { NavUser } from './NavUser';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Contact } from '@/types';
import LogoSwitcher from '../LogoSwitcher';

interface Settings {
  logo: string | null;
  logo_blk: string | null;
}


const data = {
  navMain: [
    { title: 'Inbox', url: '/mail', icon: Inbox, isActive: true },
    { title: 'Sent', url: '#', icon: SendHorizontal, isActive: false },
    { title: 'Starred', url: '#', icon: Star, isActive: false },
    { title: 'Snoozed', url: '#', icon: Clock5, isActive: false },
    { title: 'Important', url: '#', icon: Milestone, isActive: false },
    { title: 'Drafts', url: '#', icon: File, isActive: false },
    { title: 'Spam', url: '#', icon: AlertOctagon, isActive: false },
    { title: 'Junk', url: '#', icon: ArchiveX, isActive: false },
    { title: 'Trash', url: '#', icon: Trash2, isActive: false },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState(data.navMain[0]);
  const { setOpen } = useSidebar();
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const { setSelectedMail, activeFilter, setActiveFilter } = React.useContext(MailContext);
  const [settings, setSettings] = React.useState<Settings | null>(null);
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const { user, role } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Fetch settings
  React.useEffect(() => {
    const fetchSettings = async () => {
      const res = await fetch('/api/settings');
      if (res.ok) setSettings(await res.json());
    };
    fetchSettings();
  }, []);

  // Fetch contacts
  React.useEffect(() => {
    const fetchContact = async () => {
      const params = new URLSearchParams();

      if (role === 'driver' || role === 'coordinator') {
        if (activeFilter === 'Sent') {
          params.set('sender_email', user?.email || '');
        } else {
          params.set('receiver_email', user?.email || '');
        }
      } else if (role === 'admin') {
        if (activeFilter === 'Sent') {
          params.set('sender_email', user?.email || '');
        } else {
          params.set('exclude_sender_email', user?.email || '');
        }
      }

      if (activeFilter === 'Starred') params.set('is_starred', 'true');
      else if (activeFilter === 'Important' && role !== 'admin') params.set('is_read', 'false');

      const res = await fetch(`/api/contacts?${params.toString()}`);
      let mapped: Contact[] = [];
      if (res.ok) {
        const data = await res.json();
        mapped = (data as Contact[]).map((c) => {
          // Normalize created_at to ensure it's a string
          let created_at: string = '';
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dateValue: any = c.created_at;
          if (typeof dateValue === 'string') {
            created_at = dateValue;
          } else if (dateValue instanceof Date) {
            created_at = dateValue.toISOString();
          } else if (dateValue && typeof dateValue === 'object') {
            if ('toISOString' in dateValue && typeof dateValue.toISOString === 'function') {
              created_at = dateValue.toISOString();
            } else if ('getTime' in dateValue && typeof dateValue.getTime === 'function') {
              created_at = new Date(dateValue.getTime()).toISOString();
            } else {
              try {
                const serialized = JSON.stringify(dateValue);
                const parsed = JSON.parse(serialized);
                created_at = typeof parsed === 'string' && parsed.length > 0 ? parsed : new Date().toISOString();
              } catch {
                created_at = new Date().toISOString();
              }
            }
          } else if (dateValue) {
            const str = String(dateValue);
            created_at = str === '[object Object]' ? new Date().toISOString() : str;
          } else {
            created_at = new Date().toISOString();
          }
          
          return { 
            ...c, 
            source: 'contact',
            subject: c.subject_rel ? { subject: c.subject_rel.subject } : null,
            created_at
          };
        });
      }

      let normalizedContacts: Contact[] = [];
      if (role === 'admin' && activeFilter === 'Important') {
        const contactUsRes = await fetch('/api/contact');
        if (contactUsRes.ok) {
          const contactUs = await contactUsRes.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          normalizedContacts = contactUs.map((c: any) => {
            // Normalize created_at to ensure it's a string
            let created_at: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dateValue: any = c.created_at;
            if (typeof dateValue === 'string') {
              created_at = dateValue;
            } else if (dateValue instanceof Date) {
              created_at = dateValue.toISOString();
            } else if (dateValue && typeof dateValue === 'object') {
              if ('toISOString' in dateValue && typeof dateValue.toISOString === 'function') {
                created_at = dateValue.toISOString();
              } else if ('getTime' in dateValue && typeof dateValue.getTime === 'function') {
                created_at = new Date(dateValue.getTime()).toISOString();
              } else {
                try {
                  const serialized = JSON.stringify(dateValue);
                  const parsed = JSON.parse(serialized);
                  created_at = typeof parsed === 'string' && parsed.length > 0 ? parsed : new Date().toISOString();
                } catch {
                  created_at = new Date().toISOString();
                }
              }
            } else if (dateValue) {
              const str = String(dateValue);
              created_at = str === '[object Object]' ? new Date().toISOString() : str;
            } else {
              created_at = new Date().toISOString();
            }
            
            return {
              id: -Number(c.id), // Use negative IDs to ensure uniqueness from regular contacts
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
            coordinator: null,
            subject: { subject: c.subject || 'Contact Us' },
            source: 'contact_us',
          };
          });
        }
      }

      setContacts([...mapped, ...normalizedContacts]);
    };

    fetchContact();
  }, [activeFilter, role, user]);

  const handleSelectMail = async (mail: Contact) => {
    setOpen(true);
    // Normalize receiver to a string to satisfy the shared Contact type (which expects receiver: string)
    const normalizedMail = { ...mail, receiver: mail.receiver ?? '' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setSelectedMail(normalizedMail as any);

    if (!mail.is_read && mail.source === 'contact') {
      await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: mail.id, is_read: true }),
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === mail.id ? { ...c, is_read: true } : c))
      );
    }
  };

  const toggleStar = async (contact: Contact) => {
    if (contact.source !== 'contact') return;
    const newStarred = !contact.is_starred;
    await fetch('/api/contacts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: contact.id, is_starred: newStarred }),
    });
    setContacts((prev) =>
      prev.map((c) => (c.id === contact.id ? { ...c, is_starred: newStarred } : c))
    );
  };

  const toggleUnreadFilter = async () => {
    const allRead = contacts.every((c) => c.is_read);
    const newStatus = !allRead;
    const contactIds = contacts.filter((c) => c.source === 'contact').map((c) => c.id);

    if (contactIds.length > 0) {
      await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: contactIds, is_read: newStatus }),
      });
    }

    setContacts((prev) =>
      prev.map((c) => (c.source === 'contact' ? { ...c, is_read: newStatus } : c))
    );
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (diff < 60) return 'Just now';
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days === 1) return 'A day ago';
    return `${days} days ago`;
  };

  const formatSubmittedAt = (timestamp: string): string => {
    const date = new Date(timestamp);
    return `${formatTime(date)} ${getRelativeTime(date)}`;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredContacts = contacts.filter((contact) => {
    const q = searchQuery.toLowerCase();
    return (
      contact.sender?.toLowerCase().includes(q) ||
      contact.receiver?.toLowerCase().includes(q) ||
      (contact.subject?.subject && contact.subject.subject.toLowerCase().includes(q)) ||
      String(contact.message).toLowerCase().includes(q)
    );
  });

  const getHomeLink = () => {
    if (role === 'admin') return '/admin';
    if (role === 'coordinator') return '/user';
    if (role === 'driver') return '/profile';
    return '/';
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const settingsContent: Settings = settings || {};

  return (
    <Sidebar collapsible="icon" className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row" {...props}>
      {/* Icon Sidebar */}
      <Sidebar
       collapsible="none" 
       className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r sm:ring-1 sm:ring-gray-900/10 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/90"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href={getHomeLink()}>
                  <div className="flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground">
                  {(settingsContent.logo || settingsContent.logo_blk) && (
                    <>
                      <LogoSwitcher
                        logo={settingsContent.logo}
                        logo_blk={settingsContent.logo_blk}
                        width={85}
                        height={20}
                        alt="Annhurst Logo"
                        className="w-auto"
                      />
                    </>
                  )}
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={() => {
                        setActiveItem(item);
                        setActiveFilter(item.title);
                        setOpen(true);
                      }}
                      isActive={activeItem?.title === item.title}
                      className={`px-2.5 transition-colors ${
                        activeItem?.title === item.title
                          ? 'bg-red-50 text-primary border border-primary'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-primary hover:text-white transition-colors'
                      }`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Sidebar */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex flex-col sm:ring-1 sm:ring-gray-900/10 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/90">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">{activeItem?.title}</div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Unreads</span>
              <Switch className="shadow-none" onCheckedChange={toggleUnreadFilter} />
            </Label>
          </div>
          <SidebarInput placeholder="Type to search..." value={searchQuery} onChange={handleSearchChange} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={`${contact.source}-${contact.id}`}
                    onClick={() => handleSelectMail(contact)}
                    className={`flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-red-50 hover:text-primary hover:border-primary ${
                      contact.is_read ? '' : 'unread font-bold'
                    }`}
                  >
                    <div className="flex w-full items-center gap-2">
                      <Avatar>
                        {contact.driver?.avatar ? (
                          <AvatarImage
                            src={`/avatars/${contact.driver.avatar}`}
                            alt={contact.driver.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <AvatarFallback className="rounded-lg">
                            {(activeFilter === 'Sent' ? contact.receiver ?? '' : contact.sender ?? '')
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>
                        {activeFilter === 'Sent' ? contact.receiver || contact.sender : contact.sender}
                      </span>
                      {role === 'admin' && contact.source === 'contact_us' && (
                        <Link href={`/contact-us/${Math.abs(contact.id)}`}>
                          <Badge className="ml-2 bg-yellow-500 text-white">External</Badge>
                        </Link>
                      )}
                      <span className="ml-auto text-xs">{formatSubmittedAt(contact.created_at)}</span>
                    </div>
                    <div className="flex justify-between items-center w-full">
                      <span className="font-medium">{contact.subject?.subject}</span>
                      {contact.source === 'contact' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(contact);
                          }}
                          className="text-lg text-yellow-500 hover:text-yellow-600"
                        >
                          {contact.is_starred ? '★' : '☆'}
                        </button>
                      )}
                    </div>
                    <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
                      {String(contact.message)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-gray-500">No results found.</p>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}