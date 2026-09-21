import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLoginViewModel } from '../../viewmodels/useLoginViewModel';
import { Mail, Lock, LogIn } from 'lucide-react-native';

export default function LoginScreen() {
  const { email, setEmail, cui, setCui, loading, handleLogin } = useLoginViewModel();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-8">
        
        {/* Cabecera */}
        <View className="items-center mb-12">
          <View className="bg-indigo-100 p-4 rounded-full mb-6">
            <LogIn color="#4f46e5" size={48} />
          </View>
          <Text className="text-4xl font-extrabold text-slate-800 text-center">Bienvenido</Text>
          <Text className="text-slate-500 text-center mt-2 text-base">Ingresa con tus credenciales de la UNSA</Text>
        </View>

        {/* Formulario */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Correo Institucional</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
              <Mail color="#94a3b8" size={20} className="mr-3" />
              <TextInput 
                className="flex-1 text-slate-800 text-base"
                placeholder="ejemplo@unsa.edu.pe"
                placeholderTextColor="#cbd5e1"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Contraseña (CUI)</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
              <Lock color="#94a3b8" size={20} className="mr-3" />
              <TextInput 
                className="flex-1 text-slate-800 text-base"
                placeholder="Ingresa tu CUI (8 dígitos)"
                placeholderTextColor="#cbd5e1"
                value={cui}
                onChangeText={setCui}
                secureTextEntry
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity 
            className="bg-indigo-600 rounded-2xl py-4 mt-8 shadow-sm items-center justify-center"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Ingresar al Sistema</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}
