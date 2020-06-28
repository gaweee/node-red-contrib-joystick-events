# node-red-contrib-joystick-events
Package to inject Joystick Events to Node-Red based off the package from `node-joystick`  
This project was started as an attempt to link up my DualShock4 (Playstation) controller to my raspberry pi to send inputs in an attempt to replace wiring buttons via GPIO.

## Setup
To begin you first need to either bluetooth connect your DS4 Controller to linux or Raspberry Pi.
To pair your bluetooth controller, follow `https://wiki.gentoo.org/wiki/Sony_DualShock`

```bash
> bluetoothctl
[bluetooth]# agent on
[bluetooth]# default-agent
[bluetooth]# power on
[bluetooth]# discoverable on
[bluetooth]# pairable on
[bluetooth]# scan on
[bluetooth]# devices
[bluetooth]# pair device_mac_address
[agent] Authorize service service_uuid (yes/no): yes
[bluetooth]# trust device_mac_address
[bluetooth]# quit
```

In your node-red folder, download and install or clone this repo.  
Restart your node-red via:
```bash
node-red-reload
```

That's it

## TODO
- Add Xbox one controller config  


## See also
- <a href="https://github.com/JayBeavers/node-joystick/blob/master/joystick.js" target="_blank">Original Joystick NodeJS package</a>
- <a href="https://wiki.gentoo.org/wiki/Sony_DualShock" target="_blank">Setup Sony Dualshock on Gentoo Linux</a>