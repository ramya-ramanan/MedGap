// Medication Reminder & Notification Service
// Handles scheduling, browser notifications, audio chimes, and Supabase / local persistence.

import { getSupabase } from './supabase';
import { MedicationReminderItem } from '../types';

const STORAGE_REMINDERS_KEY = 'medgap_medication_reminders_v1';
const STORAGE_ALERTED_KEY = 'medgap_last_alerted_reminders';

export const reminderService = {
  // Web Audio chime generator for reminder alert sound
  playNotificationSound() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const now = ctx.currentTime;
      // Dual-tone pleasant medical chime (C5 -> G5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(783.99, now + 0.15); // G5
      gain2.gain.setValueAtTime(0.25, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.7);
    } catch {
      // Audio context might be restricted before user gesture
    }
  },

  // Request browser Notification permissions
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    return await Notification.requestPermission();
  },

  // Dispatch a native browser notification
  sendBrowserNotification(title: string, body: string) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      } catch (e) {
        console.warn('Browser notification error:', e);
      }
    }
    this.playNotificationSound();
  },

  // Get reminders from Supabase or localStorage
  async getReminders(userId: string): Promise<MedicationReminderItem[]> {
    const supabase = getSupabase();
    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('medication_reminders')
          .select('*')
          .eq('user_id', userId)
          .order('reminder_time', { ascending: true });

        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            medicationId: r.medication_id,
            medicineName: r.medicine_name,
            reminderTime: r.reminder_time.slice(0, 5),
            daysOfWeek: r.days_of_week || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            isEnabled: r.is_enabled,
            dosage: r.dosage,
            notes: r.notes,
            createdAt: r.created_at,
          }));
        }
      } catch (err) {
        console.warn('Could not query Supabase medication_reminders:', err);
      }
    }

    // LocalStorage fallback
    try {
      const raw = localStorage.getItem(STORAGE_REMINDERS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }

    return [];
  },

  // Save/add a reminder
  async addReminder(userId: string, item: Omit<MedicationReminderItem, 'id'>): Promise<MedicationReminderItem> {
    const id = 'rem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newReminder: MedicationReminderItem = {
      ...item,
      id,
      createdAt: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase && userId) {
      try {
        await supabase.from('medication_reminders').insert({
          id,
          user_id: userId,
          medication_id: item.medicationId || null,
          medicine_name: item.medicineName,
          reminder_time: item.reminderTime,
          days_of_week: item.daysOfWeek,
          is_enabled: item.isEnabled,
          dosage: item.dosage || null,
          notes: item.notes || null,
        });
      } catch (err) {
        console.warn('Could not insert into medication_reminders:', err);
      }
    }

    // Update LocalStorage
    try {
      const list = await this.getReminders(userId);
      const updated = [...list.filter(r => r.id !== id), newReminder];
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    return newReminder;
  },

  // Update an existing reminder
  async updateReminder(userId: string, id: string, updates: Partial<MedicationReminderItem>): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase && userId) {
      try {
        const payload: any = {};
        if (updates.reminderTime) payload.reminder_time = updates.reminderTime;
        if (updates.daysOfWeek) payload.days_of_week = updates.daysOfWeek;
        if (updates.isEnabled !== undefined) payload.is_enabled = updates.isEnabled;
        if (updates.dosage !== undefined) payload.dosage = updates.dosage;
        if (updates.notes !== undefined) payload.notes = updates.notes;

        await supabase.from('medication_reminders').update(payload).eq('id', id).eq('user_id', userId);
      } catch (err) {
        console.warn('Could not update medication_reminders:', err);
      }
    }

    try {
      const list = await this.getReminders(userId);
      const updated = list.map(r => (r.id === id ? { ...r, ...updates } : r));
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  // Delete a reminder
  async deleteReminder(userId: string, id: string): Promise<boolean> {
    const supabase = getSupabase();
    if (supabase && userId) {
      try {
        await supabase.from('medication_reminders').delete().eq('id', id).eq('user_id', userId);
      } catch (err) {
        console.warn('Could not delete from medication_reminders:', err);
      }
    }

    try {
      const list = await this.getReminders(userId);
      const updated = list.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_REMINDERS_KEY, JSON.stringify(updated));
      return true;
    } catch {
      return false;
    }
  },

  // Check all enabled reminders against current time and trigger notifications
  checkDueReminders(
    reminders: MedicationReminderItem[],
    onTriggerToast: (medicineName: string, dosage?: string) => void
  ) {
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMins = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMins}`;

    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayStr = daysMap[now.getDay()];

    let alertedMap: Record<string, string> = {};
    try {
      alertedMap = JSON.parse(localStorage.getItem(STORAGE_ALERTED_KEY) || '{}');
    } catch {
      alertedMap = {};
    }

    const todayDateKey = now.toISOString().split('T')[0];

    reminders.forEach(reminder => {
      if (!reminder.isEnabled) return;
      if (!reminder.daysOfWeek.includes(currentDayStr)) return;

      if (reminder.reminderTime === currentTimeStr) {
        const uniqueKey = `${reminder.id}_${todayDateKey}_${currentTimeStr}`;
        if (!alertedMap[uniqueKey]) {
          alertedMap[uniqueKey] = 'true';

          // 1. Send native browser notification
          this.sendBrowserNotification(
            `💊 Medication Reminder: ${reminder.medicineName}`,
            `It's time to take your scheduled dose: ${reminder.dosage || '1 dose'}. (${reminder.notes || 'Take with water'})`
          );

          // 2. Trigger in-app toast
          onTriggerToast(reminder.medicineName, reminder.dosage);
        }
      }
    });

    try {
      localStorage.setItem(STORAGE_ALERTED_KEY, JSON.stringify(alertedMap));
    } catch {
      // ignore
    }
  }
};
