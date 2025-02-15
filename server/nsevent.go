package main

// C code ripped off of https://github.com/Hammerspoon/hammerspoon (open-source) to create a system-level events using NSEvent

/*
#cgo CFLAGS: -x objective-c -Wno-deprecated-declarations
#cgo LDFLAGS: -framework CoreGraphics -framework IOKit -framework Cocoa
#include <stdint.h>
typedef int32_t my_int32_t;
typedef unsigned char my_bool;

#import <Cocoa/Cocoa.h>
#import <IOKit/hidsystem/ev_keymap.h>

void postMediaKey(my_int32_t keyCode, my_bool keyDown) {
    @autoreleasepool {
        NSEvent* event = [NSEvent otherEventWithType:NSSystemDefined
                                          location:NSMakePoint(0, 0)
                                     modifierFlags:0xA00
                                         timestamp:0
                                      windowNumber:0
                                           context:nil
                                           subtype:8
                                             data1:(keyCode << 16) | ((keyDown ? 0xA : 0xB) << 8)
                                             data2:-1];

        CGEventPost(kCGSessionEventTap, [event CGEvent]);
    }
}
*/
import "C"
import (
	"time"
)

var MediaKeyMapping = map[string]int32{
	"play_pause":     int32(16),
	"next_track":     int32(17),
	"previous_track": int32(18),
}

func sendMediaKey(keyCode int32) {
	C.postMediaKey(C.my_int32_t(keyCode), C.my_bool(1))
	time.Sleep(50 * time.Millisecond)
	C.postMediaKey(C.my_int32_t(keyCode), C.my_bool(0))
}
