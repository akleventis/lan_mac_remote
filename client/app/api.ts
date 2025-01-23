import { toast } from "react-toastify";

// port specifies the shared client <-> server port
const port = 5001;

// ValidEndpoint contains valid endopints configured in server/api.go
type ValidEndpoint =
  | "keystroke"
  | "volume"
  | "sleep"
  | "verify_hammerspoon";

// HttpMethod contains valid http method(s) for request
type HttpMethod = "GET";

// constants used throughout application
export const serverSearching = "...searching"
export const serverNotFound = "no server found"
export const externalMediaSource = "external_media_source"

// DefaultResponse is the expected structure of a default api response
interface DefaultResponse {
  status: string;
}

// VolumeResponse is the expected structure of a volume adjustment api response
interface VolumeResponse {
  status: string;
  volume: string;
}

// RequestOptions houses information for an api request
interface RequestOptions {
  method: HttpMethod;
  endpoint: ValidEndpoint;
  serverIP: string;
  queryParams?: Record<string, string>;
}

// apiRequest formats and sends an api request to the specified endpoint, returning a response matching the provided interface type
export const apiRequest = async <T>(options: RequestOptions): Promise<T> => {
  const { method, endpoint, serverIP, queryParams } = options;
  let url = `http://${serverIP}:${port}/${endpoint}`;

  if (queryParams) {
    const queryString = new URLSearchParams(
      Object.entries(queryParams).map(([key, value]) => [key, value])
    ).toString();
    url += `?${queryString}`;
  }

  try {
    const response = await fetch(url, {method});
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.status || `request failed with status ${response.status}`
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("api request error: ", error);
    throw error;
  }
};

// verifyHammerspoon checks to see if hammerspoon is running
export const verifyHammerspoon = async (serverIP: string) => {
  if (!isServerIPSet(serverIP)) return

  try {
    const data = await apiRequest<DefaultResponse>({
      method: "GET",
      endpoint: "verify_hammerspoon",
      serverIP: serverIP,
    });
    if (data.status == "not_running") {
      toast("Hammerspoon not detected, media functionality will be limited");
    }
  } catch (error) {
    console.error("hammerspoon verification error: ", error);
  }
};

// triggerKeyPress sends the keypress action to the /key endpoint in server/api.go
export const triggerKeyPress = async (serverIP: string, key_action: string) => {
  if (!isServerIPSet(serverIP)) return

  try {
    await apiRequest<DefaultResponse>({
      method: "GET",
      endpoint: "keystroke",
      serverIP: serverIP,
      queryParams: {
        action: key_action,
      },
    });
  } catch (error) {
    console.error("triggerKeyPress error: ", error);
  }
};

// adjustVolume triggers key press and set's the volume state to value received from server
export const adjustVolume = async (
  serverIP: string,
  key_action: string,
  setVolume: React.Dispatch<React.SetStateAction<string>>
) => {
  if (!isServerIPSet(serverIP)) return

  try {
    const data = await apiRequest<VolumeResponse>({
      method: "GET",
      endpoint: "volume",
      serverIP: serverIP,
      queryParams: {
        action: key_action,
      },
    });
    if (data.volume == externalMediaSource) {
      toast("external media source detected, volume unavailable");
      setVolume(data.volume)
    } else {
      setVolume(data.volume);
    }
  } catch (error) {
    console.error("adjustVolume error: ", error);
  }
};

// triggerSleep puts computer to sleep
export const triggerSleep = async (serverIP: string) => {
  try {
    await apiRequest<DefaultResponse>({
      method: "GET",
      endpoint: "sleep",
      serverIP: serverIP,
    });
  } catch (error) {
    console.error("sleep error: ", error);
  }
}

// scanNetwork invokes the internal scan function to discover our server's network device's IP address using Zeroconf
export const scanNetwork = async (
  setServerIP: React.Dispatch<React.SetStateAction<string>>
) => {
  const response = await fetch("/api/scan");
  const data = await response.json();
  if (data.devices.length > 0) {
    setServerIP(data.devices[0].address);
    return;
  }
  setServerIP(serverNotFound);
};

// reScan triggers a network re-scan in case of new network location / dropped connection
export const reScan = (
  i: number,
  incrRescan: React.Dispatch<React.SetStateAction<number>>,
  setServerIP: React.Dispatch<React.SetStateAction<string>>
) => {
  setServerIP(serverSearching);
  incrRescan(i + 1);
};

// isServerIPSet checks if the serverIP is configured
export const isServerIPSet = (serverIP: string) => {
  return serverIP != serverSearching && serverIP != serverNotFound
}