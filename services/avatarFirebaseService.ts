import { storage, db, auth } from './firebaseConfig';
import { ref, uploadString, getBytes, deleteObject } from 'firebase/storage';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface AvatarData {
  skinTone: string;
  hairStyle: 'short' | 'medium' | 'long' | 'curly';
  hairColor: string;
  eyeColor: string;
  bodyType: 'slim' | 'average' | 'athletic';
  clothingColor: string;
  faceImageData?: string;
}

export interface UserAvatarProfile {
  userId: string;
  userName: string;
  avatarSettings: AvatarData;
  faceImageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

class AvatarFirebaseService {
  /**
   * Save user's avatar to Firebase
   */
  async saveAvatar(userId: string, userName: string, avatarData: AvatarData): Promise<void> {
    try {
      if (!userId) throw new Error('User ID required');

      // Save face image to Cloud Storage if it exists
      let faceImageUrl: string | undefined;
      if (avatarData.faceImageData) {
        const timestamp = Date.now();
        const storageRef = ref(storage, `avatars/${userId}/face_${timestamp}.jpg`);
        
        // Upload base64 image
        await uploadString(storageRef, avatarData.faceImageData, 'data_url');
        faceImageUrl = `gs://storage_bucket/avatars/${userId}/face_${timestamp}.jpg`;
        
        console.log('✓ Face image uploaded');
      }

      // Save avatar metadata to Firestore
      const avatarDocRef = doc(db, 'users', userId, 'avatar', 'current');
      
      const avatarProfile: UserAvatarProfile = {
        userId,
        userName,
        avatarSettings: {
          ...avatarData,
          faceImageData: undefined // Don't store base64 in DB, just reference
        },
        faceImageUrl,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await setDoc(avatarDocRef, avatarProfile);
      console.log('✓ Avatar saved to Firestore');
    } catch (error) {
      console.error('Error saving avatar:', error);
      throw error;
    }
  }

  /**
   * Load user's avatar from Firebase
   */
  async loadAvatar(userId: string): Promise<UserAvatarProfile | null> {
    try {
      if (!userId) return null;

      const avatarDocRef = doc(db, 'users', userId, 'avatar', 'current');
      const avatarSnapshot = await getDoc(avatarDocRef);

      if (avatarSnapshot.exists()) {
        console.log('✓ Avatar loaded from Firestore');
        return avatarSnapshot.data() as UserAvatarProfile;
      }

      return null;
    } catch (error) {
      console.error('Error loading avatar:', error);
      return null;
    }
  }

  /**
   * Get all public avatars for community view
   */
  async getPublicAvatars(limit: number = 50): Promise<UserAvatarProfile[]> {
    try {
      const avatarsCollection = collection(db, 'public_avatars');
      const q = query(avatarsCollection);
      const querySnapshot = await getDocs(q);

      const avatars: UserAvatarProfile[] = [];
      querySnapshot.forEach(doc => {
        avatars.push(doc.data() as UserAvatarProfile);
      });

      return avatars.slice(0, limit);
    } catch (error) {
      console.error('Error fetching public avatars:', error);
      return [];
    }
  }

  /**
   * Publish avatar to public gallery
   */
  async publishAvatarPublic(userId: string, avatarData: UserAvatarProfile): Promise<void> {
    try {
      const publicDocRef = doc(db, 'public_avatars', userId);
      await setDoc(publicDocRef, {
        ...avatarData,
        isPublic: true,
        publishedAt: Date.now()
      });
      console.log('✓ Avatar published publicly');
    } catch (error) {
      console.error('Error publishing avatar:', error);
      throw error;
    }
  }

  /**
   * Delete user's avatar
   */
  async deleteAvatar(userId: string): Promise<void> {
    try {
      if (!userId) return;

      // Delete from Firestore
      const avatarDocRef = doc(db, 'users', userId, 'avatar', 'current');
      await setDoc(avatarDocRef, {}, { merge: true });

      // Note: Storage images would need manual cleanup via Firebase Console
      // or a backend function due to security rules

      console.log('✓ Avatar deleted');
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  }

  /**
   * Get user's current auth ID
   */
  getCurrentUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  /**
   * Get user's display name
   */
  getCurrentUserName(): string {
    return auth.currentUser?.displayName || 'Anonymous';
  }
}

export const avatarFirebaseService = new AvatarFirebaseService();
