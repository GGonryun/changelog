import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextRequest, NextResponse } from 'next/server';
import {
  changelogEntrySchema,
  ChangelogEntrySchema
} from '@/schemas/changelog';

const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  const pageParam = req.nextUrl.searchParams.get('page') || '1';
  const page = parseInt(pageParam, 10);
  const contentDir = path.join(process.cwd(), 'content/changelog');

  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => b.localeCompare(a)); // Newest first

  const start = (page - 1) * PAGE_SIZE;
  const selectedFiles = files.slice(start, start + PAGE_SIZE);

  const changelogs: ChangelogEntrySchema[] = selectedFiles.map((filename) => {
    const filePath = path.join(contentDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    const log = {
      slug: filename.replace('.md', ''),
      title: data.title || 'Untitled',
      date: data.date || '',
      content,
      authors: data.authors ?? [],
      media: data.media
    };

    return changelogEntrySchema.parse(log);
  });

  return NextResponse.json({
    changelogs,
    hasMore: start + PAGE_SIZE < files.length
  });
}
