'use client';

import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChangelogEntrySchema } from '@/schemas/changelog';
import { Box } from '@/components/ui/box';
import { Typography } from '@/components/ui/typography';

export const Changelog = () => {
  const [changelogs, setChangelogs] = useState<ChangelogEntrySchema[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/changelog?page=${page}`);
      const data = await res.json();
      setChangelogs((prev) => [...prev, ...data.changelogs]);
      setHasMore(data.hasMore);
    };
    fetchData();
  }, [page]);

  useEffect(() => {
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setPage((prev) => prev + 1);
      },
      { threshold: 1.0 }
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Box mb="xl">
        <Typography.H1 className="mb-6">📝 Changelog</Typography.H1>
      </Box>
      {changelogs.map((log) => (
        <article key={log.slug} className="mb-8 border-b pb-4">
          <Typography.H2 className="text-xl font-semibold">
            {log.title}
          </Typography.H2>
          <Typography.Paragraph className="text-sm text-gray-500">
            {log.date}
          </Typography.Paragraph>
          <Box className="prose mt-2">
            <ReactMarkdown>{log.content}</ReactMarkdown>
          </Box>
        </article>
      ))}
      {hasMore && <div ref={loaderRef} className="h-16" />}
    </main>
  );
};
