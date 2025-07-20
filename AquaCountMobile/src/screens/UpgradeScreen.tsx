import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import PremiumBuddy from '../components/PremiumBuddy';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type UpgradeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Upgrade'>;

interface Props {
  navigation: UpgradeScreenNavigationProp;
  route: { params: { user: any } };
  user: any;
  theme: 'light' | 'dark';
}

export default function UpgradeScreen({ navigation, user, theme }: Props) {
  const handleUpgrade = (plan: string, stripeLink: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In a real app, this would redirect to Stripe for payment
    Linking.openURL(stripeLink);
  };

  const themeColors = theme === 'dark' 
    ? { background: ['#1F2937', '#1E3A8A', '#1E40AF'], text: '#FFFFFF', card: '#374151' }
    : { background: ['#FFFFFF', '#EFF6FF', '#DBEAFE'], text: '#1E40AF', card: '#FFFFFF' };

  return (
    <LinearGradient colors={themeColors.background} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: themeColors.text }]}>Upgrade to Premium</Text>
          </View>

          {/* Premium Buddy */}
          <View style={styles.buddyContainer}>
            <PremiumBuddy size="large" expression="excited" activity="celebrating" waterLevel={100} isDraggable={false} />
          </View>

          {/* Header Text */}
          <View style={styles.headerText}>
            <Text style={[styles.mainTitle, { color: themeColors.text }]}>Upgrade to Premium</Text>
            <Text style={[styles.subtitle, { color: themeColors.text }]}>
              Unlock all features and continue your hydration journey
            </Text>
          </View>

          {/* Monthly Plan */}
          <View style={[styles.planCard, { backgroundColor: themeColors.card }]}>
            <View style={styles.planHeader}>
              <Ionicons name="diamond" size={32} color="#2563EB" />
              <Text style={[styles.planTitle, { color: themeColors.text }]}>Monthly Premium</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>$2.00</Text>
                <Text style={[styles.period, { color: themeColors.text }]}>/month</Text>
              </View>
            </View>

            <View style={styles.featuresList}>
              {[
                'Unlimited water tracking',
                'Real-time weather integration',
                'Disease condition adjustments',
                'Profile editing capabilities',
                'Golden premium buddy',
                'Draggable buddy animations'
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                  <Text style={[styles.featureText, { color: themeColors.text }]}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => handleUpgrade('monthly', 'https://buy.stripe.com/test_9B66ozduEd7lbcU2OO7EQ00')}
            >
              <Text style={styles.upgradeButtonText}>Choose Monthly Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Yearly Plan */}
          <View style={[styles.planCard, { backgroundColor: themeColors.card }, styles.yearlyCard]}>
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save 37%</Text>
            </View>
            
            <View style={styles.planHeader}>
              <Ionicons name="star" size={32} color="#F59E0B" />
              <Text style={[styles.planTitle, { color: themeColors.text }]}>Yearly Premium</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>$9.99</Text>
                <Text style={[styles.period, { color: themeColors.text }]}>/year</Text>
              </View>
              <Text style={styles.monthlyPrice}>Only $0.83/month</Text>
            </View>

            <View style={styles.featuresList}>
              {[
                'Everything in Monthly',
                'Priority customer support',
                'Advanced analytics',
                'Export your data'
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                  <Text style={[styles.featureText, { color: themeColors.text }]}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.upgradeButton, styles.yearlyButton]}
              onPress={() => handleUpgrade('yearly', 'https://buy.stripe.com/test_4gM7sDgGQ0kz0yg0GG7EQ03')}
            >
              <Text style={styles.upgradeButtonText}>Choose Yearly Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Lifetime Plan */}
          <View style={[styles.planCard, { backgroundColor: themeColors.card }, styles.lifetimeCard]}>
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>Best Value</Text>
            </View>
            
            <View style={styles.planHeader}>
              <View style={styles.lifetimeIcons}>
                <Ionicons name="diamond" size={32} color="#F59E0B" />
                <Ionicons name="star" size={32} color="#F59E0B" />
              </View>
              <Text style={[styles.planTitle, { color: themeColors.text }]}>Lifetime Premium</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>$200.00</Text>
                <Text style={[styles.period, { color: themeColors.text }]}> once</Text>
              </View>
              <Text style={styles.lifetimePrice}>Never pay again!</Text>
            </View>

            <View style={styles.featuresList}>
              {[
                'All Premium features forever',
                'Lifetime updates',
                'VIP support',
                'Exclusive lifetime badge'
              ].map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                  <Text style={[styles.featureText, { color: themeColors.text }]}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.upgradeButton, styles.lifetimeButton]}
              onPress={() => handleUpgrade('lifetime', 'https://buy.stripe.com/test_dRm14faisd7lbcU2OO7EQ02')}
            >
              <Text style={styles.upgradeButtonText}>Choose Lifetime Plan</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={[styles.footer, { color: themeColors.text }]}>
            Cancel anytime. No hidden fees. 30-day money-back guarantee.
          </Text>
        </ScrollView>
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
  },
  scrollView: {
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
  buddyContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerText: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  planCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  yearlyCard: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  lifetimeCard: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  saveBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  saveBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  bestValueBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  period: {
    fontSize: 18,
    opacity: 0.8,
  },
  monthlyPrice: {
    color: '#10B981',
    fontSize: 14,
    marginTop: 4,
  },
  lifetimePrice: {
    color: '#F59E0B',
    fontSize: 14,
    marginTop: 4,
  },
  lifetimeIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    marginLeft: 12,
  },
  upgradeButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 16,
  },
  yearlyButton: {
    backgroundColor: '#1D4ED8',
  },
  lifetimeButton: {
    backgroundColor: '#F59E0B',
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
});