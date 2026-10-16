import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Agrega el JWT a cada request si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Maneja sesion expirada / inválida
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // El 401 del login son credenciales incorrectas: lo maneja el formulario
    const esLogin = error.config?.url?.includes("/api/auth/login");
    if (error.response?.status === 401 && !esLogin) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
