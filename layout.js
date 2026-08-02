export const metadata = {
  title: 'ExpandMyFans - Creator Portal V2',
  description: 'Creator Upload Portal & Content Pipeline Engine',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
