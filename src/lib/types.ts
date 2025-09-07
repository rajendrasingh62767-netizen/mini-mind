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
  timestamp: string;
  likes: number;
  comments: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  messages: Message[];
}
