import HomeScreen from './page';

export const metadata = {
  title: 'Mac Remote',
  description: 'local area network remote for mac',
};

export default function RootLayout() {
  return (
    <html lang='en'>
      <link rel="apple-touch-icon" sizes="180x180" href="/icon.png" />
      <body style={{ margin: 0 }}>
        <HomeScreen />
      </body>
    </html>
  );
}
