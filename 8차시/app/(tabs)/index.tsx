import { useEffect } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import NavigationTop from '@components/navigation/NavigationTop';
import ContentContainer from '@components/container';
import { FeedList } from '@components/feed/FeedList';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@components/themed-view';
import { useFeedStore } from '@/store/feed-store';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { Pretendard } from '@/constants/theme';

export default function HomeScreen() {
    const { posts, loading, error, fetchFeed, loadMore } = useFeedStore();
    const router = useRouter();

    // scrollY: 스크롤 위치를 UI 스레드에서 직접 추적하는 SharedValue
    const scrollY = useSharedValue(0);

    // useAnimatedStyle: scrollY 변화에 따라 헤더를 UI 스레드에서 직접 변환
    // interpolate: 입력 범위 [0, 80] → 출력 범위 매핑 (Extrapolation.CLAMP: 범위 초과 시 고정)
    const headerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(
                    scrollY.value,
                    [0, 80],
                    [0, -80],
                    Extrapolation.CLAMP,
                ),
            },
        ],
        opacity: interpolate(
            scrollY.value,
            [0, 60],
            [1, 0],
            Extrapolation.CLAMP,
        ),
    }));

    useEffect(() => {
        fetchFeed();
    }, []);

    const header = (
        <Animated.View style={headerAnimatedStyle}>
            <ContentContainer isTopElement={true}>
                <NavigationTop
                    title='MyFeed'
                    icon={'layers'}
                    rightButtons={
                        <TouchableOpacity
                            onPress={() => router.push('/create' as never)}
                            hitSlop={8}
                        >
                            <Ionicons
                                name='add-outline'
                                size={28}
                                color='#262626'
                            />
                        </TouchableOpacity>
                    }
                />
            </ContentContainer>
        </Animated.View>
    );

    // store.error 구독: 초기 로드 실패 시 전체 화면 에러 UI 표시
    if (error && posts.length === 0) {
        return (
            <ThemedView style={{ flex: 1, overflow: 'hidden' }}>
                {header}
                <View style={styles.errorContainer}>
                    <Ionicons
                        name='cloud-offline-outline'
                        size={48}
                        color='#8e8e8e'
                    />
                    <Text style={styles.errorTitle}>
                        피드를 불러오지 못했습니다
                    </Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchFeed}
                    >
                        <Text style={styles.retryText}>다시 시도</Text>
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{ flex: 1, overflow: 'hidden' }}>
            {/* Animated.View: headerAnimatedStyle 적용 — 스크롤에 따라 헤더 숨김 */}
            {header}

            {loading && posts.length === 0 ? (
                <ActivityIndicator style={{ flex: 1 }} />
            ) : (
                // scrollY를 FeedList에 전달 → useAnimatedScrollHandler가 내부에서 처리
                <FeedList
                    posts={posts}
                    onEndReached={loadMore}
                    scrollY={scrollY}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    errorTitle: {
        fontSize: 16,
        fontFamily: Pretendard.semiBold,
        color: '#262626',
    },
    errorMessage: {
        fontSize: 13,
        fontFamily: Pretendard.regular,
        color: '#8e8e8e',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: '#0a7ea4',
        borderRadius: 8,
    },
    retryText: {
        fontSize: 15,
        fontFamily: Pretendard.medium,
        color: '#fff',
    },
});
