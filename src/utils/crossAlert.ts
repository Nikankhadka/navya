import { Alert } from 'react-native';

/**
 * Cross-platform alert that works on both native and web.
 * On web, Alert.alert is not supported — falls back to window.confirm / window.alert.
 */
export function crossAlert(
  title: string,
  message?: string,
  buttons?: {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
  }[],
): void {
  if (process.env.EXPO_OS === 'web') {
    // Web fallback
    const cancelBtn = buttons?.find((b) => b.style === 'cancel');
    const confirmBtn = buttons?.find((b) => b.style !== 'cancel');
    const msg = message ? `${title}\n\n${message}` : title;

    if (cancelBtn && confirmBtn) {
      // eslint-disable-next-line no-alert
      if (window.confirm(msg)) {
        confirmBtn.onPress?.();
      }
    } else {
      // eslint-disable-next-line no-alert
      window.alert(msg);
      buttons?.[0]?.onPress?.();
    }
    return;
  }

  Alert.alert(title, message, buttons);
}
