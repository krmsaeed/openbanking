import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

interface SectionProps extends ComponentProps<'section'> {
    className?: string;
    variant?: 'primary' | 'secondary' | 'single' | undefined;
}

const Section = ({ children, className, variant }: SectionProps) => {
    if (variant === 'primary') {
        return (
            <section
                className={cn(
                    'dark:bg-gray-dark container mx-1 my-32 flex flex-col gap-10 overflow-hidden rounded-[30px] bg-gray-50 p-4 !py-28 lg:rounded-[50px] lg:p-9',
                    className
                )}
            >
                {children}
            </section>
        );
    }
    if (variant === 'single') {
        return (
            <section
                className={cn(
                    'dark:bg-gray-dark relative container mx-1 mt-32 flex w-[95%] flex-col gap-10 rounded-[30px] bg-gray-50 p-4 md:mt-40 md:w-full md:p-8 lg:rounded-[50px] lg:p-9',
                    className
                )}
            >
                {children}
            </section>
        );
    }
    if (variant === 'secondary') {
        return (
            <section
                className={cn(
                    'border-gray-light relative container mx-1 my-32 flex flex-col gap-10 rounded-[30px] border p-4 !py-32 md:p-8 lg:rounded-[50px] lg:p-9 dark:border-gray-900',
                    className
                )}
            >
                {children}
            </section>
        );
    } else
        return <section className={cn('container flex flex-col', className)}>{children}</section>;
};
export default Section;
