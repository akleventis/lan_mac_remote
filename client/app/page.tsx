"use client";
import React, { useState, useEffect } from 'react';
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
    if (serverIP !== '...searching' && serverIP !== 'no server found') {
      adjustVolume(serverIP, "current", setVolume);
    }
  }, [serverIP]); 

  return (
    <div style={styles.container}>
      <div>ip: {serverIP}</div>
      <button style={styles.button} onClick={() => triggerKeyPress(serverIP, "play_pause")}>
        play/pause
      </button>
      <button style={styles.button} onClick={() => triggerKeyPress(serverIP, "previous_track")}>
        previous track
      </button>
      <button style={styles.button} onClick={() => triggerKeyPress(serverIP, "next_track")}>
        next track
      </button>
      <button style={styles.button} onClick={() => triggerKeyPress(serverIP, "left_arrow")}>
        left arrow key
      </button>
      <button style={styles.button} onClick={() => triggerKeyPress(serverIP, "right_arrow")}>
        right arrow key
      </button>
      <button style={styles.button} onClick={() => triggerKeyPress(serverIP, "brightness_up")}>
        brightness up
      </button>
      <button style={styles.button} onClick={() => triggerKeyPress(serverIP, "brightness_down")}>
        brightness down
      </button>
      <button style={styles.button} onClick={() => adjustVolume(serverIP, "volume_up", setVolume)}>
        volume up
      </button>
      <button style={styles.button} onClick={() => adjustVolume(serverIP, "volume_down", setVolume)}>
        volume down
      </button>
      <button style={styles.button} onClick={() => reScan(i, incrRescan, setServerIP)}>rescan</button>
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
  button: {
    margin: "5px 0",
  }
};