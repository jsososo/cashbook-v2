import { Buffer } from 'buffer';

const getKeyAndSplitStr = (): string => {
  let key = process.env.NEXT_PUBLIC_KEY || '123948713985';
  while (key.length < 30) {
    key += key;
  }

  return key;
};

export const encode = (...str: string[]): string => {
  const key = getKeyAndSplitStr();
  return Buffer.from(
    Buffer.from(str.join(key)).toString('binary').split('').reverse().join(''),
  ).toString('base64');
};

export const decode = (str: string): string[] => {
  const key = getKeyAndSplitStr();
  return Buffer.from(
    Buffer.from(str, 'base64').toString().split('').reverse().join(''),
    'binary',
  )
    .toString()
    .split(key);
};
