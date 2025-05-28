import React from 'react';
import { HexColorPicker } from 'react-colorful';
import Modal from 'react-modal';
import '../../../client/app/styles.css';

interface ColorPickerModalProps {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  isColorsOpen: boolean;
  setIsColorsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ColorPickerModal = ({
  color,
  setColor,
  isColorsOpen,
  setIsColorsOpen,
}: ColorPickerModalProps) => {
  const closeModal = () => { setIsColorsOpen(false); };
  return (
    <div>
      <Modal isOpen={isColorsOpen} onRequestClose={closeModal} ariaHideApp={false}>
        <div style={styles.colorPicker}>
          <HexColorPicker color={color} onChange={setColor} />
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  colorPicker: {
    display: 'flex',
    flex: '0 0 100%',
  },
};
