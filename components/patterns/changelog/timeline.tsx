'use client';

import { Box } from '@/components/ui/box';
import { Flex } from '@/components/ui/flex';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';
import { dates } from '@/lib/time';
import { cn } from '@/lib/utils';
import { TimelineEntrySchema } from '@/schemas/changelog';
import { CircleIcon, DotIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export const ChangelogTimeline = () => {
  const [timeline, setTimeline] = useState<TimelineEntrySchema[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/timeline');
      const data = await response.json();
      setTimeline(data.timeline);
    };

    fetchData();
  }, []);
  return (
    <Flex.Stack full="width" gap="xl">
      <Typography.H1 className="text-4xl">What's New</Typography.H1>
      <Typography.Paragraph>
        We've been busy! Here's what we've launched— this week, and every week.
      </Typography.Paragraph>
      <Features />
      <Timeline items={timeline} />
    </Flex.Stack>
  );
};

export const Features = () => {
  return (
    <Select>
      <SelectTrigger className="data-[placeholder]:text-primary bg-white border-stone-400">
        <SelectValue placeholder="View all updates" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="dark">API</SelectItem>
        <SelectItem value="light">Routing Rules</SelectItem>
        <SelectItem value="system">Integrations</SelectItem>
        <SelectItem value="system">Assessment</SelectItem>
      </SelectContent>
    </Select>
  );
};

export const Timeline: React.FC<{ items: TimelineEntrySchema[] }> = ({
  items
}) => {
  return (
    <Flex.Stack full="width">
      {items.map((item) => (
        <TimelineItem item={item} key={item.slug} />
      ))}
    </Flex.Stack>
  );
};

const TimelineItem: React.FC<{ item: TimelineEntrySchema }> = ({ item }) => {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const isActive = slug === item.slug;

  return (
    <Link
      href={`?slug=${item.slug}`}
      className={cn(
        'no-underline p-4 rounded-md',
        isActive ? 'bg-stone-200' : ''
      )}
    >
      <Flex gap="md" center>
        <Box className="bg-stone-300 rounded-full p-[3px] ">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isActive ? 'bg-stone-500' : 'bg-stone-300'
            )}
          />
        </Box>

        <Flex.Stack full="width" gap="sm">
          <Typography.Paragraph leading="none" weight="medium">
            {item.title}
          </Typography.Paragraph>
          <Typography.Caption
            leading="none"
            className="text-muted-foreground -mt-1"
          >
            {dates.pretty(item.date)}
          </Typography.Caption>
        </Flex.Stack>
      </Flex>
    </Link>
  );
};
