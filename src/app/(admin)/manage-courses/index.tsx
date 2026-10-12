import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { 
  UploadCloud, 
  Download, 
  FileSpreadsheet, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  X, 
  Eye, 
  FileText 
} from 'lucide-react-native';
import { useManageDataViewModel } from '../../../viewmodels/useManageDataViewModel';

export default function ManageDataScreen() {
  const { 
    loadingCourses, 
    loadingStudents, 
    coursesResult,
    studentsResult,
    coursesHistory,
    studentsHistory,
    isModalVisible,
    modalTitle,
    modalDuplicatedItems,
    handleDownloadTemplate, 
    handleUploadFile,
    openDuplicatedModal,
    closeDuplicatedModal
  } = useManageDataViewModel();

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6">
      <View className="mb-6 mt-4">
        <View className="bg-indigo-100 self-start px-3 py-1 rounded-full mb-2">
          <Text className="text-indigo-800 font-bold text-xs uppercase tracking-wider">Módulo Administrativo</Text>
        </View>
        <Text className="text-3xl font-black text-slate-800">Carga y Auditoría</Text>
        <Text className="text-slate-500 font-medium text-sm mt-1">
          Importa archivos masivos con detección automática de duplicados y registro histórico.
        </Text>
      </View>

      {/* ================= SECCIÓN 1: CURSOS Y GRUPOS ================= */}
      <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
        <View className="flex-row items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <View className="flex-row items-center flex-1">
            <View className="bg-blue-100 p-3 rounded-2xl mr-3">
              <BookOpen color="#2563eb" size={26} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-slate-800">Cursos y Grupos</Text>
              <Text className="text-slate-400 font-medium text-xs">Asignaturas, códigos y cupos</Text>
            </View>
          </View>
        </View>

        {/* Acciones de Descarga y Carga */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center bg-slate-100 py-3.5 px-3 rounded-2xl border border-slate-200"
            onPress={() => handleDownloadTemplate('courses')}
          >
            <Download color="#475569" size={18} className="mr-2" />
            <Text className="text-slate-700 font-bold text-xs">Plantilla</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-2 flex-row items-center justify-center bg-blue-600 py-3.5 px-4 rounded-2xl shadow-sm active:bg-blue-700"
            onPress={() => handleUploadFile('courses')}
            disabled={loadingCourses}
          >
            {loadingCourses ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <UploadCloud color="white" size={20} className="mr-2" />
                <Text className="text-white font-extrabold text-sm">Subir Excel (.xlsx)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Panel de Métricas de la Carga de Cursos */}
        {coursesResult && (
          <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-2">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Balance de la Carga ({coursesResult.filename})
              </Text>
              <View className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                <Text className="text-blue-700 font-bold text-xs">{coursesResult.total_rows} filas</Text>
              </View>
            </View>

            <View className="flex-row gap-2 mb-3">
              <View className="flex-1 bg-white p-3 rounded-xl border border-slate-100 items-center">
                <Text className="text-xs font-bold text-slate-400 uppercase">Leídos</Text>
                <Text className="text-xl font-black text-slate-800 mt-0.5">{coursesResult.total_rows}</Text>
              </View>

              <View className="flex-1 bg-white p-3 rounded-xl border border-emerald-100 items-center">
                <Text className="text-xs font-bold text-emerald-600 uppercase">Nuevos</Text>
                <Text className="text-xl font-black text-emerald-600 mt-0.5">+{coursesResult.created_count}</Text>
              </View>

              <View className="flex-1 bg-white p-3 rounded-xl border border-amber-100 items-center">
                <Text className="text-xs font-bold text-amber-600 uppercase">Duplicados</Text>
                <Text className="text-xl font-black text-amber-600 mt-0.5">{coursesResult.duplicated_count}</Text>
              </View>
            </View>

            {/* Botón Ver Duplicados si existen */}
            {coursesResult.duplicated_count > 0 && (
              <TouchableOpacity
                onPress={() => openDuplicatedModal(
                  `Cursos Duplicados Omitidos (${coursesResult.filename})`,
                  coursesResult.duplicated_items
                )}
                className="bg-amber-100 py-2.5 px-4 rounded-xl flex-row items-center justify-between border border-amber-200 active:bg-amber-200"
              >
                <View className="flex-row items-center flex-1">
                  <AlertTriangle color="#d97706" size={16} className="mr-2" />
                  <Text className="text-amber-800 font-bold text-xs">
                    {coursesResult.duplicated_count} cursos ya existían en la app
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-amber-700 font-extrabold text-xs mr-1">Ver lista</Text>
                  <Eye color="#b45309" size={14} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Historial Breve de Cargas de Cursos */}
        {coursesHistory.length > 0 && (
          <View className="mt-4 pt-3 border-t border-slate-100">
            <View className="flex-row items-center mb-2">
              <History color="#64748b" size={14} className="mr-1.5" />
              <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider">Historial de Subidas</Text>
            </View>
            {coursesHistory.slice(0, 2).map((item) => (
              <View key={item.id} className="flex-row items-center justify-between py-1.5">
                <View className="flex-1 mr-2">
                  <Text className="text-slate-700 font-bold text-xs" numberOfLines={1}>{item.filename}</Text>
                  <Text className="text-slate-400 text-[10px]">{item.created_at ? new Date(item.created_at).toLocaleString('es-PE') : ''}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <View className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Text className="text-emerald-700 font-bold text-[10px]">+{item.created_count}</Text>
                  </View>
                  <View className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Text className="text-amber-700 font-bold text-[10px]">{item.duplicated_count} dup.</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ================= SECCIÓN 2: PADRÓN DE ESTUDIANTES ================= */}
      <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-12">
        <View className="flex-row items-center justify-between mb-5 pb-3 border-b border-slate-100">
          <View className="flex-row items-center flex-1">
            <View className="bg-emerald-100 p-3 rounded-2xl mr-3">
              <Users color="#059669" size={26} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-slate-800">Padrón de Estudiantes</Text>
              <Text className="text-slate-400 font-medium text-xs">CUI, nombres y correos institucionales</Text>
            </View>
          </View>
        </View>

        {/* Acciones de Descarga y Carga */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity 
            className="flex-1 flex-row items-center justify-center bg-slate-100 py-3.5 px-3 rounded-2xl border border-slate-200"
            onPress={() => handleDownloadTemplate('students')}
          >
            <FileSpreadsheet color="#475569" size={18} className="mr-2" />
            <Text className="text-slate-700 font-bold text-xs">Plantilla</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-2 flex-row items-center justify-center bg-emerald-600 py-3.5 px-4 rounded-2xl shadow-sm active:bg-emerald-700"
            onPress={() => handleUploadFile('students')}
            disabled={loadingStudents}
          >
            {loadingStudents ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <UploadCloud color="white" size={20} className="mr-2" />
                <Text className="text-white font-extrabold text-sm">Subir Excel (.xlsx)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Panel de Métricas de la Carga de Alumnos */}
        {studentsResult && (
          <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-2">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Balance de la Carga ({studentsResult.filename})
              </Text>
              <View className="bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Text className="text-emerald-700 font-bold text-xs">{studentsResult.total_rows} filas</Text>
              </View>
            </View>

            <View className="flex-row gap-2 mb-3">
              <View className="flex-1 bg-white p-3 rounded-xl border border-slate-100 items-center">
                <Text className="text-xs font-bold text-slate-400 uppercase">Leídos</Text>
                <Text className="text-xl font-black text-slate-800 mt-0.5">{studentsResult.total_rows}</Text>
              </View>

              <View className="flex-1 bg-white p-3 rounded-xl border border-emerald-100 items-center">
                <Text className="text-xs font-bold text-emerald-600 uppercase">Nuevos</Text>
                <Text className="text-xl font-black text-emerald-600 mt-0.5">+{studentsResult.created_count}</Text>
              </View>

              <View className="flex-1 bg-white p-3 rounded-xl border border-amber-100 items-center">
                <Text className="text-xs font-bold text-amber-600 uppercase">Duplicados</Text>
                <Text className="text-xl font-black text-amber-600 mt-0.5">{studentsResult.duplicated_count}</Text>
              </View>
            </View>

            {/* Botón Ver Duplicados si existen */}
            {studentsResult.duplicated_count > 0 && (
              <TouchableOpacity
                onPress={() => openDuplicatedModal(
                  `Alumnos Duplicados Omitidos (${studentsResult.filename})`,
                  studentsResult.duplicated_items
                )}
                className="bg-amber-100 py-2.5 px-4 rounded-xl flex-row items-center justify-between border border-amber-200 active:bg-amber-200"
              >
                <View className="flex-row items-center flex-1">
                  <AlertTriangle color="#d97706" size={16} className="mr-2" />
                  <Text className="text-amber-800 font-bold text-xs">
                    {studentsResult.duplicated_count} alumnos ya figuraban en la base de datos
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Text className="text-amber-700 font-extrabold text-xs mr-1">Ver lista</Text>
                  <Eye color="#b45309" size={14} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Historial Breve de Cargas de Alumnos */}
        {studentsHistory.length > 0 && (
          <View className="mt-4 pt-3 border-t border-slate-100">
            <View className="flex-row items-center mb-2">
              <History color="#64748b" size={14} className="mr-1.5" />
              <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider">Historial de Subidas</Text>
            </View>
            {studentsHistory.slice(0, 2).map((item) => (
              <View key={item.id} className="flex-row items-center justify-between py-1.5">
                <View className="flex-1 mr-2">
                  <Text className="text-slate-700 font-bold text-xs" numberOfLines={1}>{item.filename}</Text>
                  <Text className="text-slate-400 text-[10px]">{item.created_at ? new Date(item.created_at).toLocaleString('es-PE') : ''}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <View className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Text className="text-emerald-700 font-bold text-[10px]">+{item.created_count}</Text>
                  </View>
                  <View className="bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <Text className="text-amber-700 font-bold text-[10px]">{item.duplicated_count} dup.</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* ================= MODAL / VISOR DE DUPLICADOS OMITIDOS ================= */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[85%] shadow-2xl">
            {/* Header del Modal */}
            <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
              <View className="flex-1 mr-2">
                <Text className="text-lg font-black text-slate-800" numberOfLines={1}>{modalTitle}</Text>
                <Text className="text-xs text-slate-400 font-medium">Registros omitidos para evitar duplicidad</Text>
              </View>
              <TouchableOpacity onPress={closeDuplicatedModal} className="bg-slate-100 p-2 rounded-full">
                <X color="#64748b" size={20} />
              </TouchableOpacity>
            </View>

            {/* Explicación institucional */}
            <View className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 my-4 flex-row items-start">
              <AlertTriangle color="#d97706" size={18} className="mr-2.5 mt-0.5" />
              <Text className="text-amber-900 text-xs font-semibold flex-1 leading-relaxed">
                Estos registros ya existían en la base de datos de la app. Fueron conservados sin alteraciones para preservar sus grupos y matrículas vigentes.
              </Text>
            </View>

            {/* Lista de Registros Duplicados */}
            <ScrollView className="mb-4">
              {modalDuplicatedItems.length === 0 ? (
                <Text className="text-slate-400 text-center py-6">No hay detalles disponibles.</Text>
              ) : (
                modalDuplicatedItems.map((item, index) => (
                  <View 
                    key={index}
                    className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-2.5 flex-row items-center justify-between"
                  >
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className="bg-slate-200 px-2 py-0.5 rounded">
                          <Text className="text-slate-700 font-black text-xs">{item.identifier}</Text>
                        </View>
                        <Text className="text-slate-800 font-bold text-sm flex-1" numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                      <Text className="text-slate-500 text-xs">{item.reason}</Text>
                    </View>
                    <View className="bg-amber-100 px-2 py-1 rounded-md border border-amber-200">
                      <Text className="text-amber-800 font-bold text-[10px]">Omitido</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Botón Cerrar */}
            <TouchableOpacity
              onPress={closeDuplicatedModal}
              className="bg-slate-800 py-3.5 rounded-2xl items-center"
            >
              <Text className="text-white font-black text-sm">Entendido y Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
