import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Box } from '../core/Box';

interface PageHeaderProps {
    backHref?: string;
    backText?: string;
    containerClassName?: string;
    wrapperClassName?: string;
    backLinkClassName?: string;
    children?: React.ReactNode;
    showBackButton?: boolean;
    onBack?: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    backHref = '/',
    backText = 'بازگشت',
    containerClassName = 'min-h-screen flex items-center justify-center p-4 w-full',
    wrapperClassName = 'max-w-lg w-full',
    backLinkClassName = 'inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors',
    children,
    showBackButton = true,
    onBack,
}) => {
    return (
        <Box className={`${containerClassName}`}>
            <Box className={`${wrapperClassName} border border-gray-100 p-6 shadow-md`}>
                {showBackButton &&
                    (onBack ? (
                        <button type="button" onClick={onBack} className={backLinkClassName}>
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                            {backText}
                        </button>
                    ) : (
                        <Link href={backHref} className={backLinkClassName}>
                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                            {backText}
                        </Link>
                    ))}
                {children}
            </Box>
        </Box>
    );
};

export default PageHeader;
