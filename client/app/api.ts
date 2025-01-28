import { toast } from "react-toastify";

// remote server IP dynamically injected via start_app.sh at runtime
export const remoteServerIP = process.env.SERVER_IP

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
  queryParams?: Record<string, string>;
}

// apiRequest formats and sends an api request to the specified endpoint, returning a response matching the provided interface type
export const apiRequest = async <T>(options: RequestOptions): Promise<T | undefined> => {
  const { method, endpoint, queryParams } = options;
  let url = `http://${remoteServerIP}:${port}/${endpoint}`;

  if (queryParams) {
    const queryString = new URLSearchParams(
      Object.entries(queryParams).map(([key, value]) => [key, value])
    ).toString();
    url += `?${queryString}`;
  }

  try {
    const response = await fetch(url, {method});
    const data = await response.json();

    if (!response.ok) {
      toast(`api error: ${data.status}`);
      return
    }
    return data as T;
  } catch (error) {
    console.error(`api error: ${error}`);
    throw error;
  }
};

// verifyHammerspoon checks to see if hammerspoon is running
export const verifyHammerspoon = async () => {
  try {
    const data = await apiRequest<DefaultResponse>({
      method: "GET",
      endpoint: "verify_hammerspoon",
    });
    if (!data) {
      console.error("No data returned from api");
      return;
    }
    if (data.status == "not_running") {
      toast("Hammerspoon not detected, media functionality will be limited");
    }
  } catch (error) {
    console.error(`hammerspoon verification error: ${error}`);
  }
};

// triggerKeyPress sends the keypress action to the /key endpoint in server/api.go
export const triggerKeyPress = async (key_action: string) => {
  try {
    await apiRequest<DefaultResponse>({
      method: "GET",
      endpoint: "keystroke",
      queryParams: {
        action: key_action,
      },
    });
  } catch (error) {
    console.error(`triggerKeyPress error: ${error}`);
  }
};

// adjustVolume triggers key press and set's the volume state to value received from server
export const adjustVolume = async (
  key_action: string,
  volume: string,
  setVolume: React.Dispatch<React.SetStateAction<string>>
) => {

  if (volume == externalMediaSource) {
    toast("external media source detected, volume unavailable");
    return
  }

  try {
    const data = await apiRequest<VolumeResponse>({
      method: "GET",
      endpoint: "volume",
      queryParams: {
        action: key_action,
      },
    });
    if (!data) {
      console.error("No data returned from api");
      return;
    }
    if (data.volume == externalMediaSource) {
      toast("external media source detected, volume unavailable");
      setVolume(data.volume)
    } else {
      setVolume(data.volume);
    }
  } catch (error) {
    console.error(`adjustVolume error: ${error}`);
  }
};

// triggerSleep puts computer to sleep
export const triggerSleep = async () => {
  try {
    await apiRequest<DefaultResponse>({
      method: "GET",
      endpoint: "sleep",
    });
  } catch (error) {
    console.error(`sleep error: ${error}`);
  }
}
