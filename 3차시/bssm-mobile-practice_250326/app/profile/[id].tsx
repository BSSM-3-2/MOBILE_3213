import { useLocalSearchParams } from 'expo-router';
import { Text, StyleSheet } from 'react-native';

import { ThemedView } from '@components/themed-view';
import ProfileFeedList from '@components/profile/feed/ProfileFeedList';
import { MOCK_USERS_MAP } from '@/mock/users';
import MOCK_POSTS from '@/mock/posts';
import { ProfileHeader } from '@components/profile/ProfileHeader';

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();

    const userId = Array.isArray(id) ? id[0] : id;
    const user = userId ? MOCK_USERS_MAP[userId] : undefined;
    const posts = userId ? MOCK_POSTS.filter(post => post.userId === userId) : [];

    if (!user) {
        return (
            <ThemedView style={styles.notFound}>
                <Text style={styles.notFoundText}>유저를 찾을 수 없어요.</Text>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <ProfileFeedList
                posts={posts}
                ListHeaderComponent={
                    <ProfileHeader
                        user={user}
                        userAnalytics={{
                            post: posts.length,
                        }}
                    />
                }
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    notFound: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    notFoundText: {
        fontSize: 16,
        opacity: 0.5,
    },
});
