import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { CardTest } from './src/presentation/components/shared/CardTest';

export default function App() {
  return (
    <View style={styles.container}>
      <CardTest />
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
