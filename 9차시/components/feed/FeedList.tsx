import React, { useCallback } from 'react';
import { FlatList, RefreshControl, View, Text, StyleSheet } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    SharedValue,
} from 'react-native-reanimated';
import { Post } from '@type/Post';
import { SwipeableFeedPost } from './post/SwipeableFeedPost';
import { useFeedStore } from '@/store/feed-store';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Post>);
const ITEM_HEIGHT = 420;

function FeedList({
    posts,
    onEndReached,
    scrollY,
}: {
    posts: Post[];
    onEndReached?: () => void;
    scrollY?: SharedValue<number>;
}) {
    const removePost = useFeedStore(s => s.removePost);
    const fetchFeed = useFeedStore(s => s.fetchFeed);
    const loading = useFeedStore(s => s.loading);

    const scrollHandler = useAnimatedScrollHandler(event => {
        if (scrollY) scrollY.value = event.contentOffset.y;
    });

    const renderItem = useCallback(
        ({ item }: { item: Post }) => (
            <ErrorBoundary
                key={item.id}
                fallback={
                    <View style={postStyles.error}>
                        <Text style={postStyles.errorText}>
                            이 게시물을 표시할 수 없어요.
                        </Text>
                    </View>
                }
            >
                <SwipeableFeedPost post={item} onDelete={removePost} />
            </ErrorBoundary>
        ),
        [removePost],
    );

    return (
        <AnimatedFlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
            })}
            initialNumToRender={5}
            windowSize={5}
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

const postStyles = StyleSheet.create({
    error: {
        paddingVertical: 24,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#efefef',
    },
    errorText: {
        fontSize: 13,
        color: '#c7c7c7',
    },
});

export { FeedList };
