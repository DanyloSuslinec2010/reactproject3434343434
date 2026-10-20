import { useState } from 'react';
import styled from 'styled-components';
import { FiMenu, FiX, FiUser, FiLogOut } from 'react-icons/fi';
import { WiDayCloudy } from 'react-icons/wi';
import Container from './Container';
import AuthModal from './AuthModal';
import { MainButton } from './Section';

const links = [
  { href: '#cities', label: 'Міста' },
  { href: '#news', label: 'Новини' },
  { href: '#gallery', label: 'Галерея' },
];

export default function Header({ user, onRegister, onLogout }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSubmit = userData => {
    onRegister(userData);
    setIsModalOpen(false);
  };

  return (
    <Wrapper>
      <Container>
        <Bar>
          <Logo href="#top">
            <WiDayCloudy size={36} />
            Weather
          </Logo>

          <Nav $open={isMenuOpen}>
            {links.map(link => (
              <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </Nav>

          <Right>
            {user ? (
              <UserBox>
                <UserName>
                  <FiUser /> {user.name}
                </UserName>
                <LogoutBtn type="button" onClick={onLogout} aria-label="Вийти">
                  <FiLogOut size={18} />
                </LogoutBtn>
              </UserBox>
            ) : (
              <MainButton type="button" onClick={() => setIsModalOpen(true)}>
                Реєстрація
              </MainButton>
            )}

            <Burger
              type="button"
              onClick={() => setIsMenuOpen(prev => !prev)}
              aria-label="Меню"
            >
              {isMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
            </Burger>
          </Right>
        </Bar>
      </Container>

      {isModalOpen && (
        <AuthModal onClose={() => setIsModalOpen(false)} onSubmit={handleSubmit} />
      )}
    </Wrapper>
  );
}

const Wrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: #fff;
  box-shadow: 0 2px 10px rgba(30, 60, 100, 0.08);
`;

const Bar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 64px;

  ${p => p.theme.media.desktop} {
    height: 76px;
  }
`;

const Logo = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 20px;
  font-weight: 700;
  color: ${p => p.theme.colors.primary};
`;

const Nav = styled.nav`
  position: absolute;
  top: 64px;
  left: -16px;
  right: -16px;
  display: ${p => (p.$open ? 'flex' : 'none')};
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px 16px;
  background: #fff;
  box-shadow: 0 8px 12px rgba(30, 60, 100, 0.08);

  a {
    padding: 8px 0;
    font-weight: 500;
  }

  a:hover {
    color: ${p => p.theme.colors.primary};
  }

  ${p => p.theme.media.tablet} {
    position: static;
    display: flex;
    flex-direction: row;
    gap: 28px;
    padding: 0;
    background: none;
    box-shadow: none;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Burger = styled.button`
  display: flex;
  padding: 4px;
  border: none;
  background: none;
  color: ${p => p.theme.colors.text};

  ${p => p.theme.media.tablet} {
    display: none;
  }
`;

const UserBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserName = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;

  ${p => p.theme.media.tablet} {
    max-width: 220px;
  }
`;

const LogoutBtn = styled.button`
  display: flex;
  padding: 6px;
  border: none;
  border-radius: 8px;
  background: ${p => p.theme.colors.bg};
  color: ${p => p.theme.colors.muted};

  &:hover {
    color: ${p => p.theme.colors.danger};
  }
`;
