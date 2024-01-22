export const genId = () =>
  `${Math.round(Math.random() * 1e9).toString(36)}${Date.now().toString(
    36,
  )}${Math.round(Math.random() * 1e9).toString(36)}`;

export const filterOption = (input: string, option?: { label: string }) =>
  (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
