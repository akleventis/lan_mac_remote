import HomeScreen from "./page"

export const metadata = {
  title: 'lan mac remote',
  description: 'local area network remote for mac',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <HomeScreen/>
        {children}
        </body>
    </html>
  )
}
