import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import DetallePagoModal from './DetallePagoModal'; // asegúrate que esta ruta es correcta

const MetodoPagoModal = ({ visible, onClose, onSubmit, datosPago }) => {
  const [metodo, setMetodo] = useState('');
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [datosDetalle, setDatosDetalle] = useState({});
  const [formulario, setFormulario] = useState({
    banco: '',
    referencia: '',
    monto: '',
    descripcion: '',
  });

  const handleInput = (key, value) => {
    setFormulario(prev => ({ ...prev, [key]: value }));
  };

  const handleConfirmar = () => {
    onSubmit({
      tipoPago: metodo,
      ...formulario,
    });
    setMetodo('');
    setFormulario({
      banco: '',
      referencia: '',
      monto: '',
      descripcion: '',
    });
    onClose();
  };
/*
  const renderFormulario = () => {
    if (!metodo) return null;

    return (
      <View style={styles.formulario}>
        {(metodo === 'Transferencia' || metodo === 'Pago Móvil' || metodo === 'Depósito') && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Banco"
              value={formulario.banco}
              onChangeText={text => handleInput('banco', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Referencia"
              keyboardType="numeric"
              value={formulario.referencia}
              onChangeText={text => handleInput('referencia', text)}
            />
          </>
        )}
        <TextInput
          style={styles.input}
          placeholder="Monto"
          keyboardType="numeric"
          value={formulario.monto}
          onChangeText={text => handleInput('monto', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Descripción (opcional)"
          value={formulario.descripcion}
          onChangeText={text => handleInput('descripcion', text)}
        />

        <TouchableOpacity style={styles.botonConfirmar} onPress={handleConfirmar}>
          <Text style={styles.botonConfirmarTexto}>Confirmar Pago</Text>
        </TouchableOpacity>
      </View>
    );
  };
*/
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.titulo}>Selecciona el Método de Pago</Text>

          <View style={styles.resumenPago}>
            <Text style={styles.resumenTexto}>Tipo: Avance de Efectivo</Text>
            <Text style={styles.resumenTexto}>Nº de Pagos: {datosPago?.cantGiros || '-'}</Text>
            <Text style={styles.resumenTexto}>Monto Total: $ {datosPago?.total || '-'}</Text>
          </View>

          <View style={styles.botonesMetodo}>
            {['Transferencia', 'Pago Móvil', 'Depósito', 'Billetera'].map(opcion => (
              <TouchableOpacity
                key={opcion}
                style={[
                  styles.botonMetodo,
                  metodo === opcion && styles.metodoSeleccionado,
                ]}
                onPress={() => {
                  setMetodo(opcion);
                  setDatosDetalle({
                    tipoPago: opcion,
                    banco: 'Banco de Venezuela',
                    rif: 'J-12345678-9',
                    telefono: '04141234567',
                    monto: datosPago?.total || 0,
                  });
                  setModalDetalleVisible(true);
                }}
              >
                <Text style={styles.textoMetodo}>{opcion}</Text>
              </TouchableOpacity>
            ))}
          </View>

         

          <TouchableOpacity style={styles.cerrar} onPress={onClose}>
            <Text style={styles.cerrarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        <DetallePagoModal
          visible={modalDetalleVisible}
          onClose={() => setModalDetalleVisible(false)}
          datos={datosDetalle}
        />
      </View>
    </Modal>
  );
};

export default MetodoPagoModal;

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', // cambia de 'flex-end' a 'center'
        alignItems: 'center',     // centra horizontalmente
      },
      modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20, // bordeado uniforme
        width: '90%',     // opcional: ajusta el ancho del modal centrado
        maxHeight: '80%', // opcional: límite de altura si hay mucho contenido
      },
  titulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resumenPago: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#e6f0ff',
    borderRadius: 10,
  },
  resumenTexto: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  botonesMetodo: {
    flexDirection: 'column', // <-- vertical
    marginBottom: 10,
  },
  botonMetodo: {
    backgroundColor: '#2980b9',
    padding: 12,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  metodoSeleccionado: {
    backgroundColor: '#1c5980',
  },
  textoMetodo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  formulario: {
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  botonConfirmar: {
    backgroundColor: '#27ae60',
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonConfirmarTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cerrar: {
    marginTop: 15,
    alignItems: 'center',
  },
  cerrarTexto: {
    color: '#999',
  },
});

