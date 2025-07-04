import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

const DetallePagoModal = ({ visible, onClose, datos = {} }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [referencia, setReferencia] = useState('');
  const [bancoorg , setBancoorg] = useState('');
  const [fechapago, setFechapago ] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [montotra, setMontotra] = useState('');

  const { tipoPago, banco, rif, telefono, monto } = datos;

  if (!datos) return null;

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0]; // yyyy-mm-dd
      setFechapago(formattedDate);
    }
  };

  const handleMontoChange = (text) => {
    // Permite solo números y un punto decimal
    const nuevoValor = text.replace(/[^0-9.]/g, '');
  
    // Evita más de un punto
    if ((nuevoValor.match(/\./g) || []).length > 1) return;
  
    setMontotra(nuevoValor);
  };

  const copiarAlPortapapeles = async (texto, etiqueta) => {
    await Clipboard.setStringAsync(texto);
    Alert.alert('Copiado', `${etiqueta} copiado al portapapeles`);
  };

  const copiarTodos = async () => {
    const textoCompleto = `Tipo de Pago: ${tipoPago}\nDestino: ${banco}\nRIF/CI: ${rif}\nTeléfono: ${telefono}\nMonto a Pagar: ${monto}`;
    await Clipboard.setStringAsync(textoCompleto);
    Alert.alert('Copiado', 'Todos los datos fueron copiados al portapapeles');
  };

  const handleConfirmar = () => {
    if (!referencia.trim()) {
      Alert.alert('Error', 'Debe ingresar la referencia para confirmar el pago.');
      return;
    }

    Alert.alert('Pago Confirmado', `Referencia: ${referencia}`);
    setReferencia('');
    setMostrarFormulario(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.retroceso} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.tituloTipo}>{tipoPago}</Text>

          <ScrollView contentContainerStyle={styles.contenido}>
            <DatoItem titulo="Destino" valor={banco} onCopiar={() => copiarAlPortapapeles(banco, 'Destino')} />
            <DatoItem titulo="RIF/CI" valor={rif} onCopiar={() => copiarAlPortapapeles(rif, 'RIF/CI')} />
            <DatoItem titulo="Teléfono" valor={telefono} onCopiar={() => copiarAlPortapapeles(telefono, 'Teléfono')} />
            <DatoItem titulo="Monto a Pagar" valor={`$${monto}`} onCopiar={() => copiarAlPortapapeles(`$${monto}`, 'Monto')} />

            <TouchableOpacity style={styles.botonCopiarTodos} onPress={copiarTodos}>
              <Text style={styles.botonCopiarTexto}>Copiar Todos los Datos</Text>
            </TouchableOpacity>

            {!mostrarFormulario && (
                <TouchableOpacity style={styles.botonConfirmar} onPress={() => setMostrarFormulario(true)}>
                    <Text style={styles.botonConfirmarTexto}>Confirmar Pago</Text>
                </TouchableOpacity>
                )}

                {mostrarFormulario && (
                <>
                    {/* Botón para cerrar el formulario */}
                    <TouchableOpacity style={styles.botonCerrar} onPress={() => setMostrarFormulario(false)}>
                    <Text style={styles.botonCerrarTexto}>Cerrar</Text>
                    </TouchableOpacity>

                    {tipoPago === 'Transferencia' && (
                    <>
                        <TextInput
                        style={styles.input}
                        placeholder="Número de Referencia"
                        value={referencia}
                        onChangeText={setReferencia}
                        keyboardType="numeric"
                        />
                        <TextInput
                        style={styles.input}
                        placeholder="Banco de origen"
                        value={bancoorg}
                        onChangeText={setBancoorg}
                        />
                        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                        <TextInput
                            style={styles.input}
                            placeholder="Fecha de transferencia"
                            value={fechapago}
                            editable={false}
                        />
                        </TouchableOpacity>

                        {showDatePicker && (
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={handleDateChange}
                        />
                        )}

                        <TextInput
                        style={styles.input}
                        placeholder="Monto de la transferencia"
                        value={montotra}
                        onChangeText={handleMontoChange}
                        keyboardType="numeric"
                        />
   
                </>
                )}

                {tipoPago === 'Pago Móvil' && (
                <>
                    {/* Campos si es un pago móvil externo */}
                    <TextInput
                    style={styles.input}
                    placeholder="Número de Referencia"
                    value={referencia}
                    onChangeText={setReferencia}
                    keyboardType="numeric"
                    />
                    {/* Aquí irán más campos: Banco Emisor, Cédula, Monto, Captura */}
                </>
                )}

                <TouchableOpacity style={styles.botonEnviar} onPress={handleConfirmar}>
                <Text style={styles.botonEnviarTexto}>Enviar</Text>
                </TouchableOpacity>
            </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const DatoItem = ({ titulo, valor, onCopiar }) => (
  <View style={styles.itemContainer}>
    <Text style={styles.itemTitulo}>{titulo}</Text>
    <View style={styles.itemFila}>
      <Text style={styles.itemValor}>{valor}</Text>
      <TouchableOpacity onPress={onCopiar}>
        <Ionicons name="copy-outline" size={22} color="#007AFF" />
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    paddingTop: 40,
    elevation: 10,
    position: 'relative',
  },
  retroceso: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 8,
    backgroundColor: '#00000088',
    borderRadius: 20,
  },
  tituloTipo: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  contenido: {
    paddingBottom: 20,
  },
  itemContainer: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 10,
  },
  itemTitulo: {
    fontSize: 14,
    color: '#555',
  },
  itemFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemValor: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  botonCopiarTodos: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  botonCopiarTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botonConfirmar: {
    backgroundColor: '#28a745',
    padding: 12,
    marginTop: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonConfirmarTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  botonEnviar: {
    backgroundColor: '#007AFF',
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  botonEnviarTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  botonCerrar: {
    backgroundColor: '#ccc',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  
  botonCerrarTexto: {
    color: '#333',
    fontWeight: 'bold',
  }
});

export default DetallePagoModal;