import { NextResponse } from 'next/server';
import Bonjour from 'bonjour-service';

const remoteServer = "lan_mac_remote_server"

// searches local area network for an http service named "lan_mac_remote_server"
export async function GET() {
  const bonjour = new Bonjour();

  const devices: any[] = [];
  bonjour.find({ type: 'http' }, (service) => {
    if (service.name == remoteServer) {
      devices.push({
        name: service.name,
        address: service.referer?.address,
        port: service.port,
      });
    }
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));
  bonjour.destroy();

  return NextResponse.json({devices});
}