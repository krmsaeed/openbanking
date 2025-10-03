import { Box } from '@/components/ui';
import HomeLoader from '@/components/HomeLoader';

export default function Home() {
    return (
        <Box className="flex min-h-screen w-full items-center justify-center p-6">
            <HomeLoader />
        </Box>
    );
}
