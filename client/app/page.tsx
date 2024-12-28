"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { scanNetwork, triggerKeyPress, adjustVolume, reScan } from "./api";

// manually add ip in the overrideIP variable below to skip network scan
const overrideIP = ''

export default function HomeScreen() {
  const [serverIP, setServerIP] = useState('...searching');
  const [volume, setVolume] = useState("")
  const [i, incrRescan] = useState(0)

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
    adjustVolume(serverIP, "current", setVolume);
  }, [serverIP]);

  return (
    <div style={styles.container}>
      <div>ip: {serverIP}</div>

      <div style={styles.row}>
        <button style={styles.item} onClick={() => triggerKeyPress(serverIP, "previous_track")}>
          <Image width="25" height="25" alt="previous track" src={`/images/track-prev.png`} />
        </button>
        <button style={styles.item} onClick={() => triggerKeyPress(serverIP, "next_track")}>
          <Image width="25" height="25" alt="next track" src={`/images/track-next.png`} />
        </button>
      </div>
      
      <div style={styles.row}>
        <button style={styles.item} onClick={() => triggerKeyPress(serverIP, "left_arrow")}>
          <Image width="25" height="25" alt="left arrow key" src={`/images/arrow-left.png`} />
        </button>
        <button style={styles.item} onClick={() => triggerKeyPress(serverIP, "play_pause")}>
          <Image width="25" height="25" alt="play/pause" src={`/images/play.png`} />
        </button>
        <button style={styles.item} onClick={() => triggerKeyPress(serverIP, "right_arrow")}>
          <Image width="25" height="25" alt="right arrow key" src={`/images/arrow-right.png`} />
        </button>
      </div>

      <div style={styles.buttonRow}>
        <div style={styles.column}>
          <button style={styles.item} onClick={() => triggerKeyPress(serverIP, "brightness_up")}>
            <Image width="25" height="25" alt="brightness up" src={`/images/brightness-up.png`} />
          </button>
          <button style={styles.item} onClick={() => triggerKeyPress(serverIP, "brightness_down")}>
            <Image width="25" height="25" alt="brightness down" src={`/images/brightness-down.png`} />
          </button>
        </div>

        <button style={styles.item} onClick={() => reScan(i, incrRescan, setServerIP)}>
          <Image width="25" height="25" alt="rescan" src={`/images/rescan.png`} />
        </button>

        <div style={styles.column}>
          <button style={styles.item} onClick={() => adjustVolume(serverIP, "volume_up", setVolume)}>
            <Image width="25" height="25" alt="volume up" src={`/images/volume-up.png`} />
          </button>
          <button style={styles.item} onClick={() => adjustVolume(serverIP, "volume_down", setVolume)}>
            <Image width="25" height="25" alt="volume down" src={`/images/volume-down.png`} />
          </button>
        </div>

      </div>

      <div>volume: {volume}</div>
    </div>
  );
}


const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
  },
  item: {
    margin: 10,
    width: 50,
    height: 50,
    padding: 5,
    borderRadius: 10,
    borderColor: '#d26ffc',
  },
  column: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
  },
  row: {
    display: 'flex',
    flexDirection: 'row' as 'row',
  },
  buttonRow: {
    display: 'flex',
    flexDirection: 'row' as 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 80,
    marginRight: 80,
  },
};