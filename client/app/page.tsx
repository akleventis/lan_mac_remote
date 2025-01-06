'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { scanNetwork, triggerKeyPress, adjustVolume, reScan } from './api';
import { BrightnessControls } from './components/BrightnessControls';
import { VolumeControls } from './components/VolumeControls';
import { Poppins } from 'next/font/google';

// manually add ip in the overrideIP variable below to skip network scan
const overrideIP = '';

const poppins = Poppins({
  weight: ['400', '700'], // Add the weights you need
  subsets: ['latin'],
  variable: '--font-poppins',
});

export default function HomeScreen() {
  const [serverIP, setServerIP] = useState('...searching');
  const [volume, setVolume] = useState('');
  const [i, incrRescan] = useState(0);

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

  return (
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

        <VolumeControls serverIP={serverIP} setVolume={setVolume} />
      </div>

      <div className={poppins.className}>volume: {volume}</div>
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
    backgroundColor: '#434343',
    background: 'linear-gradient(to bottom, #434343,#000000)',
  },
  item: {
    width: 50,
    height: 50,
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
    gap: 20,
  },
};
