import React from 'react';
import {
    Pressable,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '../constants';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    loading = 'false',
    disabled = 'false',
    style,
}) => {
    const buttonStyles = [
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        disabled && styles.disabledText,
        style,
    ];

    const textStyles = [
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        disabled && styles.disabledText,
    ];
    
    return (
        <Pressable
        style={buttonStyles}
        onPress={onPress}
        disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator
                color={variant === 'outline' ? Colors.primary : Colors.textOnPrimary}
                />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xxl,
        borderRadius: Spacing.borderRadius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48, 
    },

    primaryButton: {
        backgroundColor: Colors.primary,
    },
    primaryText: {
        ...Typography.button,
        color: Colors.textOnPrimary,
    },
    secondaryButton: {
        backgroundColor: Colors.primaryLight + '20',
    },
    secondaryText: {
        ...Typography.button,
        color: Colors.primary,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.primary,
    },
    outlineText: {
        ...Typography.button,
        color: Colors.primary,
    },
    disabledButton: {
        backgroundColor: Colors.border,
    },
    disabledText: {
        ...Typography.button,
        color: Colors.textSecondary,
    },
    text: {
        ...Typography.button,
    },
});

export default Button;