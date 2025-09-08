import { User, Post, Conversation, Notification, Song } from '@/lib/types';
import { getLoggedInUser } from './auth';
import { db } from './firebase';
import { addDoc, collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';


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
  {
    id: 'user-5',
    name: 'Rajneesh Singh Patel',
    username: 'rajneesh',
    email: 'rajneeshsinghpatel444@gmail.com',
    avatarUrl: 'https://picsum.photos/seed/rajneesh/100/100',
    description: 'A new user of Mini Mind.',
  },
  {
    id: 'user-6',
    name: 'Rajendra Singh',
    username: 'rajendras',
    email: 'Rajendrasingh62767@gmail.com',
    avatarUrl: 'https://picsum.photos/seed/rajendra/100/100',
    description: 'A new user of Mini Mind.',
  },
];

export const songs: { hindi: Song[], bhojpuri: Song[] } = {
  hindi: [
    { title: "Kesariya", artist: "Arijit Singh" },
    { title: "Chaleya", artist: "Arijit Singh, Shilpa Rao" },
    { title: "Apna Bana Le", artist: "Arijit Singh" },
    { title: "Heeriye", artist: "Arijit Singh, Jasleen Royal" },
    { title: "Tum Hi Ho", artist: "Arijit Singh" },
  ],
  bhojpuri: [
    { title: "Raja Ji Ke Dilwa", artist: "Pawan Singh" },
    { title: "Le Le Aayi Coca Cola", artist: "Khesari Lal Yadav" },
    { title: "Lollipop Lagelu", artist: "Pawan Singh" },
    { title: "Theek Hai", artist: "Khesari Lal Yadav" },
    { title: "Dhani Ho Sab Dhan", artist: "Pawan Singh" },
  ],
};


// This is now legacy data, kept for user info and initial seeding if necessary.
// App will now use Firestore for posts.
export let posts: Post[] = [];

export let conversations: Conversation[] = [];

// Notifications are also now stored in Firestore
export let notifications: Notification[] = [];


export async function followUser(fromUserId: string, toUserId: string) {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, 
        where("type", "==", "follow"),
        where("fromUserId", "==", fromUserId),
        where("toUserId", "==", toUserId)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        await addDoc(notificationsRef, {
            type: 'follow',
            fromUserId: fromUserId,
            toUserId: toUserId,
            timestamp: new Date(),
            read: false,
        });
    }
}

export async function unfollowUser(fromUserId: string, toUserId: string) {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, 
        where("type", "==", "follow"),
        where("fromUserId", "==", fromUserId),
        where("toUserId", "==", toUserId)
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
    });
}


// This is now the definitive way to get the current user.
// It will default to the first user if not logged in, ONLY in a non-browser environment.
// In the browser, it relies on localStorage.
export function getCurrentUser(): User {
  if (typeof window !== 'undefined') {
    const loggedInUser = getLoggedInUser();
    if (loggedInUser) {
        const fullUser = users.find(u => u.id === loggedInUser.id);
        if(fullUser) return fullUser;
    }
    // If in browser and not logged in, we ideally redirect.
    // For components that need a user before redirect, we might return a default.
    // Or, more safely, those components should handle a null user.
  }
  // Default for server-side rendering or if something goes wrong.
  return users[0]; 
};

export async function getFollowers(userId: string): Promise<User[]> {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("type", "==", "follow"), where("toUserId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const followerIds = querySnapshot.docs.map(doc => doc.data().fromUserId);
    return users.filter(u => followerIds.includes(u.id));
}

export async function getFollowing(userId: string): Promise<User[]> {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("type", "==", "follow"), where("fromUserId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const followingIds = querySnapshot.docs.map(doc => doc.data().toUserId);
    return users.filter(u => followingIds.includes(u.id));
}
