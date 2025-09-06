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
import { Home, MessageCircle, User, Sparkles, LogOut, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { currentUser } from "@/lib/data"
import { ConnectNowLogo } from "@/components/ConnectNowLogo"
import ChatWidget from "@/components/chat/ChatWidget"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ProfileWidget from "@/components/profile/ProfileWidget"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
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
                        <SidebarMenuButton href="/login">
                            <LogOut />
                            Logout
                        </SidebarMenuButton>
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
        <div className="fixed bottom-6 right-24 flex gap-4">
            <ProfileWidget />
        </div>
        <ChatWidget />
      </div>
    </SidebarProvider>
  )
}
