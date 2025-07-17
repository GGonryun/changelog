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
import { useRouter, useSearchParams } from 'next/navigation';
import { useSlugIntent } from '@/components/context/slug-intent-context';

export const ChangelogDetails = () => {
  const admin = true;
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
    <>
      {/*
       * The interplay between scrolling things and the watcher can be tricky.
       * Because the watcher changes the URL based on visibility,
       * other components automatically scroll which causes bouncing
       * or looping behavior.
       */}

      {/* <ChangelogWatcher logs={changelogs} /> */}

      {changelogs.map((log) => (
        <ChangelogItem key={log.slug} log={log} />
      ))}

      {hasMore && <div ref={loaderRef} className="h-16" />}
    </>
  );
};

const ChangelogItem: React.FC<{ log: ChangelogEntrySchema }> = ({ log }) => {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const isActive = slug === log.slug;

  const { consumeIntent } = useSlugIntent();
  const itemRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isActive && itemRef.current && consumeIntent()) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isActive]);

  return (
    <article
      ref={itemRef}
      id={log.slug}
      data-slug={log.slug}
      className="scroll-mt-4 mb-8 border-b bg-stone-200 rounded-lg p-8 changelog-entry"
    >
      <Flex items="center" justify="between">
        <Flex gap="lg" items="center">
          <div className="bg-[#00AA8D]/40 rounded-lg p-3 w-fit h-fit">
            <SquareFunction size={36} />
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
  );
};

const DEBOUNCE_MS = 250;

const ChangelogWatcher: React.FC<{ logs: ChangelogEntrySchema[] }> = ({
  logs
}) => {
  const router = useRouter();
  const observer = useRef<IntersectionObserver | null>(null);
  const visibleEntries = useRef<Record<string, number>>({});
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const elements = document.querySelectorAll('.changelog-entry');
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const slug = entry.target.getAttribute('data-slug');
          if (!slug) return;

          const ratio = entry.intersectionRatio;

          if (ratio >= 0.2) {
            visibleEntries.current[slug] = entry.boundingClientRect.top;
          } else {
            delete visibleEntries.current[slug];
          }
        });

        const closestSlug = Object.entries(visibleEntries.current).sort(
          (a, b) => a[1] - b[1]
        )[0]?.[0];

        if (!closestSlug) return;

        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
          const currentSlug = new URLSearchParams(window.location.search).get(
            'slug'
          );
          if (currentSlug !== closestSlug) {
            const url = new URL(window.location.href);
            url.searchParams.set('slug', closestSlug);
            router.replace(url.toString(), { scroll: false });
          }
        }, DEBOUNCE_MS);
      },
      {
        root: null,
        threshold: Array.from({ length: 101 }, (_, i) => i / 100) // 0.00 → 1.00
      }
    );

    elements.forEach((el) => observer.current?.observe(el));

    return () => {
      observer.current?.disconnect();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [router, logs]);

  return null;
};
