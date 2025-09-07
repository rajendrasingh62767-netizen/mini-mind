"use client"

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { users, getCurrentUser } from '@/lib/data';
import { User } from '@/lib/types';
import UserCard from './user-card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmittedSearch(searchTerm);
  };
  
  if (!currentUser) {
    return <p>Loading...</p>
  }
  
  const filteredUsers = users.filter(user => {
      if (submittedSearch.trim() === '') return user.id !== currentUser.id;
      const lowercasedSearch = submittedSearch.toLowerCase();
      return user.id !== currentUser.id && (user.name.toLowerCase().includes(lowercasedSearch) || user.id.toLowerCase().includes(lowercasedSearch))
  });

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md">
        <Input
          type="search"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="flex-1"
        />
        <Button type="submit" variant="destructive">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredUsers.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
      
      {filteredUsers.length === 0 && submittedSearch && (
         <div className="text-center text-muted-foreground py-10">
            <p>No users found matching "{submittedSearch}".</p>
        </div>
      )}
    </div>
  );
}
