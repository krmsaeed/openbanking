import Link from "next/link";
import { BuildingLibraryIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/core/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/core/Card";
import { Box } from "@/components/ui";

export default function Home() {
  return (
    <Box className="min-h-screen flex items-center justify-center p-6 w-full">
      <div className="w-full max-w-lg space-y-8  border border-gray-100 shadow-md rounded-2xl p-6">

        <Card padding="lg">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BuildingLibraryIcon className="h-6 w-6 text-white" />
            </div>

            <CardTitle className="text-center">
              بانک اقتصاد نوین
            </CardTitle>
            <CardDescription className="text-center">
              بانکداری ساده و امن
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 w-full">
            <Link href="/login" className="">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <BuildingLibraryIcon className="w-4 h-4 ml-2" />
                ورود به حساب
              </Button>
            </Link>

            <Link href="/register">
              <Button variant="success" size="lg" className="w-full">
                <UserPlusIcon className="w-4 h-4 ml-2" />
                ایجاد حساب جدید
              </Button>
            </Link>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            © ۱۴۰۳ بانک اقتصاد نوین
          </p>
        </div>
      </div>
    </Box>
  );
}
