import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';

export const ColorPicker = ({ backgroundColor }) => {
  const [color, setColor] = useState('black');

  return (
    <div>
      <HexColorPicker
        className='colorPicker'
        color={backgroundColor}
        onChange={setColor}
      />
    </div>
  );
};
