import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

// Keep the app directory explicit so Metro doesn't have to derive the entry
// from package.json "main" via expo-router/entry.
export function App() {
    const ctx = require.context('./app');

    return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
