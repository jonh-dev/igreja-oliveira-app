import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { ButtonTest } from './src/presentation/components/shared/ButtonTest';

export default function App() {
  return (
    <View style={styles.container}>
      <ButtonTest />
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
