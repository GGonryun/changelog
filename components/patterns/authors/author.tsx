'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export const Author: React.FC<{ id: string }> = ({ id }) => {
  return (
    <Avatar>
      <AvatarImage src={`https://github.com/${id}.png`} alt={id} />
      <AvatarFallback>
        <Skeleton className="w-10 h-10 rounded-full" />
      </AvatarFallback>
    </Avatar>
  );
};
