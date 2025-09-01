import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableFooter,
    Box,
    Typography,
    Button
} from '@/components/ui';

export function TableDemo() {
    const sampleData = [
        { id: 1, name: 'علی احمدی', score: 95, status: 'active' },
        { id: 2, name: 'سارا کریمی', score: 87, status: 'inactive' },
        { id: 3, name: 'محمد رضایی', score: 92, status: 'active' },
        { id: 4, name: 'فاطمه موسوی', score: 78, status: 'pending' },
    ];

    return (
        <Box className="space-y-8 p-6">
            <Typography variant="h2">نمونه‌های Table Component</Typography>

            {/* Basic Table */}
            <Box>
                <Typography variant="h4" className="mb-4">جدول پایه</Typography>
                <Table variant="default" size="md">
                    <TableHeader>
                        <TableRow>
                            <TableCell as="th" variant="header">شناسه</TableCell>
                            <TableCell as="th" variant="header">نام</TableCell>
                            <TableCell as="th" variant="header">نمره</TableCell>
                            <TableCell as="th" variant="header">وضعیت</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sampleData.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell weight="medium">{item.id}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell variant="numeric">{item.score}</TableCell>
                                <TableCell>
                                    <Typography
                                        variant="caption"
                                        className={`px-2 py-1 rounded-full ${item.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : item.status === 'inactive'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                    >
                                        {item.status}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            {/* Bordered & Striped Table */}
            <Box>
                <Typography variant="h4" className="mb-4">جدول با خط‌کشی</Typography>
                <Table variant="bordered" size="md">
                    <TableHeader variant="dark">
                        <TableRow>
                            <TableCell as="th" variant="header" sortable sortDirection="asc">
                                شناسه
                            </TableCell>
                            <TableCell as="th" variant="header" sortable>
                                نام کاربر
                            </TableCell>
                            <TableCell as="th" variant="header" sortable sortDirection="desc">
                                نمره
                            </TableCell>
                            <TableCell as="th" variant="header" align="center">
                                عملیات
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody striped>
                        {sampleData.map((item) => (
                            <TableRow key={item.id} interactive>
                                <TableCell weight="bold">{item.id}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell variant="numeric" weight="semibold">
                                    {item.score}
                                </TableCell>
                                <TableCell variant="action">
                                    <Button size="sm" variant="outline">ویرایش</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter summary>
                        <TableRow>
                            <TableCell weight="bold">مجموع:</TableCell>
                            <TableCell weight="bold">{sampleData.length} کاربر</TableCell>
                            <TableCell variant="numeric" weight="bold">
                                {sampleData.reduce((sum, item) => sum + item.score, 0)}
                            </TableCell>
                            <TableCell variant="action">-</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </Box>

            {/* Compact Table */}
            <Box>
                <Typography variant="h4" className="mb-4">جدول فشرده</Typography>
                <Table variant="compact" size="sm">
                    <TableHeader variant="light">
                        <TableRow>
                            <TableCell as="th" variant="header">ردیف</TableCell>
                            <TableCell as="th" variant="header">نام</TableCell>
                            <TableCell as="th" variant="header" align="center">نمره</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sampleData.slice(0, 2).map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell align="center" variant="numeric">{item.score}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Box>
    );
}
