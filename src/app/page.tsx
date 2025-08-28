import Link from "next/link";
import { BuildingLibraryIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">

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

          <CardContent className="space-y-4">
            <Link href="/login">
              <Button size="lg" className="w-full">
                <BuildingLibraryIcon className="w-4 h-4 ml-2" />
                ورود به حساب
              </Button>
            </Link>

            <Link href="/register">
              <Button variant="outline" size="lg" className="w-full">
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
    </div>
  );
}
