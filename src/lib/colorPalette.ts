export interface ColorPalette {
    background: string;
    text: string;
    surface: string;
    border: string;
    bg: string;
    cardShadow: string;
    gray: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    primary: {
        main: string;
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    secondary: {
        main: string;
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    success: {
        main: string;
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    info: {
        main: string;
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    warning: {
        main: string;
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    error: {
        main: string;
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
}

export const darkTheme: ColorPalette = {
    background: '#0f172a',
    text: '#e2e8f0',
    surface: '#1e293b',
    border: '#475569',
    bg: '#0f172a',
    cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',

    gray: {
        50: '#1f2937',
        100: '#374151',
        200: '#4b5563',
        300: '#6b7280',
        400: '#9ca3af',
        500: '#d1d5db',
        600: '#e5e7eb',
        700: '#f3f4f6',
        800: '#f9fafb',
        900: '#ffffff',
    },

    primary: {
        main: '#9046d5',
        50: '#0e0516',
        100: '#1b0a2b',
        200: '#290f41',
        300: '#361456',
        400: '#45196e',
        500: '#6a26aa',
        600: '#9046d5',
        700: '#b584e3',
        800: '#dac1f1',
        900: '#eee7f4',
    },

    secondary: {
        main: '#a89fc6',
        50: '#161320',
        100: '#2c2640',
        200: '#423960',
        300: '#584b81',
        400: '#6d5ea0',
        500: '#8b7eb4',
        600: '#a89fc6',
        700: '#c5bfd9',
        800: '#e2dfec',
        900: '#fbf8ff',
    },

    success: {
        main: '#56d78a',
        50: '#0c3e20',
        100: '#125f30',
        200: '#17803f',
        300: '#1da052',
        400: '#22c55e',
        500: '#56d78a',
        600: '#9fe6b8',
        700: '#cff0dc',
        800: '#e6f6ee',
        900: '#f3fbf6',
    },

    info: {
        main: '#61a9ff',
        50: '#142c60',
        100: '#1d4388',
        200: '#2759b0',
        300: '#316fd6',
        400: '#3b82f6',
        500: '#61a9ff',
        600: '#9bc7ff',
        700: '#c7e1ff',
        800: '#e3f0ff',
        900: '#f0f7ff',
    },

    warning: {
        main: '#ffc055',
        50: '#4c2e02',
        100: '#764604',
        200: '#a36406',
        300: '#d68809',
        400: '#f59e0b',
        500: '#ffc055',
        600: '#ffd480',
        700: '#ffe8bf',
        800: '#fff6e6',
        900: '#fffbf0',
    },

    error: {
        main: '#ff8a8a',
        50: '#601616',
        100: '#8b2323',
        200: '#ad2f2f',
        300: '#d03b3b',
        400: '#ef4444',
        500: '#ff8a8a',
        600: '#ffb1b1',
        700: '#ffd6d6',
        800: '#ffefef',
        900: '#fff5f5',
    },
};

export const lightTheme: ColorPalette = {
    background: '#f8fafc',
    text: '#334155',
    surface: '#ffffff',
    border: '#e2e8f0',
    bg: '#f8fafc',
    cardShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',

    gray: {
        50: '#f7f7f7',
        100: '#ededed',
        200: '#e4e4e4',
        300: '#c8c8c8',
        400: '#adadad',
        500: '#999999',
        600: '#888888',
        700: '#7b7b7b',
        800: '#545454',
        900: '#1f2937',
    },

    primary: {
        main: '#45196e',
        50: '#eee7f4',
        100: '#dac1f1',
        200: '#b584e3',
        300: '#9046d5',
        400: '#6a26aa',
        500: '#45196e',
        600: '#361456',
        700: '#290f41',
        800: '#1b0a2b',
        900: '#0e0516',
    },

    secondary: {
        main: '#6d5ea0',
        50: '#fbf8ff',
        100: '#e2dfec',
        200: '#c5bfd9',
        300: '#a89fc6',
        400: '#8b7eb4',
        500: '#6d5ea0',
        600: '#584b81',
        700: '#423960',
        800: '#2c2640',
        900: '#161320',
    },

    success: {
        main: '#22c55e',
        50: '#f3fbf6',
        100: '#e6f6ee',
        200: '#cff0dc',
        300: '#9fe6b8',
        400: '#56d78a',
        500: '#22c55e',
        600: '#1da052',
        700: '#17803f',
        800: '#125f30',
        900: '#0c3e20',
    },

    info: {
        main: '#3b82f6',
        50: '#f0f7ff',
        100: '#e3f0ff',
        200: '#c7e1ff',
        300: '#9bc7ff',
        400: '#61a9ff',
        500: '#3b82f6',
        600: '#316fd6',
        700: '#2759b0',
        800: '#1d4388',
        900: '#142c60',
    },

    warning: {
        main: '#f59e0b',
        50: '#fffbf0',
        100: '#fff6e6',
        200: '#ffe8bf',
        300: '#ffd480',
        400: '#ffc055',
        500: '#f59e0b',
        600: '#d68809',
        700: '#a36406',
        800: '#764604',
        900: '#4c2e02',
    },

    error: {
        main: '#ef4444',
        50: '#fff5f5',
        100: '#ffefef',
        200: '#ffd6d6',
        300: '#ffb1b1',
        400: '#ff8a8a',
        500: '#ef4444',
        600: '#d03b3b',
        700: '#ad2f2f',
        800: '#8b2323',
        900: '#601616',
    },
};

export const getTheme = (isDark: boolean): ColorPalette => {
    return isDark ? darkTheme : lightTheme;
};

export const applyThemeColors = (theme: ColorPalette): void => {
    const root = document.documentElement;

    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--card-shadow', theme.cardShadow);

    Object.entries(theme.gray).forEach(([key, value]) => {
        root.style.setProperty(`--color-gray-${key}`, value);
    });

    root.style.setProperty('--color-primary', theme.primary.main);
    Object.entries(theme.primary).forEach(([key, value]) => {
        if (key !== 'main') {
            root.style.setProperty(`--color-primary-${key}`, value);
        }
    });

    root.style.setProperty('--color-secondary', theme.secondary.main);
    Object.entries(theme.secondary).forEach(([key, value]) => {
        if (key !== 'main') {
            root.style.setProperty(`--color-secondary-${key}`, value);
        }
    });

    root.style.setProperty('--color-success', theme.success.main);
    Object.entries(theme.success).forEach(([key, value]) => {
        if (key !== 'main') {
            root.style.setProperty(`--color-success-${key}`, value);
        }
    });

    root.style.setProperty('--color-info', theme.info.main);
    Object.entries(theme.info).forEach(([key, value]) => {
        if (key !== 'main') {
            root.style.setProperty(`--color-info-${key}`, value);
        }
    });

    root.style.setProperty('--color-warning', theme.warning.main);
    Object.entries(theme.warning).forEach(([key, value]) => {
        if (key !== 'main') {
            root.style.setProperty(`--color-warning-${key}`, value);
        }
    });

    root.style.setProperty('--color-error', theme.error.main);
    Object.entries(theme.error).forEach(([key, value]) => {
        if (key !== 'main') {
            root.style.setProperty(`--color-error-${key}`, value);
        }
    });

    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
};
