import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/core/Card';

export default function CardPaddingExamples() {
    return (
        <div className="space-y-8 p-8">
            <h1 className="mb-6 text-2xl font-bold">Card Responsive Padding Examples</h1>

            {/* Single padding value */}
            <Card padding="md">
                <CardHeader>
                    <CardTitle>Single Padding Value</CardTitle>
                    <CardDescription>
                        padding=&quot;md&quot; → consistent padding on all screens
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This card uses a single padding value that applies to all screen sizes.</p>
                </CardContent>
            </Card>

            {/* Responsive padding object */}
            <Card padding={{ base: 'sm', md: 'md', lg: 'lg' }}>
                <CardHeader>
                    <CardTitle>Responsive Padding Object</CardTitle>
                    <CardDescription>
                        padding={'{ base: "sm", md: "md", lg: "lg" }'} → responsive padding
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>This card uses responsive padding:</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>
                            <strong>Base (mobile):</strong> small padding (p-3)
                        </li>
                        <li>
                            <strong>Medium screens:</strong> medium padding (p-4)
                        </li>
                        <li>
                            <strong>Large screens:</strong> large padding (p-6)
                        </li>
                    </ul>
                </CardContent>
            </Card>

            {/* Different padding per component */}
            <Card>
                <CardHeader padding={{ base: 'xs', md: 'sm' }}>
                    <CardTitle>Header with Custom Padding</CardTitle>
                    <CardDescription>CardHeader with responsive padding</CardDescription>
                </CardHeader>
                <CardContent padding={{ base: 'sm', lg: 'md' }}>
                    <p>CardContent with different responsive padding than header.</p>
                </CardContent>
                <CardFooter padding={{ base: 'md', xl: 'lg' }}>
                    <p className="text-muted-foreground text-sm">
                        Footer with its own responsive padding
                    </p>
                </CardFooter>
            </Card>

            {/* No padding example */}
            <Card padding="none">
                <CardHeader padding="sm">
                    <CardTitle>No Padding on Card</CardTitle>
                    <CardDescription>Card has no padding, but header has padding</CardDescription>
                </CardHeader>
                <CardContent padding="md">
                    <p>
                        The card itself has no padding, but individual components can have their
                        own.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
