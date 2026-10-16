import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorLogin, setErrorLogin] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(data) {
    setErrorLogin(null);
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 401) {
        setErrorLogin("Email o contraseña incorrectos.");
      } else if (err.response?.status === 403 || err.response?.status === 429) {
        setErrorLogin(err.response.data?.detail ?? err.response.data?.message);
      } else {
        setErrorLogin("Ocurrió un error al iniciar sesión. Intentá nuevamente.");
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <p className="login-brand-titulo">Hennovo</p>
          <p className="login-brand-subtitulo">Ingresá a tu cuenta</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              {...register("email", { required: "El email es obligatorio" })}
            />
            {errors.email && (
              <span className="login-field-error">{errors.email.message}</span>
            )}
          </div>

          <div className="login-field">
            <label>Contraseña</label>
            <div className="login-password">
              <input
                type={mostrarPassword ? "text" : "password"}
                {...register("password", {
                  required: "La contraseña es obligatoria",
                })}
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setMostrarPassword((v) => !v)}
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="login-field-error">
                {errors.password.message}
              </span>
            )}
          </div>

          {errorLogin && <p className="login-error-api">{errorLogin}</p>}

          <button type="submit" className="login-button" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
