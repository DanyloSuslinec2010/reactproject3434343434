import React, { useState } from 'react';
import styled from 'styled-components';

export const SearchForm = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() === '') return;

    onSearch(query.trim());
    setQuery('');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        type="text"
        placeholder="Введіть назву міста..."
        value={query}
        onChange={handleChange}
      />
      <Button type="submit">Пошук</Button>
    </Form>
  );
};

const Form = styled.form`
  display: flex;
  gap: 12px;
  max-width: 500px;
  width: 100%;
  margin: 20px 0;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px 16px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  outline: none;

  &:focus {
    border-color: #3b82f6;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #2563eb;
  }
`;