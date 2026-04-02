import { create } from 'zustand';
import { Post } from '@type/Post';
import { getFeed, likePost, unlikePost } from '@/api/content';
// TODO: (5차) toggleLike 구현 시 필요한 함수를 import에 추가한다

interface FeedState {
    posts: Post[];
    page: number;
    hasNext: boolean;
    loading: boolean;
    error: string | null;

    fetchFeed: () => Promise<void>;
    loadMore: () => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
}

export const useFeedStore = create<FeedState>((set, get) => ({
    posts: [],
    page: 1,
    hasNext: false,
    loading: false,
    error: null,

    fetchFeed: async () => {
        // TODO: (4차) set()으로 loading을 켜고, getFeed(1)를 호출해 posts/pagination을 저장한다
        // 힌트: try/catch로 감싸고 실패 시 error 메시지도 저장한다
        set({ loading: true, error: null });
        try {
            const { data, pagination } = await getFeed(1);
            set({
                posts: data,
                page: 1,
                hasNext: pagination.hasNext,
                loading: false,
            });
        } catch (error: any) {
            set({
                loading: false,
                error: error.message || 'Failed to fetch feed',
            });
        }
    },

    loadMore: async () => {
        const { loading, hasNext, page, posts } = get();
        if (loading || !hasNext) return;

        set({ loading: true });
        try {
            const nextPage = page + 1;
            const { data, pagination } = await getFeed(nextPage);
            set({
                posts: [...posts, ...data],
                page: nextPage,
                hasNext: pagination.hasNext,
                loading: false,
            });
        } catch {
            set({ loading: false });
        }
    },

    // 낙관적 업데이트: UI를 먼저 바꾸고 API 호출 → 실패 시 원상복구
    toggleLike: async (postId: string) => {
        const { posts } = get();
        const target = posts.find(p => p.id === postId);
        if (!target) return;

        // ① UI 즉시 반영 (낙관적 업데이트)
        const previousPosts = [...posts]; // 롤백용 스냅샷
        const isCurrentlyLiked = target.liked;

        set({
            posts: posts.map(p =>
                p.id === postId
                    ? {
                          ...p,
                          liked: !p.liked,
                          likes: p.liked ? p.likes - 1 : p.likes + 1,
                      }
                    : p,
            ),
        });

        try {
            // ② API 호출
            const { likes, liked } = isCurrentlyLiked
                ? await unlikePost(postId)
                : await likePost(postId);

            // ③ 서버 응답으로 최종 동기화 (선택 사항이나 권장)
            set({
                posts: get().posts.map(p =>
                    p.id === postId ? { ...p, likes, liked } : p,
                ),
            });
        } catch (error) {
            // ④ 실패 시 롤백 (이때 get().posts를 기준으로 postId만 복구)
            set({
                posts: get().posts.map(p =>
                    p.id === postId
                        ? (previousPosts.find(pp => pp.id === postId) as Post)
                        : p,
                ),
            });
            console.error('[Like Error] Rollback performed', error);
        }
    },
}));
