import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    SharedValue,
} from 'react-native-reanimated';
import { Post } from '@type/Post';
import { SwipeableFeedPost } from './post/SwipeableFeedPost';
import { useFeedStore } from '@/store/feed-store';
import { ErrorBoundary } from '@components/ErrorBoundary';
import { Pretendard } from '@/constants/theme';

// Animated.FlatList: Reanimated의 네이티브 이벤트 시스템과 연결된 FlatList
// — onScroll 핸들러가 JS 브리지 없이 UI 스레드에서 직접 실행됨
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>);

function PostFallback() {
    return (
        <View style={styles.postError}>
            <Text style={styles.postErrorText}>
                이 게시물을 표시할 수 없습니다
            </Text>
        </View>
    );
}

function FeedList({
    posts,
    onEndReached,
    scrollY,
}: {
    posts: Post[];
    onEndReached?: () => void;
    scrollY?: SharedValue<number>;
}) {
    const { removePost, fetchFeed, loading } = useFeedStore();

    // useAnimatedScrollHandler: 스크롤 이벤트를 UI 스레드 worklet으로 처리
    // 일반 onScroll 대비 이점: JS 스레드 부하 없이 매 프레임 정확한 위치 추적
    const scrollHandler = useAnimatedScrollHandler(event => {
        if (scrollY) scrollY.value = event.contentOffset.y;
    });

    return (
        <AnimatedFlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <ErrorBoundary key={item.id} fallback={<PostFallback />}>
                    <SwipeableFeedPost post={item} onDelete={removePost} />
                </ErrorBoundary>
            )}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={fetchFeed}
                    tintColor='#8e8e8e'
                />
            }
        />
    );
}

export { FeedList };

const styles = StyleSheet.create({
    postError: {
        paddingVertical: 20,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#dbdbdb',
    },
    postErrorText: {
        fontSize: 13,
        fontFamily: Pretendard.regular,
        color: '#8e8e8e',
    },
});
