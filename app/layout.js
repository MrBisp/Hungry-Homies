import { Inter } from "next/font/google";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/LayoutClient";
import config from "@/config";
import "./globals.css";
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

const font = Inter({ subsets: ["latin"] });
const MapNavBar = dynamic(() => import('@/components/MapNavBar'), {
	ssr: false
});

export const metadata = {
	...getSEOTags(),
	themeColor: config.colors.main,
	manifest: "/manifest.json",
	appleTouchIcon: "/person-no-head.png",
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			data-theme={config.colors.theme}
			className={font.className}
		>
			<body>
				<ClientLayout>
					{children}
					<MapNavBar />
				</ClientLayout>
			</body>
		</html>
	);
}
