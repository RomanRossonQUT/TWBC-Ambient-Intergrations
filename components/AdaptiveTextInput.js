import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, Animated } from 'react-native';

const AdaptiveTextInput = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  returnKeyType = 'done',
  error = false,
  style,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!hasValue) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleTextChange = (text) => {
    setHasValue(text.length > 0);
    onChangeText(text);
  };

  // Initialize hasValue based on initial value
  useEffect(() => {
    const hasContent = value && value.length > 0;
    setHasValue(hasContent);
    
    // If there's content, animate the label up immediately
    if (hasContent) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 0, // Instant animation for initial state
        useNativeDriver: false,
      }).start();
    }
  }, [value, animatedValue]);

  const labelTranslateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const labelScale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.85],
  });

  const borderColor = isFocused ? '#ed469a' : error ? '#d32f2f' : '#ccc';
  const labelColor = isFocused ? '#ed469a' : '#898989';

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={[
          styles.input,
          { borderColor },
        ]}
        value={value}
        onChangeText={handleTextChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        returnKeyType={returnKeyType}
        {...props}
      />
      <Animated.Text
        style={[
          styles.label,
          {
            transform: [
              { translateY: labelTranslateY },
              { scale: labelScale },
            ],
            color: labelColor,
          },
        ]}
      >
        {placeholder}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    height: 70,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    fontSize: 16,
    backgroundColor: '#fff',
    fontFamily: 'Roboto',
    fontWeight: '400',
  },
  label: {
    position: 'absolute',
    left: 20,
    top: 25,
    fontSize: 14,
    fontFamily: 'Roboto',
    fontWeight: '400',
    zIndex: 1,
  },
});

export default AdaptiveTextInput;
