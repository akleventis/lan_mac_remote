import React from 'react';
import { HexColorPicker } from 'react-colorful';
import Modal from 'react-modal';
import '../../../client/app/styles.css';

interface ColorPickerModalProps {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string | undefined>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ColorPickerModal = ({
  color,
  setColor,
  isOpen,
  setIsOpen,
}: ColorPickerModalProps) => {
  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <Modal isOpen={isOpen} onRequestClose={closeModal} ariaHideApp={false}>
        <button style={styles.item} onClick={closeModal}>
          <img
            width='25'
            height='25'
            alt='exit'
            src={`/images/x.png`}
          />
        </button>

        <div style={styles.colorPicker}>
          <HexColorPicker color={color} onChange={setColor} />
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  item: {
    marginBottom: 10,
    padding: 0,
    borderColor: '#FFFFFF',
    borderStyle: 'solid',
    background: 'none',
  },
  colorPicker: {
    display: 'flex',
    flex: '0 0 100%',
  },
};
