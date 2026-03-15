import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Button, Input, Divider } from '../../src/components/ui';
import { Colors, Spacing, Typography, Radius, Shadow } from '../../src/constants/theme';
import { supabase } from '../../src/services/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    let authError = null;

    if (isSignIn) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
    } else {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: email.split('@')[0], 
          }
        }
      });
      authError = error;
      if (!error) {
        Alert.alert('Success', 'Check your email for the confirmation link.');
      }
    }

    if (authError) {
      Alert.alert('Authentication Error', authError.message);
    }
    setLoading(false);
  }

  async function handleOAuth(provider: 'google' | 'facebook' | 'apple') {
    setLoading(true);

    if (provider === 'apple' && Platform.OS === 'ios') {
      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        if (credential.identityToken) {
          const { error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          });

          if (error) throw error;
        } else {
          throw new Error('No identityToken.');
        }
      } catch (e: any) {
        if (e.code !== 'ERR_REQUEST_CANCELED') {
          Alert.alert('Apple Auth Error', e.message);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const redirectUrl = Linking.createURL('/(tabs)');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data?.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
          
          if (result.type === 'success') {
            const url = result.url;
            // Parse URL parameters or fragments
            const parsedUrl = Linking.parse(url);
            let access_token = '';
            let refresh_token = '';
            
            if (parsedUrl.queryParams) {
              access_token = parsedUrl.queryParams.access_token as string;
              refresh_token = parsedUrl.queryParams.refresh_token as string;
            }

            // Fallback for fragmented hash parsing
            if (!access_token && url.includes('#')) {
              const hashObj = url.split('#')[1].split('&').reduce((acc: any, item) => {
                const [k, v] = item.split('=');
                acc[k] = decodeURIComponent(v);
                return acc;
              }, {});
              access_token = hashObj.access_token;
              refresh_token = hashObj.refresh_token;
            }

            if (access_token && refresh_token) {
               await supabase.auth.setSession({ access_token, refresh_token });
            }
          }
        }
      }
    } catch (e: any) {
      Alert.alert(`${provider} Auth Error`, e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Navya</Text>
          <Text style={styles.subtitle}>
            {isSignIn ? 'Sign in to continue your fitness journey' : 'Create an account to get started'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Input 
            label="Email Address" 
            placeholder="your@email.com" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input 
            label="Password" 
            placeholder="••••••••" 
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <View style={styles.forgotPasswordContainer}>
            <Button 
              label="Forgot Password?" 
              variant="ghost" 
              size="sm"
              onPress={() => Alert.alert('Coming Soon', 'Password reset will be implemented in the future.')}
            />
          </View>

          <Button 
            label={isSignIn ? "Sign In" : "Sign Up"} 
            fullWidth 
            loading={loading}
            onPress={handleEmailAuth}
            style={[{ marginTop: Spacing.sm }]}
          />

          <Button 
            label={isSignIn ? "Create an account" : "Already have an account? Sign In"} 
            variant="ghost" 
            fullWidth 
            onPress={() => setIsSignIn(!isSignIn)}
            style={[{ marginTop: Spacing.md }]}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialContainer}>
          {Platform.OS === 'ios' && (
            <Button 
              label="Continue with Apple" 
              variant="secondary" 
              fullWidth
              onPress={() => handleOAuth('apple')}
              disabled={loading}
            />
          )}
          <Button 
            label="Continue with Google" 
            variant="secondary" 
            fullWidth
            onPress={() => handleOAuth('google')}
            disabled={loading}
            style={[{ marginTop: Spacing.md }]}
          />
          <Button 
            label="Continue with Facebook" 
            variant="secondary" 
            fullWidth
            onPress={() => handleOAuth('facebook')}
            disabled={loading}
            style={[{ marginTop: Spacing.md }]}
          />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: Typography.weight.extrabold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },
  formContainer: {
    marginBottom: Spacing.xxl,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.xs,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.muted,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1.5,
  },
  socialContainer: {
    marginBottom: Spacing.xl,
  },
});
