import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import styles from './RegisterForm.module.css';

const schema = Yup.object({
  name: Yup.string().min(2, 'Мінімум 2 символи').required('Введіть ім\'я'),
  email: Yup.string().email('Невірна пошта').required('Введіть пошту'),
  password: Yup.string().min(6, 'Мінімум 6 символів').required('Введіть пароль'),
});

export default function RegisterForm({ onSubmit }) {
  const formik = useFormik({
    initialValues: { name: '', email: '', password: '' },
    validationSchema: schema,
    onSubmit: values => onSubmit(values),
  });

  const renderField = (name, label, type = 'text') => (
    <label className={styles.label}>
      {label}
      <input
        className={styles.input}
        type={type}
        name={name}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched[name] && formik.errors[name] && (
        <span className={styles.error}>{formik.errors[name]}</span>
      )}
    </label>
  );

  return (
    <form className={styles.form} onSubmit={formik.handleSubmit} noValidate>
      <h2 className={styles.title}>Реєстрація</h2>
      {renderField('name', "Ім'я")}
      {renderField('email', 'Пошта', 'email')}
      {renderField('password', 'Пароль', 'password')}
      <button className={styles.submit} type="submit">
        Зареєструватися
      </button>
    </form>
  );
}

RegisterForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
