import { toast } from "react-toastify";

// set client <-> server port
const port = 5001;

// valid endpoints configured in server
export type ValidEndpoint = "keystroke" | "volume" | "sleep" | "verify_hammerspoon"

// valid http methods for request
export type HttpMethod = "GET" 

interface DefaultResponse {
  status: string,
}

interface VolumeResponse {
  status: string,
  volume: string
}

// houses information for an api request
interface RequestOptions {
  method: HttpMethod,
  endpoint: ValidEndpoint,
  serverIP: string,
  queryParams?: Record<string, string | number>
}

// apiRequest formats and sends an API request to the specified endpoint, returning a response matching the provided interface type
export const apiRequest = async <T>(options: RequestOptions): Promise<T> => {
  const {method, endpoint, serverIP, queryParams} = options
  let url = `http://${serverIP}:${port}/${endpoint}`

  if (queryParams) {
    if (queryParams) {
      const queryString = new URLSearchParams(
        Object.entries(queryParams).map(([key, value]) => [key, String(value)])
      ).toString();
      url += `?${queryString}`;
    }
  }

  try {
    const response = await fetch(url, {
      method,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error("api request error: ", error);
    throw error;
  }
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
  if (serverIP == "...searching" || serverIP == "no server found") {
    return
  }

  try {    
    const data = await apiRequest<DefaultResponse>({
      method: "GET",
      endpoint: "verify_hammerspoon",
      serverIP: serverIP,
    })
    if (data.status == "not_running") {
      toast("Application 'Hammerspoon' not detected. Media functionality will be limited.");
    }
  } catch (error){
    console.error("hammerspoon verification error: ", error)
  }
}

// triggerKeyPress sends the keypress action to the /key endpoint in server.py
export const triggerKeyPress = async (serverIP: string, key_action: string) => {
  if (serverIP == "...searching" || serverIP == "no server found") {
    return
  }

  try {    
    await apiRequest<DefaultResponse>({
      method: "GET",
      endpoint: "keystroke",
      serverIP: serverIP,
      queryParams: {
        "action": key_action
      }
    })
  } catch (error){
    console.error("hammerspoon verification error: ", error)
  }
};

// adjustVolume triggers key press and set's the volume state to value received from server
export const adjustVolume = async(serverIP: string, key_action: string, setVolume: React.Dispatch<React.SetStateAction<string>>) => {
  if (serverIP == "...searching" || serverIP == "no server found") {
    return
  }

  try {    
    const data = await apiRequest<VolumeResponse>({
      method: "GET",
      endpoint: "volume",
      serverIP: serverIP,
      queryParams: {
        "action": key_action
      }
    })
    if (data.volume == "external_connection") {
      toast("external media source detected, remote volume unavailable")
    } else {
      setVolume(data.volume)
    }
  } catch (error){
    console.error("adjust volume error: ", error)
  }
};

// reScan scans the network again for /discovery_ping response in case of new network location
export const reScan = (i: number, incrRescan: React.Dispatch<React.SetStateAction<number>>, setServerIP: React.Dispatch<React.SetStateAction<string>>) => {
  setServerIP("...searching")
  incrRescan(i + 1)
}