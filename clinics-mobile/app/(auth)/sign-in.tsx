import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions,
  Alert
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSignIn, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => void WebBrowser.coolDownAsync();
  }, []);
};

export default function SignInScreen() {
  useWarmUpBrowser();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === 'complete' && attempt.createdSessionId) {
        await setActive({ session: attempt.createdSessionId });
        router.push('/(onboarding)');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Sign In Failed', err.errors?.[0]?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSSO = async () => {
    try {
      const { createdSessionId, setActive: activate } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({
          path: "callback",
        }),
      });
      if (createdSessionId && activate) {
        await activate({ session: createdSessionId });
        router.push('/(onboarding)');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Google Sign In Failed', err.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={['#F8FAFC', '#EBF4FF', '#DBEAFE']}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginBottom: 48 }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#2563EB',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}>
                <Ionicons name="medical" size={36} color="white" />
              </View>
              <Text style={{
                fontSize: 28,
                fontWeight: 'bold',
                color: '#1F2937',
                marginBottom: 8,
              }}>
                Welcome Back
              </Text>
              <Text style={{
                fontSize: 16,
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: 24,
              }}>
                Sign in to continue to HealthConnect
              </Text>
            </View>

            {/* Form */}
            <View style={{ marginBottom: 32 }}>
              {/* Email Input */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 12,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                }}>
                  <Mail size={20} color="#6B7280" />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingHorizontal: 12,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: '#1F2937',
                    }}
                    placeholder="Email address"
                    placeholderTextColor="#9CA3AF"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={{
                backgroundColor: 'white',
                borderRadius: 12,
                marginBottom: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 4,
                }}>
                  <Lock size={20} color="#6B7280" />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingHorizontal: 12,
                      paddingVertical: 16,
                      fontSize: 16,
                      color: '#1F2937',
                    }}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ padding: 4 }}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={onSignInPress}
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#9CA3AF' : '#2563EB',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  shadowColor: '#2563EB',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '600',
                  marginRight: 8,
                }}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
                {!loading && <ArrowRight size={20} color="white" />}
              </TouchableOpacity>

              {/* Divider */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 24,
              }}>
                <View style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: '#E5E7EB',
                }} />
                <Text style={{
                  marginHorizontal: 16,
                  color: '#6B7280',
                  fontSize: 14,
                }}>
                  Or continue with
                </Text>
                <View style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: '#E5E7EB',
                }} />
              </View>

              {/* Google Sign In Button */}
              <TouchableOpacity
                onPress={onGoogleSSO}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 12,
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <Text style={{
                  color: '#1F2937',
                  fontSize: 16,
                  fontWeight: '600',
                  marginLeft: 12,
                }}>
                  Sign in with Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{
                color: '#6B7280',
                fontSize: 16,
              }}>
                New to HealthConnect?{' '}
              </Text>
              <Link href="/(auth)/sign-up">
                <Text style={{
                  color: '#2563EB',
                  fontSize: 16,
                  fontWeight: '600',
                }}>
                  Sign Up
                </Text>
              </Link>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
