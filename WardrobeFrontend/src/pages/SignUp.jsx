import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import TextField from "../components/TextField";
import { registerUser } from "../api/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password, confirm }) {
  const errors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = "Enter a valid email, like name@example.com.";

  if (!password) errors.password = "Enter a password.";
  else if (password.length < 8) errors.password = "Use at least 8 characters.";

  if (!confirm) errors.confirm = "Re-enter your password.";
  else if (confirm !== password) errors.confirm = "Passwords don't match.";

  return errors;
}

// Called by App.jsx with: onRegistered (switch to Log In + show the
// "account created" notice), onGoToLogin (just switch tabs), onAboutClick.
export default function SignUp({ onRegistered, onGoToLogin, onAboutClick }) {
  const [values, setValues] = useState({ email: "", password: "", confirm: "" });
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

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await registerUser({
        email: values.email.trim(),
        password: values.password,
      });
      onRegistered();
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building your digital closet."
      onAboutClick={onAboutClick}
      footer={
        <>
          Already have an account?{" "}
          <button type="button" className="link-button" onClick={onGoToLogin}>
            Log in
          </button>
        </>
      }
    >
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
          hint="At least 8 characters."
          autoComplete="new-password"
        />
        <TextField
          id="confirm"
          label="Confirm password"
          type="password"
          value={values.confirm}
          onChange={handleChange("confirm")}
          error={errors.confirm}
          autoComplete="new-password"
        />

        {serverError && (
          <p className="form-error" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
