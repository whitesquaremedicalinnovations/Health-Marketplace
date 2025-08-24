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
  Alert,
  ScrollView
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Eye, EyeOff, Mail, Lock, ArrowRight, UserPlus, Shield } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => void WebBrowser.coolDownAsync();
  }, []);
};

export default function SignUpScreen() {
  useWarmUpBrowser();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Sign Up Failed', err.errors?.[0]?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        router.push('/(onboarding)');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Verification Failed', err.errors?.[0]?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSSO = async () => {
    try {
      const { createdSessionId, setActive: activate } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri(),
      });
      if (createdSessionId && activate) {
        await activate({ session: createdSessionId });
        router.push('/(onboarding)');
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Google Sign Up Failed', err.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient
            colors={['#F8FAFC', '#EBF4FF', '#DBEAFE']}
            style={{ flex: 1, minHeight: height }}
          >
            <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center', paddingVertical: 40 }}>
              {!pendingVerification ? (
                <>
                  {/* Header */}
                  <View style={{ alignItems: 'center', marginBottom: 48 }}>
                    <View style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: '#10B981',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 16,
                      shadowColor: '#10B981',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }}>
                      <UserPlus size={36} color="white" />
                    </View>
                    <Text style={{
                      fontSize: 28,
                      fontWeight: 'bold',
                      color: '#1F2937',
                      marginBottom: 8,
                    }}>
                      Create Account
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      color: '#6B7280',
                      textAlign: 'center',
                      lineHeight: 24,
                    }}>
                      Join HealthConnect to manage your clinic
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
                      marginBottom: 8,
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
                          placeholder="Password (min. 8 characters)"
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

                    {/* Password Requirements */}
                    <Text style={{
                      fontSize: 12,
                      color: '#6B7280',
                      marginBottom: 24,
                      paddingHorizontal: 4,
                    }}>
                      Password must be at least 8 characters long
                    </Text>

                    {/* Sign Up Button */}
                    <TouchableOpacity
                      onPress={onSignUpPress}
                      disabled={loading}
                      style={{
                        backgroundColor: loading ? '#9CA3AF' : '#10B981',
                        borderRadius: 12,
                        paddingVertical: 16,
                        paddingHorizontal: 24,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                        shadowColor: '#10B981',
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
                        {loading ? 'Creating Account...' : 'Create Account'}
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

                    {/* Google Sign Up Button */}
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
                        Sign up with Google
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
                      Already have an account?{' '}
                    </Text>
                    <Link href="/(auth)/sign-in">
                      <Text style={{
                        color: '#2563EB',
                        fontSize: 16,
                        fontWeight: '600',
                      }}>
                        Sign In
                      </Text>
                    </Link>
                  </View>
                </>
              ) : (
                /* Verification Screen */
                <>
                  <View style={{ alignItems: 'center', marginBottom: 48 }}>
                    <View style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: '#6366F1',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 16,
                      shadowColor: '#6366F1',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 8,
                    }}>
                      <Shield size={36} color="white" />
                    </View>
                    <Text style={{
                      fontSize: 28,
                      fontWeight: 'bold',
                      color: '#1F2937',
                      marginBottom: 8,
                    }}>
                      Verify Your Email
                    </Text>
                    <Text style={{
                      fontSize: 16,
                      color: '#6B7280',
                      textAlign: 'center',
                      lineHeight: 24,
                      paddingHorizontal: 20,
                    }}>
                      We've sent a verification code to{'\n'}{email}
                    </Text>
                  </View>

                  <View style={{ marginBottom: 32 }}>
                    {/* Code Input */}
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
                      <TextInput
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 16,
                          fontSize: 18,
                          color: '#1F2937',
                          textAlign: 'center',
                          letterSpacing: 4,
                        }}
                        placeholder="Enter verification code"
                        placeholderTextColor="#9CA3AF"
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                      onPress={onVerifyPress}
                      disabled={loading}
                      style={{
                        backgroundColor: loading ? '#9CA3AF' : '#6366F1',
                        borderRadius: 12,
                        paddingVertical: 16,
                        paddingHorizontal: 24,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#6366F1',
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
                        {loading ? 'Verifying...' : 'Verify Email'}
                      </Text>
                      {!loading && <ArrowRight size={20} color="white" />}
                    </TouchableOpacity>

                    {/* Back Button */}
                    <TouchableOpacity
                      onPress={() => setPendingVerification(false)}
                      style={{
                        marginTop: 16,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{
                        color: '#6B7280',
                        fontSize: 16,
                      }}>
                        Back to sign up
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
