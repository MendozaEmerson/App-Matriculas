import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGroupDetailViewModel } from '../../../../viewmodels/useGroupDetailViewModel';
import { ArrowLeft, Pencil, Trash2, Save, X, Clock, Users, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react-native';

export default function GroupDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const groupId = Number(id);

  const {
    group,
    loading,
    saving,
    deleting,
    isEditing,
    error,
    name,
    setName,
    scheduleRange,
    setScheduleRange,
    initialVacancies,
    setInitialVacancies,
    toggleEdit,
    saveChanges,
    confirmDelete,
  } = useGroupDetailViewModel(groupId, () => {
    router.back();
  });

  if (loading && !group) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text className="text-slate-500 font-medium mt-3">Cargando información del grupo...</Text>
      </View>
    );
  }

  if (error || !group) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50 p-6">
        <AlertCircle color="#ef4444" size={48} />
        <Text className="text-slate-800 text-lg font-bold mt-4 text-center">No se pudo cargar el grupo</Text>
        <Text className="text-slate-500 text-sm mt-1 text-center">{error || 'Grupo no encontrado'}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-slate-800 px-6 py-3 rounded-xl"
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
        <Text className="text-slate-500 font-bold ml-2 text-base">Volver a la Asignatura</Text>
      </TouchableOpacity>

      {/* Encabezado del Curso */}
      <View className="mb-4">
        <View className="flex-row items-center flex-wrap gap-2 mb-1">
          <View className="bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
            <Text className="text-indigo-800 font-bold text-xs uppercase tracking-wider">
              {group.course_lab_code ? `Lab: ${group.course_lab_code}` : 'Laboratorio'}
            </Text>
          </View>
          <View className="bg-slate-200 px-3 py-1 rounded-full">
            <Text className="text-slate-700 font-bold text-xs">
              Año {group.course_year || 'Académico'}
            </Text>
          </View>
        </View>
        <Text className="text-2xl font-black text-slate-800 mt-1">{group.course_name}</Text>
      </View>

      {/* Tarjeta Principal del Grupo */}
      <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6">
        {/* Cabecera de la Tarjeta */}
        <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
          <View className="flex-row items-center">
            <View className="bg-indigo-600 w-12 h-12 rounded-2xl items-center justify-center mr-3 shadow-sm">
              <Text className="text-white font-black text-xl">{group.name}</Text>
            </View>
            <View>
              <Text className="text-xl font-black text-slate-800">
                Grupo {isEditing ? name : group.name}
              </Text>
              <Text className="text-xs font-semibold text-slate-400">
                {isEditing ? 'Modo Edición Activado' : 'Detalles del Horario y Cupos'}
              </Text>
            </View>
          </View>

          {/* Acciones: Botón Lápiz y Botón Tacho */}
          <View className="flex-row items-center gap-2">
            {/* Botón Lápiz */}
            <TouchableOpacity
              onPress={toggleEdit}
              disabled={saving || deleting}
              className={`w-11 h-11 rounded-xl items-center justify-center border ${
                isEditing
                  ? 'bg-amber-100 border-amber-300'
                  : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              {isEditing ? (
                <X color="#d97706" size={20} />
              ) : (
                <Pencil color="#4f46e5" size={20} />
              )}
            </TouchableOpacity>

            {/* Botón Tacho de Basura */}
            <TouchableOpacity
              onPress={confirmDelete}
              disabled={saving || deleting}
              className="w-11 h-11 rounded-xl items-center justify-center bg-red-50 border border-red-200 hover:bg-red-100"
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#dc2626" />
              ) : (
                <Trash2 color="#dc2626" size={20} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenido de la Tarjeta: Modo Lectura vs Modo Edición */}
        {!isEditing ? (
          <View className="pt-5">
            {/* Horario */}
            <View className="flex-row items-start mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <Clock color="#64748b" size={22} className="mt-0.5 mr-3" />
              <View className="flex-1">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Horario de Laboratorio
                </Text>
                <Text className="text-base font-bold text-slate-800 mt-0.5">
                  {group.schedule_range || 'Sin horario asignado'}
                </Text>
              </View>
            </View>

            {/* Capacidad y Vacantes */}
            <View className="flex-row gap-3 mb-2">
              <View className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Vacantes
                </Text>
                <Text className="text-2xl font-black text-slate-800 mt-1">
                  {group.initial_vacancies}
                </Text>
              </View>

              <View className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Disponibles
                </Text>
                <Text
                  className={`text-2xl font-black mt-1 ${
                    group.available_vacancies <= 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {group.available_vacancies}
                </Text>
              </View>

              <View className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Inscritos
                </Text>
                <Text className="text-2xl font-black text-indigo-600 mt-1">
                  {group.enrolled_count}
                </Text>
              </View>
            </View>

            {/* Estado de Vacantes */}
            <View
              className={`mt-3 py-2 px-4 rounded-xl flex-row items-center justify-between border ${
                group.available_vacancies <= 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  group.available_vacancies <= 0 ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                {group.available_vacancies <= 0
                  ? 'Grupo Completo (Sin vacantes)'
                  : 'Vacantes Disponibles para Matrícula'}
              </Text>
              <Text
                className={`text-xs font-black ${
                  group.available_vacancies <= 0 ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                {group.enrolled_count} / {group.initial_vacancies}
              </Text>
            </View>
          </View>
        ) : (
          <View className="pt-5">
            {/* Formulario de Edición */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Nombre del Grupo (Letra o Identificador)
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ej. A, B, C"
                placeholderTextColor="#94a3b8"
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-base font-bold focus:border-indigo-600"
              />
            </View>

            <View className="mb-4">
              <Text className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Horario de Laboratorio
              </Text>
              <TextInput
                value={scheduleRange}
                onChangeText={setScheduleRange}
                placeholder="Ej. Lunes 07:00 - 09:00"
                placeholderTextColor="#94a3b8"
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-base font-medium focus:border-indigo-600"
              />
            </View>

            <View className="mb-6">
              <Text className="text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Capacidad Total (Vacantes)
              </Text>
              <TextInput
                value={initialVacancies}
                onChangeText={setInitialVacancies}
                keyboardType="numeric"
                placeholder="Ej. 20"
                placeholderTextColor="#94a3b8"
                className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-base font-bold focus:border-indigo-600"
              />
              <Text className="text-slate-400 text-xs mt-1.5 ml-1">
                Actualmente hay {group.enrolled_count} alumnos matriculados en este grupo.
              </Text>
            </View>

            {/* Botón Guardar Cambios */}
            <TouchableOpacity
              onPress={saveChanges}
              disabled={saving}
              className="bg-indigo-600 py-4 px-6 rounded-2xl flex-row items-center justify-center shadow-md active:bg-indigo-700"
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Save color="white" size={20} className="mr-2" />
                  <Text className="text-white font-extrabold text-base">Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleEdit}
              disabled={saving}
              className="mt-3 py-3 items-center"
            >
              <Text className="text-slate-500 font-bold text-sm">Cancelar edición</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Sección: Estudiantes Matriculados en este Grupo */}
      <View className="mb-10">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Users color="#4f46e5" size={22} className="mr-2" />
            <Text className="text-xl font-black text-slate-800">Alumnos Inscritos</Text>
          </View>
          <View className="bg-slate-200 px-3 py-1 rounded-full">
            <Text className="text-slate-700 font-black text-xs">
              {group.students.length} {group.students.length === 1 ? 'Alumno' : 'Alumnos'}
            </Text>
          </View>
        </View>

        {group.students.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 border border-slate-200 items-center justify-center">
            <GraduationCap color="#94a3b8" size={40} className="mb-2 opacity-50" />
            <Text className="text-slate-600 font-bold text-base text-center">
              Sin alumnos matriculados aún
            </Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Las inscripciones de este grupo aparecerán aquí cuando los alumnos se matriculen.
            </Text>
          </View>
        ) : (
          group.students.map((student, index) => (
            <View
              key={student.cui || index}
              className="bg-white p-4 rounded-2xl border border-slate-200 mb-3 shadow-xs flex-row items-center justify-between"
            >
              <View className="flex-row items-center flex-1 mr-3">
                <View className="bg-indigo-50 w-10 h-10 rounded-xl items-center justify-center mr-3 border border-indigo-100">
                  <Text className="text-indigo-700 font-black text-sm">
                    {student.first_name ? student.first_name.charAt(0) : 'E'}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-slate-800 text-sm">
                    {student.last_name}, {student.first_name}
                  </Text>
                  <Text className="text-xs text-slate-400 mt-0.5">
                    CUI: {student.cui} {student.dni ? `• DNI: ${student.dni}` : ''}
                  </Text>
                  {student.institutional_email ? (
                    <Text className="text-xs text-indigo-600 mt-0.5">
                      {student.institutional_email}
                    </Text>
                  ) : null}
                </View>
              </View>
              <CheckCircle2 color="#059669" size={18} />
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
