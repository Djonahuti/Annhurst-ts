'use client'

import * as React from "react"
import {
  Bell,
  AlertOctagon,
  Inbox,
  MoreHorizontal,
  PersonStanding,
  Scale,
  Cog,
  File,
  Pencil,
  Send,
  Trash2,
  LogOut,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { ThemeToggle } from "../ThemeToggle"
import Modal from "@/components/Modal"
import Contact from "./Contact"

type UserData = {
  id: number
  name: string
  email: string
  avatar?: string
}

export function PopRight() {
  const [isPopOpen, setIsPopOpen] = React.useState(false)
  const [unreadCount, setUnreadCount] = React.useState(0);
  const { user, role, signOut } = useAuth();

  const data = [
    [
      {
        label: "Inbox",
        icon: Inbox,
        url: "/my-inbox",
        count: unreadCount,
      },
      {
        label: "Sent",
        icon: Send,
        url: "*",
      },
      {
        label: "Compose",
        icon: Pencil,
        url: "/contact",
      },    
    ],
    [
      {
        label: "Draft",
        icon: File,
        url: "*",
      },
      {
        label: "Spam",
        icon: AlertOctagon,
        url: "*",
      },
      {
        label: "Trash",
        icon: Trash2,
        url: "*",
      },    
    ],
    [
      {
        label: "Settings",
        icon: Cog,
        url: "*",
      },
      {
        label: "Accessibily",
        icon: PersonStanding,
        url: "*",
      },
      {
        label: "Penalties Information",
        icon: Scale,
        url: "*",
      },
      {
        label: "Notifications",
        icon: Bell,
        url: "/my-inbox",
      },   
    ],
  ]  

  React.useEffect(() => {
    setIsPopOpen(true)
  }, []);

  const [isContactModalOpen, setContactModalOpen] = React.useState(false);

  const [profile, setProfile] = React.useState<UserData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        let response;
        if (role === "admin") {
          response = await fetch(`/api/admins?email=${encodeURIComponent(user.email || '')}`);
        } else if (role === "coordinator") {
          response = await fetch(`/api/coordinators?email=${encodeURIComponent(user.email || '')}`);
        } else if (role === "driver") {
          response = await fetch(`/api/drivers?email=${encodeURIComponent(user.email || '')}`);
        }

        if (response && response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error(`Error fetching ${role} data:`, error);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user, role]);

  React.useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/contacts?is_read=false');
        if (response.ok) {
          const contacts = await response.json();
          setUnreadCount(contacts.length);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
  
    fetchCounts();
  }, []);  

    if (loading){
      return(
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>     
      )
    }

  if (!profile) {
    return <div>No {role} data found.</div>
  } 

  const handleLogout = async () => {
    // Use NextAuth signOut instead of Supabase
    await signOut();
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        {profile.email}
      </div>
      <Avatar className="h-8 w-8 rounded-full">
        {profile.avatar ? (
        <AvatarImage
         src={`/uploads/${profile.avatar}`}
         alt={profile.name}
         className="rounded-full" 
         />
        ):(
          <AvatarFallback className="rounded-full">{profile.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
        )}
      </Avatar>
      <Popover open={isPopOpen} onOpenChange={setIsPopOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 data-[state=open]:bg-accent"
          >
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0 bg-gray-50 dark:bg-gray-900/90"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {data.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          {item.label === "Compose" ? (
                            role === 'admin' ? (
                              <SidebarMenuButton
                                onClick={() => setContactModalOpen(true)}
                                className="flex items-center gap-2 hover:bg-red-50 hover:text-primary hover:border-primary w-full p-2 rounded hover:border-b"
                              >
                                <item.icon /> <span>{item.label}</span>
                                {typeof item.count === "number" && item.count > 0 && (
                                  <Badge className="ml-auto text-xs bg-red-500 text-white rounded-full">
                                    {item.count}
                                  </Badge>
                                )}
                              </SidebarMenuButton>
                            ) : null
                          ) : (
                            <SidebarMenuButton
                              asChild
                              className="hover:bg-red-50 hover:text-primary hover:border-primary w-full p-2 rounded hover:border-b"
                            >
                              <a href={item.url} className="flex items-center gap-2">
                                <item.icon /> <span>{item.label}</span>
                                {typeof item.count === "number" && item.count > 0 && (
                                  <Badge className="ml-auto text-xs bg-red-500 text-white rounded-full">
                                    {item.count}
                                  </Badge>
                                )}
                              </a>
                            </SidebarMenuButton>
                          )}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
              <SidebarGroup className="border-b last:border-none">
                <SidebarGroupContent className="gap-0">
                  <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-2 hover:bg-red-50 hover:text-primary hover:border-primary w-full p-2 rounded hover:border-b">
                          <LogOut /> <span>Log Out</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
      <Modal isOpen2={isContactModalOpen} onClose={() => setContactModalOpen(false)}>
        <Contact coordinatorId={null} />
      </Modal>
      <div className="block md:hidden text-sm">
          <ThemeToggle />
      </div>      
    </div>
  )
}
