import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Pretendard } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { ErrorBoundary } from '@components/ErrorBoundary';

function TabFallback() {
    return (
        <View style={styles.container}>
            <Ionicons name='warning-outline' size={40} color='#8e8e8e' />
            <Text style={styles.text}>탭을 불러오지 못했습니다</Text>
        </View>
    );
}

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <ErrorBoundary fallback={<TabFallback />}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                    headerShown: false,
                    tabBarButton: HapticTab,
                }}
            >
                <Tabs.Screen
                    name='index'
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color }) => (
                            <IconSymbol
                                size={28}
                                name='house.fill'
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name='profile'
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color }) => (
                            <Ionicons
                                name='person-circle-outline'
                                size={26}
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    text: {
        fontSize: 15,
        fontFamily: Pretendard.medium,
        color: '#8e8e8e',
    },
});
