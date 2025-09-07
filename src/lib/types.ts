export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  description: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  timestamp: any; // Allow for Firestore ServerTimestamp
  likes: number;
  comments: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  timestamp: any; // Allow for Firestore ServerTimestamp
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any; // Allow for Firestore ServerTimestamp
}

export interface Conversation {
  id: string;
  participantIds: string[];
  messages: Message[];
  lastMessage?: Message;
}

export interface Notification {
    id: string;
    type: 'like' | 'follow';
    fromUserId: string;
    toUserId: string;
    postId?: string; // only for 'like' type
    timestamp: any; // Allow for Firestore ServerTimestamp
    read: boolean;
}
