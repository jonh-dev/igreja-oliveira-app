import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows } from './design-system';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 'medium',
}) => {
  const getIntensityStyle = () => {
    const intensityStyles = {
      light: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      medium: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      strong: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
    };

    return intensityStyles[intensity];
  };

  return (
    <View style={[styles.container, getIntensityStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    ...Shadows.glass,
  },
});
