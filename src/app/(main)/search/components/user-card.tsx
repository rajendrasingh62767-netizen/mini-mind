"use client";

import { useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, Check, UserX } from 'lucide-react';
import Link from 'next/link';
import { notifications, followUser, unfollowUser } from '@/lib/data';
import { getLoggedInUser } from '@/lib/auth';

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hoveringFollow, setHoveringFollow] = useState(false);

  useEffect(() => {
      const Cuser = getLoggedInUser();
      setCurrentUser(Cuser);
  }, []);
  
  useEffect(() => {
    if (currentUser) {
      const followExists = notifications.some(
          n => n.type === 'follow' &&
          n.fromUserId === currentUser.id && n.toUserId === user.id
      );
      setIsFollowing(followExists);
    }
  }, [currentUser, user.id, notifications])


  const handleFollowToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (!currentUser) return;
    
    if(isFollowing) {
        unfollowUser(currentUser.id, user.id);
        setIsFollowing(false);
    } else {
        followUser(currentUser.id, user.id);
        setIsFollowing(true);
    }
  }

  return (
    <Card className="flex flex-col">
       <Link href={`/profile/${user.id}`} className="flex flex-col flex-grow">
          <CardHeader className="items-center text-center p-4">
              <Avatar className="w-20 h-20 mb-2">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            <CardTitle className="text-lg hover:underline">
                {user.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground px-4 pb-4 flex-grow">
            <p className="line-clamp-3">{user.description}</p>
          </CardContent>
      </Link>
      <CardFooter className="p-4 pt-0">
        {isFollowing ? (
          <Button 
            variant={hoveringFollow ? "destructive" : "outline"}
            className="w-full"
            onMouseEnter={() => setHoveringFollow(true)}
            onMouseLeave={() => setHoveringFollow(false)}
            onClick={handleFollowToggle}
          >
            {hoveringFollow ? <UserX className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
            {hoveringFollow ? "Unfollow" : "Following"}
          </Button>
        ) : (
          <Button 
              className="w-full" 
              onClick={handleFollowToggle}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Follow
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
