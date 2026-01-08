import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/data/contacts.json');

async function getContacts() {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data).contacts;
}

/**
 * Look up a contact by name (case-insensitive, partial match)
 * @param {string} name - Contact name to search for
 * @returns {Promise<Object|null>} Contact info or null if not found
 */
export async function lookupContact(name) {
  const contacts = await getContacts();
  const searchName = name.toLowerCase();

  // Find exact match first, then partial match
  const contact = contacts.find(c =>
    c.name.toLowerCase() === searchName
  ) || contacts.find(c =>
    c.name.toLowerCase().includes(searchName)
  );

  return contact || null;
}

/**
 * Get all contacts
 */
export async function getAllContacts() {
  return await getContacts();
}
