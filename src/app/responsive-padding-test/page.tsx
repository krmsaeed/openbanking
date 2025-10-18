import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/core/Card';

export default function ResponsivePaddingTest() {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-4xl space-y-6">
                <h1 className="mb-8 text-center text-3xl font-bold">Responsive Padding Test</h1>

                {/* Test different responsive configurations */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Test 1: Simple responsive padding */}
                    <Card padding={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
                        <CardHeader>
                            <CardTitle>Test 1: Progressive Padding</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>Padding increases with screen size:</p>
                            <ul className="mt-2 text-sm">
                                <li>• Mobile: xs (8px)</li>
                                <li>• Small: sm (12px)</li>
                                <li>• Medium: md (16px)</li>
                                <li>• Large: lg (24px)</li>
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Test 2: Header vs Content different padding */}
                    <Card>
                        <CardHeader padding={{ base: 'sm', md: 'md' }}>
                            <CardTitle>Test 2: Component-Specific</CardTitle>
                        </CardHeader>
                        <CardContent padding={{ base: 'md', lg: 'lg' }}>
                            <p>Header and content have different responsive padding.</p>
                            <p className="mt-2 text-sm">Resize the window to see the changes!</p>
                        </CardContent>
                        <CardFooter padding={{ base: 'xs', xl: 'md' }}>
                            <span className="text-muted-foreground text-xs">
                                Footer padding also responsive
                            </span>
                        </CardFooter>
                    </Card>

                    {/* Test 3: Large padding on large screens only */}
                    <Card padding={{ lg: 'xl', xl: 'xl' }}>
                        <CardHeader>
                            <CardTitle>Test 3: Large Screens Only</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>
                                This card has minimal padding on smaller screens but large padding
                                on lg/xl screens.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Test 4: Consistent padding */}
                    <Card padding="md">
                        <CardHeader>
                            <CardTitle>Test 4: Consistent Padding</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>This card uses the same padding on all screen sizes (md = 16px).</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Instructions */}
                <Card padding="md" className="border-blue-200 bg-blue-50">
                    <CardContent>
                        <h3 className="mb-2 font-semibold">How to Test:</h3>
                        <ol className="list-inside list-decimal space-y-1 text-sm">
                            <li>Resize your browser window to different widths</li>
                            <li>
                                Observe how padding changes at breakpoints (640px, 768px, 1024px,
                                1280px)
                            </li>
                            <li>Check that padding increases/decreases appropriately</li>
                            <li>Verify that component-specific padding works independently</li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
