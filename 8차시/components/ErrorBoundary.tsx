import React, { Component, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { Pretendard } from '@/constants/theme';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo): void {
        Sentry.captureException(error, {
            extra: { componentStack: info.componentStack ?? '' },
        });
    }

    reset = () => this.setState({ hasError: false, error: null });

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <View style={styles.container}>
                    <Text style={styles.title}>문제가 발생했습니다</Text>
                    <Text style={styles.message}>
                        {this.state.error?.message ?? '알 수 없는 오류'}
                    </Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={this.reset}
                    >
                        <Text style={styles.buttonText}>다시 시도</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    title: {
        fontSize: 17,
        fontFamily: Pretendard.semiBold,
        color: '#262626',
    },
    message: {
        fontSize: 13,
        fontFamily: Pretendard.regular,
        color: '#8e8e8e',
        textAlign: 'center',
    },
    button: {
        marginTop: 8,
        paddingHorizontal: 24,
        paddingVertical: 10,
        backgroundColor: '#0a7ea4',
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 15,
        fontFamily: Pretendard.medium,
        color: '#fff',
    },
});
