import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from './Button';
import { Colors, Spacing, Typography } from './design-system';

export const ButtonTest: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handlePress = () => {
    console.log('Button pressed!');
  };

  const handleLoadingPress = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Button Component Test</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Variantes</Text>
        
        <View style={styles.buttonRow}>
          <Button title="Primary" onPress={handlePress} variant="primary" />
          <Button title="Secondary" onPress={handlePress} variant="secondary" />
        </View>
        
        <View style={styles.buttonRow}>
          <Button title="Danger" onPress={handlePress} variant="danger" />
          <Button title="Outline" onPress={handlePress} variant="outline" />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tamanhos</Text>
        
        <View style={styles.buttonRow}>
          <Button title="Small" onPress={handlePress} size="small" />
          <Button title="Medium" onPress={handlePress} size="medium" />
          <Button title="Large" onPress={handlePress} size="large" />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estados</Text>
        
        <View style={styles.buttonRow}>
          <Button title="Loading" onPress={handleLoadingPress} loading={loading} />
          <Button title="Disabled" onPress={handlePress} disabled />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Combinações</Text>
        
        <View style={styles.buttonRow}>
          <Button 
            title="Primary Large" 
            onPress={handlePress} 
            variant="primary" 
            size="large" 
          />
        </View>
        
        <View style={styles.buttonRow}>
          <Button 
            title="Danger Small" 
            onPress={handlePress} 
            variant="danger" 
            size="small" 
          />
        </View>
        
        <View style={styles.buttonRow}>
          <Button 
            title="Outline Medium" 
            onPress={handlePress} 
            variant="outline" 
            size="medium" 
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: Typography.fontSize2xl,
    fontWeight: Typography.fontWeightBold,
    color: Colors.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.darkGray,
    marginBottom: Spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
}); 