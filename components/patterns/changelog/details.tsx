'use client';

import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChangelogEntrySchema } from '@/schemas/changelog';
import { Box } from '@/components/ui/box';
import { Typography } from '@/components/ui/typography';
import { Authors } from '../authors';
import { Separator } from '@/components/ui/separator';
import { SquareFunction } from 'lucide-react';
import { Flex } from '@/components/ui/flex';
import { dates } from '@/lib/time';
import Image from 'next/image';

export const ChangelogDetails = () => {
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
    <main>
      {changelogs.map((log) => (
        <article
          key={log.slug}
          className="mb-8 border-b bg-stone-200 rounded-lg p-6"
        >
          <Flex items="center" justify="between">
            <Flex gap="lg" items="center">
              <div className="bg-stone-300/90 rounded-lg p-3 w-fit h-fit">
                <SquareFunction size={32} />
              </div>
              <div>
                <Typography.H2>{log.title}</Typography.H2>
                <Typography.Paragraph
                  className="text-sm text-gray-500"
                  leading="none"
                >
                  {dates.pretty(log.date)}
                </Typography.Paragraph>
              </div>
            </Flex>
            <Authors ids={log.authors} />
          </Flex>
          <Box w="full" className="my-6">
            <Separator className="bg-stone-300" />
          </Box>
          <ReactMarkdown
            components={{
              p: (props) => <Typography.Paragraph {...(props as any)} />
            }}
          >
            {log.content}
          </ReactMarkdown>

          {log.media && (
            <Image
              src={log.media}
              alt="Changelog media"
              height={540}
              width={960}
              className="rounded-lg mt-6"
            />
          )}
        </article>
      ))}
      {hasMore && <div ref={loaderRef} className="h-16" />}
    </main>
  );
};
