import HomeScreen from './page';

export const metadata = {
  title: 'Mac Remote',
  description: 'local area network remote for mac',
};

export default function RootLayout() {
  return (
    <html lang='en'>
      <body style={{margin: 0}}>
        <HomeScreen />
      </body>
    </html>
  );
}
