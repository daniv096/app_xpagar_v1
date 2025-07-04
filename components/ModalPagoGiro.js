// ModalPagoGiro.js
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../constants/colors";
import { useRoute } from "@react-navigation/native";
import MetodoPagoModal from '../components/MetodoPagoModal';

const ModalPagoGiro = ({ visible, onClose }) => {
  const [modoPago, setModoPago] = useState("completo"); // 'completo' o 'abono'
  const [giros, setGiros] = useState([]);
  const [seleccionados, setSeleccionados] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const route = useRoute();
  const { usu_codigo } = route.params || {};
  const [datosParaMetodoPago, setDatosParaMetodoPago] = useState(null);

  const [loading, setLoading] = useState(true);

  const mostrarModal = () => {
    setModalVisible(true); // Mostrar el modal
  };

  const ocultarModal = () => {
    setModalVisible(false); // Ocultar el modal
  };

  // Función para manejar la confirmación del pago en el modal
  const manejarPago = (datos) => {
    console.log('Pago confirmado:', datos);
    setModalVisible(false); // Cierra el modal después de confirmar
    onClose(); // Ahora sí cierras ModalPagoGiro
  };

  useEffect(() => {
    fetchMovimientos();
  }, []); // Llama a fetchMovimientos solo una vez al cargar el componente

  useEffect(() => {
    fetchMovimientos();
  }, [usu_codigo]); // Vuelve a llamar cuando el `usu_codigo` cambia

  const formatNumber = (number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  // Fetch de los giros
  const fetchMovimientos = async () => {
    try {
      const response = await fetch(
        `https://nodejs-mysql-restapi-production-d0f6.up.railway.app/api/movimientos/${usu_codigo}`
      );
      const data = await response.json();

      // Convertimos los montos e intereses de cadena a número
      const dataConvertida = data.map((item) => ({
        ...item,
        monto_interes: parseFloat(item.monto_interes),
        monto_pago: parseFloat(item.monto_pago),
        total_pagado: parseFloat(item.total_pagado),
      }));

      setGiros(dataConvertida); // Asignamos los datos convertidos
    } catch (error) {
      console.error("Error al obtener los movimientos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Total por pago completo
  const totalAbono = giros.reduce(
    (acc, g) =>
      seleccionados[g.mov_numref] ? acc + g.monto_pago + g.monto_interes : acc,
    0
  );

  const toggleSeleccionado = (mov_numref) => {
    setSeleccionados((prev) => ({ ...prev, [mov_numref]: !prev[mov_numref] }));
  };

  const handleConfirmar = () => {
    const seleccion = modoPago === "completo" ? "Pago completo" : "Abono parcial";
    const total = modoPago === "completo" ? totalCompleto : totalAbono;
    const tipoPago = "Avance de Efectivo Credito";

    const movimientosSeleccionados = modoPago === "completo"
    ? giros
    : giros.filter(g => seleccionados[g.mov_numref]);

    const datosPago = {
        tipoPago,
        total,
        usuario: usu_codigo,
        cantGiros: cantidadGiros,
      };

    setDatosParaMetodoPago(datosPago); 
    mostrarModal(); 
    console.log(`Confirmado: ${seleccion} - Total: ${total}`);
    console.log("Datos enviados al metodo de pago:", datosPago)
    
    // Mostrar modal de método de pago
    
  };

  const totalMontos = giros.reduce((sum, giro) => sum + giro.monto_pago, 0);
  const totalIntereses = giros.reduce(
    (sum, giro) => sum + giro.monto_interes,
    0
  );
  const totalCompleto = totalMontos + totalIntereses;
  const cantidadGiros = giros.length;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.titulo}>Pagar Giros</Text>

          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[
                styles.switchButton,
                modoPago === "completo" && styles.switchActive,
              ]}
              onPress={() => setModoPago("completo")}
            >
              <Text style={styles.switchText}>Pago Completo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.switchButton,
                modoPago === "abono" && styles.switchActive,
              ]}
              onPress={() => setModoPago("abono")}
            >
              <Text style={styles.switchText}>Abono Parcial</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            {modoPago === "completo" ? (
              <View style={styles.cardTotal}>
                <Text style={styles.totalLabel}>
                  Pagando {cantidadGiros} giros
                </Text>

                <View style={styles.totalRow}>
                  <Text style={styles.etiqueta}>Montos:</Text>
                  <Text style={styles.valor}>{formatNumber(totalMontos)}</Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.etiqueta}>Intereses:</Text>
                  <Text style={styles.valor}>
                    {formatNumber(totalIntereses)}
                  </Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.etiquetaTotal}>Total a Pagar:</Text>
                  <Text style={styles.totalMonto}>
                    {formatNumber(totalCompleto)}
                  </Text>
                </View>
              </View>
            ) : (
              giros.map((giro) => (
                <View key={giro.mov_numref} style={styles.cardAbono}>
                  <View style={styles.filaReferenciaFecha}>
                    <View style={styles.itemDato}>
                      <Text style={styles.etiqueta}>📎 Referencia</Text>
                      <Text style={styles.valor}>{giro.mov_numref}</Text>
                    </View>
                    <View style={styles.itemDato}>
                      <Text style={styles.etiqueta}>📅 Fecha</Text>
                      <Text style={styles.valor}>{giro.fecha_pago}</Text>
                    </View>
                  </View>

                  <View style={styles.cardFila}>
                    <View style={styles.filaDatos}>
                      <View style={styles.itemDato}>
                        <Text style={styles.etiqueta}>Avance</Text>
                        <Text style={styles.valor}>
                          {formatNumber(giro.monto_pago)}
                        </Text>
                      </View>
                      <View style={styles.itemDato}>
                        <Text style={styles.etiqueta}>Interés</Text>
                        <Text style={styles.valor}>
                          {formatNumber(giro.monto_interes)}
                        </Text>
                      </View>
                      <View style={styles.itemDato}>
                        <Text style={styles.etiqueta}>Total a Pagar</Text>
                        <Text style={styles.valor}>
                          {formatNumber(giro.monto_pago + giro.monto_interes)}
                        </Text>
                      </View>
                    </View>

                    <Switch
                      value={seleccionados[giro.mov_numref]}
                      onValueChange={() => toggleSeleccionado(giro.mov_numref)}
                      trackColor={{ false: "#ccc", true: "#FFA500" }}
                      thumbColor={
                        seleccionados[giro.mov_numref] ? "#FFA500" : "#f4f3f4"
                      }
                    />
                  </View>
                </View>
              ))
            )}

            {modoPago === "abono" && (
              <Text style={styles.totalAbono}>
                Total Seleccionado: {formatNumber(totalAbono)}
              </Text>
            )}
          </ScrollView>

          <View style={styles.container}>
            <TouchableOpacity
              style={styles.botonConfirmar}
              onPress={handleConfirmar}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.botonTexto}>Confirmar Pago</Text>
            </TouchableOpacity>
            {/* Modal de método de pago */}
            <MetodoPagoModal
              visible={modalVisible}
              onClose={ocultarModal}
              onSubmit={manejarPago}
              datosPago={datosParaMetodoPago}
            />
          </View>

          <TouchableOpacity style={styles.cerrarBtn} onPress={onClose}>
            <Text style={styles.cerrarTexto}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: colors.primary,
    textAlign: "center",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  switchButton: {
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    backgroundColor: "#ccc",
  },
  switchActive: {
    backgroundColor: colors.primary,
  },
  switchText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cardTotal: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    margin: 12,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 10,
    textAlign: "center",
  },
  totalMonto: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.primary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  cardAbono: {
    backgroundColor: "#ee1e1", // Gris más oscuro
    borderRadius: 3,
    padding: 10,
    marginBottom: 12,
    elevation: 6, // Sombra más pronunciada
    shadowColor: "#000", // Sombra negra para contraste
    shadowOffset: { width: 0, height: 2 }, // Desplazamiento de la sombra
    shadowOpacity: 0.2, // Opacidad de la sombra
    shadowRadius: 4, // Difusión de la sombra
  },
  giroTexto: {
    fontSize: 10,
    color: "#333",
  },
  giroTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  totalAbono: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.secondary,
    textAlign: "right",
    marginTop: 10,
  },
  botonConfirmar: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  botonTexto: {
    color: "#fff",
    fontSize: 16,
  },
  cerrarBtn: {
    alignItems: "center",
    marginTop: 10,
  },
  cerrarTexto: {
    color: "#999",
  },
  filaDatos: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  },
  filaReferenciaFecha: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  itemDato: {
    marginRight: 10,
  },
  etiqueta: {
    color: "#333", // Gris oscuro para mejor contraste
    fontSize: 13,
    color: "#FFA500", // naranja
    fontWeight: "bold",
    textShadowColor: "#000", // Sombra sutil para resaltar más
    //textShadowOffset: { width: 1, height: 1 },
    //textShadowRadius: 3,
  },
  valor: {
    fontSize: 18,
    color: "#007BFF", // azul
  },

  cardFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  etiquetaTotal: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },

  totalMonto: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0066CC",
  },
});

export default ModalPagoGiro;
