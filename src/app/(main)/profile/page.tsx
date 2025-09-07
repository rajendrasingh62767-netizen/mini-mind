"use client"
import { getLoggedInUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfileRedirectPage() {
    
  useEffect(() => {
    const user = getLoggedInUser();
    if (user) {
        redirect(`/profile/${user.id}`);
    } else {
        redirect('/login');
    }
  }, []);

  return null;
}
