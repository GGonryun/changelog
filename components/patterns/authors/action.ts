'use server';

import { authorSchema } from '@/schemas/changelog';
import fs from 'fs';
import path from 'path';

export const getAuthorData = async (id: string) => {
  const authorPath = path.join(process.cwd(), 'content/authors', `${id}.json`);

  if (!fs.existsSync(authorPath)) {
    return undefined;
  }

  const raw = fs.readFileSync(authorPath, 'utf-8');
  const authorData = JSON.parse(raw);

  return authorSchema.parse(authorData);
};
