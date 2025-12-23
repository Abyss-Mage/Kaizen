import { Client, Account, Databases, Query } from 'node-appwrite';
import { cookies } from 'next/headers';

// 1. Admin Client (Server-Side Only - Bypasses Permissions)
export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!); // 🚨 Ensure this exists in .env

  return {
    get account() { return new Account(client); },
    get databases() { return new Databases(client); }
  };
};

// 2. Session Client (Server-Side - Respects User Permissions)
export const createSessionClient = async () => {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

  const cookieStore = await cookies();
  const session = cookieStore.get('a_session_' + process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID); // Appwrite's default cookie name

  if (session) {
    client.setSession(session.value);
  }

  return {
    get account() { return new Account(client); },
    get databases() { return new Databases(client); }
  };
};

// 3. Helper for Configuration Constants
export const APPWRITE_CONFIG = {
  DATABASE_ID: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  COLLECTION_ID_SERIES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SERIES!,
};

export { Query };