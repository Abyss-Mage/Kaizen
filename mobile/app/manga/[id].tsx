import React from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
// If you don't have nativewind 'cn', just use template literals below.
import { useKaizenStore } from '../../lib/store';
import { getMangaDetails, getMangaFeed, Chapter } from '../../lib/api/mangadex';

export default function MangaDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // 1. Store Access
  const { library, toggleFollow } = useKaizenStore();
  const safeId = Array.isArray(id) ? id[0] : id; // Handle potential array from params
  const inLibrary = safeId ? library[safeId] : false;

  // 2. Data Fetching
  const { data: manga, isLoading: loadingManga } = useQuery({
    queryKey: ['manga', safeId],
    queryFn: () => getMangaDetails(safeId!),
    enabled: !!safeId, // Only fetch if ID exists
  });

  const { data: chapters, isLoading: loadingChapters } = useQuery({
    queryKey: ['chapters', safeId],
    queryFn: () => getMangaFeed(safeId!),
    enabled: !!safeId,
  });

  const isLoading = loadingManga || loadingChapters;

  // --- Components ---

  const Header = () => {
    if (!manga) return null;

    return (
      <View className="pb-6">
        {/* 🎨 HERO SECTION */}
        <View className="relative h-72 w-full bg-gray-900">
          <Image
            source={{ uri: manga.coverUrl || undefined }}
            style={{ width: '100%', height: '100%', opacity: 0.5 }}
            contentFit="cover"
            transition={500}
            // Blur is handled natively by opacity + bg color for performance on Android
          />
          <LinearGradient
            colors={['transparent', '#000000']}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 160 }}
          />
          
          {/* Foreground Content */}
          <View className="absolute bottom-0 w-full flex-row px-4 pb-4 items-end gap-4">
            <Image
              source={{ uri: manga.coverUrl || undefined }}
              style={{ width: 100, height: 150, borderRadius: 8 }}
              contentFit="cover"
            />
            <View className="flex-1 pb-1">
              <Text className="text-white text-2xl font-bold leading-tight" numberOfLines={3}>
                {manga.title}
              </Text>
              <Text className="text-gray-300 text-xs font-bold uppercase mt-1">
                {manga.status} • {manga.year || 'N/A'}
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
                {manga.authors?.join(', ')}
              </Text>
            </View>
          </View>
        </View>

        {/* 🕹️ ACTIONS */}
        <View className="flex-row px-4 mt-4 gap-3">
          <Pressable 
            onPress={() => safeId && toggleFollow(safeId)}
            className={`flex-1 py-3 rounded-lg flex-row items-center justify-center gap-2 ${inLibrary ? 'bg-red-500/20 border border-red-500' : 'bg-white'}`}
          >
             <Ionicons name={inLibrary ? "heart" : "heart-outline"} size={20} color={inLibrary ? "#ef4444" : "#000"} />
             <Text className={`font-bold ${inLibrary ? 'text-red-500' : 'text-black'}`}>
               {inLibrary ? 'In Library' : 'Add to Library'}
             </Text>
          </Pressable>
        </View>

        {/* 📝 DESCRIPTION */}
        <View className="px-4 mt-6">
           <Text className="text-gray-300 text-sm leading-relaxed" numberOfLines={6}>
             {manga.description}
           </Text>
           {/* Tags */}
           <View className="flex-row flex-wrap gap-2 mt-4">
             {manga.tags?.slice(0, 5).map((tag: string) => (
               <View key={tag} className="px-2 py-1 rounded bg-gray-800 border border-white/10">
                 <Text className="text-[10px] text-gray-400 uppercase tracking-wider">{tag}</Text>
               </View>
             ))}
           </View>
        </View>

        {/* 📑 CHAPTERS HEADER */}
        <View className="px-4 mt-8 pb-2 border-b border-white/10 flex-row justify-between items-end">
          <Text className="text-white text-lg font-bold">Chapters</Text>
          <Text className="text-gray-500 text-xs mb-1">{chapters?.length || 0} found</Text>
        </View>
      </View>
    );
  };

  const renderChapter = ({ item }: { item: Chapter }) => (
    <Pressable className="px-4 py-3 flex-row items-center justify-between active:bg-white/5 border-b border-white/5">
      <View className="flex-1 pr-4">
        <Text className="text-white font-medium text-sm">
          Chapter {item.chapter}
        </Text>
        <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>
          {item.title || `Chapter ${item.chapter}`}
        </Text>
        <Text className="text-gray-600 text-[10px] mt-1">
          {item.scanGroup || 'Unknown Group'} • {new Date(item.publishAt).toLocaleDateString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#404040" />
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : (
        <View className="flex-1 w-full h-full">
           <FlashList
            data={chapters}
            renderItem={renderChapter}
            estimatedItemSize={70}
            ListHeaderComponent={Header}
            contentContainerStyle={{ paddingBottom: 40 }}
            drawDistance={2000}
          />
          
          {/* Back Button Overlay */}
          <View className="absolute top-4 left-4 z-50">
             <Pressable 
               className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
               onPress={() => router.back()}
             >
               <Ionicons name="arrow-back" size={24} color="white" />
             </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}