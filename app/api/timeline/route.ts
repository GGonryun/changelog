import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';
import { TimelineEntrySchema, timelineEntrySchema } from '@/schemas/changelog';

export async function GET() {
  const contentDir = path.join(process.cwd(), 'content/changelog');

  const files = fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => b.localeCompare(a)); // Newest first

  const timeline: TimelineEntrySchema[] = files.map((filename) => {
    const filePath = path.join(contentDir, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContent);
    const log = {
      slug: filename.replace('.md', ''),
      title: data.title || 'Untitled',
      date: data.date || ''
    };

    return timelineEntrySchema.parse(log);
  });

  return NextResponse.json({
    timeline
  });
}
