from zeroconf import ServiceInfo, Zeroconf
import socket, time

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]
    except Exception:
        ip = "127.0.0.1"
    finally:
        s.close()
    return ip

def register_service():
    zeroconf = Zeroconf()
    service_type = "_http._tcp.local."
    service_name = "lan_mac_remote_server._http._tcp.local."
    port = 8080
    ip_address = get_ip()
    binary_address = [socket.inet_aton(ip_address)] 

    info = ServiceInfo(
        type_=service_type,
        name=service_name,
        addresses=binary_address,
        port=port,
        properties={"description": "ZeroConf mac remote server"},
        server="my-remote.local.",
    )

    try:
        print(f"Registering service {service_name} on port {port}...")
        zeroconf.register_service(info)
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        zeroconf.unregister_service(info)
        zeroconf.close()

if __name__ == "__main__":
    register_service()