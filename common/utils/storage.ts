import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { events } from './events';

type CustomStroage = {
  get: (key: string) => any;
  set: (key: string, value: any) => void;
  useStorage: <T>(key: string) => [T | undefined, (value?: T) => void];
};

const storage: CustomStroage = {
  get: (key: string) => {
    const string = localStorage.getItem(key) || '';

    try {
      return JSON.parse(string);
    } catch (err) {
      return string;
    }
  },
  set: (key: string, value: any) => {
    if (typeof value === 'undefined') {
      localStorage.removeItem(key);
    } else if (typeof value === 'object') {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
      localStorage.setItem(key, String(value));
    }
  },

  useStorage: key => {
    const [data, setData] = useState(storage.get(key));
    const handler = useRef((value: any) => {
      storage.set(key, value);
      setData(storage.get(key));
    });

    useLayoutEffect(() => {
      events.bind(key, handler.current);
      return () => {
        events.remove(key, handler.current);
      };
    }, []);

    return [data, (value?: any) => events.trigger(key, value)];
  },
};

export default storage;
