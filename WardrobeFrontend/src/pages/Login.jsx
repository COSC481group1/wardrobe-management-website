import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";
import { loginUser } from "../api/auth";

// Called by App.jsx with: justRegistered (show the "account created"
// notice), onLoggedIn (switch to Homepage), onGoToSignUp, onAboutClick.
export default function Login({ justRegistered, onLoggedIn, onGoToSignUp, onAboutClick }) {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const found = {};
    if (!values.email.trim()) found.email = "Enter your email address.";
    if (!values.password) found.password = "Enter your password.";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await loginUser({ email: values.email.trim(), password: values.password });
      onLoggedIn();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Welcome back to your closet."
      onAboutClick={onAboutClick}
      footer={
        <>
          New here?{" "}
          <button type="button" className="link-button" onClick={onGoToSignUp}>
            Create an account
          </button>
        </>
      }
    >
      {justRegistered && (
        <p className="form-notice" role="status">
          Account created. Log in to get started.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          id="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={handleChange("email")}
          error={errors.email}
          autoComplete="email"
        />
        <TextField
          id="password"
          label="Password"
          type="password"
          value={values.password}
          onChange={handleChange("password")}
          error={errors.password}
          autoComplete="current-password"
        />

        {serverError && (
          <p className="form-error" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
}
