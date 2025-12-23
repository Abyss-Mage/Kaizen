import { useLocalSearchParams, Stack } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MangaDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-lg font-bold">
          Manga ID: {id}
        </Text>
        <Text className="text-gray-400 mt-2">
          Details page under construction...
        </Text>
        <ActivityIndicator size="small" color="#ef4444" className="mt-4" />
      </View>
    </SafeAreaView>
  );
}