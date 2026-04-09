import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import NavigationTop from '@components/navigation/NavigationTop';
import ContentContainer from '@components/container';
import { FeedList } from '@components/feed/FeedList';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@components/themed-view';
import { useFeedStore } from '@/store/feed-store';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';

const HEADER_HEIGHT = 100;

export default function HomeScreen() {
    const { posts, loading, fetchFeed, loadMore } = useFeedStore();

    // 실습 6-4: scrollY 선언
    const scrollY = useSharedValue(0);

    // 실습 6-5: headerAnimatedStyle 정의
    const headerAnimatedStyle = useAnimatedStyle(() => {
        const translateY = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT],
            [0, -HEADER_HEIGHT],
            'clamp',
        );
        const opacity = interpolate(
            scrollY.value,
            [0, HEADER_HEIGHT / 2],
            [1, 0],
            'clamp',
        );

        return {
            transform: [{ translateY }],
            opacity,
            height: HEADER_HEIGHT,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            backgroundColor: 'white',
        };
    });

    useEffect(() => {
        fetchFeed();
    }, []);

    return (
        <ThemedView style={{ flex: 1, overflow: 'hidden' }}>
            {/* 실습 6-6: Animated.View + headerAnimatedStyle 적용 */}
            <Animated.View style={headerAnimatedStyle}>
                <ContentContainer isTopElement={true}>
                    <NavigationTop
                        title='MyFeed'
                        icon={'layers'}
                        rightButtons={
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 15,
                                }}
                            >
                                <Ionicons
                                    name='add-outline'
                                    size={24}
                                    color='#262626'
                                />
                            </View>
                        }
                    />
                </ContentContainer>
            </Animated.View>

            {loading && posts.length === 0 ? (
                <ActivityIndicator style={{ flex: 1 }} />
            ) : (
                // 실습 6-7: scrollY 전달
                <View style={{ flex: 1, paddingTop: HEADER_HEIGHT }}>
                    <FeedList
                        posts={posts}
                        onEndReached={loadMore}
                        scrollY={scrollY}
                    />
                </View>
            )}
        </ThemedView>
    );
}
