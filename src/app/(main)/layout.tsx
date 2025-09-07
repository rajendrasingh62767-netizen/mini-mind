
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
import { Home, MessageCircle, User, Sparkles, LogOut, Settings, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getCurrentUser } from "@/lib/data"
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

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState(getCurrentUser());

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
              <header className="md:hidden mb-4">
                  <div className="flex justify-between items-center">
                      <ConnectNowLogo />
                      <SidebarTrigger />
                  </div>
              </header>
              <main>{children}</main>
          </SidebarInset>
          <div className="fixed bottom-6 right-6 flex flex-col-reverse sm:flex-row gap-4">
              <Link href={`/profile/${currentUser.id}`}>
                <Button
                  className="w-16 h-16 rounded-full shadow-lg"
                  size="icon"
                  aria-label="Profile"
                >
                  <User className="h-8 w-8" />
                </Button>
              </Link>
              <Link href="/search">
                <Button
                  variant="destructive"
                  className="w-16 h-16 rounded-full shadow-lg"
                  size="icon"
                  aria-label="Search"
                >
                  <Search className="h-8 w-8" />
                </Button>
              </Link>
              <Link href="/messages">
                <Button
                  className="w-16 h-16 rounded-full shadow-lg"
                  size="icon"
                  aria-label="Messages"
                >
                  <MessageCircle className="h-8 w-8" />
                </Button>
              </Link>
          </div>
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
