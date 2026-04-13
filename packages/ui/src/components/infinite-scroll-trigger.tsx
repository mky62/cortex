import { Button } from "@workspace/ui/components/button";
import { cn }  from "@workspace/ui/lib/utils.js"

interface InfiniteScrollTriggerProps {
    canLoadMore: boolean;
    isLoadingMore: boolean;
    onLoadMore: () => void;
    loadMoreText?: string;
    noMoreText?: string;
    className?: string;
    ref?: React.Ref<HTMLDivElement>
}

export const InfiniteScrollTrigger:any = ({
    canLoadMore,
    isLoadingMore,
    onLoadMore,
    loadMoreText = "Load More",
    noMoreText = "No More items",
    className,
    ref,
}:typeof InfiniteScrollTrigger) => {
    let text = loadMoreText;

    if(isLoadingMore) {
        text = "Loading....";
    }
    else if (!canLoadMore) {
        text = noMoreText;
    }

    return (
        <div className={cn("flex w-full justify-center py-2", className)} ref={ref}>
            <Button
            disabled={!canLoadMore || isLoadingMore}
            onClick={onLoadMore}
            size="sm">
                {text}
            </Button>
        </div>
    )
}