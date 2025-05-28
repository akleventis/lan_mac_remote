import React from 'react';
import { triggerKeyPress } from '../../app/api';

export const BrightnessControls = () => {
  return (
    <div style={styles.column}>
      <button
        style={styles.item}
        onClick={() => triggerKeyPress('brightness_up')}
      >
        <img
          width='25'
          height='25'
          alt='brightness up'
          src={`/images/brightness-up.png`}
        />
      </button>
      <button
        style={styles.item}
        onClick={() => triggerKeyPress('brightness_down')}
      >
        <img
          width='25'
          height='25'
          alt='brightness down'
          src={`/images/brightness-down.png`}
        />
      </button>
    </div>
  );
};

const styles = {
  item: {
    width: 50,
    height: 50,
    margin: 10,
    padding: 2,
    background: 'none',
    border: 'none',
  },
  column: {
    borderStyle: 'solid',
    borderRadius: 50,
    borderColor: '#FFFFFF',
    maxWidth: 70,
    marginBottom: '10px'
  },
};
