import { PageSkeleton, SkeletonBlock } from '../ui';

export default function HomeSkeleton() {
  return (
    <PageSkeleton as="main" className="clean-home">
      <div className="clean-home-loading">
        <SkeletonBlock className="clean-loading-nav" />
        <SkeletonBlock className="clean-loading-hero" />
        <SkeletonBlock className="clean-loading-panel" />
      </div>
    </PageSkeleton>
  );
}
