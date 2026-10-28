import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    margin: 0;
    min-width: 320px;
    font-family: 'Montserrat', sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: ${p => p.theme.colors.text};
    background: ${p => p.theme.colors.bg};
  }

  h1, h2, h3, p, ul {
    margin: 0;
    padding: 0;
  }

  ul {
    list-style: none;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button, input {
    font: inherit;
  }

  button {
    cursor: pointer;
  }

  img {
    display: block;
    max-width: 100%;
  }
`;

export default GlobalStyle;
