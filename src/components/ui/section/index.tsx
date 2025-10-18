import { cn } from '@/lib/utils';
import { ComponentProps, memo } from 'react';

type SectionVariant = 'primary' | 'secondary' | 'single';

interface SectionProps extends ComponentProps<'section'> {
    variant?: SectionVariant;
}

const variantStyles: Record<SectionVariant, string> = {
    primary:
        'dark:bg-gray-dark container mx-1 my-32 flex flex-col gap-10 overflow-hidden rounded-[30px] bg-gray-50 p-4 !py-28 lg:rounded-[50px] lg:p-9',
    secondary:
        'border-gray-light relative container mx-1 my-32 flex flex-col gap-10 rounded-[30px] border p-4 !py-32 md:p-8 lg:rounded-[50px] lg:p-9 dark:border-gray-900',
    single: 'dark:bg-gray-dark relative container mx-1 mt-32 flex w-[95%] flex-col gap-10 rounded-[30px] bg-gray-50 p-4 md:mt-40 md:w-full md:p-8 lg:rounded-[50px] lg:p-9',
};

const Section = memo<SectionProps>(({ children, className, variant, ...props }) => {
    const baseStyles = variant ? variantStyles[variant] : 'container flex flex-col';

    return (
        <section className={cn(baseStyles, className)} {...props}>
            {children}
        </section>
    );
});

Section.displayName = 'Section';

export default Section;
