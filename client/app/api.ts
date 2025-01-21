import { toast } from "react-toastify";

// set client <-> server port
const port = 5001;

// valid endpoints configured in server
export type ValidEndpoint = "keystroke" | "volume" | "sleep" | "verify_hammerspoon"

// valid http methods for request
export type HttpMethod = "GET" 

// sendRequest is a helper function that sends a general http request and returns the full response
export const sendRequest = async (method: HttpMethod, endpoint: ValidEndpoint, ip: string, signal?: AbortSignal, queryParams?: URLSearchParams): Promise<Response> => {
  let url = `http://${ip}:${port}/${endpoint}`;

  const queryString = queryParams?.toString();
  if (queryString) {
    url += `?${queryString}`;
  }

  const response = await fetch(url, { 
    method: method,
    signal: signal,
  });
  return response
}

// scanNetwork invokes the internal scan function to discover our server's network device's IP address using Zeroconf
export const scanNetwork = async (setServerIP: React.Dispatch<React.SetStateAction<string>>) => {
  const response = await fetch('/api/scan');
  const data = await response.json();
  if (data.devices.length > 0) {
    setServerIP(data.devices[0].address)
    return
  }
  setServerIP("no server found")
}

// verifyHammerspoon checks to see if hammerspoon is running
export const verifyHammerspoon = async(serverIP: string) => {
  // noop if serverIP is not configured
  if (serverIP == "...searching" || serverIP == "no server found") {
    return
  }

  try {
    const response = await sendRequest("GET", "verify_hammerspoon", serverIP);
    if (response && response.ok) {
      const data = await response.json();
      if (data.status == "not_running") {
        toast("Application 'Hammerspoon' not detected. Some media functionality may be limited.");
      }
    }
  } catch (error) {
    toast(`Failed to send request: ${(error as Error).message}`);
  }

}

// triggerKeyPress sends the keypress action to the /key endpoint in server.py
export const triggerKeyPress = async (serverIP: string, key_action: string) => {
  if (serverIP == "...searching" || serverIP == "no server found") {
    return
  }
    
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("action", key_action);

    const response = await sendRequest("GET", "keystroke", serverIP, undefined, queryParams);
    if (!response.ok) {
      toast(`Failed to send request: ${response.status}`);
    }
  } catch (error) {
    toast(`Failed to send request: ${(error as Error).message}`);
  }
};

// adjustVolume triggers key press and set's the volume state to value received from server
export const adjustVolume = async(serverIP: string, key_action: string, setVolume: React.Dispatch<React.SetStateAction<string>>) => {
  if (serverIP == "...searching" || serverIP == "no server found") {
    return
  }

  try {
    const queryParams = new URLSearchParams();
    queryParams.append("action", key_action);
    const response = await sendRequest("GET", "volume", serverIP, undefined, queryParams);
    if (response) {
      const data = await response.json();
      if (response.ok) {
        if (data.volume == "external_connection") {
          toast("external media source detected, remote volume unavailable")
          return
        }
        setVolume(data.volume);
        return
      }
      toast(`error setting volume ${data.status}`)
    }
  } catch (error) {
    toast(`failed to send request: ${(error as Error).message}`);
  }
};

// reScan scans the network again for /discovery_ping response in case of new network location
export const reScan = (i: number, incrRescan: React.Dispatch<React.SetStateAction<number>>, setServerIP: React.Dispatch<React.SetStateAction<string>>) => {
  setServerIP("...searching")
  incrRescan(i + 1)
}