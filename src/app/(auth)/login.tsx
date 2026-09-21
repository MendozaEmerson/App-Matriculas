import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { GraduationCap, ShieldCheck } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center px-6 bg-slate-50">
      <View className="bg-white p-8 rounded-3xl shadow-sm w-full max-w-sm items-center border border-slate-100">
        <Text className="text-3xl font-extrabold text-slate-800 mb-2">Matrículas</Text>
        <Text className="text-slate-500 mb-8 text-center">Selecciona tu perfil para ingresar al sistema</Text>
        
        <TouchableOpacity 
          className="bg-blue-600 flex-row items-center justify-center p-4 rounded-xl w-full mb-4 shadow-sm active:bg-blue-700" 
          onPress={() => router.replace('/(student)/home')}
        >
          <GraduationCap color="white" size={24} className="mr-3" />
          <Text className="text-white font-bold text-lg ml-2">Entrar como Alumno</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-emerald-600 flex-row items-center justify-center p-4 rounded-xl w-full shadow-sm active:bg-emerald-700" 
          onPress={() => router.replace('/(admin)/home')}
        >
          <ShieldCheck color="white" size={24} className="mr-3" />
          <Text className="text-white font-bold text-lg ml-2">Administrador</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
