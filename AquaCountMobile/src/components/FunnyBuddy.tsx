import React, { useEffect, useState, useRef } from 'react';
import { View, Animated, PanGestureHandler, State } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface FunnyBuddyProps {
  size?: 'small' | 'medium' | 'large';
  expression?: 'happy' | 'sleepy' | 'excited' | 'wink' | 'love' | 'thirsty' | 'confused' | 'determined' | 'sad';
  activity?: 'idle' | 'dancing' | 'jumping' | 'floating' | 'celebrating' | 'wiggling' | 'spinning' | 'waving';
  waterLevel?: number;
  isDraggable?: boolean;
  onPositionChange?: (x: number, y: number) => void;
  onClick?: () => void;
  onBuddyClick?: () => void;
}

export default function FunnyBuddy({
  size = 'medium',
  expression = 'happy',
  activity = 'idle',
  waterLevel = 50,
  isDraggable = false,
  onPositionChange,
  onClick,
  onBuddyClick,
}: FunnyBuddyProps) {
  const [clickActivityOverride, setClickActivityOverride] = useState<string | null>(null);
  const [clickExpressionOverride, setClickExpressionOverride] = useState<string | null>(null);
  const [eyeBlink, setEyeBlink] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const sizeValues = {
    small: { width: 48, height: 64 },
    medium: { width: 80, height: 104 },
    large: { width: 128, height: 160 },
  };

  const expressionsMap = {
    happy: { eyes: '😊', mouth: '^_^' },
    sleepy: { eyes: '😴', mouth: 'zzz' },
    excited: { eyes: '✨', mouth: 'WOW!' },
    wink: { eyes: '😉', mouth: '~' },
    love: { eyes: '♥', mouth: '♥' },
    thirsty: { eyes: '🥺', mouth: 'H2O?' },
    confused: { eyes: 'perplexed', mouth: '?' },
    determined: { eyes: '💪', mouth: '!' },
    sad: { eyes: '😢', mouth: 'o.o' },
  };

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Animation effects
  useEffect(() => {
    const currentActivity = clickActivityOverride || activity;
    
    switch (currentActivity) {
      case 'dancing':
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.1, duration: 300, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
          ])
        ).start();
        break;
      case 'jumping':
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, { toValue: -10, duration: 200, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
          ])
        ).start();
        break;
      case 'floating':
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, { toValue: -5, duration: 2000, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 5, duration: 2000, useNativeDriver: true }),
          ])
        ).start();
        break;
      case 'spinning':
        Animated.loop(
          Animated.timing(rotateAnim, { toValue: 1, duration: 2000, useNativeDriver: true })
        ).start();
        break;
    }
  }, [activity, clickActivityOverride]);

  const handleClick = () => {
    if (onClick) onClick();
    if (onBuddyClick) onBuddyClick();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setClickActivityOverride('jumping');
    setClickExpressionOverride('excited');
    
    setTimeout(() => {
      setClickActivityOverride(null);
      setClickExpressionOverride(null);
    }, 800);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, translationY } = event.nativeEvent;
      onPositionChange?.(translationX, translationY);
    }
  };

  const getBuddyColors = () => {
    const fillPercentage = Math.min(waterLevel, 100);
    if (fillPercentage > 80) return ['#BFDBFE', '#60A5FA'];
    if (fillPercentage > 50) return ['#DBEAFE', '#93C5FD'];
    if (fillPercentage > 20) return ['#EFF6FF', '#BFDBFE'];
    return ['#F3F4F6', '#DBEAFE'];
  };

  const currentExpression = clickExpressionOverride || expression;
  const buddySize = sizeValues[size];
  const colors = getBuddyColors();

  const BuddyContent = (
    <Animated.View
      style={{
        width: buddySize.width,
        height: buddySize.height,
        transform: [
          { translateX },
          { translateY },
          { scale: scaleAnim },
          { rotate: rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
          }) }
        ],
      }}
    >
      <LinearGradient
        colors={colors}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: buddySize.width * 0.6,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Water level indicator */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${waterLevel}%`,
            backgroundColor: '#60A5FA',
            borderRadius: buddySize.width * 0.6,
          }}
        />

        {/* Face */}
        <View style={{ alignItems: 'center', zIndex: 10 }}>
          {/* Eyes */}
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <View
              style={{
                width: 12,
                height: eyeBlink ? 4 : 12,
                backgroundColor: 'white',
                borderRadius: 6,
                marginHorizontal: 4,
                borderWidth: 1,
                borderColor: '#93C5FD',
              }}
            />
            <View
              style={{
                width: 12,
                height: eyeBlink ? 4 : 12,
                backgroundColor: 'white',
                borderRadius: 6,
                marginHorizontal: 4,
                borderWidth: 1,
                borderColor: '#93C5FD',
              }}
            />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  if (isDraggable) {
    return (
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View>
          {BuddyContent}
        </Animated.View>
      </PanGestureHandler>
    );
  }

  return (
    <Animated.View onTouchEnd={handleClick}>
      {BuddyContent}
    </Animated.View>
  );
}