
import { Box } from "@/components/ui";
import HomeLoader from "@/components/HomeLoader";

export default function Home() {
  return (
    <Box className="min-h-screen flex items-center justify-center p-6 w-full">
      <HomeLoader delay={1600} />
    </Box>
  );
}
