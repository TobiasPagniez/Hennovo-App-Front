import api from "./api";

export async function login(email, password) {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data; // AuthResponse: token, type, id, nombre, apellido, email, rol
}
