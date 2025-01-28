import React from 'react';
import { adjustVolume, externalMediaSource } from '../../app/api';
import Image from 'next/image';

interface VolumeControlsProps {
  volume: string;
  setVolume: React.Dispatch<React.SetStateAction<string>>;
}


export const VolumeControls = ({
  setVolume,
  volume
}: VolumeControlsProps) => {
  return (
    <div style={styles.column}>
      <button
        style={styles.item}
        onClick={() => adjustVolume('volume_up', volume, setVolume)}
      >
        <Image
          width='25'
          height='25'
          alt='volume up'
          src={`/images/volume-up.png`}
        />
      </button>
      <button
        style={styles.item}
        onClick={() => adjustVolume('volume_down', volume, setVolume)}
      >
        <Image
          width='25'
          height='25'
          alt='volume down'
          src={`/images/volume-down.png`}
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
