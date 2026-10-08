import { Link } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabase";
import { colores, ui } from "../lib/ui";
import { Boton } from "./Ui";
import { Marca } from "./Editorial";
export function AuthForm({ registro = false }: { registro?: boolean }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [visible, setVisible] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const ocupado = useRef(false);
  const enviar = async () => {
    if (ocupado.current) return;
    setError("");
    setAviso("");
    const email = correo.trim().toLowerCase();
    if (registro && nombre.trim().length < 2)
      return setError("Escribe tu nombre (al menos 2 caracteres).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Escribe un correo válido.");
    if (password.length < (registro ? 6 : 1))
      return setError(
        registro
          ? "La contraseña debe tener al menos 6 caracteres."
          : "Escribe tu contraseña.",
      );
    if (registro && password !== confirmacion)
      return setError("Las contraseñas no coinciden.");
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
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
            <View style={ui.hero}>
              <Text style={[ui.heroTexto, { letterSpacing: 2, fontSize: 11 }]}>
                PARTICIPA EN VIVO
              </Text>
              <Text style={ui.heroTitulo}>
                {registro
                  ? "Tu próxima pieza.\nTu propia historia."
                  : "Buenas piezas.\nMejores historias."}
              </Text>
              <Text style={ui.heroTexto}>
                Explora los productos, encuentra el tuyo y participa en su
                subasta desde tu celular.
              </Text>
            </View>
            <View style={{ gap: 16 }}>
              <Text style={ui.titulo}>
                {registro ? "Crear cuenta" : "Bienvenido de nuevo"}
              </Text>
              <Text style={ui.secundario}>
                {registro
                  ? "Regístrate para participar en las subastas."
                  : "Inicia sesión para seguir tus subastas."}
              </Text>
              {registro && (
                <View style={{ gap: 6 }}>
                  <Text style={ui.etiqueta}>Nombre</Text>
                  <TextInput
                    accessibilityLabel="Nombre"
                    style={ui.input}
                    placeholder="¿Cómo te llamas?"
                    placeholderTextColor={colores.gris}
                    value={nombre}
                    onChangeText={setNombre}
                    autoComplete="name"
                    maxLength={80}
                    editable={!enviando}
                  />
                </View>
              )}
              <View style={{ gap: 6 }}>
                <Text style={ui.etiqueta}>Correo electrónico</Text>
                <TextInput
                  accessibilityLabel="Correo electrónico"
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
                />
              </View>
              <View style={{ gap: 6 }}>
                <Text style={ui.etiqueta}>Contraseña</Text>
                <TextInput
                  accessibilityLabel="Contraseña"
                  style={ui.input}
                  placeholder={
                    registro ? "Al menos 6 caracteres" : "Tu contraseña"
                  }
                  placeholderTextColor={colores.gris}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!visible}
                  autoCapitalize="none"
                  autoComplete={registro ? "new-password" : "current-password"}
                  editable={!enviando}
                  onSubmitEditing={registro ? undefined : enviar}
                />
              </View>
              {registro && (
                <View style={{ gap: 6 }}>
                  <Text style={ui.etiqueta}>Confirmar contraseña</Text>
                  <TextInput
                    accessibilityLabel="Confirmar contraseña"
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
                </View>
              )}
              <Boton
                titulo={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
                secundario
                onPress={() => setVisible(!visible)}
              />
              {!!error && (
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
