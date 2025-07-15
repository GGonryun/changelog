import { ChangelogDetails } from '../patterns/changelog/details';
import { ChangelogTimeline } from '../patterns/changelog/timeline';
import { Flex } from '../ui/flex';

export const ChangelogPage = () => {
  return (
    <div className="container p-8 h-full">
      <Flex.Grid
        full="height"
        gap="lg"
        className="h-full grid-cols-[250px_1fr] gap-12"
      >
        <ChangelogTimeline />
        <ChangelogDetails />
      </Flex.Grid>
    </div>
  );
};
