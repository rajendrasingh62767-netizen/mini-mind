import { User, Post, Conversation } from '@/lib/types';
import { getLoggedInUser } from './auth';

export let users: User[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    username: 'alexj',
    email: 'alex.j@example.com',
    avatarUrl: 'https://picsum.photos/id/1005/100/100',
    description: 'Software Engineer at TechCorp. Passionate about AI and building scalable systems. Opinions are my own.',
  },
  {
    id: 'user-2',
    name: 'Samantha Lee',
    username: 'samlee',
    email: 'sam.lee@example.com',
    avatarUrl: 'https://picsum.photos/id/1011/100/100',
    description: 'Product Manager at Innovate Ltd. Focused on user-centric design and agile development. Let\'s connect!',
  },
  {
    id: 'user-3',
    name: 'Michael Chen',
    username: 'mikechen',
    email: 'michael.c@example.com',
    avatarUrl: 'https://picsum.photos/id/1025/100/100',
    description: 'UX/UI Designer creating intuitive digital experiences. Currently exploring the intersection of art and technology.',
  },
    {
    id: 'user-4',
    name: 'Emily Carter',
    username: 'emilyc',
    email: 'emily.c@example.com',
    avatarUrl: 'https://picsum.photos/id/1027/100/100',
    description: 'Marketing Director at Growth Co. Helping brands tell their stories and connect with their audience.',
  },
];

export const posts: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-2',
    content: 'Excited to share that our new feature has officially launched! A big thank you to the entire team for their hard work and dedication. #productlaunch #tech #innovation',
    timestamp: '2024-05-20T10:00:00Z',
    likes: 124,
    comments: 18,
  },
  {
    id: 'post-2',
    authorId: 'user-1',
    content: 'Just published a new article on "The Future of Generative AI in Software Development". Would love to hear your thoughts! Link in comments. #AI #MachineLearning #FutureOfTech',
    timestamp: '2024-05-19T15:30:00Z',
    likes: 256,
    comments: 42,
  },
  {
    id: 'post-3',
    authorId: 'user-3',
    content: 'The key to great design is empathy. Understanding the user\'s needs and pain points is the first step towards creating something truly valuable. #UX #DesignThinking #UserExperience',
    timestamp: '2024-05-18T09:15:00Z',
    likes: 301,
    comments: 35,
  },
  {
    id: 'post-4',
    authorId: 'user-4',
    content: 'Our latest marketing campaign just went live! We focused on authentic storytelling to build a stronger connection with our community. #Marketing #Branding #Storytelling',
    timestamp: '2024-05-20T11:45:00Z',
    likes: 98,
    comments: 12,
  },
];

export const conversations: Conversation[] = [
    {
    id: 'conv-1',
    participantIds: ['user-1', 'user-2'],
    messages: [
      { id: 'msg-1', senderId: 'user-2', text: 'Hey Alex, great article on AI! I have a few ideas on how we could integrate some of those concepts into our product.', timestamp: '2024-05-19T16:00:00Z' },
      { id: 'msg-2', senderId: 'user-1', text: 'Thanks, Samantha! I\'d love to hear them. Are you free to chat tomorrow morning?', timestamp: '2024-05-19T16:05:00Z' },
       { id: 'msg-3', senderId: 'user-2', text: 'Absolutely. How about 10 AM?', timestamp: '2024-05-19T16:06:00Z' },
    ],
  },
  {
    id: 'conv-2',
    participantIds: ['user-1', 'user-3'],
    messages: [
      { id: 'msg-4', senderId: 'user-3', text: 'Michael here. I was really impressed by your presentation last week. Your insights into backend architecture were fascinating.', timestamp: '2024-05-18T11:00:00Z' },
      { id: 'msg-5', senderId: 'user-1', text: 'Thanks, Michael! Glad you found it useful. Your design work is top-notch, by the way.', timestamp: '2024-05-18T11:10:00Z' },
    ],
  },
    {
    id: 'conv-3',
    participantIds: ['user-1', 'user-4'],
    messages: [
      { id: 'msg-6', senderId: 'user-4', text: 'Hi Alex, saw your profile and thought we could connect. I\'m always looking to network with tech leaders.', timestamp: '2024-05-20T14:00:00Z' },
    ],
  },
];

// This is now a function that can dynamically get the user
// It will default to the first user if not logged in, which is useful for development
// but in a real app, you'd enforce a login.
export function getCurrentUser(): User {
  if (typeof window !== 'undefined') {
    const loggedInUser = getLoggedInUser();
    if (loggedInUser) {
        // Ensure the user from local storage exists in our "database"
        const fullUser = users.find(u => u.id === loggedInUser.id);
        if(fullUser) return fullUser;
    }
  }
  return users[0];
};
