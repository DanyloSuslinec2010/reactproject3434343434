import { useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import styles from './RegisterModal.module.css';

export default function RegisterModal({ onClose, onRegister, onLogin }) {
  const [isLogin, setIsLogin] = useState(false);
  const formik = useFormik({
    initialValues: { name: '', email: '', password: '' },
    onSubmit: (values) => {
      const email = values.email.trim();
      if (isLogin) {
        return onLogin({ email, password: values.password });
      }

      return onRegister({
        name: values.name.trim(),
        email,
        password: values.password,
      });
    },
  });

  function switchMode() {
    setIsLogin(!isLogin);
    formik.resetForm();
  }

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className={styles.backdrop} role="presentation" onMouseDown={handleBackdropClick}>
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
      >
        <h2 id="register-title">{isLogin ? 'Log In' : 'Sign up'}</h2>
        <form className={styles.form} onSubmit={formik.handleSubmit}>
          {!isLogin && (
            <div className={styles.field}>
              <label htmlFor="register-name">Username</label>
              <input
                id="register-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Username"
                value={formik.values.name}
                onChange={formik.handleChange}
                required
              />
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="register-email">E-Mail</label>
            <input
              id="register-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="E-Mail"
              value={formik.values.email}
              onChange={formik.handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              minLength={isLogin ? undefined : 6}
              required
            />
          </div>

          <button
            className={styles.submit}
            type="submit"
            disabled={formik.isSubmitting}
          >
            {isLogin ? 'Log In' : 'Sign up'}
          </button>
        </form>

        <p className={styles.switchText}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button className={styles.switchButton} type="button" onClick={switchMode}>
            {isLogin ? 'Sign up' : 'Log In'}
          </button>
        </p>
      </section>
    </div>
  );
}

RegisterModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onRegister: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
};
