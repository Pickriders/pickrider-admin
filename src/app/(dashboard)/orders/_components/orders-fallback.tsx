import { PageHeader, SkeletonLine, TabsSkeleton } from "@/components/kit";

/** Until the search params resolve: the real title, the description line and the four tabs. */
export function OrdersFallback({ title }: { title: string }) {
  return (
    <div aria-busy="true">
      <PageHeader title={title} description={<SkeletonLine box="h-5" bar="h-3.5 w-80 max-w-full" />} />
      <TabsSkeleton widths={["w-[4.5rem]", "w-24", "w-24", "w-[5.5rem]"]} className="mb-4" />
    </div>
  );
}
