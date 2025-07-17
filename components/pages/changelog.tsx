import { SlugIntentProvider } from '../context/slug-intent-context';
import { ChangelogDetails } from '../patterns/changelog/details';
import { ChangelogTimeline } from '../patterns/changelog/timeline';
import { Flex } from '../ui/flex';

export const ChangelogPage = () => {
  return (
    <SlugIntentProvider>
      <Flex.Grid
        full="height"
        gap="lg"
        className="w-full ml-auto mr-auto pl-8 h-[calc(100vh-4rem)] grid-cols-[250px_1fr] gap-6 max-w-[1280px]"
      >
        <div className="py-14 h-full overflow-y-auto self-start">
          <ChangelogTimeline />
        </div>
        <div className="py-4 pr-8 h-full overflow-y-auto self-start ">
          <ChangelogDetails />
        </div>
      </Flex.Grid>
    </SlugIntentProvider>
  );
};
