"use client"

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { users, currentUser } from '@/lib/data';
import { User } from '@/lib/types';
import UserCard from './user-card';

export default function SearchUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users.filter(u => u.id !== currentUser.id));

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term.trim() === '') {
      setFilteredUsers(users.filter(u => u.id !== currentUser.id));
      return;
    }

    const lowercasedTerm = term.toLowerCase();
    const results = users.filter(user =>
      user.id !== currentUser.id && user.name.toLowerCase().includes(lowercasedTerm)
    );
    setFilteredUsers(results);
  };

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search for users..."
        value={searchTerm}
        onChange={handleSearch}
        className="max-w-md"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredUsers.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
      {filteredUsers.length === 0 && (
         <div className="text-center text-muted-foreground py-10">
            <p>No users found matching "{searchTerm}".</p>
        </div>
      )}
    </div>
  );
}
