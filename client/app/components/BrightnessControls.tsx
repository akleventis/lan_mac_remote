import React from 'react';
import {
  scanNetwork,
  triggerKeyPress,
  adjustVolume,
  reScan,
} from '../../app/api';
import Image from 'next/image';

export const BrightnessControls = (serverIP: any) => {
  return (
    <div style={styles.column}>
      <button
        style={styles.item}
        onClick={() => triggerKeyPress(serverIP, 'brightness_up')}
      >
        <Image
          width='25'
          height='25'
          alt='brightness up'
          src={`/images/light/brightness-up.png`}
        />
      </button>
      <button
        style={styles.item}
        onClick={() => triggerKeyPress(serverIP, 'brightness_down')}
      >
        <Image
          width='25'
          height='25'
          alt='brightness down'
          src={`/images/light/brightness-down.png`}
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
    flexDirection: 'column' as 'column',
    justifyContent: 'center' as 'center',
    borderStyle: 'solid',
    borderWidth: 3,
    borderRadius: 50,
    borderColor: '#FFFFFF',
    maxWidth: 70,
  },
  row: {
    flexDirection: 'row' as 'row',
  },
};
