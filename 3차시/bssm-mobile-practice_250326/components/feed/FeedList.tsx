import { FlatList, StyleSheet } from 'react-native';
import { Post } from '@type/Post';
import { FeedPost } from './post/FeedPost';

function FeedList({ posts }: { posts: Post[] }) {
    return (
        <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <FeedPost post={item} />}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    contentContainer: {
        paddingTop: 8,
        paddingBottom: 32,
    },
});

export { FeedList };
