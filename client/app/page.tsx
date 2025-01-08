'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { scanNetwork, triggerKeyPress, adjustVolume, reScan } from './api';
import { BrightnessControls } from './components/BrightnessControls';
import { VolumeControls } from './components/VolumeControls';
import { Poppins } from 'next/font/google';
import { HexColorPicker } from 'react-colorful';
import Modal from 'react-modal';
import '../../client/app/styles.css';
import { useLocalStorage } from './hooks/useLocalStorage';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import AnimatedProgressProvider from './providers/AnimatedProgressProvider';
import { easeQuadInOut } from 'd3-ease';

// manually add ip in the overrideIP variable below to skip network scan
const overrideIP = '';

const poppins = Poppins({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export default function HomeScreen() {
  const [serverIP, setServerIP] = useState('...searching');
  const [volume, setVolume] = useState(75);
  const [i, incrRescan] = useState(0);
  const [color, setColor] = useLocalStorage('backgroundColor', '#434343');
  const [modalIsOpen, setIsOpen] = useState(false);

  // allow override on known network
  useEffect(() => {
    if (overrideIP) {
      setServerIP(overrideIP);
    } else {
      scanNetwork(setServerIP);
    }
  }, [overrideIP, i]);

  // fetch current volume from server
  useEffect(() => {
    adjustVolume(serverIP, 'current', setVolume);
  }, [serverIP]);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <div
      style={{
        background: `linear-gradient(to bottom, ${color},#000000)`,
      }}
    >
      <div style={styles.container}>
        <div className={poppins.className}>ip: {serverIP}</div>

        <div style={styles.row}>
          <button
            style={styles.item}
            onClick={() => triggerKeyPress(serverIP, 'previous_track')}
          >
            <Image
              width='25'
              height='25'
              alt='previous track'
              src={`/images/light/track-prev.png`}
            />
          </button>
          <button
            style={styles.item}
            onClick={() => triggerKeyPress(serverIP, 'next_track')}
          >
            <Image
              width='25'
              height='25'
              alt='next track'
              src={`/images/light/track-next.png`}
            />
          </button>
        </div>

        <div style={styles.row}>
          <button
            style={styles.item}
            onClick={() => triggerKeyPress(serverIP, 'left_arrow')}
          >
            <Image
              width='25'
              height='25'
              alt='left arrow key'
              src={`/images/light/arrow-left.png`}
            />
          </button>
          <button
            style={styles.item}
            onClick={() => triggerKeyPress(serverIP, 'play_pause')}
          >
            <Image
              width='25'
              height='25'
              alt='play/pause'
              src={`/images/light/play.png`}
            />
          </button>
          <button
            style={styles.item}
            onClick={() => triggerKeyPress(serverIP, 'right_arrow')}
          >
            <Image
              width='25'
              height='25'
              alt='right arrow key'
              src={`/images/light/arrow-right.png`}
            />
          </button>
        </div>

        <div style={styles.buttonRow}>
          <BrightnessControls serverIP={serverIP} />

          <div style={styles.column}>
            <div
              className={poppins.className}
              style={{ width: '60px', margin: '10px' }}
            >
              <AnimatedProgressProvider easingFunction={easeQuadInOut} repeat>
                {(value) => {
                  const roundedValue = Math.round(volume);
                  return (
                    <CircularProgressbar
                      strokeWidth={6}
                      value={volume}
                      text={`${roundedValue}`}
                      styles={buildStyles({
                        // Rotation of path and trail, in number of turns (0-1)
                        rotation: 0.5,

                        // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
                        strokeLinecap: 'round',

                        // Text size
                        textSize: '24px',

                        // How long animation takes to go from one percentage to another, in seconds
                        pathTransition: 'none',

                        // Can specify path transition in more detail, or remove it entirely
                        // pathTransition: 'none',

                        // Colors
                        pathColor: `rgba(255, 255, 255)`,
                        textColor: '#FFFFFF',
                        trailColor: 'rgba(0, 0, 0, 0)',
                        backgroundColor: '#3e98c7',
                      })}
                    />
                  );
                }}
              </AnimatedProgressProvider>
            </div>
            <button
              style={styles.item}
              onClick={() => reScan(i, incrRescan, setServerIP)}
            >
              <Image
                width='25'
                height='25'
                alt='rescan'
                src={`/images/light/rescan.png`}
              />
            </button>
          </div>

          <VolumeControls serverIP={serverIP} setVolume={setVolume} />
        </div>

        <div style={styles.colorModalButton}>
          <button style={styles.item} onClick={openModal}>
            <Image
              width='25'
              height='25'
              alt='colorpicker'
              src={`/images/light/color-picker.png`}
            />
          </button>
        </div>

        <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
          <button className='close-button' onClick={closeModal}>
            <Image
              width='25'
              height='25'
              alt='next track'
              src={`/images/dark/x.png`}
            />
          </button>

          <div className='color-picker'>
            <HexColorPicker color={color} onChange={setColor} />
          </div>
        </Modal>
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
