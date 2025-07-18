import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { DesignSystemTest } from './src/presentation/components/shared/DesignSystemTest';

export default function App() {
  return (
    <View style={styles.container}>
      <DesignSystemTest />
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
