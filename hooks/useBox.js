import React, { useState, useCallback } from 'react';
import CustomAlert from '../components/CustomAlert';

export function useBox() {
  const [visible, setVisible] = useState(false);
  const [content, setContent] = useState({ title: '', message: '', buttonText: 'Aceptar' });

  const box = useCallback((title, message, buttonText = 'Aceptar') => {
    setContent({ title, message, buttonText });
    setVisible(true);
  }, []);

  const BoxComponent = (
    <CustomAlert
      visible={visible}
      title={content.title}
      message={content.message}
      buttonText={content.buttonText}
      onClose={() => setVisible(false)}
    />
  );

  return { box, BoxComponent };
}