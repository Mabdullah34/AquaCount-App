import React, { useEffect, useState, useRef } from 'react';
import { View, Animated, PanGestureHandler, State } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface PremiumBuddyProps {
  size?: 'small' | 'medium' | 'large';
  expression?: 'happy' | 'sleepy' | 'excited' | 'wink' | 'love' | 'thirsty' | 'confused' | 'determined' | 'sad';
  activity?: 'idle' | 'dancing' | 'jumping' | 'floating' | 'celebrating' | 'wiggling' | 'flying' | 'spinning' | 'waving';
  waterLevel?: number;
  isDraggable?: boolean;
  onPositionChange?: (x: number, y: number) => void;
  onClick?: () => void;
  onBuddyClick?: () => void;
}

export default function PremiumBuddy({
  size = 'medium',
  expression = 'happy',
  activity = 'idle',
  waterLevel = 50,
  isDraggable = true,
  onPositionChange,
  onClick,
  onBuddyClick,
}: PremiumBuddyProps) {
  const [clickActivityOverride, setClickActivityOverride] = useState<string | null>(null);
  const [clickExpressionOverride, setClickExpressionOverride] = useState<string | null>(null);
  const [eyeBlink, setEyeBlink] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const sizeValues = {
    small: { width: 64, height: 80 },
    medium: { width: 96, height: 120 },
    large: { width: 128, height: 160 },
  };

  const expressionsMap = {
    happy: '✨',
    sleepy: '😴',
    excited: '🌟',
    wink: '😉',
    love: '💛',
    thirsty: '💧',
    confused: '🌀',
    determined: '🚀',
    sad: '💔',
  };

  // Generate golden sparkles
  useEffect(() => {
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 120,
      y: Math.random() * 120,
      delay: Math.random() * 3,
    }));
    setSparkles(newSparkles);

    const interval = setInterval(() => {
      setSparkles(prev =>
        prev.map(sparkle => ({
          ...sparkle,
          x: Math.random() * 120,
          y: Math.random() * 120,
          delay: Math.random() * 3,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
    }, 2000 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Premium glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
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
      case 'flying':
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, { toValue: -15, duration: 1000, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ])
        ).start();
        break;
      case 'floating':
        Animated.loop(
          Animated.sequence([
            Animated.timing(translateY, { toValue: -8, duration: 2000, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 8, duration: 2000, useNativeDriver: true }),
          ])
        ).start();
        break;
    }
  }, [activity, clickActivityOverride]);

  const handleClick = () => {
    if (onClick) onClick();
    if (onBuddyClick) onBuddyClick();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setClickActivityOverride('flying');
    setClickExpressionOverride('love');
    
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
    if (fillPercentage > 80) return ['#FDE68A', '#F59E0B'];
    if (fillPercentage > 50) return ['#FEF3C7', '#FBBF24'];
    if (fillPercentage > 20) return ['#FFFBEB', '#FDE68A'];
    return ['#F3F4F6', '#FEF3C7'];
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
        ],
      }}
    >
      {/* Golden sparkles */}
      {sparkles.map((sparkle) => (
        <Animated.View
          key={sparkle.id}
          style={{
            position: 'absolute',
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: 4,
            height: 4,
            backgroundColor: '#FBBF24',
            borderRadius: 2,
            opacity: glowAnim,
          }}
        />
      ))}

      {/* Premium golden aura */}
      <Animated.View
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: buddySize.width * 0.6,
          backgroundColor: '#FEF3C7',
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.2, 0.5]
          }),
        }}
      />

      <LinearGradient
        colors={colors}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: buddySize.width * 0.6,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          borderWidth: 2,
          borderColor: '#FBBF24',
        }}
      >
        {/* Water level indicator with golden tint */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: `${waterLevel}%`,
            backgroundColor: '#F59E0B',
            borderRadius: buddySize.width * 0.6,
          }}
        />

        {/* Premium crown */}
        <View
          style={{
            position: 'absolute',
            top: -12,
            width: 24,
            height: 16,
            backgroundColor: '#F59E0B',
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          }}
        />

        {/* Face with premium expressions */}
        <View style={{ alignItems: 'center', zIndex: 10 }}>
          {/* Enhanced eyes with golden pupils */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <View
              style={{
                width: 16,
                height: eyeBlink ? 4 : 16,
                backgroundColor: 'white',
                borderRadius: 8,
                marginHorizontal: 4,
                borderWidth: 2,
                borderColor: '#FBBF24',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {!eyeBlink && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: '#F59E0B',
                    borderRadius: 4,
                  }}
                />
              )}
            </View>
            <View
              style={{
                width: 16,
                height: eyeBlink ? 4 : 16,
                backgroundColor: 'white',
                borderRadius: 8,
                marginHorizontal: 4,
                borderWidth: 2,
                borderColor: '#FBBF24',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {!eyeBlink && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor: '#F59E0B',
                    borderRadius: 4,
                  }}
                />
              )}
            </View>
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