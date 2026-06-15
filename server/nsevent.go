package main

// Uses MediaRemote private framework (same channel as physical media keys) via dlopen.
// NSSystemDefined/CGEventPost stopped working on macOS 14+ for apps using MPRemoteCommandCenter.

/*
#cgo LDFLAGS: -framework Foundation
#include <dlfcn.h>
#include <objc/objc.h>

void sendMediaRemoteCommand(int command) {
    void* handle = dlopen("/System/Library/PrivateFrameworks/MediaRemote.framework/MediaRemote", RTLD_NOW | RTLD_LOCAL);
    if (!handle) return;
    typedef void (*MRMediaRemoteSendCommandFunc)(int cmd, id userInfo);
    MRMediaRemoteSendCommandFunc sendCmd = (MRMediaRemoteSendCommandFunc)dlsym(handle, "MRMediaRemoteSendCommand");
    if (sendCmd) {
        sendCmd(command, (id)0);
    }
    dlclose(handle);
}
*/
import "C"

var MediaKeyMapping = map[string]int32{
	"play_pause":     int32(2), // MRMediaRemoteCommandTogglePlayPause
	"next_track":     int32(4), // MRMediaRemoteCommandNextTrack
	"previous_track": int32(5), // MRMediaRemoteCommandPreviousTrack
}

func sendMediaKey(keyCode int32) {
	C.sendMediaRemoteCommand(C.int(keyCode))
}
