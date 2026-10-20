import { useState } from 'react';
import { WiDayCloudy } from 'react-icons/wi';
import { useUser } from '../../context/UserContext';
import Modal from '../Modal/Modal';
import RegisterForm from '../RegisterForm/RegisterForm';
import styles from './Header.module.css';

export default function Header() {
  const { user, register, logOut } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRegister = values => {
    register(values);
    setIsModalOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <a href="#top" className={styles.logo}>
          <WiDayCloudy size={36} />
          <span>Weather</span>
        </a>

        <nav className={styles.nav}>
          <a href="#weather">Погода</a>
          <a href="#news">Новини</a>
          <a href="#gallery">Галерея</a>
        </nav>

        {user ? (
          <button
            type="button"
            className={styles.userName}
            title="Натисніть, щоб вийти"
            onClick={logOut}
          >
            {user.name}
          </button>
        ) : (
          <button
            type="button"
            className={styles.btn}
            onClick={() => setIsModalOpen(true)}
          >
            Реєстрація
          </button>
        )}
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <RegisterForm onSubmit={handleRegister} />
        </Modal>
      )}
    </header>
  );
}
