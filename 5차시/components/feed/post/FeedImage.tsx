import { Image, ImageLoadEventData } from 'expo-image';
import { Dimensions, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_SCALE = 3;

export default function FeedImage({
    image,
    onDoubleTap,
}: {
    image: ImageSourcePropType;
    onDoubleTap?: () => void;
}) {
    const [imageHeight, setImageHeight] = useState(SCREEN_WIDTH);

    // 실습 2-1: scale, savedScale 선언
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    // 실습 3-1: heartOpacity, heartScale 선언
    const heartOpacity = useSharedValue(0);
    const heartScale = useSharedValue(0);

    // 실습 2-2: pinchGesture 정의 (강사 정답 기반 개선)
    const pinchGesture = Gesture.Pinch()
        .onUpdate(e => {
            // 제스처 도중에도 1배 미만으로 작아지지 않도록 방어
            scale.value = Math.max(
                1,
                Math.min(savedScale.value * e.scale, MAX_SCALE),
            );
        })
        .onEnd(() => {
            savedScale.value = scale.value;
            if (scale.value <= 1) {
                scale.value = withSpring(1);
                savedScale.value = 1;
            }
        });

    // 실습 3-2: doubleTapGesture 정의 (강사 정답 기반 개선)
    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            // 하트 투명도 애니메이션
            heartOpacity.value = withSequence(
                withTiming(1),
                withTiming(0),
            );
            // 하트 크기 애니메이션
            heartScale.value = withSequence(
                withSpring(1.2),
                withSpring(1),
            );

            // 실제 좋아요 처리 (JS 스레드에서 실행)
            if (onDoubleTap) {
                runOnJS(onDoubleTap)();
            }
        });

    // 실습 3-3: Gesture.Simultaneous로 합성
    const composedGesture = Gesture.Simultaneous(
        pinchGesture,
        doubleTapGesture,
    );

    // 실습 2-3: imageAnimatedStyle 정의
    const imageAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // 실습 3-4: heartAnimatedStyle 정의
    const heartAnimatedStyle = useAnimatedStyle(() => ({
        opacity: heartOpacity.value,
        transform: [{ scale: heartScale.value }],
    }));

    const handleImageLoad = (e: ImageLoadEventData) => {
        const { width, height } = e.source;
        const ratio = height / width;
        setImageHeight(SCREEN_WIDTH * ratio);
    };

    return (
        // 실습 2-4: GestureDetector + Animated.View 적용
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={{ overflow: 'hidden' }}>
                <Animated.View style={imageAnimatedStyle}>
                    <Image
                        source={image}
                        style={{ width: SCREEN_WIDTH, height: imageHeight }}
                        onLoad={handleImageLoad}
                    />
                </Animated.View>

                {/* 실습 3-5: 하트 오버레이 추가 */}
                <Animated.View
                    style={[styles.heartOverlay, heartAnimatedStyle]}
                    pointerEvents='none'
                >
                    <Ionicons name='heart' size={100} color='white' />
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    heartOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
