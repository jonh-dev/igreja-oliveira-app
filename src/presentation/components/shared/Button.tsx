import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from './design-system';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyleCombined = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];

  const getLoadingColor = () => {
    switch (variant) {
      case 'outline':
        return Colors.primary;
      case 'secondary':
        return Colors.white;
      case 'danger':
        return Colors.white;
      default:
        return Colors.white;
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            color={getLoadingColor()}
            size="small"
            style={styles.loadingIndicator}
          />
          <Text style={[textStyleCombined, styles.loadingText]}>{title}</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={textStyleCombined}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    elevation: 2,
  },

  // Variantes
  primary: {
    backgroundColor: Colors.primary,
    borderWidth: 0,
    ...Shadows.sm,
  },
  secondary: {
    backgroundColor: Colors.secondary,
    borderWidth: 0,
    ...Shadows.sm,
  },
  danger: {
    backgroundColor: Colors.danger,
    borderWidth: 0,
    ...Shadows.sm,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    elevation: 0,
  },

  // Tamanhos
  small: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    minHeight: 56,
  },

  // Estados
  disabled: {
    opacity: 0.5,
  },

  // Textos por variante
  primaryText: {
    color: Colors.white,
    fontWeight: Typography.fontWeightSemibold,
  },
  secondaryText: {
    color: Colors.white,
    fontWeight: Typography.fontWeightSemibold,
  },
  dangerText: {
    color: Colors.white,
    fontWeight: Typography.fontWeightSemibold,
  },
  outlineText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemibold,
  },

  // Textos por tamanho
  smallText: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
  },
  mediumText: {
    fontSize: Typography.fontSizeBase,
    fontWeight: Typography.fontWeightMedium,
  },
  largeText: {
    fontSize: Typography.fontSizeLg,
    fontWeight: Typography.fontWeightSemibold,
  },

  // Estados de texto
  disabledText: {
    opacity: 0.7,
  },

  // Texto base
  text: {
    textAlign: 'center',
  },

  // Containers para loading e conteúdo
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  loadingIndicator: {
    marginRight: Spacing.sm,
  },
  loadingText: {
    opacity: 0.8,
  },
});
