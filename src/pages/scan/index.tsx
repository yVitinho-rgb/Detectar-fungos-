// src/pages/scan/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { analisarPlanta, ResultadoAnalise } from '../../services/cropService';
import styles, { COR_NEON, COR_BRANCO } from './styles';

const ScanIA = () => {
  const navigation = useNavigation<any>();

  const [imagemUri, setImagemUri]   = useState<string | null>(null);
  const [analisando, setAnalisando] = useState(false);
  const [resultado, setResultado]   = useState<ResultadoAnalise | null>(null);
  const [erro, setErro]             = useState<string | null>(null);

  const abrirCamera = async () => {
    Alert.alert(
      'Analisar Planta',
      'Como deseja enviar a imagem?',
      [
        {
          text: 'Câmera',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permissão negada', 'Precisamos de acesso à câmera.');
              return;
            }
            const imagem = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: true,
              aspect: [4, 3],
            });
            if (imagem.canceled || !imagem.assets?.[0]) return;
            const uri = imagem.assets[0].uri;
            setImagemUri(uri);
            setResultado(null);
            setErro(null);
            await enviarParaAPI(uri);
          },
        },
        {
          text: 'Galeria',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permissão negada', 'Precisamos de acesso à galeria.');
              return;
            }
            const imagem = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.7,
              allowsEditing: true,
              aspect: [4, 3],
            });
            if (imagem.canceled || !imagem.assets?.[0]) return;
            const uri = imagem.assets[0].uri;
            setImagemUri(uri);
            setResultado(null);
            setErro(null);
            await enviarParaAPI(uri);
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const enviarParaAPI = async (uri: string) => {
    try {
      setAnalisando(true);
      setErro(null);

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const resultado = await analisarPlanta(base64);
      setResultado(resultado);

    } catch (e: any) {
      setErro(e?.message ?? 'Erro ao analisar a planta. Tente novamente.');
    } finally {
      setAnalisando(false);
    }
  };

  const novaFoto = () => {
    setImagemUri(null);
    setResultado(null);
    setErro(null);
  };

  const renderBadge = () => {
    if (!resultado) return null;

    if (!resultado.saudavel) {
      return (
        <View style={{ backgroundColor: '#3d1a14', borderRadius: 99,
          paddingHorizontal: 14, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 12 }}>
          <Text style={{ color: '#e8644a', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
            ⚠ Problema detectado
          </Text>
        </View>
      );
    }

    if (resultado.alertaNutricional) {
      return (
        <View style={{ backgroundColor: '#3d3014', borderRadius: 99,
          paddingHorizontal: 14, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 12 }}>
          <Text style={{ color: '#f0c040', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
            ⚡ Atenção nutricional
          </Text>
        </View>
      );
    }

    return (
      <View style={{ backgroundColor: '#1a3d28', borderRadius: 99,
        paddingHorizontal: 14, paddingVertical: 5, alignSelf: 'flex-start', marginBottom: 12 }}>
        <Text style={{ color: '#3ddc84', fontSize: 12, fontWeight: '600', letterSpacing: 1 }}>
          ✔ Saudável
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <Image
        source={{
          uri: imagemUri ??
            'https://images.unsplash.com/photo-1520412099551-62b6bafdf5bb?q=80&w=1000&auto=format&fit=crop',
        }}
        style={styles.cameraPlaceholder}
        resizeMode="cover"
      />

      <View style={styles.overlayContainer}>
        <View style={styles.scannerFrame}>
          <View style={styles.laserLine} />
        </View>
        <Text style={styles.statusText}>
          {analisando
            ? 'Analisando com IA...'
            : imagemUri
            ? 'Análise concluída'
            : 'Aponte para a planta'}
        </Text>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.thumbnail}>
          <Image
            source={{
              uri: imagemUri ??
                'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=100&auto=format&fit=crop',
            }}
            style={{ width: '100%', height: '100%', borderRadius: 15 }}
          />
        </View>

        <View style={styles.infoContainer}>
          {analisando && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color={COR_NEON} />
              <Text style={styles.resultSubtitle}>Analisando...</Text>
            </View>
          )}

          {erro && !analisando && (
            <Text style={[styles.resultSubtitle, { color: '#e8644a' }]}>
              ⚠ {erro}
            </Text>
          )}

          {resultado && !analisando && (
            <>
              {renderBadge()}
              <Text style={styles.resultTitle}>{resultado.plantaNome}</Text>
              {resultado.plantaCientifico ? (
                <Text style={[styles.resultSubtitle, { fontStyle: 'italic' }]}>
                  {resultado.plantaCientifico}
                </Text>
              ) : null}

              {resultado.doencas.length > 0 && (
                <ScrollView style={{ maxHeight: 80, marginTop: 6 }} nestedScrollEnabled>
                  {resultado.doencas.map((d, i) => (
                    <Text key={i} style={[styles.resultSubtitle, {
                      color: d.categoria === 'nutricional' ? '#f0c040' : '#e8644a'
                    }]}>
                      • {d.nome} — {(d.probabilidade * 100).toFixed(0)}%
                    </Text>
                  ))}
                </ScrollView>
              )}

              {resultado.doencas.length === 0 && (
                <Text style={[styles.resultSubtitle, { color: '#3ddc84' }]}>
                  Nenhuma doença detectada 🌿
                </Text>
              )}
            </>
          )}

          {!resultado && !analisando && !erro && (
            <>
              <Text style={styles.resultTitle}>GoFarming Scan</Text>
              <Text style={styles.resultSubtitle}>Tire uma foto para analisar</Text>
            </>
          )}
        </View>

        {resultado || erro ? (
          <TouchableOpacity onPress={novaFoto}>
            <Ionicons name="refresh" size={28} color={COR_NEON} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="heart" size={28} color={COR_NEON} />
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerIsland}>
          <Text style={styles.footerBrand}>GoFarming</Text>
        </View>
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="leaf-outline" size={24} color="#888" />
            <Text style={styles.tabLabel}>Jardim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="notifications-outline" size={24} color="#888" />
            <Text style={styles.tabLabel}>Alertas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="compass-outline" size={24} color="#888" />
            <Text style={styles.tabLabel}>Explorar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="settings" size={24} color={COR_BRANCO} />
            <Text style={[styles.tabLabel, styles.tabLabelActive]}>Config</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem}>
            <Ionicons name="person-outline" size={24} color="#888" />
            <Text style={styles.tabLabel}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.floatingWrapper}>
        <View style={styles.glowBeam} />
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={abrirCamera}
          disabled={analisando}
        >
          {analisando
            ? <ActivityIndicator size="small" color={COR_BRANCO} />
            : <Ionicons name="leaf" size={26} color={COR_BRANCO} />
          }
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default ScanIA;