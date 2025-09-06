import { currentUser } from '@/lib/data';
import { redirect } from 'next/navigation';

export default function ProfileRedirectPage() {
  redirect(`/profile/${currentUser.id}`);
}
