import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

class HapticsManager {
  private static instance: HapticsManager | null = null;
  private isAvailable: boolean = false;

  private constructor() {
    this.checkAvailability();
  }

  static getInstance(): HapticsManager {
    if (!HapticsManager.instance) {
      HapticsManager.instance = new HapticsManager();
    }
    return HapticsManager.instance;
  }

  private async checkAvailability(): Promise<void> {
    // Check if running on native platform
    if (Capacitor.isNativePlatform()) {
      // Haptics should be available on native platforms
      this.isAvailable = true;
    } else {
      // Web platform - check for Vibration API as fallback
      this.isAvailable = 'vibrate' in navigator;
    }
  }

  async impact(style: ImpactStyle = ImpactStyle.Medium): Promise<void> {
    if (!this.isAvailable) return;

    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.warn('Haptics impact failed:', error);
    }
  }

  async vibrate(duration?: number): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.vibrate();
      } catch (error) {
        console.warn('Haptics vibrate failed:', error);
      }
    } else if (this.isAvailable && 'vibrate' in navigator) {
      // Fallback to Web Vibration API
      if (duration) {
        navigator.vibrate(duration);
      } else {
        navigator.vibrate(200); // Default 200ms
      }
    }
  }

  async notification(type: NotificationType = NotificationType.Success): Promise<void> {
    if (!this.isAvailable) return;

    try {
      await Haptics.notification({ type });
    } catch (error) {
      console.warn('Haptics notification failed:', error);
    }
  }

  async lightImpact(): Promise<void> {
    await this.impact(ImpactStyle.Light);
  }

  async mediumImpact(): Promise<void> {
    await this.impact(ImpactStyle.Medium);
  }

  async heavyImpact(): Promise<void> {
    await this.impact(ImpactStyle.Heavy);
  }

  isSupported(): boolean {
    return this.isAvailable;
  }
}

export const hapticsManager = HapticsManager.getInstance();

