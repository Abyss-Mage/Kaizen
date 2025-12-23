import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from 'nativewind';

interface MangaCardProps {
  id: string;
  title: string;
  coverUrl: string | null;
  statusRaw?: string;  // Made optional for safety
  statusScan?: string; // Made optional for safety
}

export function MangaCard({ id, title, coverUrl, statusRaw = 'Unknown', statusScan = 'Unknown' }: MangaCardProps) {
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'hiatus': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    <Link href={`/manga/${id}`} asChild>
      <Pressable className="group relative w-[48%] aspect-[3/4] overflow-hidden rounded-xl bg-gray-900 border border-white/10 active:opacity-90 active:scale-[0.98] transition-all">
        
        {/* 🖼️ IMAGE: Skia-backed High Performance Image */}
        {coverUrl ? (
          <Image
            source={{ uri: coverUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200} // Smooth fade-in
            cachePolicy="memory-disk" 
          />
        ) : (
          <View className="flex-1 items-center justify-center bg-gray-800">
            <Text className="text-gray-500 text-xs font-bold">No Cover</Text>
          </View>
        )}

        {/* 🌑 GRADIENT OVERLAY: Native Implementation */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
          locations={[0, 0.5, 1]}
          className="absolute inset-0"
        />

        {/* ℹ️ CONTENT LAYER */}
        <View className="absolute bottom-0 w-full p-3">
          <Text 
            numberOfLines={2} 
            className="text-sm font-bold text-white leading-tight mb-3"
          >
            {title}
          </Text>

          {/* 🚨 DUAL-STATUS INDICATORS */}
          <View className="flex-col gap-1.5">
            {/* Author Status */}
            <View className="flex-row items-center justify-between">
              <Text className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Author
              </Text>
              <View className={`px-1.5 py-0.5 rounded border ${getStatusColor(statusRaw)}`}>
                <Text className={`text-[9px] font-bold uppercase tracking-wider ${getStatusColor(statusRaw).split(' ')[1]}`}>
                  {statusRaw}
                </Text>
              </View>
            </View>

            {/* Scan Status */}
            <View className="flex-row items-center justify-between">
              <Text className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                Scan
              </Text>
              <View className={`px-1.5 py-0.5 rounded border ${getStatusColor(statusScan)}`}>
                <Text className={`text-[9px] font-bold uppercase tracking-wider ${getStatusColor(statusScan).split(' ')[1]}`}>
                  {statusScan}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}