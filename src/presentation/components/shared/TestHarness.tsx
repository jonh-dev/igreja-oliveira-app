import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { DesignSystemTest } from './DesignSystemTest';
import { ButtonTest } from './ButtonTest';
import { InputTest } from './InputTest';
import { CardTest } from './CardTest';
import { NavigationStrategyTest } from './NavigationStrategyTest';
import { AuthScreensTest } from './AuthScreensTest';
import { Colors, Typography, Spacing } from './design-system';

type TestComponent = 'design-system' | 'button' | 'input' | 'card' | 'navigation' | 'auth-screens';

export const TestHarness: React.FC = () => {
  const [currentTest, setCurrentTest] = useState<TestComponent>('card');

  const tests = [
    { id: 'design-system' as TestComponent, name: 'Design System', component: DesignSystemTest },
    { id: 'button' as TestComponent, name: 'Button Component', component: ButtonTest },
    { id: 'input' as TestComponent, name: 'Input Component', component: InputTest },
    { id: 'card' as TestComponent, name: 'Card Component', component: CardTest },
    { id: 'navigation' as TestComponent, name: 'Navigation Strategy', component: NavigationStrategyTest },
    { id: 'auth-screens' as TestComponent, name: 'Auth Screens', component: AuthScreensTest },
  ];

  const CurrentTestComponent = tests.find(test => test.id === currentTest)?.component || CardTest;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Test Harness - Igreja Oliveira App</Text>
        <Text style={styles.subtitle}>Selecione um componente para testar</Text>
      </View>
      
      <View style={styles.navigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tests.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={[
                styles.navButton,
                currentTest === test.id && styles.navButtonActive
              ]}
              onPress={() => setCurrentTest(test.id)}
            >
              <Text style={[
                styles.navButtonText,
                currentTest === test.id && styles.navButtonTextActive
              ]}>
                {test.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.content}>
        <CurrentTestComponent />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    ...Platform.select({
      ios: { paddingTop: 60 },
      android: { paddingTop: 40 },
    }),
  },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    textAlign: 'center',
  },
  navigation: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  navButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.xs,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
  },
  navButtonActive: {
    backgroundColor: Colors.primary,
  },
  navButtonText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: Colors.gray,
  },
  navButtonTextActive: {
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
}); 