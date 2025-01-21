import HomeScreen from './page';

export const metadata = {
  title: 'lan remote',
  description: 'local area network remote for mac',
};

export default function RootLayout({
  // children,
}: {
  // children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body style={styles.body}>
        <HomeScreen />
        {/* {children} */}
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
  },
};
