'use client';
import React, { useState, useEffect } from 'react';
import { ToastContainer } from "react-toastify";
import { Poppins } from 'next/font/google';
import { triggerKeyPress, triggerMediaKeyPress, adjustVolume, triggerSleep } from './api';
import { useLocalStorage } from './hooks/useLocalStorage';
import { BrightnessControls } from './components/BrightnessControls';
import { VolumeControls } from './components/VolumeControls';
import { CircularProgressBar } from './components/CircularProgressBar';
import { ColorPickerModal } from './components/ColorPickerModal';

const poppins = Poppins({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export default function HomeScreen() {
  const [volume, setVolume] = useState('');
  const [color, setColor] = useLocalStorage('backgroundColor', '#434343');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    adjustVolume('current', volume, setVolume); // fetch current volume from server
  }, []);

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <div
      style={{
        background: `linear-gradient(to bottom, ${color},#000000)`,
      }}
      className={poppins.className}
    >
      <ToastContainer />
      <div style={styles.container}>
        <button
          style={styles.item}
          onClick={() => triggerSleep()}
        >
          <img
            width='25'
            height='25'
            alt='sleep'
            src={`/images/sleep.png`}
          />
        </button>

        <div style={styles.row}>
          <button
            style={styles.item}
            onClick={() => triggerMediaKeyPress('previous_track')}
          >
            <img
              width='25'
              height='25'
              alt='previous track'
              src={`/images/track-prev.png`}
            />
          </button>

          <button
            style={styles.item}
            onClick={() => triggerMediaKeyPress('play_pause')}
          >
            <img
              width='25'
              height='25'
              alt='play/pause'
              src={`/images/play.png`}
            />
          </button>

          <button
            style={styles.item}
            onClick={() => triggerMediaKeyPress('next_track')}
          >
            <img
              width='25'
              height='25'
              alt='next track'
              src={`/images/track-next.png`}
            />
          </button>
        </div>

        <div style={styles.row}>
          <button
            style={styles.item}
            onClick={() => triggerKeyPress('left_arrow')}
          >
            <img
              width='25'
              height='25'
              alt='left arrow key'
              src={`/images/arrow-left.png`}
            />
          </button>

          <button
            style={styles.item}
            onClick={() => triggerKeyPress('spacebar')}
          >
            <img
              width='25'
              height='25'
              alt='space'
              src={`/images/space.png`}
            />
          </button>

          <button
            style={styles.item}
            onClick={() => triggerKeyPress('right_arrow')}
          >
            <img
              width='25'
              height='25'
              alt='right arrow key'
              src={`/images/arrow-right.png`}
            />
          </button>
        </div>

        <div style={styles.buttonRow}>
          <BrightnessControls />

          <div style={styles.column}>
            <CircularProgressBar volume={volume} />
          </div>

          <VolumeControls setVolume={setVolume} volume={volume}/>
        </div>

        <div style={styles.colorModalButton}>
          <button style={styles.item} onClick={openModal}>
            <img
              width='25'
              height='25'
              alt='colorpicker'
              src={`/images/color-picker.png`}
            />
          </button>
        </div>

        <ColorPickerModal
          color={color}
          setColor={setColor}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    color: 'white',
  },
  item: {
    width: 60,
    height: 60,
    color: 'red',
    margin: 10,
    padding: 7,
    borderWidth: 3,
    borderRadius: 50,
    borderColor: '#FFFFFF',
    borderStyle: 'solid',
    background: 'none',
  },
  column: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
  },
  row: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row' as 'row',
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'row' as 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginLeft: 80,
    marginRight: 80,
    gap: 25,
  },
  closeButton: {
    display: 'flex',
    flex: 1,
    justifyContent: 'flex-end',
  },
  colorModalButton: {
    margin: 20,
  },
  volumeRow: {
    flexDirection: 'row' as 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
