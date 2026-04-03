
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TextInputProps,
} from 'react-native';
import { Colors, Typography, Spacing } from '../constants';

interface InputProps extends TextInputProps {
    label: string;
    error?: string; 
}

const Input: React.FC<InputProps> = ({ label, error, style, ...rest }) => {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            
            <TextInput
                style={[
                    styles.input,
                    isFocused && styles.inputFocused,
                    error ? styles.inputError : null,
                    style,
                ]}
                placeholderTextColor={Colors.textSecondary}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...rest}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: Spacing.lg, },
    label: {
        ...Typography.body,
        fontWeight: '500',
        marginBottom: Spacing.xs,
        color: Colors.textPrimary,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Spacing.borderRadius.sm,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        fontSize: 16,
        color: Colors.textPrimary,
    },
    inputFocused: {
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    inputError: {
        borderColor: Colors.error,
        borderWidth: 2,
    },
    errorText: {
        color: Colors.error,
        fontSize: 13,
        marginTop: Spacing.xs,
    },
});

export default Input;