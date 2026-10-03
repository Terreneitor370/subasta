// Integrante 1 - Frontend
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import { supabase } from "../../src/lib/supabase";
import { ui } from "../../src/lib/ui";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const registrar = async () => {
    // El trigger crear_perfil_usuario() crea la fila en public.usuarios con este nombre
    const { error } = await supabase.auth.signUp({
      email: correo.trim(),
      password,
      options: { data: { nombre } },
    });
    if (error) return Alert.alert("Error", error.message);
    router.replace("/(tabs)");
  };

  return (
    <View style={[ui.pantalla, { justifyContent: "center", gap: 12 }]}>
      <Text style={ui.titulo}>Crear cuenta</Text>
      <TextInput style={ui.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={ui.input} placeholder="Correo" autoCapitalize="none" keyboardType="email-address" value={correo} onChangeText={setCorreo} />
      <TextInput style={ui.input} placeholder="Contrasena (min. 6)" secureTextEntry value={password} onChangeText={setPassword} />
      <Pressable style={ui.boton} onPress={registrar}>
        <Text style={ui.botonTexto}>Registrarme</Text>
      </Pressable>
    </View>
  );
}
