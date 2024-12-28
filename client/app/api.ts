// set client <-> server port
const port = 5001;

// valid endpoints configured in server
export type ValidEndpoint = "discover_ping" | "os_action"

// valid http methods for request
export type HttpMethod = "GET" | "POST" // ...etc

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

export const scanNetwork = async (setServerIP: React.Dispatch<React.SetStateAction<string>>) => {
  const response = await fetch('/api/scan');
  const data = await response.json();
  if (data.devices.length > 0) {
    setServerIP(data.devices[0].address)
    return
  }
  setServerIP("no server found")
}

// triggerKeyPress sends the keypress action to the /key endpoint in server.py
export const triggerKeyPress = async (serverIP: string, key_action: string) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("action", key_action);

    const response = await sendRequest("GET", "os_action", serverIP, undefined, queryParams);
    if (!response.ok) {
      alert(`Failed to send request: ${response.status}`);
    }
    return response
  } catch (error) {
    alert(`Failed to send request: ${(error as Error).message}`);
  }
};

// adjustVolume triggers key press and set's the vollume state to value received from server
export const adjustVolume = async(serverIP: string, key_action: string, setVolume: React.Dispatch<React.SetStateAction<string>>) => {
  // noop if serverIP is not configured
  if (serverIP == "...searching" || serverIP == "no server found") {
    return
  }
  const res = await triggerKeyPress(serverIP, key_action)
  if (res && res.ok) {
    const data = await res.json();
    if (data.volume !== "") {
      setVolume(data.volume);
    }
  } else {
    console.log("failed to adjust volume");
  }
}

// reScan scans the network again for /discovery_ping response in case of new network location
export const reScan = (i: number, incrRescan: React.Dispatch<React.SetStateAction<number>>, setServerIP: React.Dispatch<React.SetStateAction<string>>) => {
  setServerIP("...searching")
  incrRescan(i + 1)
}