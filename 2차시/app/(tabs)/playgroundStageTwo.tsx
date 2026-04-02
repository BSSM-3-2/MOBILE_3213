import { Image } from 'expo-image';
import {StyleSheet, Text, View} from 'react-native';
import {AvatarSizes, Colors, FeedColors, FontSizes, Spacing} from '@/constants/theme';
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function PlaygroundStageTwoScreen() {
    const inset = useSafeAreaInsets();

    return (
        <View style={[styles.contentContainer, {paddingTop: inset.top + 20}]}>
            <View style={styles.contentPadding}>
                <Text style={[styles.title, {
                    borderColor: Colors.light.text
                }]}>Playground 2</Text>
            </View>
            <View style={[styles.playgroundGap, styles.contentPadding]}>
                <View style={styles.profileHeader}>
                    <Image
                        source={{ uri: "https://i.pravatar.cc/150?img=12" }}
                        style={styles.avatar}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.displayName}>
                            {'애옹이'}
                        </Text>
                        <View style={styles.infoParent}>
                            <View style={styles.infoContainer}>
                                <Text style={styles.infoValue}>
                                    {parseInt("121").toLocaleString()}
                                </Text>
                                <Text style={styles.infoKey}>
                                    posts
                                </Text>
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={styles.infoValue}>
                                    {parseInt("2341").toLocaleString()}
                                </Text>
                                <Text style={styles.infoKey}>
                                    followers
                                </Text>
                            </View>
                            <View style={styles.infoContainer}>
                                <Text style={styles.infoValue}>
                                    {parseInt("324").toLocaleString()}
                                </Text>
                                <Text style={styles.infoKey}>
                                    following
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contentPadding: {
        paddingHorizontal: 16
    },
    contentContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    playgroundGap: {
        marginTop: Spacing.xxl,
        gap: Spacing.lg,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
    },
    profileInfo: {
        flex: 1,
        gap: Spacing.sm,
    },
    profileMeta: {
        gap: Spacing.xs,
    },
    title: {
        fontSize: 24,
        paddingBottom: 20,
        fontWeight: 'bold',
        borderBottomWidth: 1,
    },
    infoParent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    infoContainer: {
        flex: 1,
        alignItems: 'center',
        gap: 2,
    },
    infoKey: {
        fontSize: FontSizes.sm,
        lineHeight: FontSizes.sm + 2,
        fontWeight: '400',
        color: '#8E8E8E',
    },
    infoValue: {
        fontSize: FontSizes.md,
        lineHeight: FontSizes.lg + 2,
        fontWeight: '700',
    },
    avatar: {
        width: AvatarSizes.xl,
        height: AvatarSizes.xl,
        borderRadius: AvatarSizes.xl / 2,
    },
    displayName: {
        fontSize: FontSizes.md,
        fontWeight: '700',
        color: FeedColors.primaryText,
    },
    username: {
        fontSize: FontSizes.sm,
        color: '#8E8E8E',
    },
    bio: {
        fontSize: FontSizes.sm,
        color: FeedColors.primaryText,
        lineHeight: FontSizes.sm + 4,
    },
});
