export default function DarkModeTest() {
    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div className="fixed top-4 left-4 z-50">
            <button
                onClick={toggleDarkMode}
                className="bg-primary-500 hover:bg-primary-600 rounded-lg px-4 py-2 text-white shadow-md transition-colors"
            >
                🌙 Toggle Dark Mode
            </button>
        </div>
    );
}
