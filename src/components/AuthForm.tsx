import { VistaConTeclado } from "./VistaConTeclado";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { colores, ui } from "../lib/ui";
import { Boton } from "./Ui";
import { Marca } from "./Editorial";
import { useCampoVisible } from "../hooks/useCampoVisible";
import { Icono } from "./Icono";
export function AuthForm({ registro = false }: { registro?: boolean }) {
  const campos = useCampoVisible();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [visible, setVisible] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [campoError, setCampoError] = useState("");
  const [aviso, setAviso] = useState("");
  const ocupado = useRef(false);
  const entradas = useRef<Record<string, TextInput | null>>({});
  const enviar = async () => {
    if (ocupado.current) return;
    setError("");
    setCampoError("");
    setAviso("");
    const email = correo.trim().toLowerCase();
    const invalido = (campo: string, mensaje: string) => {
      setCampoError(campo);
      setError(mensaje);
      entradas.current[campo]?.focus();
    };
    if (registro && (nombre.trim().length < 2 || nombre.trim().length > 80))
      return invalido(
        "nombre",
        "Escribe tu nombre (al menos 2 caracteres, máximo 80).",
      );
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return invalido("correo", "Escribe un correo válido.");
    if (password.length < (registro ? 6 : 1))
      return invalido(
        "password",
        registro
          ? "La contraseña debe tener al menos 6 caracteres."
          : "Escribe tu contraseña.",
      );
    if (registro && password.length > 128)
      return invalido(
        "password",
        "La contraseña debe tener como máximo 128 caracteres.",
      );
    if (registro && password !== confirmacion)
      return invalido("confirmacion", "Las contraseñas no coinciden.");
    ocupado.current = true;
    setEnviando(true);
    try {
      if (registro) {
        const { data, error: fallo } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nombre: nombre.trim() } },
        });
        if (fallo) throw fallo;
        if (!data.session)
          setAviso(
            "Revisa tu correo para confirmar tu cuenta. Después podrás iniciar sesión.",
          );
      } else {
        const { error: fallo } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (fallo) throw fallo;
      }
      // El layout navega cuando Supabase entrega una sesión real.
    } catch (e) {
      const codigo =
        typeof e === "object" && e !== null && "code" in e ? e.code : undefined;
      setError(
        codigo === "invalid_credentials"
          ? "El correo o la contraseña son incorrectos."
          : codigo === "email_not_confirmed"
            ? "Confirma tu correo antes de iniciar sesión."
            : codigo === "user_already_exists"
              ? "Ya existe una cuenta con ese correo."
              : "No pudimos completar la solicitud. Revisa tus datos y conexión e inténtalo de nuevo.",
      );
    } finally {
      ocupado.current = false;
      setEnviando(false);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colores.fondo }}>
      <VistaConTeclado>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ref={(vista) => {
            campos.ref.current = vista;
          }}
          onScroll={campos.onScroll}
          scrollEventThrottle={16}
          onLayout={campos.revelarCampo}
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 24,
            gap: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 480,
              alignSelf: "center",
              gap: 24,
            }}
          >
            <Marca />
            <View style={{ gap: 16 }}>
              <Text style={ui.titulo}>
                {registro ? "Crear cuenta" : "Iniciar sesión"}
              </Text>
              <Text style={ui.secundario}>
                {registro
                  ? "Únete y empieza a participar en subastas."
                  : "Accede a tus subastas."}
              </Text>
              {registro && (
                <View style={{ gap: 6 }}>
                  <Text style={ui.etiqueta}>Nombre</Text>
                  <TextInput
                    onFocus={campos.revelarCampo}
                    accessibilityLabel="Nombre"
                    ref={(entrada) => {
                      entradas.current.nombre = entrada;
                    }}
                    style={ui.input}
                    placeholder="¿Cómo te llamas?"
                    placeholderTextColor={colores.gris}
                    value={nombre}
                    onChangeText={setNombre}
                    autoComplete="name"
                    maxLength={80}
                    editable={!enviando}
                  />
                  {campoError === "nombre" && (
                    <Text style={ui.error} accessibilityRole="alert">
                      {error}
                    </Text>
                  )}
                </View>
              )}
              <View style={{ gap: 6 }}>
                <Text style={ui.etiqueta}>Correo electrónico</Text>
                <TextInput
                  onFocus={campos.revelarCampo}
                  accessibilityLabel="Correo electrónico"
                  ref={(entrada) => {
                    entradas.current.correo = entrada;
                  }}
                  style={ui.input}
                  placeholder="nombre@correo.com"
                  placeholderTextColor={colores.gris}
                  value={correo}
                  onChangeText={setCorreo}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!enviando}
                  maxLength={254}
                />
                {campoError === "correo" && (
                  <Text style={ui.error} accessibilityRole="alert">
                    {error}
                  </Text>
                )}
              </View>
              <View style={{ gap: 6 }}>
                <Text style={ui.etiqueta}>Contraseña</Text>
                <View>
                  <TextInput
                    onFocus={campos.revelarCampo}
                    accessibilityLabel="Contraseña"
                    ref={(entrada) => {
                      entradas.current.password = entrada;
                    }}
                    style={[ui.input, { paddingRight: 56 }]}
                    placeholder={
                      registro ? "Al menos 6 caracteres" : "Tu contraseña"
                    }
                    placeholderTextColor={colores.gris}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoComplete={
                      registro ? "new-password" : "current-password"
                    }
                    editable={!enviando}
                    onSubmitEditing={registro ? undefined : enviar}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      visible ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    accessibilityState={{ disabled: enviando }}
                    disabled={enviando}
                    onPress={() => setVisible(!visible)}
                    style={{
                      position: "absolute",
                      right: 4,
                      top: 4,
                      bottom: 4,
                      width: 48,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icono nombre={visible ? "ojo-cerrado" : "ojo"} />
                  </Pressable>
                </View>
                {campoError === "password" && (
                  <Text style={ui.error} accessibilityRole="alert">
                    {error}
                  </Text>
                )}
              </View>
              {registro && (
                <View style={{ gap: 6 }}>
                  <Text style={ui.etiqueta}>Confirmar contraseña</Text>
                  <TextInput
                    onFocus={campos.revelarCampo}
                    accessibilityLabel="Confirmar contraseña"
                    ref={(entrada) => {
                      entradas.current.confirmacion = entrada;
                    }}
                    style={ui.input}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={colores.gris}
                    value={confirmacion}
                    onChangeText={setConfirmacion}
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    editable={!enviando}
                    onSubmitEditing={enviar}
                  />
                  {campoError === "confirmacion" && (
                    <Text style={ui.error} accessibilityRole="alert">
                      {error}
                    </Text>
                  )}
                </View>
              )}
              {!!error && !campoError && (
                <Text
                  accessibilityRole="alert"
                  accessibilityLiveRegion="assertive"
                  style={ui.error}
                >
                  {error}
                </Text>
              )}
              {!!aviso && (
                <Text accessibilityLiveRegion="polite" style={ui.secundario}>
                  {aviso}
                </Text>
              )}
              <Boton
                titulo={registro ? "Crear mi cuenta" : "Iniciar sesión"}
                onPress={enviar}
                cargando={enviando}
              />
              <Link
                href={registro ? "/(auth)/login" : "/(auth)/registro"}
                style={ui.enlace}
              >
                {registro
                  ? "Ya tengo cuenta · Iniciar sesión"
                  : "¿Primera vez? Crea tu cuenta"}
              </Link>
            </View>
          </View>
        </ScrollView>
      </VistaConTeclado>
    </SafeAreaView>
  );
}
