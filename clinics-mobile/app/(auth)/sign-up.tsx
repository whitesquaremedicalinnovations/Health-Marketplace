import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSignUp, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';

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
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState('');

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({ emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      console.error(err);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    try {
      const attempt = await signUp.attemptEmailAddressVerification({ code });
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        router.replace('/');
      }
    } catch (err) {
      console.error(err);
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
        router.replace('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-6">
      {!pendingVerification ? (
        <>
          <Text className="text-3xl font-bold mb-6">Create Account</Text>
          <TextInput
            className="w-full border border-gray-300 rounded-md p-3 mb-4"
            placeholder="Email"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            className="w-full border border-gray-300 rounded-md p-3 mb-4"
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            className="bg-blue-600 w-full rounded-md p-3 mb-4"
            onPress={onSignUpPress}
          >
            <Text className="text-white text-center font-medium">Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-600 w-full rounded-md p-3"
            onPress={onGoogleSSO}
          >
            <Text className="text-white text-center font-medium">
              Sign Up with Google
            </Text>
          </TouchableOpacity>
          <View className="flex-row mt-4">
            <Text>Already registered? </Text>
            <Link href="/(auth)/sign-in">
              <Text className="text-blue-600">Sign In</Text>
            </Link>
          </View>
        </>
      ) : (
        <>
          <Text className="text-xl mb-4">Enter Verification Code</Text>
          <TextInput
            className="w-full border border-gray-300 rounded-md p-3 mb-4"
            placeholder="Code"
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity
            className="bg-green-600 w-full rounded-md p-3"
            onPress={onVerifyPress}
          >
            <Text className="text-white text-center font-medium">Verify</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
