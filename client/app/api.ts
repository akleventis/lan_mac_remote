import { toast } from "react-toastify";

export const port = "5001";

// ValidEndpoint contains valid endopints configured in server/api.go
type ValidEndpoint = "keystroke" | "media_keystroke" | "volume" | "sleep"

// HttpMethod contains valid http method(s) for request
type HttpMethod = "GET";

// externalMediaSource indicates sound output through external device (hdmi)
export const externalMediaSource = "external_media_source";

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
export const apiRequest = async <T>(
  options: RequestOptions
): Promise<T | undefined> => {
  const { method, endpoint, queryParams } = options;

  // remote server IP dynamically injected via start_app.sh at runtime via start_client.sh.
  // if value is empty, we assume this is running as a static build.
  var remoteServerIP = process.env.SERVER_IP || "";
  if (remoteServerIP != "") {
    remoteServerIP = `http://${remoteServerIP}:${port}`
  }

  let url = `${remoteServerIP}/${endpoint}`;
  
  if (queryParams) {
    const queryString = new URLSearchParams(
      Object.entries(queryParams).map(([key, value]) => [key, value])
    ).toString();
    url += `?${queryString}`;
  }

  try {
    const response = await fetch(url, { method });
    if (!response.ok) {
      toast(`error /${endpoint} : ${response.status}`);
      return;
    }
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("NetworkError")) {
      toast(`/${endpoint} network error: unable to reach server`);
    }
    console.warn(`api error: ${error}`);
    throw error;
  }
};

// triggerKeyPress sends the keypress action to the /keystroke endpoint in server/api.go
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
    console.warn(`triggerKeyPress error: ${error}`);
  }
};

// triggerMediaKeyPress sends the media keypress action to the /media_keystroke endpoint in server/api.go
export const triggerMediaKeyPress = async (key_action: string) => {
  try {
    await apiRequest<DefaultResponse>({
      method: "GET",
      endpoint: "media_keystroke",
      queryParams: {
        action: key_action,
      },
    });
  } catch (error) {
    console.warn(`triggerMediaKeyPress error: ${error}`);
  }
}

// adjustVolume triggers key press and set's the volume state to value received from server
export const adjustVolume = async (
  key_action: string,
  volume: string,
  setVolume: React.Dispatch<React.SetStateAction<string>>
) => {
  if (volume == externalMediaSource) {
    setVolume(externalMediaSource)
    toast("external media source detected, volume unavailable");
    return;
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
      console.warn("No data returned from api");
      return;
    }
    if (data.volume == externalMediaSource) {
      setVolume(externalMediaSource);
      toast("external media source detected, volume unavailable");
    } else {
      setVolume(data.volume);
    }
  } catch (error) {
    console.warn(`adjustVolume error: ${error}`);
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
    console.warn(`sleep error: ${error}`);
  }
};
