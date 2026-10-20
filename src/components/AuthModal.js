import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { FiX } from 'react-icons/fi';
import { MainButton } from './Section';

const schema = Yup.object({
  name: Yup.string().min(2, 'Мінімум 2 символи').required("Введіть ім'я"),
  email: Yup.string().email('Некоректний email').required('Введіть email'),
  password: Yup.string().min(6, 'Мінімум 6 символів').required('Введіть пароль'),
});

export default function AuthModal({ onClose, onSubmit }) {
  useEffect(() => {
    const onKeyDown = e => {
      if (e.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <Backdrop onClick={handleBackdropClick}>
      <Modal role="dialog" aria-modal="true" aria-label="Реєстрація">
        <CloseBtn type="button" onClick={onClose} aria-label="Закрити">
          <FiX size={22} />
        </CloseBtn>
        <Title>Реєстрація</Title>

        <Formik
          initialValues={{ name: '', email: '', password: '' }}
          validationSchema={schema}
          onSubmit={values => {
            onSubmit({ name: values.name.trim(), email: values.email.trim() });
          }}
        >
          <StyledForm>
            <Label>
              Ім'я
              <Input name="name" type="text" placeholder="Ваше ім'я" autoComplete="name" />
              <Error name="name" component="p" />
            </Label>
            <Label>
              Email
              <Input name="email" type="email" placeholder="name@mail.com" autoComplete="email" />
              <Error name="email" component="p" />
            </Label>
            <Label>
              Пароль
              <Input
                name="password"
                type="password"
                placeholder="Мінімум 6 символів"
                autoComplete="new-password"
              />
              <Error name="password" component="p" />
            </Label>
            <MainButton type="submit">Зареєструватися</MainButton>
          </StyledForm>
        </Formik>
      </Modal>
    </Backdrop>,
    document.body
  );
}

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 30, 50, 0.55);
`;

const Modal = styled.div`
  position: relative;
  width: 100%;
  max-width: 320px;
  max-height: 100%;
  overflow-y: auto;
  padding: 32px 20px 24px;
  border-radius: 16px;
  background: #fff;

  ${p => p.theme.media.tablet} {
    max-width: 400px;
    padding: 40px 32px 32px;
  }

  ${p => p.theme.media.desktop} {
    max-width: 440px;
  }
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  padding: 4px;
  border: none;
  background: none;
  color: ${p => p.theme.colors.muted};

  &:hover {
    color: ${p => p.theme.colors.text};
  }
`;

const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 24px;
`;

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
`;

const Input = styled(Field)`
  padding: 10px 12px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 10px;
  font-weight: 400;
  outline: none;

  &:focus {
    border-color: ${p => p.theme.colors.primary};
  }
`;

const Error = styled(ErrorMessage)`
  font-size: 12px;
  font-weight: 400;
  color: ${p => p.theme.colors.danger};
`;
