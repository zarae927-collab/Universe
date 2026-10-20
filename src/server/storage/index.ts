import { IQuizStorage, StorageHealthStatus } from './types';
import { JsonQuizStorage } from './JsonQuizStorage';
import { FirestoreQuizStorage } from './FirestoreQuizStorage';

let activeStorage: IQuizStorage;
let jsonStorageInstance: JsonQuizStorage;
let firestoreStorageInstance: FirestoreQuizStorage;
let lastKnownStatus: StorageHealthStatus;

export async function initializeStorage(): Promise<{
  active: IQuizStorage;
  status: StorageHealthStatus;
}> {
  jsonStorageInstance = new JsonQuizStorage();
  await jsonStorageInstance.init();

  firestoreStorageInstance = new FirestoreQuizStorage();
  await firestoreStorageInstance.init();

  // Check Firestore health
  const firestoreHealth = await firestoreStorageInstance.checkHealth();

  const requestedEngine = (process.env.STORAGE_ENGINE || '').toLowerCase().trim();

  if (requestedEngine === 'firestore') {
    if (firestoreHealth.healthy) {
      activeStorage = firestoreStorageInstance;
      lastKnownStatus = firestoreHealth;
      console.log('[StorageManager] Activated Firestore as primary persistence engine.');
    } else {
      // Per Step 5: Do NOT silently fall back while claiming shared persistence
      console.error('[StorageManager] STORAGE_ENGINE=firestore was explicitly requested, but Firestore health check failed:');
      console.error(firestoreHealth.message);
      activeStorage = firestoreStorageInstance; // keep firestore so it returns clear errors rather than false success
      lastKnownStatus = firestoreHealth;
    }
  } else {
    // Default to JsonQuizStorage to maintain 100% uninterrupted uptime and working website
    activeStorage = jsonStorageInstance;
    const jsonHealth = await jsonStorageInstance.checkHealth();
    lastKnownStatus = {
      ...jsonHealth,
      firestoreConfigured: firestoreHealth.firestoreConfigured,
      details: {
        ...jsonHealth.details,
        firestoreProbe: firestoreHealth,
      },
    };
    console.log(`[StorageManager] Initialized with engine: ${activeStorage.name}. Firestore configured: ${firestoreHealth.firestoreConfigured}`);
  }

  return { active: activeStorage, status: lastKnownStatus };
}

export function getStorage(): IQuizStorage {
  if (!activeStorage) {
    throw new Error('Storage has not been initialized. Call initializeStorage() first.');
  }
  return activeStorage;
}

export function getJsonStorage(): JsonQuizStorage {
  return jsonStorageInstance;
}

export function getFirestoreStorage(): FirestoreQuizStorage {
  return firestoreStorageInstance;
}

export async function getStorageStatus(): Promise<StorageHealthStatus> {
  if (activeStorage) {
    return await activeStorage.checkHealth();
  }
  return {
    engine: 'json',
    healthy: false,
    message: 'Storage not initialized',
    firestoreConfigured: false,
  };
}

export type { IQuizStorage, StoredQuiz, QuizSubmission, StorageHealthStatus } from './types';
