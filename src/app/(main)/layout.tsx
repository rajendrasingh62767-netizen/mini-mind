
"use client"

import * as React from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Home, MessageCircle, User, Sparkles, LogOut, Settings, Search, Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ConnectNowLogo } from "@/components/ConnectNowLogo"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { clearUserFromLocalStorage, getLoggedInUser } from "@/lib/auth"
import type { User as UserType } from "@/lib/types"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<UserType | null>(null);

  React.useEffect(() => {
    const user = getLoggedInUser();
    if (!user) {
      router.push('/login');
    } else {
      setCurrentUser(user);
    }
  }, [router]);

  const handleLogout = () => {
    clearUserFromLocalStorage();
    router.push('/login');
  }

  if (!currentUser) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    )
  }

  return (
    <SidebarProvider>
      <AlertDialog>
        <div className="flex min-h-screen">
          <Sidebar className="border-r">
            <SidebarHeader>
              <ConnectNowLogo />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/feed" isActive>
                    <Home />
                    Feed
                  </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <SidebarMenuButton href="/notifications">
                    <Bell />
                    Notifications
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/messages">
                    <MessageCircle />
                    Messages
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/search">
                    <Search />
                    Search
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/analyzer">
                    <Sparkles />
                    Profile Analyzer
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="flex-col items-start gap-4">
               <div className="w-full border-t border-border pt-4 flex flex-col gap-2">
                   <SidebarMenu>
                      <SidebarMenuItem>
                          <SidebarMenuButton href="#">
                              <Settings />
                              Settings
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <AlertDialogTrigger asChild>
                           <SidebarMenuButton>
                                <LogOut />
                                Logout
                           </SidebarMenuButton>
                        </AlertDialogTrigger>
                      </SidebarMenuItem>
                  </SidebarMenu>
               </div>
              <Link href={`/profile/${currentUser.id}`} className="flex items-center gap-3 w-full">
                <Avatar>
                  <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-sm truncate">{currentUser.name}</span>
                  <span className="text-muted-foreground text-xs truncate">{currentUser.email}</span>
                </div>
              </Link>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
              <header className="mb-4">
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <SidebarTrigger className="md:hidden"/>
                        <ConnectNowLogo />
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href="/search">
                            <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Search"
                            >
                            <Search className="h-6 w-6" />
                            </Button>
                        </Link>
                        <Link href="/notifications">
                            <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Notifications"
                            >
                            <Bell className="h-6 w-6" />
                            </Button>
                        </Link>
                        <Link href="/messages">
                            <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Messages"
                            >
                            <MessageCircle className="h-6 w-6" />
                            </Button>
                        </Link>
                         <Link href={`/profile/${currentUser.id}`}>
                            <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Profile"
                            >
                            <User className="h-6 w-6" />
                            </Button>
                        </Link>
                      </div>
                  </div>
              </header>
              <main>{children}</main>
          </SidebarInset>
        </div>
        <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be returned to the login page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                Log Out
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
