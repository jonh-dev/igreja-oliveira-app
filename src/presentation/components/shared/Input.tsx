import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from './design-system';

export interface InputProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'cpf' | 'phone' | 'cep';
  error?: string;
  required?: boolean;
  mask?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  type = 'text',
  error,
  required = false,
  mask,
  style,
  textStyle,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    textInputProps.onFocus?.(textInputProps.onFocus as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    textInputProps.onBlur?.(textInputProps.onBlur as any);
  };

  const applyMask = (text: string) => {
    const cleanText = text.replace(/\D/g, '');
    
    if (type === 'cep') {
      if (cleanText.length <= 5) {
        return cleanText;
      }
      return `${cleanText.slice(0, 5)}-${cleanText.slice(5, 8)}`;
    }
    
    if (!mask) return text;
    
    let maskedText = '';
    let textIndex = 0;
    
    for (let i = 0; i < mask.length && textIndex < text.length; i++) {
      if (mask[i] === '#') {
        maskedText += text[textIndex];
        textIndex++;
      } else {
        maskedText += mask[i];
      }
    }
    
    return maskedText;
  };

  const handleChangeText = (text: string) => {
    const maskedText = applyMask(text);
    onChangeText(maskedText);
  };

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'cpf':
      case 'cep':
        return 'numeric';
      default:
        return 'default';
    }
  };

  const getAutoCapitalize = () => {
    switch (type) {
      case 'email':
        return 'none';
      default:
        return 'sentences';
    }
  };

  const getSecureTextEntry = () => {
    if (type === 'password') {
      return !isPasswordVisible;
    }
    return false;
  };

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  const containerStyle = [
    styles.container,
    isFocused && styles.focused,
    error && styles.error,
    style,
  ];

  const inputStyle = [
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    textStyle,
  ];

  return (
    <View style={containerStyle}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[inputStyle, type === 'password' && styles.passwordInput]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          secureTextEntry={getSecureTextEntry()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
        
        {type === 'password' && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeText}>
              {isPasswordVisible ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    position: 'relative',
  },
  label: {
    fontSize: Typography.fontSizeSm,
    fontWeight: Typography.fontWeightMedium,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    fontSize: Typography.fontSizeBase,
    color: Colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    ...Shadows.sm,
    minHeight: 44,
  },
  inputFocused: {
    borderColor: Colors.secondary,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    ...Shadows.md,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    fontSize: Typography.fontSizeSm,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  focused: {
    // Container focus state if needed
  },
  error: {
    // Container error state if needed
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
  },
  eyeText: {
    fontSize: 16,
  },
}); 