import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Post } from '@type/Post';
import { FeedPost } from './FeedPost';
import * as Haptics from 'expo-haptics';

const DELETE_AREA_WIDTH = 80;
const DELETE_THRESHOLD = -60;

function SwipeableFeedPost({
    post,
    onDelete,
}: {
    post: Post;
    onDelete: (id: string) => void;
}) {
    // 실습 4-1: translateX 선언
    const translateX = useSharedValue(0);
    // 실습 5-1: cardScale 선언
    const cardScale = useSharedValue(1);

    // 실습 4-2: panGesture 정의 (강사 정답 기반 개선)
    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate(e => {
            // 범위를 0 ~ -DELETE_AREA_WIDTH 사이로 제한
            translateX.value = Math.min(
                0,
                Math.max(e.translationX, -DELETE_AREA_WIDTH),
            );
        })
        .onEnd(e => {
            if (e.translationX < DELETE_THRESHOLD) {
                // 임계값보다 많이 밀면 삭제 영역 고정
                translateX.value = withTiming(-DELETE_AREA_WIDTH);
            } else {
                // 아니면 다시 복귀
                translateX.value = withTiming(0);
            }
        });

    // 실습 5-2: longPressGesture 정의 (강사 정답 기반 개선)
    const longPressGesture = Gesture.LongPress()
        .minDuration(400)
        .onStart(() => {
            cardScale.value = withSpring(0.96, { damping: 8 });
            runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        })
        .onFinalize(() => {
            cardScale.value = withSpring(1, { damping: 8 });
        });

    // 실습 5-3: Gesture.Race로 합성 (롱프레스와 팬이 경쟁)
    const composedGesture = Gesture.Race(longPressGesture, panGesture);

    // 실습 4-3 & 5-1: animatedStyle 정의
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: cardScale.value },
        ],
    }));

    // 실습 4-4: handleDeletePress 작성
    const handleDeletePress = () => {
        translateX.value = withTiming(-400, { duration: 200 }, () => {
            runOnJS(onDelete)(post.id);
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.deleteArea}>
                <TouchableOpacity
                    onPress={handleDeletePress}
                    style={styles.deleteButton}
                >
                    <Ionicons name='trash-outline' size={24} color='white' />
                </TouchableOpacity>
            </View>

            <GestureDetector gesture={composedGesture}>
                <Animated.View style={[styles.card, animatedStyle]}>
                    <FeedPost post={post} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#ED4956', // 삭제 영역 배경색 노출 대비
    },
    card: {
        backgroundColor: 'white',
    },
    deleteArea: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: DELETE_AREA_WIDTH,
        backgroundColor: '#ED4956',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
});

export { SwipeableFeedPost };
