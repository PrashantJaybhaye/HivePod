import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function CourseSkeleton() {
  return (
    <Card className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/1.5 bg-linear-to-b from-white/4 to-transparent backdrop-blur-[32px] flex flex-col h-full shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
      {/* Liquid glass light reflection sheen */}
      <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/1 to-white/4 pointer-events-none" />

      {/* Top border catch-light effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/12 to-transparent pointer-events-none" />

      {/* Card Header Shimmer */}
      <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-3 relative z-10">
        <div className="h-5 w-24 rounded-full shimmer-bg"></div>
        <div className="h-5 w-16 rounded-full shimmer-bg"></div>
      </CardHeader>

      {/* Card Content Shimmer */}
      <CardContent className="flex-1 flex flex-col pt-1 pb-0 relative z-10">
        {/* Title */}
        <div className="h-5 w-4/5 rounded-md shimmer-bg mb-2"></div>

        {/* Description */}
        <div className="space-y-1.5 mb-3">
          <div className="h-3 w-full rounded shimmer-bg"></div>
          <div className="h-3 w-5/6 rounded shimmer-bg"></div>
        </div>

        {/* Instructor & Active Students Row Shimmer */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="h-3 w-28 rounded shimmer-bg"></div>
        </div>

        {/* iOS-Style Badges Shimmer */}
        <div className="flex gap-1.5 mb-4 mt-1">
          <div className="h-5 w-16 rounded-full shimmer-bg"></div>
          <div className="h-5 w-14 rounded-full shimmer-bg"></div>
        </div>

        {/* iOS-Style Product Sheet Spec Row Shimmer */}
        <div className="flex flex-col gap-1.5 mb-4 mt-auto pt-3.5 border-t border-white/6">
          <div className="flex items-center gap-2.5">
            <div className="h-3 w-14 rounded shimmer-bg"></div>
            <div className="w-px h-2.5 bg-white/15 shrink-0"></div>
            <div className="h-3 w-10 rounded shimmer-bg"></div>
            <div className="w-px h-2.5 bg-white/15 shrink-0"></div>
            <div className="h-3 w-16 rounded shimmer-bg"></div>
          </div>
          <div className="h-2.5 w-20 rounded shimmer-bg"></div>
        </div>

        {/* Progress Shimmer */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <div className="h-3 w-12 rounded shimmer-bg"></div>
            <div className="h-3 w-16 rounded shimmer-bg"></div>
          </div>
          <div className="h-1.5 w-full bg-white/6 rounded-full shimmer-bg"></div>
        </div>
      </CardContent>

      {/* Action Button Shimmer */}
      <CardFooter className="pt-2 pb-5 px-6 border-0 bg-transparent mt-auto relative z-10">
        <div className="w-full h-[38px] rounded-xl shimmer-bg"></div>
      </CardFooter>
    </Card>
  );
}
