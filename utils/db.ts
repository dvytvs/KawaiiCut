import { openDB, DBSchema } from 'idb';
import { ProjectMetadata, ProjectState, UserProfile, AppSettings } from '../types';

interface KawaiiDB extends DBSchema {
  projects: {
    key: string;
    value: ProjectState;
  };
  meta: {
    key: string;
    value: ProjectMetadata;
  };
  // New stores for global app state
  profile: {
    key: string;
    value: UserProfile;
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

const DB_NAME = 'KawaiiCutDB';
const DB_VERSION = 2; // Incremented version for new stores

export const initDB = async () => {
  return openDB<KawaiiDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'meta.id' });
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'id' });
      }
      // Create single-object stores (we'll use a fixed key like 'current')
      if (!db.objectStoreNames.contains('profile')) {
        db.createObjectStore('profile');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });
};

// --- Projects ---

export const saveProjectToDB = async (project: ProjectState) => {
  const db = await initDB();
  await db.put('projects', project);
  await db.put('meta', project.meta);
};

export const loadProjectsMeta = async (): Promise<ProjectMetadata[]> => {
  const db = await initDB();
  return db.getAll('meta');
};

export const loadProjectFromDB = async (id: string): Promise<ProjectState | undefined> => {
  const db = await initDB();
  return db.get('projects', id);
};

export const deleteProjectFromDB = async (id: string) => {
  const db = await initDB();
  await db.delete('projects', id);
  await db.delete('meta', id);
};

export const emptyTrashInDB = async () => {
    const db = await initDB();
    const allMeta = await db.getAll('meta');
    const tx = db.transaction(['projects', 'meta'], 'readwrite');
    
    for (const meta of allMeta) {
        if (meta.isDeleted) {
            await tx.objectStore('meta').delete(meta.id);
            await tx.objectStore('projects').delete(meta.id);
        }
    }
    await tx.done;
};

export const softDeleteProjectInDB = async (id: string) => {
  const db = await initDB();
  const meta = await db.get('meta', id);
  const project = await db.get('projects', id);
  
  if (meta) {
    meta.isDeleted = true;
    await db.put('meta', meta);
  }
  if (project) {
    project.meta.isDeleted = true;
    await db.put('projects', project);
  }
};

export const restoreProjectInDB = async (id: string) => {
  const db = await initDB();
  const meta = await db.get('meta', id);
  const project = await db.get('projects', id);
  
  if (meta) {
    meta.isDeleted = false;
    await db.put('meta', meta);
  }
  if (project) {
    project.meta.isDeleted = false;
    await db.put('projects', project);
  }
};

// --- User Profile ---

export const saveUserProfile = async (profile: UserProfile) => {
    const db = await initDB();
    await db.put('profile', profile, 'currentUser');
};

export const loadUserProfile = async (): Promise<UserProfile | undefined> => {
    const db = await initDB();
    return db.get('profile', 'currentUser');
};

// --- App Settings ---

export const saveAppSettings = async (settings: AppSettings) => {
    const db = await initDB();
    await db.put('settings', settings, 'currentSettings');
};

export const loadAppSettings = async (): Promise<AppSettings | undefined> => {
    const db = await initDB();
    return db.get('settings', 'currentSettings');
};

// Helper
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};