import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ThemedText } from '@components/themed-text';
import { FeedColors, Spacing } from '@/constants/theme';
import { ThemedView } from '@components/themed-view';
import { useFeedStore } from '@/store/feed-store';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

function FeedPostActions({
    postId,
    initialLikes,
    initialLiked = false,
    commentCount = 0,
}: {
    postId: string;
    initialLikes: number;
    initialLiked?: boolean;
    commentCount?: number;
}) {
    const [saved, setSaved] = useState(false);
    const { posts, toggleLike } = useFeedStore();

    const post = posts.find(p => p.id === postId);
    const liked = post?.liked ?? initialLiked;
    const likeCount = post?.likes ?? initialLikes;

    // 실습 1-1: heartScale 선언
    const heartScale = useSharedValue(1);

    // 실습 1-2: heartAnimatedStyle 정의
    const heartAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: heartScale.value }],
    }));

    const handleLike = () => {
        // 실습 1-3: 하트 애니메이션 실행 (강사 정답 기반 개선)
        toggleLike(postId);
        heartScale.value = withSequence(
            withSpring(1.4, { damping: 3, stiffness: 300 }),
            withSpring(1, { damping: 5, stiffness: 200 }),
        );
    };

    const handleSave = () => setSaved(prev => !prev);

    return (
        <ThemedView style={styles.actions}>
            <ThemedView style={styles.leftActions}>
                <TouchableOpacity
                    onPress={handleLike}
                    style={[styles.actionButton, styles.row]}
                >
                    {/* 실습 1-4: Animated.View + heartAnimatedStyle 적용 */}
                    <Animated.View style={heartAnimatedStyle}>
                        <Ionicons
                            name={liked ? 'heart' : 'heart-outline'}
                            size={26}
                            color={
                                liked
                                    ? FeedColors.likeActive
                                    : FeedColors.primaryText
                            }
                        />
                    </Animated.View>
                    <ThemedText style={styles.countText}>
                        {likeCount.toLocaleString()}
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.row]}>
                    <Ionicons
                        name='chatbubble-outline'
                        size={24}
                        color={FeedColors.primaryText}
                    />
                    <ThemedText style={styles.countText}>
                        {commentCount.toLocaleString()}
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons
                        name='paper-plane-outline'
                        size={24}
                        color={FeedColors.primaryText}
                    />
                </TouchableOpacity>
            </ThemedView>

            <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                <Ionicons
                    name={saved ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color={FeedColors.primaryText}
                />
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.md,
    },
    leftActions: {
        flexDirection: 'row',
        gap: Spacing.lg,
    },
    actionButton: {
        padding: 2,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.xs,
        alignItems: 'center',
    },
    countText: {
        fontWeight: '600',
    },
});

export { FeedPostActions };
