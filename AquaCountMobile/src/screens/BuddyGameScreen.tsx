import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import FunnyBuddy from '../components/FunnyBuddy';
import PremiumBuddy from '../components/PremiumBuddy';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type BuddyGameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BuddyGame'>;

interface Props {
  navigation: BuddyGameScreenNavigationProp;
  route: { params: { user: any } };
  user: any;
  theme: 'light' | 'dark';
}

interface Droplet {
  id: number;
  x: number;
  y: number;
  radius: number;
  color: string;
  animatedValue: Animated.Value;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_WIDTH = SCREEN_WIDTH - 48; // Account for padding
const GAME_HEIGHT = SCREEN_HEIGHT * 0.6;
const DROPLET_RADIUS = 12;
const BUDDY_BASKET_WIDTH = 80;
const BUDDY_BASKET_HEIGHT = 20;
const DROPLET_FALL_SPEED = 2;
const DROPLET_SPAWN_INTERVAL = 1000;
const MAX_MISSED_DROPS = 5;

export default function BuddyGameScreen({ navigation, user, theme }: Props) {
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [buddyX, setBuddyX] = useState(GAME_WIDTH / 2);
  const [score, setScore] = useState(0);
  const [missedDrops, setMissedDrops] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dropletIdRef = useRef(0);

  const isPremium = user?.subscription?.plan !== 'free';

  const generateDropletColor = () => {
    const colors = [
      '#60A5FA', // Light blue
      '#3B82F6', // Medium blue
      '#1D4ED8', // Darker blue
      '#06B6D4', // Cyan
      '#8B5CF6', // Purple-ish
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const resetGame = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDroplets([]);
    setScore(0);
    setMissedDrops(0);
    setGameOver(false);
    setGameStarted(false);
    dropletIdRef.current = 0;
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    
    // Spawn droplets
    spawnIntervalRef.current = setInterval(() => {
      if (!gameOver) {
        const newDroplet: Droplet = {
          id: dropletIdRef.current++,
          x: Math.random() * (GAME_WIDTH - DROPLET_RADIUS * 2) + DROPLET_RADIUS,
          y: -DROPLET_RADIUS,
          radius: DROPLET_RADIUS,
          color: generateDropletColor(),
          animatedValue: new Animated.Value(-DROPLET_RADIUS),
        };

        setDroplets(prev => [...prev, newDroplet]);

        // Animate droplet falling
        Animated.timing(newDroplet.animatedValue, {
          toValue: GAME_HEIGHT + DROPLET_RADIUS,
          duration: (GAME_HEIGHT + DROPLET_RADIUS * 2) / DROPLET_FALL_SPEED * 16, // 60fps
          useNativeDriver: false,
        }).start();
      }
    }, DROPLET_SPAWN_INTERVAL);

    // Game loop for collision detection
    gameLoopRef.current = setInterval(() => {
      setDroplets(prevDroplets => {
        return prevDroplets.filter(droplet => {
          const currentY = droplet.animatedValue._value;
          
          // Check for collision with buddy's basket
          const buddyBasketLeft = buddyX - BUDDY_BASKET_WIDTH / 2;
          const buddyBasketRight = buddyX + BUDDY_BASKET_WIDTH / 2;
          const buddyBasketTop = GAME_HEIGHT - BUDDY_BASKET_HEIGHT;

          const isColliding =
            currentY + droplet.radius > buddyBasketTop &&
            currentY - droplet.radius < GAME_HEIGHT &&
            droplet.x + droplet.radius > buddyBasketLeft &&
            droplet.x - droplet.radius < buddyBasketRight;

          if (isColliding && currentY < buddyBasketTop + 10) {
            setScore(s => s + 1);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            return false; // Remove droplet
          }

          // Check if droplet missed the basket
          if (currentY + droplet.radius > GAME_HEIGHT) {
            setMissedDrops(m => {
              const newMissed = m + 1;
              if (newMissed >= MAX_MISSED_DROPS) {
                setGameOver(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
              return newMissed;
            });
            return false; // Remove droplet
          }

          return true; // Keep droplet
        });
      });
    }, 16); // 60fps
  };

  useEffect(() => {
    if (gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    }
  }, [gameOver]);

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, []);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      if (!gameOver && gameStarted) {
        const newX = evt.nativeEvent.locationX;
        const clampedX = Math.max(BUDDY_BASKET_WIDTH / 2, Math.min(newX, GAME_WIDTH - BUDDY_BASKET_WIDTH / 2));
        setBuddyX(clampedX);
      }
    },
  });

  const themeColors = theme === 'dark' 
    ? { background: ['#1F2937', '#1E3A8A', '#1E40AF'], text: '#FFFFFF', card: '#374151' }
    : { background: ['#FFFFFF', '#EFF6FF', '#DBEAFE'], text: '#1E40AF', card: '#FFFFFF' };

  return (
    <LinearGradient colors={themeColors.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>Buddy Catch!</Text>
        </View>

        {/* Score */}
        <View style={[styles.scoreCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.scoreText, { color: themeColors.text }]}>Score: {score}</Text>
          <Text style={[styles.missedText, { color: themeColors.text }]}>
            Missed: {missedDrops} / {MAX_MISSED_DROPS}
          </Text>
        </View>

        {/* Game Area */}
        <View
          style={[
            styles.gameArea,
            { backgroundColor: theme === 'dark' ? '#1F2937' : '#E0F2FE' }
          ]}
          {...panResponder.panHandlers}
        >
          {/* Render falling droplets */}
          {droplets.map((droplet) => (
            <Animated.View
              key={droplet.id}
              style={[
                styles.droplet,
                {
                  width: droplet.radius * 2,
                  height: droplet.radius * 2,
                  backgroundColor: droplet.color,
                  left: droplet.x - droplet.radius,
                  top: droplet.animatedValue,
                }
              ]}
            />
          ))}

          {/* Buddy and basket */}
          <View
            style={[
              styles.buddyContainer,
              { left: buddyX - (isPremium ? 48 : 40) } // Adjust for buddy width
            ]}
          >
            {isPremium ? (
              <PremiumBuddy
                size="medium"
                expression="determined"
                activity="waving"
                waterLevel={100}
                isDraggable={false}
              />
            ) : (
              <FunnyBuddy
                size="medium"
                expression="determined"
                activity="waving"
                waterLevel={100}
                isDraggable={false}
              />
            )}
            
            {/* Buddy's Catching Basket */}
            <View style={styles.basket} />
          </View>

          {/* Game Over Overlay */}
          {gameOver && (
            <View style={styles.gameOverOverlay}>
              <Text style={styles.gameOverTitle}>Game Over!</Text>
              <Text style={styles.finalScore}>Final Score: {score}</Text>
              <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
                <Ionicons name="refresh" size={20} color="white" />
                <Text style={styles.playAgainText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Start Game Overlay */}
          {!gameStarted && !gameOver && (
            <View style={styles.startOverlay}>
              <Text style={styles.startTitle}>Buddy Catch!</Text>
              <Text style={styles.startDescription}>
                Move your finger to help buddy catch the falling water droplets!
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={startGame}>
                <Ionicons name="play" size={20} color="white" />
                <Text style={styles.startButtonText}>Start Game</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scoreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
  },
  missedText: {
    fontSize: 14,
    opacity: 0.8,
  },
  gameArea: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    position: 'relative',
    overflow: 'hidden',
  },
  droplet: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  buddyContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  basket: {
    position: 'absolute',
    bottom: -10,
    width: BUDDY_BASKET_WIDTH,
    height: BUDDY_BASKET_HEIGHT,
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    borderWidth: 2,
    borderColor: '#1D4ED8',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    left: -BUDDY_BASKET_WIDTH / 2,
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  finalScore: {
    fontSize: 20,
    color: 'white',
    marginBottom: 24,
  },
  playAgainButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  playAgainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  startOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  startTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  startDescription: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  startButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startButtonText: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});