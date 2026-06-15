import React from 'react';
import { adjustVolume } from '../../app/api';

interface VolumeControlsProps {
  volume: string;
  setVolume: React.Dispatch<React.SetStateAction<string>>;
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;
}


export const VolumeControls = ({
  setVolume,
  volume,
  setMuted,
}: VolumeControlsProps) => {
  return (
    <div style={styles.column}>
      <button
        style={styles.item}
        onClick={() => adjustVolume('volume_up', volume, setVolume, setMuted)}
      >
        <img
          width='25'
          height='25'
          alt='volume up'
          src={`/images/volume-up.png`}
        />
      </button>
      <button
        style={styles.item}
        onClick={() => adjustVolume('volume_down', volume, setVolume, setMuted)}
      >
        <img
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
    borderStyle: 'solid',
    borderWidth: 2,
    borderRadius: 50,
    borderColor: '#FFFFFF',
    maxWidth: 70,
  },
};
