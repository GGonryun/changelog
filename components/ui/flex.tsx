import { cn } from '@/lib/utils';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { text } from '../foundations/text';

const flex = {
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-5'
  },
  full: {
    true: 'h-full w-full',
    width: 'w-full',
    height: 'h-full'
  },
  center: {
    true: 'items-center justify-center'
  },
  justify: {
    between: 'justify-between'
  },
  items: {
    center: 'items-center'
  }
};
const flexVariants = cva('flex', {
  variants: flex
});

const gridVariants = cva('grid auto-cols-auto grid-flow-col', {
  variants: {
    ...flex
  }
});

type FlexProps = React.ComponentProps<'div'> &
  VariantProps<typeof flexVariants> & {
    children: React.ReactNode;
  };

type StackProps = React.ComponentProps<'div'> &
  VariantProps<typeof flexVariants> & {
    children: React.ReactNode;
  };

type GridProps = React.ComponentProps<'div'> &
  VariantProps<typeof gridVariants> & {
    children: React.ReactNode;
  };
interface FlexComponent extends React.FC<FlexProps> {
  Stack: React.FC<StackProps>;
  Grid: React.FC<GridProps>;
}

const Flex: FlexComponent = ({
  className,
  children,
  gap,
  full,
  items,
  justify,
  center,
  ...props
}) => {
  return (
    <div
      className={cn(
        flexVariants({ gap, full, center, items, justify }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Flex.Stack = ({
  className,
  children,
  gap,
  full,
  center,
  items,
  justify,
  ...props
}) => (
  <div
    className={cn(
      flexVariants({ gap, full, center, items, justify }),
      'flex-col',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

Flex.Grid = ({
  className,
  children,
  gap,
  full,
  center,
  items,
  justify,
  ...props
}) => (
  <div
    className={cn(
      'grid',
      gridVariants({ gap, full, center, items, justify }),
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export { Flex };
