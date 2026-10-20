import styled from 'styled-components';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';
import { WiDayCloudy } from 'react-icons/wi';
import Container from './Container';

const links = [
  { href: '#cities', label: 'Міста' },
  { href: '#news', label: 'Новини' },
  { href: '#gallery', label: 'Галерея' },
];

const socials = [
  { href: 'https://facebook.com', label: 'Facebook', Icon: FaFacebookF },
  { href: 'https://instagram.com', label: 'Instagram', Icon: FaInstagram },
  { href: 'https://twitter.com', label: 'Twitter', Icon: FaTwitter },
];

export default function Footer() {
  return (
    <Wrapper>
      <Container>
        <Inner>
          <Logo>
            <WiDayCloudy size={36} />
            Weather
          </Logo>

          <Nav>
            {links.map(link => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </Nav>

          <Socials>
            {socials.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer noopener" aria-label={label}>
                <Icon size={18} />
              </a>
            ))}
          </Socials>
        </Inner>
        <Copy>© {new Date().getFullYear()} Weather App. Дані погоди: Open-Meteo</Copy>
      </Container>
    </Wrapper>
  );
}

const Wrapper = styled.footer`
  padding: 32px 0 24px;
  color: #fff;
  background: #16263a;

  ${p => p.theme.media.desktop} {
    padding: 48px 0 32px;
  }
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  ${p => p.theme.media.tablet} {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const Logo = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 20px;
  font-weight: 700;
`;

const Nav = styled.nav`
  display: flex;
  gap: 24px;

  a:hover {
    color: ${p => p.theme.colors.heroFrom};
  }
`;

const Socials = styled.div`
  display: flex;
  gap: 12px;

  a {
    display: flex;
    padding: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.12);
    transition: background 0.2s;
  }

  a:hover {
    background: ${p => p.theme.colors.primary};
  }
`;

const Copy = styled.p`
  margin-top: 24px;
  font-size: 14px;
  text-align: center;
  opacity: 0.6;
`;
