import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { InputTest } from './src/presentation/components/shared/InputTest';

export default function App() {
  return (
    <View style={styles.container}>
      <InputTest />
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
