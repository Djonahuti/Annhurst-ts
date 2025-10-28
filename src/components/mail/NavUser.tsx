"use client"

import {
  UserCircleIcon,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOutIcon,
  BadgeCheck,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import Link from "next/link";
// Removed Supabase usage
import { useAuth } from "@/contexts/AuthContext"

type UserData = {
  id: number
  name: string
  email: string
  avatar?: string
}

export function NavUser() {
  const [profile, setProfile] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useSidebar();
  const { user, role } = useAuth();  // ✅ new

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      let tableName = ""
      if (role === "admin") tableName = "admins"
      else if (role === "coordinator") tableName = "coordinators"
      else if (role === "driver") tableName = "driver"

      if (!tableName) return

      const res = await fetch(`/api/${tableName}?email=${encodeURIComponent(user.email)}`)
      if (res.ok) {
        const list = await res.json()
        const row = Array.isArray(list) ? list[0] : list
        setProfile(row)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user, role])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return <div>No {role} data found.</div>
  }

  const handleLogout = async () => {
    // Use AuthContext's signOut (NextAuth)
    window.location.href = "/api/auth/signout?callbackUrl=/login"
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-full">
                {profile.avatar ? (
                <AvatarImage
                 src={profile.avatar.startsWith('http') ? profile.avatar : `/receipts/${profile.avatar}`}
                 alt={profile.name} />
                ):(
                  <AvatarFallback className="rounded-full">{profile.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{profile.name}</span>
                <span className="truncate text-xs">{profile.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-full grayscale">
                {profile.avatar ? (
                <AvatarImage
                 src={profile.avatar.startsWith('http') ? profile.avatar : `/receipts/${profile.avatar}`} 
                 alt={profile.name} />
                ):(
                  <AvatarFallback className="rounded-full">{profile.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{profile.name}</span>
                  <span className="truncate text-xs">{profile.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                {role}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
            <DropdownMenuItem>
                <Link href="/account" className="flex justify-between gap-2">
                <UserCircleIcon />Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
            <button onClick={handleLogout} className="flex space-x-0 w-full text-left cursor-pointer">
              <LogOutIcon />
              Log out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
