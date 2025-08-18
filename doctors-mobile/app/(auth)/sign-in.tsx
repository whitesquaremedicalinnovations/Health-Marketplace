import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSignIn, useSSO } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';

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

  const onSignInPress = async () => {
    if (!isLoaded) return;
    try {
      const attempt = await signIn.create({ identifier: email, password });
      if (attempt.status === 'complete' && attempt.createdSessionId) {
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
      <Text className="text-3xl font-bold mb-6">Welcome Back</Text>
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
        onPress={onSignInPress}
      >
        <Text className="text-white text-center font-medium">Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="bg-red-600 w-full rounded-md p-3"
        onPress={onGoogleSSO}
      >
        <Text className="text-white text-center font-medium">
          Sign In with Google
        </Text>
      </TouchableOpacity>
      <View className="flex-row mt-4">
        <Text>New here? </Text>
        <Link href="/(auth)/sign-up">
          <Text className="text-blue-600">Sign Up</Text>
        </Link>
      </View>
    </View>
  );
}
