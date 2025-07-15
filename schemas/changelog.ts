import z from 'zod';

export const changelogEntrySchema = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.string(),
  content: z.string(),
  authors: z.array(z.string())
});

export type ChangelogEntrySchema = z.infer<typeof changelogEntrySchema>;

export const timelineEntrySchema = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.string()
});
export type TimelineEntrySchema = z.infer<typeof timelineEntrySchema>;

export const authorSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().optional()
});
export type AuthorSchema = z.infer<typeof authorSchema>;
