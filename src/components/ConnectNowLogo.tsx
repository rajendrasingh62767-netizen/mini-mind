import { Wind } from 'lucide-react';
import Link from 'next/link';

export const ConnectNowLogo = () => (
  <Link href="/feed" className="flex items-center gap-2">
    <div className="bg-primary p-2 rounded-lg">
      <Wind className="h-6 w-6 text-primary-foreground" />
    </div>
    <h1 className="text-xl font-bold text-foreground sm:text-2xl font-headline">ConnectNow</h1>
  </Link>
);
