import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorLogin, setErrorLogin] = useState(null);

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
      } else {
        setErrorLogin(
          "Ocurrió un error al iniciar sesión. Intentá nuevamente.",
        );
      }
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Hennovo</h1>

        <label>Email</label>
        <input
          type="email"
          {...register("email", { required: "El email es obligatorio" })}
        />
        {errors.email && <span>{errors.email.message}</span>}

        <label>Contraseña</label>
        <input
          type="password"
          {...register("password", {
            required: "La contraseña es obligatoria",
          })}
        />
        {errors.password && <span>{errors.password.message}</span>}

        {errorLogin && <p className="error-login">{errorLogin}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
