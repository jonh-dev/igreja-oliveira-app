import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from './design-system';

export const DesignSystemTest: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Design System Test</Text>
      
      <View style={styles.colorTest}>
        <View style={[styles.colorBox, { backgroundColor: Colors.primary }]}>
          <Text style={styles.colorText}>Primary</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: Colors.secondary }]}>
          <Text style={styles.colorText}>Secondary</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: Colors.accent }]}>
          <Text style={styles.colorText}>Accent</Text>
        </View>
      </View>
      
      <View style={styles.typographyTest}>
        <Text style={styles.textXs}>Text XS - {Typography.fontSizeXs}px</Text>
        <Text style={styles.textSm}>Text SM - {Typography.fontSizeSm}px</Text>
        <Text style={styles.textBase}>Text Base - {Typography.fontSizeBase}px</Text>
        <Text style={styles.textLg}>Text LG - {Typography.fontSizeLg}px</Text>
      </View>
      
      <View style={styles.spacingTest}>
        <View style={[styles.spacingBox, { margin: Spacing.xs }]}>
          <Text>Spacing XS</Text>
        </View>
        <View style={[styles.spacingBox, { margin: Spacing.sm }]}>
          <Text>Spacing SM</Text>
        </View>
        <View style={[styles.spacingBox, { margin: Spacing.md }]}>
          <Text>Spacing MD</Text>
        </View>
      </View>
    </View>
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
  colorTest: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  colorBox: {
    width: 80,
    height: 60,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  colorText: {
    color: Colors.white,
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
  },
  typographyTest: {
    marginBottom: Spacing.lg,
  },
  textXs: {
    fontSize: Typography.fontSizeXs,
    color: Colors.gray,
    marginBottom: Spacing.xs,
  },
  textSm: {
    fontSize: Typography.fontSizeSm,
    color: Colors.gray,
    marginBottom: Spacing.xs,
  },
  textBase: {
    fontSize: Typography.fontSizeBase,
    color: Colors.darkGray,
    marginBottom: Spacing.xs,
  },
  textLg: {
    fontSize: Typography.fontSizeLg,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  spacingTest: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  spacingBox: {
    backgroundColor: Colors.lightGray,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    ...Shadows.sm,
  },
}); 