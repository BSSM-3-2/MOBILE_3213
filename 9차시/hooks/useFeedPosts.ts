import { useMemo, useCallback } from 'react';
import { useFeedStore } from '@/store/feed-store';

export function useFeedPosts(keyword: string = '') {
    const posts = useFeedStore(s => s.posts);
    const loading = useFeedStore(s => s.loading);
    const error = useFeedStore(s => s.error);
    const fetchFeed = useFeedStore(s => s.fetchFeed);
    const loadMore = useFeedStore(s => s.loadMore);
    const toggleLike = useFeedStore(s => s.toggleLike);

    const filteredPosts = useMemo(
        () =>
            keyword.trim()
                ? posts.filter(p => p.caption?.includes(keyword))
                : posts,
        [posts, keyword],
    );

    const handleLike = useCallback(
        (id: string) => toggleLike(id),
        [toggleLike],
    );

    return {
        posts: filteredPosts,
        loading,
        error,
        fetchFeed,
        loadMore,
        handleLike,
    };
}
