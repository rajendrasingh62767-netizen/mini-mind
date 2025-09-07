"use client";

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Check } from 'lucide-react';
import Link from 'next/link';
import { notifications, getCurrentUser } from '@/lib/data';

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
      const Cuser = getCurrentUser();
      setCurrentUser(Cuser);
       if (Cuser) {
        // In a real app, you'd check a connections list from an API
        // For this demo, we'll check if a "connection" notification exists
        const connectionExists = notifications.some(
            n => n.type === 'connection' &&
            ((n.fromUserId === Cuser.id && n.toUserId === user.id) || 
             (n.fromUserId === user.id && n.toUserId === Cuser.id))
        );
        setIsConnected(connectionExists);
    }
  }, [user.id])


  const handleConnect = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when clicking the button
    if (isConnected || !currentUser) return;

    setIsConnected(true);
    notifications.unshift({
      id: `notif-${Date.now()}`,
      type: 'connection',
      fromUserId: currentUser.id,
      toUserId: user.id,
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center text-center p-4">
        <Link href={`/profile/${user.id}`}>
          <Avatar className="w-20 h-20 mb-2">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <CardTitle className="text-lg">
          <Link href={`/profile/${user.id}`} className="hover:underline">
            {user.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground px-4 pb-4 flex-grow">
        <p className="line-clamp-3">{user.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
            className="w-full" 
            onClick={handleConnect}
            disabled={isConnected}
        >
          {isConnected ? <Check className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
          {isConnected ? 'Connected' : 'Connect'}
        </Button>
      </CardFooter>
    </Card>
  );
}
