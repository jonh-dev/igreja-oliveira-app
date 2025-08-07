import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import { Colors } from './design-system';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'dark';
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  variant = 'primary',
}) => {
  const getGradientStyle = () => {
    return {
      backgroundColor: Colors.primary,
    };
  };

  return (
    <View style={[styles.container, getGradientStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});