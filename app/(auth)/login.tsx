// Integrante 1 - Frontend
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { colores, ui } from "../../src/lib/ui";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  const entrar = async () => {
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: correo.trim(), password });
    setEnviando(false);
    if (error) return Alert.alert("No se pudo iniciar sesion", error.message);
    router.replace("/(tabs)");
  };

  return (
    <View style={[ui.pantalla, { justifyContent: "center", gap: 12 }]}>
      <Text style={ui.titulo}>Subasta</Text>
      <TextInput style={ui.input} placeholder="Correo" placeholderTextColor={colores.gris} autoCapitalize="none" keyboardType="email-address" value={correo} onChangeText={setCorreo} />
      <TextInput style={ui.input} placeholder="Contrasena" placeholderTextColor={colores.gris} secureTextEntry value={password} onChangeText={setPassword} />
      <Pressable style={ui.boton} onPress={entrar} disabled={enviando}>
        <Text style={ui.botonTexto}>{enviando ? "Entrando..." : "Iniciar sesion"}</Text>
      </Pressable>
      <Link href="/(auth)/registro" style={{ textAlign: "center", marginTop: 8 }}>
        Crear cuenta
      </Link>
    </View>
  );
}
