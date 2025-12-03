
// This is a mock service mimicking Firebase Auth and Firestore
// using localStorage. Replace this logic with actual Firebase SDK calls
// when connecting to your real project.

export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
}

export interface UserData {
    balance: number;
    xp: number;
    inventory: any[];
}

class MockAuth {
    private currentUser: User | null = null;
    private listeners: ((user: User | null) => void)[] = [];

    constructor() {
        const storedUser = localStorage.getItem('mock_fb_user');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
        }
    }

    onAuthStateChanged(callback: (user: User | null) => void) {
        this.listeners.push(callback);
        callback(this.currentUser); // Immediate call with current state
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    async signInWithEmailAndPassword(email: string): Promise<User> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Simple mock logic: just create a user from the email
        const uid = 'uid_' + email.split('@')[0];
        const user: User = {
            uid,
            email,
            displayName: email.split('@')[0],
            photoURL: ''
        };

        this.currentUser = user;
        localStorage.setItem('mock_fb_user', JSON.stringify(user));
        this.notifyListeners();
        return user;
    }

    async signOut() {
        await new Promise(resolve => setTimeout(resolve, 500));
        this.currentUser = null;
        localStorage.removeItem('mock_fb_user');
        this.notifyListeners();
    }

    private notifyListeners() {
        this.listeners.forEach(l => l(this.currentUser));
    }
}

class MockFirestore {
    async getDoc(collection: string, docId: string): Promise<any | null> {
        await new Promise(resolve => setTimeout(resolve, 600));
        const key = `mock_fb_db_${collection}_${docId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    async setDoc(collection: string, docId: string, data: any) {
        await new Promise(resolve => setTimeout(resolve, 600));
        const key = `mock_fb_db_${collection}_${docId}`;
        // Merge with existing data if any
        const existing = localStorage.getItem(key);
        const merged = existing ? { ...JSON.parse(existing), ...data } : data;
        localStorage.setItem(key, JSON.stringify(merged));
    }
}

export const auth = new MockAuth();
export const db = new MockFirestore();
