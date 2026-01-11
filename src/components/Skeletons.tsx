import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Document item skeleton
export const DocumentSkeleton = () => (
  <div className="px-3 py-1">
    <div className="w-full p-4 rounded-2xl bg-muted/20 border-2 border-transparent">
      <div className="flex items-start gap-3">
        <Skeleton circle width={32} height={32} />
        <div className="flex-1 min-w-0">
          <Skeleton width="60%" height={16} />
          <Skeleton count={2} height={12} className="mt-2" />
          <div className="flex gap-2 mt-2">
            <Skeleton width={60} height={16} borderRadius={12} />
            <Skeleton width={40} height={16} borderRadius={12} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Multiple document skeletons
export const DocumentListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-1">
    {Array.from({ length: count }).map((_, i) => (
      <DocumentSkeleton key={i} />
    ))}
  </div>
);

// Editor content skeleton
export const EditorSkeleton = () => (
  <div className="w-full max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
    <Skeleton width="40%" height={32} className="mb-6" />
    <Skeleton count={3} height={18} className="mb-4" />
    <Skeleton width="80%" height={18} className="mb-8" />
    <Skeleton count={5} height={18} className="mb-4" />
    <Skeleton width="60%" height={18} />
  </div>
);

// Sidebar header skeleton
export const SidebarHeaderSkeleton = () => (
  <div className="flex items-center gap-3 p-4">
    <Skeleton circle width={40} height={40} />
    <div className="flex-1">
      <Skeleton width={120} height={18} />
      <Skeleton width={80} height={12} className="mt-1" />
    </div>
  </div>
);

// Settings panel skeleton
export const SettingsSkeleton = () => (
  <div className="space-y-6 p-6">
    <div>
      <Skeleton width={100} height={14} className="mb-3" />
      <Skeleton height={40} borderRadius={8} />
    </div>
    <div>
      <Skeleton width={120} height={14} className="mb-3" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width={60} height={32} borderRadius={8} />
        ))}
      </div>
    </div>
    <div>
      <Skeleton width={80} height={14} className="mb-3" />
      <Skeleton height={8} borderRadius={4} />
    </div>
  </div>
);

// Version history skeleton
export const VersionHistorySkeleton = () => (
  <div className="space-y-3 p-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
        <Skeleton circle width={32} height={32} />
        <div className="flex-1">
          <Skeleton width={100} height={14} />
          <Skeleton width={60} height={12} className="mt-1" />
        </div>
        <Skeleton width={24} height={24} borderRadius={6} />
      </div>
    ))}
  </div>
);

export default {
  DocumentSkeleton,
  DocumentListSkeleton,
  EditorSkeleton,
  SidebarHeaderSkeleton,
  SettingsSkeleton,
  VersionHistorySkeleton,
};
