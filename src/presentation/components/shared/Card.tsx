import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from './design-system';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  onPress?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  variant = 'default',
  onPress,
  icon,
  style,
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    onPress && styles.pressable,
    style,
  ];

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={cardStyle}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {(title || subtitle || icon) && (
        <View style={styles.header}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.headerContent}>
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      )}

      <View style={styles.content}>{children}</View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },

  // Variantes
  default: {
    ...Shadows.sm,
  },
  elevated: {
    ...Shadows.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.lightGray,
    backgroundColor: 'transparent',
  },

  // Estados
  pressable: {
    // Adiciona feedback visual para cards clicáveis
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
    color: Colors.darkGray,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightNormal,
    color: Colors.gray,
  },

  // Content
  content: {
    // Content area
  },
});
