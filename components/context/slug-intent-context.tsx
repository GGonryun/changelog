'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback
} from 'react';

type SlugIntentContextType = {
  wasIntentional: boolean;
  markIntentional: () => void;
  consumeIntent: () => boolean;
};

const SlugIntentContext = createContext<SlugIntentContextType | undefined>(
  undefined
);

export const SlugIntentProvider = ({ children }: { children: ReactNode }) => {
  const [intent, setIntent] = useState(false);

  const markIntentional = useCallback(() => {
    setIntent(true);
  }, []);

  const consumeIntent = useCallback(() => {
    const result = intent;
    setIntent(false);
    return result;
  }, [intent]);

  return (
    <SlugIntentContext.Provider
      value={{ wasIntentional: intent, markIntentional, consumeIntent }}
    >
      {children}
    </SlugIntentContext.Provider>
  );
};

export const useSlugIntent = () => {
  const context = useContext(SlugIntentContext);
  if (!context) {
    throw new Error('useSlugIntent must be used within a SlugIntentProvider');
  }
  return context;
};
