import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { TestHarness } from './src/presentation/components/shared/TestHarness';
import { AppMain } from './src/presentation/screens/AppMain';
import { Environment } from './src/config/environment';

export default function App() {
  return (
    <View style={styles.container}>
      {Environment.shouldShowTests() ? <TestHarness /> : <AppMain />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
