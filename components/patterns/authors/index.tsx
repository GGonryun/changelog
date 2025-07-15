'use client';

import { Author } from './author';

export const Authors: React.FC<{ ids: string[] }> = ({ ids }) => {
  return (
    <div>
      {ids.map((id) => (
        <Author key={id} id={id} />
      ))}
    </div>
  );
};
