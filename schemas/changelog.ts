import z from 'zod';

export const changelogEntrySchema = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.string(),
  content: z.string()
});

export type ChangelogEntrySchema = z.infer<typeof changelogEntrySchema>;
