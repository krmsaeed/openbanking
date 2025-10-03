
export default function DarkModeTest() {
    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className="fixed top-4 left-4 z-50">
            <button
                onClick={toggleDarkMode}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors"
            >
                🌙 Toggle Dark Mode
            </button>
        </div>
    );
}