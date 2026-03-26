import { Dimensions, FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { Post } from '@type/Post';
import { Image } from 'expo-image';
import { resolveImageSource } from '@/utils/image';
import { Grid } from '@/constants/theme';
import { ReactElement } from 'react';
import { ThemedText } from '@components/themed-text';
import { ThemedView } from '@components/themed-view';

const { width } = Dimensions.get('window');
const ITEM_SIZE =
    (width - Grid.gap * (Grid.profileColumnCount - 1)) /
    Grid.profileColumnCount;

type Props = {
    posts: Post[];
    ListHeaderComponent?: ReactElement | null;
};

export default function ProfileFeedList({
    posts,
    ListHeaderComponent = null,
}: Props) {
    const renderItem: ListRenderItem<Post> = ({ item }) => (
        <Image
            style={styles.image}
            contentFit={'cover'}
            source={resolveImageSource(item.images[0])}
        />
    );

    return (
        <FlatList
            data={posts}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            numColumns={Grid.profileColumnCount}
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={
                <ThemedView style={styles.emptyState}>
                    <ThemedText style={styles.emptyText}>
                        아직 올린 게시물이 없어요.
                    </ThemedText>
                </ThemedView>
            }
        />
    );
}

const styles = StyleSheet.create({
    image: {
        height: ITEM_SIZE * Grid.profileImageRatio,
        width: ITEM_SIZE,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 40,
        gap: Grid.gap,
    },
    row: {
        gap: Grid.gap,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        opacity: 0.5,
    },
});
