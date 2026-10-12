import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCourseDetailViewModel } from '../../../../viewmodels/useCourseDetailViewModel';
import { ArrowLeft, Users, Pencil, Trash2, Plus, Clock, ChevronRight, X } from 'lucide-react-native';

export default function CourseScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const {
    course,
    loading,
    creating,
    showAddModal,
    setShowAddModal,
    newGroupName,
    setNewGroupName,
    newGroupSchedule,
    setNewGroupSchedule,
    newGroupVacancies,
    setNewGroupVacancies,
    confirmDeleteGroup,
    handleCreateGroup,
  } = useCourseDetailViewModel(String(id));

  if (!course && loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  if (!course) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-6">
        <Text className="text-slate-800 font-bold text-lg">Asignatura no encontrada</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-slate-800 px-6 py-2.5 rounded-xl"
        >
          <Text className="text-white font-bold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      {/* Botón Volver */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center mb-6 self-start py-1 pr-3"
      >
        <ArrowLeft color="#64748b" size={22} />
        <Text className="text-slate-500 font-bold ml-2 text-base">Volver a los Cursos</Text>
      </TouchableOpacity>

      {/* Cabecera del Curso */}
      <View className="mb-6">
        <View className="flex-row items-center flex-wrap gap-2 mb-2">
          <View className="bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
            <Text className="text-indigo-800 font-bold text-xs uppercase tracking-wider">
              {course.lab_code ? `Lab: ${course.lab_code}` : 'Laboratorio'}
            </Text>
          </View>
          <View className="bg-slate-200 px-3 py-1 rounded-full">
            <Text className="text-slate-700 font-bold text-xs">
              Semestre {course.semester}
            </Text>
          </View>
        </View>

        <Text className="text-3xl font-black text-slate-800 leading-tight mb-1">
          {course.name}
        </Text>
        <Text className="text-slate-500 font-medium text-sm">
          Código Teórico: {course.theoretical_code}
        </Text>
      </View>

      {/* Barra de Título y Botón Agregar Grupo */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Users color="#4f46e5" size={22} className="mr-2" />
          <Text className="text-xl font-black text-slate-800">
            Grupos ({course.groups?.length || 0})
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center shadow-xs"
        >
          <Plus color="white" size={18} className="mr-1" />
          <Text className="text-white font-bold text-xs">Nuevo Grupo</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Cartas de Grupos */}
      {(!course.groups || course.groups.length === 0) ? (
        <View className="bg-white p-8 rounded-3xl border border-slate-200 items-center justify-center my-4">
          <Users color="#94a3b8" size={36} className="mb-2 opacity-50" />
          <Text className="text-slate-600 font-bold text-base text-center">
            No hay grupos registrados
          </Text>
          <Text className="text-slate-400 text-xs text-center mt-1">
            Presiona "+ Nuevo Grupo" para añadir el primer laboratorio.
          </Text>
        </View>
      ) : (
        course.groups.map((group: any) => (
          <TouchableOpacity
            key={group.id}
            activeOpacity={0.7}
            onPress={() => router.push(`/(admin)/home/group/${group.id}` as any)}
            className="bg-white p-5 rounded-3xl shadow-xs border border-slate-200 mb-4"
          >
            {/* Fila superior de la carta: Nombre del grupo y acciones */}
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="bg-indigo-600 w-10 h-10 rounded-xl items-center justify-center mr-3">
                  <Text className="text-white font-black text-base">{group.name}</Text>
                </View>
                <View>
                  <Text className="text-lg font-black text-slate-800">
                    Grupo {group.name}
                  </Text>
                  <Text className="text-xs font-semibold text-slate-400">
                    Toca para ver o modificar
                  </Text>
                </View>
              </View>

              {/* Botón Lápiz y Botón Tacho integrados en la tarjeta */}
              <View className="flex-row items-center gap-1.5">
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push(`/(admin)/home/group/${group.id}` as any);
                  }}
                  className="w-9 h-9 rounded-xl items-center justify-center bg-indigo-50 border border-indigo-200"
                >
                  <Pencil color="#4f46e5" size={16} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    confirmDeleteGroup(group.id, group.name);
                  }}
                  className="w-9 h-9 rounded-xl items-center justify-center bg-red-50 border border-red-200"
                >
                  <Trash2 color="#dc2626" size={16} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Horario */}
            <View className="flex-row items-center mb-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <Clock color="#64748b" size={16} className="mr-2" />
              <Text className="text-slate-600 font-medium text-xs flex-1">
                {group.schedule_range || 'Sin horario especificado'}
              </Text>
            </View>

            {/* Fila de Vacantes y Navegación */}
            <View className="flex-row items-center justify-between pt-2 border-t border-slate-100">
              <View
                className={`px-3 py-1 rounded-full border ${
                  group.is_full
                    ? 'bg-red-50 border-red-200'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <Text
                  className={`font-bold text-xs ${
                    group.is_full ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {group.initial_vacancies - group.available_vacancies}/{group.initial_vacancies}{' '}
                  {group.is_full ? 'Lleno' : 'Vacantes Ocupadas'}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Text className="text-indigo-600 font-bold text-xs mr-1">Administrar</Text>
                <ChevronRight color="#4f46e5" size={16} />
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Modal para Crear Nuevo Grupo */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <View className="flex-row items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <Text className="text-xl font-black text-slate-800">Añadir Nuevo Grupo</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X color="#94a3b8" size={24} />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Identificador / Nombre (Ej. A, B, C)
              </Text>
              <TextInput
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Ej. A"
                placeholderTextColor="#94a3b8"
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-bold"
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Horario de Laboratorio
              </Text>
              <TextInput
                value={newGroupSchedule}
                onChangeText={setNewGroupSchedule}
                placeholder="Ej. Miércoles 10:00 - 12:00"
                placeholderTextColor="#94a3b8"
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-medium"
              />
            </View>

            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">
                Capacidad de Vacantes
              </Text>
              <TextInput
                value={newGroupVacancies}
                onChangeText={setNewGroupVacancies}
                keyboardType="numeric"
                placeholder="20"
                placeholderTextColor="#94a3b8"
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 font-bold"
              />
            </View>

            <TouchableOpacity
              onPress={handleCreateGroup}
              disabled={creating}
              className="bg-indigo-600 py-3.5 rounded-2xl items-center justify-center shadow-md active:bg-indigo-700"
            >
              {creating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-extrabold text-base">Crear Grupo</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
