import { View, Text, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Update imports to include the new function
import { getPopularManga, Manga } from '../../lib/api/mangadex';
import { MangaCard } from '../../components/manga/MangaCard';

export default function HomeScreen() {
  
  // 1. Fetch Popular Manga (Real Discovery Data)
  const { data: mangaList, isLoading, error } = useQuery({
    queryKey: ['popular-manga'],
    queryFn: () => getPopularManga(20),
  });

  // 2. Render Item Adapter
  const renderItem = ({ item }: { item: Manga }) => (
    <View className="flex-1 p-2">
      <MangaCard 
        id={item.id}
        title={item.title}
        coverUrl={item.coverUrl}
        statusRaw={item.status}
        statusScan={item.year ? String(item.year) : 'Unknown'} // Reusing status slot for Year
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <StatusBar style="light" />
      
      <View className="px-4 py-3 border-b border-white/10">
        <Text className="text-xl font-bold text-white tracking-tight">
          Kaizen <Text className="text-red-500">Mobile</Text>
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : (
        <View className="flex-1 h-full w-full">
          <FlashList
            data={mangaList}
            renderItem={renderItem}
            estimatedItemSize={280}
            numColumns={2}
            contentContainerStyle={{ padding: 8, paddingBottom: 100 }}
            drawDistance={2000} 
          />
        </View>
      )}
    </SafeAreaView>
  );
}