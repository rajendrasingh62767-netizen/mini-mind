"use client";

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Check } from 'lucide-react';
import Link from 'next/link';
import { notifications } from '@/lib/data';
import { getLoggedInUser } from '@/lib/auth';

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
      const Cuser = getLoggedInUser();
      setCurrentUser(Cuser);
       if (Cuser) {
        const followExists = notifications.some(
            n => n.type === 'follow' &&
            n.fromUserId === Cuser.id && n.toUserId === user.id
        );
        setIsFollowing(followExists);
    }
  }, [user.id])


  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation when clicking the button
    if (isFollowing || !currentUser) return;

    setIsFollowing(true);
    notifications.unshift({
      id: `notif-${Date.now()}`,
      type: 'follow',
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
            onClick={handleFollow}
            disabled={isFollowing}
        >
          {isFollowing ? <Check className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </CardFooter>
    </Card>
  );
}
